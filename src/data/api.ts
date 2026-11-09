
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://appnook-api.appnook.workers.dev";

export interface PublicApp {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  version: string;
  size: string;
  updated: string;
  icon: string;
  screenshots: string[];
  features: string[];
  downloads: number;
  featured: boolean;
  apkUrl: string;
}

export interface PublicCategory {
  id: number;
  name: string;
  slug: string;
}

function parseArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapPublicApp(data: any): PublicApp {
  return {
    id: String(data.id),
    name: data.name,
    slug: data.slug,
    description: data.description,
    category: data.category || "",
    version: data.version || "",
    size: data.size || "Not specified",
    updated: data.updated_at || "",
    icon: data.icon_key || data.name.slice(0, 2).toUpperCase(),
    screenshots: parseArray(data.screenshots),
    features: parseArray(data.features),
    downloads: Number(data.downloads || 0),
    featured: Boolean(data.featured),
    apkUrl: data.apk_url || "",
  };
}

export async function fetchPublicApps(): Promise<PublicApp[]> {
  const response = await fetch(`${API_BASE}/api/apps`);

  if (!response.ok) {
    throw new Error("Unable to load applications.");
  }

  const data = await response.json();
  return Array.isArray(data) ? data.map(mapPublicApp) : [];
}

export async function fetchPublicCategories(): Promise<PublicCategory[]> {
  const response = await fetch(`${API_BASE}/api/categories`);

  if (!response.ok) {
    throw new Error("Unable to load categories.");
  }

  return response.json();
}

export async function fetchPublicApp(slug: string): Promise<PublicApp> {
  const response = await fetch(
    `${API_BASE}/api/apps/${encodeURIComponent(slug)}`
  );

  if (!response.ok) {
    throw new Error("Application not found.");
  }

  return mapPublicApp(await response.json());
}

export function getDownloadUrl(slug: string): string {
  return `${API_BASE}/api/download/${encodeURIComponent(slug)}`;
}