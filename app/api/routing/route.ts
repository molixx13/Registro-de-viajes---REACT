import { NextResponse } from "next/server";

const OSRM_ROUTE_URL = "http://router.project-osrm.org/route/v1/driving/";
const cache = new Map<string, { status: number; body: string }>();
const CACHE_LIMIT = 100;
const POINTS_REGEX = /^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?(?:;-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?)*$/;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const points = (url.searchParams.get("points") ?? "").trim();

  if (!points) {
    return NextResponse.json({ error: "Missing points parameter" }, { status: 400 });
  }

  if (!POINTS_REGEX.test(points)) {
    return NextResponse.json({ error: "Invalid points format" }, { status: 400 });
  }

  const cacheKey = points.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached) {
    return new NextResponse(cached.body, {
      status: cached.status,
      headers: {
        "content-type": "application/json",
        "x-routing-cache": "hit",
      },
    });
  }

  try {
    const upstreamUrl = `${OSRM_ROUTE_URL}${points}?overview=full&geometries=geojson`;
    const upstream = await fetch(upstreamUrl, {
      headers: {
        "user-agent": "registro-viajes-mapa/0.1 (contact: local)",
        accept: "application/json",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "upstream error", status: upstream.status },
        { status: 502 }
      );
    }

    const payload = await upstream.json();
    if (payload.code !== "Ok" || !Array.isArray(payload.routes) || payload.routes.length === 0) {
      return NextResponse.json(
        { error: "no route found" },
        { status: 404 }
      );
    }

    const route = payload.routes[0];
    const result = {
      coordinates: route.geometry.coordinates,
      distance: route.distance,
      duration: route.duration,
    };

    const body = JSON.stringify(result);
    cache.set(cacheKey, { status: 200, body });
    if (cache.size > CACHE_LIMIT) {
      const oldest = cache.keys().next().value as string | undefined;
      if (oldest) cache.delete(oldest);
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        "content-type": "application/json",
        "x-routing-cache": "miss",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    return NextResponse.json(
      { error: "failed to fetch route", message },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
