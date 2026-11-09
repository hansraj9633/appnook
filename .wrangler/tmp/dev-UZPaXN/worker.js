var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/worker.ts
function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
__name(slugify, "slugify");
function isValidGitHubApkUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "github.com" && !url.username && !url.password && /^\/[^/]+\/[^/]+\/releases\/download\/[^/]+\/[^/]+\.apk$/i.test(
      url.pathname
    );
  } catch {
    return false;
  }
}
__name(isValidGitHubApkUrl, "isValidGitHubApkUrl");
function cors(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = ["http://localhost:5173", env.ALLOWED_ORIGIN].filter(
    (value) => Boolean(value)
  );
  return {
    "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : "null",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin"
  };
}
__name(cors, "cors");
function response(data, request, env, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...cors(request, env)
    }
  });
}
__name(response, "response");
var encoder = new TextEncoder();
function base64UrlEncode(value) {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(base64UrlEncode, "base64UrlEncode");
function base64UrlDecode(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return atob(padded);
}
__name(base64UrlDecode, "base64UrlDecode");
async function getSigningKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}
__name(getSigningKey, "getSigningKey");
async function createSessionToken(env) {
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: "admin",
      exp: Math.floor(Date.now() / 1e3) + 7200
    })
  );
  const key = await getSigningKey(env.SESSION_SECRET);
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  const signatureString = String.fromCharCode(...new Uint8Array(signature));
  return `${payload}.${base64UrlEncode(signatureString)}`;
}
__name(createSessionToken, "createSessionToken");
async function authorized(request, env) {
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token || !env.SESSION_SECRET) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [payload, signature] = parts;
    const key = await getSigningKey(env.SESSION_SECRET);
    const signatureBytes = Uint8Array.from(
      base64UrlDecode(signature),
      (char) => char.charCodeAt(0)
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(payload)
    );
    if (!valid) return false;
    const data = JSON.parse(base64UrlDecode(payload));
    return data.sub === "admin" && typeof data.exp === "number" && data.exp > Math.floor(Date.now() / 1e3);
  } catch {
    return false;
  }
}
__name(authorized, "authorized");
async function getCategoryId(db, name) {
  const category = await db.prepare("SELECT id FROM categories WHERE name = ?").bind(name).first();
  return category?.id ?? null;
}
__name(getCategoryId, "getCategoryId");
async function uniqueSlug(db, name, currentId) {
  const base = slugify(name);
  if (!base) throw new Error("Invalid app name");
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await db.prepare("SELECT id FROM apps WHERE slug = ?").bind(slug).first();
    if (!existing || String(existing.id) === currentId) return slug;
    slug = `${base}-${counter++}`;
  }
}
__name(uniqueSlug, "uniqueSlug");
function isAppInput(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
__name(isAppInput, "isAppInput");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (method === "OPTIONS") {
      return new Response(null, { headers: cors(request, env) });
    }
    try {
      if (path === "/api/health" && method === "GET") {
        return response(
          { success: true, service: "AppNook API" },
          request,
          env
        );
      }
      if (path === "/api/categories" && method === "GET") {
        const result = await env.APPNOOK_DB.prepare(
          "SELECT id, name, slug FROM categories ORDER BY name"
        ).all();
        return response(result.results, request, env);
      }
      if (path === "/api/apps" && method === "GET") {
        const result = await env.APPNOOK_DB.prepare(
          `
            SELECT a.*, c.name AS category
            FROM apps a
            LEFT JOIN categories c ON c.id = a.category_id
            WHERE a.published = 1
            ORDER BY a.created_at DESC
          `
        ).all();
        return response(result.results, request, env);
      }
      const publicAppMatch = path.match(/^\/api\/apps\/([^/]+)$/);
      if (publicAppMatch && method === "GET") {
        const slug = decodeURIComponent(publicAppMatch[1]);
        const app = await env.APPNOOK_DB.prepare(
          `
            SELECT a.*, c.name AS category
            FROM apps a
            LEFT JOIN categories c ON c.id = a.category_id
            WHERE a.slug = ? AND a.published = 1
          `
        ).bind(slug).first();
        if (!app) {
          return response({ error: "App not found" }, request, env, 404);
        }
        return response(app, request, env);
      }
      const downloadMatch = path.match(/^\/api\/download\/([^/]+)$/);
      if (downloadMatch && method === "GET") {
        const slug = decodeURIComponent(downloadMatch[1]);
        const app = await env.APPNOOK_DB.prepare(
          `
            SELECT id, apk_url
            FROM apps
            WHERE slug = ? AND published = 1
          `
        ).bind(slug).first();
        if (!app || !app.apk_url) {
          return response(
            { error: "Application or APK not found." },
            request,
            env,
            404
          );
        }
        if (!isValidGitHubApkUrl(app.apk_url)) {
          return response(
            { error: "Invalid APK download URL." },
            request,
            env,
            400
          );
        }
        await env.APPNOOK_DB.prepare(
          "UPDATE apps SET downloads = downloads + 1 WHERE id = ?"
        ).bind(app.id).run();
        return Response.redirect(app.apk_url, 302);
      }
      if (path === "/api/admin/login" && method === "POST") {
        if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
          return response(
            { error: "Admin authentication is not configured" },
            request,
            env,
            500
          );
        }
        const body = await request.json();
        const password = typeof body === "object" && body !== null && "password" in body ? body.password : void 0;
        if (typeof password !== "string" || password !== env.ADMIN_PASSWORD) {
          return response({ error: "Invalid password" }, request, env, 401);
        }
        const token = await createSessionToken(env);
        return response(
          { success: true, token, expiresIn: 7200 },
          request,
          env
        );
      }
      if (path.startsWith("/api/admin/")) {
        if (!await authorized(request, env)) {
          return response({ error: "Unauthorized" }, request, env, 401);
        }
        if (path === "/api/admin/apps" && method === "GET") {
          const result = await env.APPNOOK_DB.prepare(
            `
              SELECT a.*, c.name AS category
              FROM apps a
              LEFT JOIN categories c ON c.id = a.category_id
              ORDER BY a.created_at DESC
            `
          ).all();
          return response(result.results, request, env);
        }
        if (path === "/api/admin/apps" && method === "POST") {
          const body = await request.json();
          if (!isAppInput(body)) {
            return response({ error: "Invalid request body" }, request, env, 400);
          }
          const input = body;
          if (typeof input.name !== "string" || !input.name.trim() || typeof input.description !== "string" || !input.description.trim() || typeof input.version !== "string" || !input.version.trim() || typeof input.category !== "string" || !input.category.trim()) {
            return response(
              { error: "Name, description, category and version are required" },
              request,
              env,
              400
            );
          }
          if (typeof input.apk_url !== "string" || !isValidGitHubApkUrl(input.apk_url.trim())) {
            return response(
              { error: "A valid GitHub Releases APK URL is required." },
              request,
              env,
              400
            );
          }
          const categoryId = await getCategoryId(
            env.APPNOOK_DB,
            input.category.trim()
          );
          if (!categoryId) {
            return response(
              { error: "Category does not exist" },
              request,
              env,
              400
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
            `
          ).bind(
            input.name.trim(),
            slug,
            input.description.trim(),
            categoryId,
            input.version.trim(),
            input.size?.trim() || null,
            input.icon_key?.trim() || null,
            input.apk_url.trim(),
            JSON.stringify(Array.isArray(input.screenshots) ? input.screenshots : []),
            JSON.stringify(Array.isArray(input.features) ? input.features : []),
            input.release_notes?.trim() || null,
            input.android_version?.trim() || null,
            input.featured ? 1 : 0,
            input.published ? 1 : 0
          ).run();
          return response({ success: true, slug }, request, env, 201);
        }
        const appMatch = path.match(/^\/api\/admin\/apps\/(\d+)$/);
        if (appMatch && (method === "PUT" || method === "DELETE")) {
          const id = appMatch[1];
          if (method === "DELETE") {
            const result2 = await env.APPNOOK_DB.prepare(
              "DELETE FROM apps WHERE id = ?"
            ).bind(id).run();
            if (!result2.meta.changes) {
              return response({ error: "App not found" }, request, env, 404);
            }
            return response({ success: true }, request, env);
          }
          const body = await request.json();
          if (!isAppInput(body)) {
            return response({ error: "Invalid request body" }, request, env, 400);
          }
          const input = body;
          if (typeof input.name !== "string" || !input.name.trim() || typeof input.description !== "string" || !input.description.trim() || typeof input.version !== "string" || !input.version.trim() || typeof input.category !== "string" || !input.category.trim()) {
            return response(
              { error: "Required fields are missing" },
              request,
              env,
              400
            );
          }
          if (typeof input.apk_url !== "string" || !isValidGitHubApkUrl(input.apk_url.trim())) {
            return response(
              { error: "A valid GitHub Releases APK URL is required." },
              request,
              env,
              400
            );
          }
          const categoryId = await getCategoryId(
            env.APPNOOK_DB,
            input.category.trim()
          );
          if (!categoryId) {
            return response(
              { error: "Category does not exist" },
              request,
              env,
              400
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
            `
          ).bind(
            input.name.trim(),
            slug,
            input.description.trim(),
            categoryId,
            input.version.trim(),
            input.size?.trim() || null,
            input.icon_key?.trim() || null,
            input.apk_url.trim(),
            JSON.stringify(Array.isArray(input.screenshots) ? input.screenshots : []),
            JSON.stringify(Array.isArray(input.features) ? input.features : []),
            input.release_notes?.trim() || null,
            input.android_version?.trim() || null,
            input.featured ? 1 : 0,
            input.published ? 1 : 0,
            id
          ).run();
          if (!result.meta.changes) {
            return response({ error: "App not found" }, request, env, 404);
          }
          return response({ success: true, slug }, request, env);
        }
        if (path === "/api/admin/categories" && method === "POST") {
          const body = await request.json();
          const name = typeof body === "object" && body !== null && "name" in body && typeof body.name === "string" ? body.name.trim() : "";
          if (!name) {
            return response(
              { error: "Category name required" },
              request,
              env,
              400
            );
          }
          const categorySlug = slugify(name);
          if (!categorySlug) {
            return response(
              { error: "Category name is invalid" },
              request,
              env,
              400
            );
          }
          try {
            await env.APPNOOK_DB.prepare(
              "INSERT INTO categories (name, slug) VALUES (?, ?)"
            ).bind(name, categorySlug).run();
          } catch {
            return response(
              { error: "Category already exists or is invalid" },
              request,
              env,
              409
            );
          }
          return response({ success: true }, request, env, 201);
        }
        const categoryMatch = path.match(/^\/api\/admin\/categories\/(\d+)$/);
        if (categoryMatch && method === "DELETE") {
          const id = categoryMatch[1];
          const used = await env.APPNOOK_DB.prepare(
            "SELECT COUNT(*) AS total FROM apps WHERE category_id = ?"
          ).bind(id).first();
          if (used && used.total > 0) {
            return response(
              { error: "Category is still in use" },
              request,
              env,
              409
            );
          }
          const result = await env.APPNOOK_DB.prepare(
            "DELETE FROM categories WHERE id = ?"
          ).bind(id).run();
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
  }
};

// C:/Users/HANS RAJ/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/HANS RAJ/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-S3sKRN/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// C:/Users/HANS RAJ/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-S3sKRN/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
