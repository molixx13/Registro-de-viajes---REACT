import type { TripPoint } from "./types";

export const PHOTON_SEARCH_URL = "https://photon.komoot.io/api/";
export const PLACE_SEARCH_CACHE_LIMIT = 50;

export type PhotonFeature = {
  geometry?: {
    coordinates?: unknown;
  };
  properties?: {
    name?: unknown;
    city?: unknown;
    state?: unknown;
    country?: unknown;
  };
};

export type PhotonResponse = {
  features?: PhotonFeature[];
};

export type PlaceOption = TripPoint & {
  label: string;
};

export function normalizePhotonFeature(feature: PhotonFeature): PlaceOption | null {
  const coordinates = feature.geometry?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;

  const [lng, lat] = coordinates;
  if (typeof lat !== "number" || typeof lng !== "number") return null;

  const properties = feature.properties ?? {};
  const name = typeof properties.name === "string" ? properties.name : "";
  if (!name.trim()) return null;

  const context = [properties.city, properties.state, properties.country]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .filter((value, index, values) => values.indexOf(value) === index);

  const label = [name, ...context].join(", ");

  return {
    name,
    lat,
    lng,
    description: label,
    label,
  };
}

export function normalizePhotonResponse(response: PhotonResponse): PlaceOption[] {
  return (response.features ?? [])
    .map(normalizePhotonFeature)
    .filter((option): option is PlaceOption => option !== null);
}

export function rememberCachedSearch(
  cache: Map<string, PlaceOption[]>,
  query: string,
  options: PlaceOption[]
) {
  const key = query.trim().toLowerCase();
  if (!key) return;

  if (cache.has(key)) cache.delete(key);
  cache.set(key, options);

  while (cache.size > PLACE_SEARCH_CACHE_LIMIT) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (!oldestKey) break;
    cache.delete(oldestKey);
  }
}

export function buildPhotonSearchUrl(query: string) {
  const params = new URLSearchParams({
    q: query,
    limit: "5",
  });

  return `${PHOTON_SEARCH_URL}?${params.toString()}`;
}

export type PlaceSearchEndpoint = string | ((query: string) => string);

export function getDefaultPlaceSearchEndpoint(): PlaceSearchEndpoint {
  return "/api/places/search";
}

export function buildPlaceSearchRequest(endpoint: PlaceSearchEndpoint, query: string) {
  const url = typeof endpoint === "function" ? endpoint(query) : endpoint;
  const separator = url.includes("?") ? "&" : "?";
  const safeQuery = encodeURIComponent(query.trim());
  return url.includes("q=") ? `${url}q=${safeQuery}` : `${url}${separator}q=${safeQuery}`;
}

export async function fetchPlaceOptions(
  query: string,
  endpoint: PlaceSearchEndpoint = getDefaultPlaceSearchEndpoint(),
  fetchImpl: typeof fetch = fetch
): Promise<PlaceOption[]> {
  const normalized = query.trim();
  if (normalized.length < 3) return [];

  const response = await fetchImpl(buildPlaceSearchRequest(endpoint, normalized), {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) {
    throw new Error(`Place search failed: ${response.status}`);
  }

  const payload = (await response.json()) as { options?: PlaceOption[] };
  return Array.isArray(payload.options) ? payload.options : [];
}
