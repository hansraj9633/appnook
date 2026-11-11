/// <reference types="@cloudflare/workers-types" />

interface Env {
  APPNOOK_DB: D1Database;
  APPNOOK_MEDIA: KVNamespace;
  ADMIN_PASSWORD: string;
  SESSION_SECRET: string;
  ALLOWED_ORIGIN?: string;
}

interface AppInput {
  name: string;
  description: string;
  category: string;
  version: string;
  size?: string;
  icon_key?: string;
  apk_url?: string;
  screenshots?: string[];
  features?: string[];
  release_notes?: string;
  android_version?: string;
  featured?: boolean;
  published?: boolean;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Accept only direct APK assets from a standard GitHub Releases URL. */
function isValidGitHubApkUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname === "github.com" &&
      !url.username &&
      !url.password &&
      /^\/[^/]+\/[^/]+\/releases\/download\/[^/]+\/[^/]+\.apk$/i.test(
        url.pathname,
      )
    );
  } catch {
    return false;
  }
}

function cors(request: Request, env: Env): HeadersInit {
  const origin = request.headers.get("Origin") || "";
  const allowed = ["http://localhost:5173","http://localhost:5174", env.ALLOWED_ORIGIN].filter(
    (value): value is string => Boolean(value),
  );

  return {
    "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : "null",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

function response(
  data: unknown,
  request: Request,
  env: Env,
  status = 200,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...cors(request, env),
    },
  });
}

const encoder = new TextEncoder();

function base64UrlEncode(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return atob(padded);
}

async function getSigningKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function createSessionToken(env: Env): Promise<string> {
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: "admin",
      exp: Math.floor(Date.now() / 1000) + 7200,
    }),
  );

  const key = await getSigningKey(env.SESSION_SECRET);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );
  const signatureString = String.fromCharCode(...new Uint8Array(signature));

  return `${payload}.${base64UrlEncode(signatureString)}`;
}

async function authorized(request: Request, env: Env): Promise<boolean> {
  const token = request.headers
    .get("Authorization")
    ?.replace(/^Bearer\s+/i, "");

  if (!token || !env.SESSION_SECRET) return false;

  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;

    const [payload, signature] = parts;
    const key = await getSigningKey(env.SESSION_SECRET);
    const signatureBytes = Uint8Array.from(base64UrlDecode(signature), (char) =>
      char.charCodeAt(0),
    );

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(payload),
    );

    if (!valid) return false;

    const data = JSON.parse(base64UrlDecode(payload)) as {
      sub?: string;
      exp?: number;
    };

    return (
      data.sub === "admin" &&
      typeof data.exp === "number" &&
      data.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

async function getCategoryId(
  db: D1Database,
  name: string,
): Promise<number | null> {
  const category = await db
    .prepare("SELECT id FROM categories WHERE name = ?")
    .bind(name)
    .first<{ id: number }>();

  return category?.id ?? null;
}

async function uniqueSlug(
  db: D1Database,
  name: string,
  currentId?: string,
): Promise<string> {
  const base = slugify(name);
  if (!base) throw new Error("Invalid app name");

  let slug = base;
  let counter = 1;

  while (true) {
    const existing = await db
      .prepare("SELECT id FROM apps WHERE slug = ?")
      .bind(slug)
      .first<{ id: number }>();

    if (!existing || String(existing.id) === currentId) return slug;
    slug = `${base}-${counter++}`;
  }
}

function isAppInput(value: unknown): value is AppInput {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === "OPTIONS") {
      return new Response(null, { headers: cors(request, env) });
    }

    // Public: serve uploaded application screenshots
    const mediaMatch = path.match(/^\/media\/([a-f0-9-]+\.(?:png|jpg|webp))$/i);

    if (mediaMatch && method === "GET") {
      const key = mediaMatch[1];
      const image = await env.APPNOOK_MEDIA.get(key, "arrayBuffer");

      if (!image) {
        return new Response("Image not found", { status: 404 });
      }

      const extension = key.split(".").pop()?.toLowerCase();

      const contentType =
        extension === "png"
          ? "image/png"
          : extension === "webp"
            ? "image/webp"
            : "image/jpeg";

      return new Response(image, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    try {
      // Health check
      if (path === "/api/health" && method === "GET") {
        return response(
          { success: true, service: "AppNook API" },
          request,
          env,
        );
      }

      // Public: categories
      if (path === "/api/categories" && method === "GET") {
        const result = await env.APPNOOK_DB.prepare(
          "SELECT id, name, slug FROM categories ORDER BY name",
        ).all();

        return response(result.results, request, env);
      }

      // Public: published applications
      if (path === "/api/apps" && method === "GET") {
        const result = await env.APPNOOK_DB.prepare(
          `
            SELECT a.*, c.name AS category
            FROM apps a
            LEFT JOIN categories c ON c.id = a.category_id
            WHERE a.published = 1
            ORDER BY a.created_at DESC
          `,
        ).all();

        return response(result.results, request, env);
      }

      // Public: one published application
      const publicAppMatch = path.match(/^\/api\/apps\/([^/]+)$/);

      if (publicAppMatch && method === "GET") {
        const slug = decodeURIComponent(publicAppMatch[1]);
        const app = await env.APPNOOK_DB.prepare(
          `
            SELECT a.*, c.name AS category
            FROM apps a
            LEFT JOIN categories c ON c.id = a.category_id
            WHERE a.slug = ? AND a.published = 1
          `,
        )
          .bind(slug)
          .first();

        if (!app) {
          return response({ error: "App not found" }, request, env, 404);
        }

        return response(app, request, env);
      }

      // Public: APK download and download tracking
      const downloadMatch = path.match(/^\/api\/download\/([^/]+)$/);

      if (downloadMatch && method === "GET") {
        const slug = decodeURIComponent(downloadMatch[1]);
        const app = await env.APPNOOK_DB.prepare(
          `
            SELECT id, apk_url
            FROM apps
            WHERE slug = ? AND published = 1
          `,
        )
          .bind(slug)
          .first<{ id: number; apk_url: string | null }>();

        if (!app || !app.apk_url) {
          return response(
            { error: "Application or APK not found." },
            request,
            env,
            404,
          );
        }

        if (!isValidGitHubApkUrl(app.apk_url)) {
          return response(
            { error: "Invalid APK download URL." },
            request,
            env,
            400,
          );
        }

        await env.APPNOOK_DB.prepare(
          "UPDATE apps SET downloads = downloads + 1 WHERE id = ?",
        )
          .bind(app.id)
          .run();

        return Response.redirect(app.apk_url, 302);
      }

      // Admin login
      if (path === "/api/admin/login" && method === "POST") {
        if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
          return response(
            { error: "Admin authentication is not configured" },
            request,
            env,
            500,
          );
        }

        const body: unknown = await request.json();
        const password =
          typeof body === "object" && body !== null && "password" in body
            ? (body as { password?: unknown }).password
            : undefined;

        if (typeof password !== "string" || password !== env.ADMIN_PASSWORD) {
          return response({ error: "Invalid password" }, request, env, 401);
        }

        const token = await createSessionToken(env);
        return response(
          { success: true, token, expiresIn: 7200 },
          request,
          env,
        );
      }

      // All remaining admin routes require authentication.
      if (path.startsWith("/api/admin/")) {
        if (!(await authorized(request, env))) {
          return response({ error: "Unauthorized" }, request, env, 401);
        }

        // Admin: upload application screenshot
        if (path === "/api/admin/media" && method === "POST") {
          const formData = await request.formData();
          const file = formData.get("file");

          if (!(file instanceof File)) {
            return response(
              { error: "Please select an image." },
              request,
              env,
              400,
            );
          }

          if (file.size === 0 || file.size > 5 * 1024 * 1024) {
            return response(
              { error: "Image must be between 1 byte and 5 MB." },
              request,
              env,
              400,
            );
          }

          const extensions: Record<string, string> = {
            "image/png": "png",
            "image/jpeg": "jpg",
            "image/webp": "webp",
          };

          const extension = extensions[file.type];

          if (!extension) {
            return response(
              { error: "Only PNG, JPEG and WebP images are supported." },
              request,
              env,
              400,
            );
          }

          const bytes = await file.arrayBuffer();
          const data = new Uint8Array(bytes);

          const isPng =
            extension === "png" &&
            data.length >= 8 &&
            data[0] === 0x89 &&
            data[1] === 0x50 &&
            data[2] === 0x4e &&
            data[3] === 0x47;

          const isJpeg =
            extension === "jpg" &&
            data.length >= 3 &&
            data[0] === 0xff &&
            data[1] === 0xd8 &&
            data[2] === 0xff;

          const isWebp =
            extension === "webp" &&
            data.length >= 12 &&
            String.fromCharCode(...data.slice(0, 4)) === "RIFF" &&
            String.fromCharCode(...data.slice(8, 12)) === "WEBP";

          if (!isPng && !isJpeg && !isWebp) {
            return response(
              { error: "The selected file is not a valid supported image." },
              request,
              env,
              400,
            );
          }

          const key = `${crypto.randomUUID()}.${extension}`;

          await env.APPNOOK_MEDIA.put(key, bytes, {
            metadata: { contentType: file.type },
          });

          return response(
            {
              success: true,
              url: `${url.origin}/media/${key}`,
            },
            request,
            env,
            201,
          );
        }

        // Admin: list all apps
        if (path === "/api/admin/apps" && method === "GET") {
          const result = await env.APPNOOK_DB.prepare(
            `
              SELECT a.*, c.name AS category
              FROM apps a
              LEFT JOIN categories c ON c.id = a.category_id
              ORDER BY a.created_at DESC
            `,
          ).all();

          return response(result.results, request, env);
        }

        // Admin: create app
        if (path === "/api/admin/apps" && method === "POST") {
          const body: unknown = await request.json();

          if (!isAppInput(body)) {
            return response(
              { error: "Invalid request body" },
              request,
              env,
              400,
            );
          }

          const input = body;

          if (
            typeof input.name !== "string" ||
            !input.name.trim() ||
            typeof input.description !== "string" ||
            !input.description.trim() ||
            typeof input.version !== "string" ||
            !input.version.trim() ||
            typeof input.category !== "string" ||
            !input.category.trim()
          ) {
            return response(
              { error: "Name, description, category and version are required" },
              request,
              env,
              400,
            );
          }

          if (
            typeof input.apk_url !== "string" ||
            !isValidGitHubApkUrl(input.apk_url.trim())
          ) {
            return response(
              { error: "A valid GitHub Releases APK URL is required." },
              request,
              env,
              400,
            );
          }

          const categoryId = await getCategoryId(
            env.APPNOOK_DB,
            input.category.trim(),
          );

          if (!categoryId) {
            return response(
              { error: "Category does not exist" },
              request,
              env,
              400,
            );
          }

          const slug = await uniqueSlug(env.APPNOOK_DB, input.name);

          await env.APPNOOK_DB.prepare(
            `
              INSERT INTO apps (
                name, slug, description, category_id, version, size,
                icon_key, apk_url, screenshots, features, release_notes,
                android_version, featured, published
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
          )
            .bind(
              input.name.trim(),
              slug,
              input.description.trim(),
              categoryId,
              input.version.trim(),
              input.size?.trim() || null,
              input.icon_key?.trim() || null,
              input.apk_url.trim(),
              JSON.stringify(
                Array.isArray(input.screenshots) ? input.screenshots : [],
              ),
              JSON.stringify(
                Array.isArray(input.features) ? input.features : [],
              ),
              input.release_notes?.trim() || null,
              input.android_version?.trim() || null,
              input.featured ? 1 : 0,
              input.published ? 1 : 0,
            )
            .run();

          return response({ success: true, slug }, request, env, 201);
        }

        // Admin: update or delete app
        const appMatch = path.match(/^\/api\/admin\/apps\/(\d+)$/);

        if (appMatch && (method === "PUT" || method === "DELETE")) {
          const id = appMatch[1];

          if (method === "DELETE") {
            const result = await env.APPNOOK_DB.prepare(
              "DELETE FROM apps WHERE id = ?",
            )
              .bind(id)
              .run();

            if (!result.meta.changes) {
              return response({ error: "App not found" }, request, env, 404);
            }

            return response({ success: true }, request, env);
          }

          const body: unknown = await request.json();

          if (!isAppInput(body)) {
            return response(
              { error: "Invalid request body" },
              request,
              env,
              400,
            );
          }

          const input = body;

          if (
            typeof input.name !== "string" ||
            !input.name.trim() ||
            typeof input.description !== "string" ||
            !input.description.trim() ||
            typeof input.version !== "string" ||
            !input.version.trim() ||
            typeof input.category !== "string" ||
            !input.category.trim()
          ) {
            return response(
              { error: "Required fields are missing" },
              request,
              env,
              400,
            );
          }

          if (
            typeof input.apk_url !== "string" ||
            !isValidGitHubApkUrl(input.apk_url.trim())
          ) {
            return response(
              { error: "A valid GitHub Releases APK URL is required." },
              request,
              env,
              400,
            );
          }

          const categoryId = await getCategoryId(
            env.APPNOOK_DB,
            input.category.trim(),
          );

          if (!categoryId) {
            return response(
              { error: "Category does not exist" },
              request,
              env,
              400,
            );
          }

          const slug = await uniqueSlug(env.APPNOOK_DB, input.name, id);
          const result = await env.APPNOOK_DB.prepare(
            `
              UPDATE apps SET
                name = ?, slug = ?, description = ?, category_id = ?,
                version = ?, size = ?, icon_key = ?, apk_url = ?,
                screenshots = ?, features = ?, release_notes = ?,
                android_version = ?, featured = ?, published = ?,
                updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `,
          )
            .bind(
              input.name.trim(),
              slug,
              input.description.trim(),
              categoryId,
              input.version.trim(),
              input.size?.trim() || null,
              input.icon_key?.trim() || null,
              input.apk_url.trim(),
              JSON.stringify(
                Array.isArray(input.screenshots) ? input.screenshots : [],
              ),
              JSON.stringify(
                Array.isArray(input.features) ? input.features : [],
              ),
              input.release_notes?.trim() || null,
              input.android_version?.trim() || null,
              input.featured ? 1 : 0,
              input.published ? 1 : 0,
              id,
            )
            .run();

          if (!result.meta.changes) {
            return response({ error: "App not found" }, request, env, 404);
          }

          return response({ success: true, slug }, request, env);
        }

        // Admin: create category
        if (path === "/api/admin/categories" && method === "POST") {
          const body: unknown = await request.json();
          const name =
            typeof body === "object" &&
            body !== null &&
            "name" in body &&
            typeof (body as { name?: unknown }).name === "string"
              ? (body as { name: string }).name.trim()
              : "";

          if (!name) {
            return response(
              { error: "Category name required" },
              request,
              env,
              400,
            );
          }

          const categorySlug = slugify(name);
          if (!categorySlug) {
            return response(
              { error: "Category name is invalid" },
              request,
              env,
              400,
            );
          }

          try {
            await env.APPNOOK_DB.prepare(
              "INSERT INTO categories (name, slug) VALUES (?, ?)",
            )
              .bind(name, categorySlug)
              .run();
          } catch {
            return response(
              { error: "Category already exists or is invalid" },
              request,
              env,
              409,
            );
          }

          return response({ success: true }, request, env, 201);
        }

        // Admin: delete category only if it is unused
        const categoryMatch = path.match(/^\/api\/admin\/categories\/(\d+)$/);

        if (categoryMatch && method === "DELETE") {
          const id = categoryMatch[1];
          const used = await env.APPNOOK_DB.prepare(
            "SELECT COUNT(*) AS total FROM apps WHERE category_id = ?",
          )
            .bind(id)
            .first<{ total: number }>();

          if (used && used.total > 0) {
            return response(
              { error: "Category is still in use" },
              request,
              env,
              409,
            );
          }

          const result = await env.APPNOOK_DB.prepare(
            "DELETE FROM categories WHERE id = ?",
          )
            .bind(id)
            .run();

          if (!result.meta.changes) {
            return response({ error: "Category not found" }, request, env, 404);
          }

          return response({ success: true }, request, env);
        }
      }

      return response({ error: "Route not found" }, request, env, 404);
    } catch (error) {
      console.error("AppNook Worker error:", error);
      return response({ error: "Internal server error" }, request, env, 500);
    }
  },
};
