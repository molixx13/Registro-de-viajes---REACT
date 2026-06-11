import { describe, expect, it, vi } from "vitest";
import {
  PLACE_SEARCH_CACHE_LIMIT,
  buildPhotonSearchUrl,
  buildPlaceSearchRequest,
  fetchPlaceOptions,
  normalizePhotonResponse,
  rememberCachedSearch,
  type PlaceOption
} from "./place-search";

describe("place search utilities", () => {
  it("normalizes Photon GeoJSON into autocomplete options", () => {
    const options = normalizePhotonResponse({
      features: [
        {
          geometry: { coordinates: [-74.0721, 4.711] },
          properties: { name: "Bogota", country: "Colombia" }
        }
      ]
    });

    expect(options).toEqual([
      {
        name: "Bogota",
        lat: 4.711,
        lng: -74.0721,
        description: "Bogota, Colombia",
        label: "Bogota, Colombia"
      }
    ]);
  });

  it("builds a single configurable Photon URL", () => {
    const url = buildPhotonSearchUrl("Bogota");

    expect(url).toContain("https://photon.komoot.io/api/");
    expect(url).toContain("q=Bogota");
    expect(url).toContain("limit=5");
  });

  it("keeps only the newest 50 cached searches", () => {
    const cache = new Map<string, PlaceOption[]>();

    for (let index = 0; index < PLACE_SEARCH_CACHE_LIMIT + 5; index += 1) {
      rememberCachedSearch(cache, `query-${index}`, []);
    }

    expect(cache.size).toBe(PLACE_SEARCH_CACHE_LIMIT);
    expect(cache.has("query-0")).toBe(false);
    expect(cache.has("query-54")).toBe(true);
  });

  it("builds a request to the local proxy endpoint by default", () => {
    const url = buildPlaceSearchRequest("/api/places/search", "bogotá sur");
    expect(url).toBe("/api/places/search?q=bogot%C3%A1%20sur");
  });

  it("appends the query to a custom endpoint function result", () => {
    const url = buildPlaceSearchRequest(
      (query) => `https://example.test/search?q=${query}`,
      "lima"
    );
    expect(url).toBe("https://example.test/search?q=limaq=lima");
  });
});

describe("fetchPlaceOptions", () => {
  it("returns options from a JSON response", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          options: [
            {
              name: "Bogota",
              label: "Bogota, Colombia",
              lat: 4.711,
              lng: -74.0721,
              description: "Bogota, Colombia"
            }
          ]
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );

    const options = await fetchPlaceOptions("bogota", "/api/places/search", fetchImpl as unknown as typeof fetch);
    expect(options).toHaveLength(1);
    expect(options[0].name).toBe("Bogota");
  });

  it("returns empty array for short queries without calling fetch", async () => {
    const fetchImpl = vi.fn();
    const options = await fetchPlaceOptions("ab", "/api/places/search", fetchImpl as unknown as typeof fetch);
    expect(options).toEqual([]);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("throws when the upstream is not ok", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("nope", { status: 502 }));
    await expect(
      fetchPlaceOptions("bogota", "/api/places/search", fetchImpl as unknown as typeof fetch)
    ).rejects.toThrow(/502/);
  });
});
