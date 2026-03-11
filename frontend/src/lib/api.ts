import type { DiscoveryResponse, SkitDetail, Category } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API error ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

/** Discover a skit by category slug or randomly. */
export async function discoverSkit(params: {
  categorySlug?: string;
  isRandom?: boolean;
  forceRefresh?: boolean;
}): Promise<DiscoveryResponse> {
  const sp = new URLSearchParams();
  if (params.categorySlug) sp.set("categorySlug", params.categorySlug);
  if (params.isRandom) sp.set("isRandom", "true");
  if (params.forceRefresh) sp.set("forceRefresh", "true");
  return apiFetch<DiscoveryResponse>(`/api/v1/discovery?${sp}`);
}

/** Fetch the full skit details (including three-act narrative). */
export async function getSkitById(id: string): Promise<SkitDetail> {
  return apiFetch<SkitDetail>(`/api/v1/skits/${id}`);
}

/** Mark a skit as played (increments play count). */
export async function markSkitPlayed(id: string): Promise<void> {
  await apiFetch(`/api/v1/skits/${id}/played`, { method: "PATCH" });
}

/** List all scientific categories. */
export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>(`/api/v1/categories`);
}
