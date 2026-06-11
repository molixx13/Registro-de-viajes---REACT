import { NextResponse } from "next/server";
import {
  PLACE_SEARCH_CACHE_LIMIT,
  buildPhotonSearchUrl,
  normalizePhotonResponse,
  type PhotonResponse
} from "@/lib/place-search";

const USER_AGENT = "registro-viajes-mapa/0.1 (contact: local)";

const cache = new Map<string, { status: number; body: string }>();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();

  if (query.length < 3) {
    return NextResponse.json({ options: [] });
  }

  const cacheKey = query.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached) {
    return new NextResponse(cached.body, {
      status: cached.status,
      headers: {
        "content-type": "application/json",
        "x-places-cache": "hit",
      },
    });
  }

  try {
    const upstream = await fetch(buildPhotonSearchUrl(query), {
      headers: {
        "user-agent": USER_AGENT,
        accept: "application/json",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "upstream", status: upstream.status },
        { status: 502 }
      );
    }

    const payload = (await upstream.json()) as PhotonResponse;
    const options = normalizePhotonResponse(payload).slice(0, 5);
    const body = JSON.stringify({ options });

    cache.set(cacheKey, { status: 200, body });
    if (cache.size > PLACE_SEARCH_CACHE_LIMIT) {
      const oldest = cache.keys().next().value as string | undefined;
      if (oldest) cache.delete(oldest);
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        "content-type": "application/json",
        "x-places-cache": "miss",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    return NextResponse.json(
      { error: "upstream", message },
      { status: 502 }
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
