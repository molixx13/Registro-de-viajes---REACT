import type { Bounds, Trip, TripDraft, TripPoint, ValidationResult } from "./types";

const REQUIRED_TRIP_KEYS = [
  "id",
  "title",
  "startDate",
  "endDate",
  "origin",
  "destination",
  "stops",
  "notes",
  "color",
  "createdAt",
  "updatedAt"
] as const;

export function createTripId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `trip-${Math.random().toString(36).slice(2)}`;
}

export function getTripPoints(trip: Pick<TripDraft, "origin" | "stops" | "destination">) {
  return [trip.origin, ...trip.stops, trip.destination];
}

export function isValidCoordinate(point: TripPoint) {
  return (
    typeof point.lat === "number" &&
    typeof point.lng === "number" &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180
  );
}

function isTripPoint(value: unknown): value is TripPoint {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.name === "string" &&
    typeof candidate.lat === "number" &&
    typeof candidate.lng === "number" &&
    (candidate.description === undefined || typeof candidate.description === "string")
  );
}

export function validateTrip(trip: TripDraft | Trip): ValidationResult {
  const errors: string[] = [];
  const points = getTripPoints(trip);

  if (!trip.title.trim()) errors.push("El titulo es obligatorio.");
  if (!trip.origin.name.trim()) errors.push("El origen es obligatorio.");
  if (!trip.destination.name.trim()) errors.push("El destino es obligatorio.");
  if (!trip.startDate) errors.push("La fecha de inicio es obligatoria.");
  if (!trip.endDate) errors.push("La fecha de fin es obligatoria.");
  if (trip.startDate && trip.endDate && trip.endDate < trip.startDate) {
    errors.push("La fecha de fin no puede ser anterior a la fecha de inicio.");
  }
  if (points.length < 2) errors.push("La ruta necesita al menos dos puntos.");

  points.forEach((point) => {
    if (!point.name.trim()) errors.push("Cada punto necesita un nombre.");
    if (!isValidCoordinate(point)) {
      errors.push(`Coordenadas invalidas para ${point.name || "un punto"}.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors: Array.from(new Set(errors))
  };
}

export function calculateBounds(
  points: TripPoint[] | Pick<TripDraft, "origin" | "stops" | "destination">
): Bounds {
  const routePoints = Array.isArray(points) ? points : getTripPoints(points);

  if (routePoints.length === 0) {
    return [
      [-80, -40],
      [-35, 15]
    ];
  }

  const lngs = routePoints.map((point) => point.lng);
  const lats = routePoints.map((point) => point.lat);

  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)]
  ];
}

export function tripToLineString(trip: Trip) {
  const coordinates = trip.routeGeometry && trip.routeGeometry.length > 0
    ? trip.routeGeometry
    : getTripPoints(trip).map((point) => [point.lng, point.lat]);
  return {
    type: "Feature" as const,
    properties: {
      id: trip.id,
      title: trip.title,
      color: trip.color
    },
    geometry: {
      type: "LineString" as const,
      coordinates
    }
  };
}

export function tripsToFeatureCollection(trips: Trip[]) {
  return {
    type: "FeatureCollection" as const,
    features: trips.map(tripToLineString)
  };
}

export function isTrip(value: unknown): value is Trip {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;

  const hasKeys = REQUIRED_TRIP_KEYS.every((key) => key in candidate);
  if (!hasKeys || !isTripPoint(candidate.origin) || !isTripPoint(candidate.destination)) {
    return false;
  }
  if (!Array.isArray(candidate.stops) || !candidate.stops.every(isTripPoint)) return false;

  if ("routeGeometry" in candidate && candidate.routeGeometry !== undefined) {
    if (
      !Array.isArray(candidate.routeGeometry) ||
      !candidate.routeGeometry.every(
        (coord) =>
          Array.isArray(coord) &&
          coord.length === 2 &&
          typeof coord[0] === "number" &&
          typeof coord[1] === "number"
      )
    ) {
      return false;
    }
  }

  if ("distance" in candidate && candidate.distance !== undefined && typeof candidate.distance !== "number") {
    return false;
  }

  if ("duration" in candidate && candidate.duration !== undefined && typeof candidate.duration !== "number") {
    return false;
  }

  return validateTrip(candidate as Trip).valid;
}

export function parseStoredTrips(rawValue: string | null, fallbackTrips: Trip[]) {
  if (!rawValue) return fallbackTrips;

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    const maybeTrips =
      parsed && typeof parsed === "object" && "trips" in parsed
        ? (parsed as { trips: unknown }).trips
        : parsed;

    if (!Array.isArray(maybeTrips) || !maybeTrips.every(isTrip)) {
      return fallbackTrips;
    }

    return maybeTrips;
  } catch {
    return fallbackTrips;
  }
}

export function importTripsFromJson(json: string) {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("El archivo JSON esta corrupto o no se puede leer.");
  }

  const maybeTrips =
    parsed && typeof parsed === "object" && "trips" in parsed
      ? (parsed as { trips: unknown }).trips
      : parsed;

  if (!Array.isArray(maybeTrips) || maybeTrips.length === 0 || !maybeTrips.every(isTrip)) {
    throw new Error("El archivo no contiene viajes validos.");
  }

  return maybeTrips;
}

export function buildTrip(draft: TripDraft, existingTrip?: Trip): Trip {
  const now = new Date().toISOString();

  return {
    ...draft,
    id: existingTrip?.id ?? createTripId(),
    createdAt: existingTrip?.createdAt ?? now,
    updatedAt: now
  };
}

export async function fetchRoute(
  points: TripPoint[],
  signal?: AbortSignal
): Promise<{ coordinates: [number, number][]; distance: number; duration: number } | null> {
  const coords = points.map((p) => `${p.lng},${p.lat}`).join(";");

  try {
    const res = await fetch(`/api/routing?points=${coords}`, {
      signal,
      headers: { accept: "application/json" }
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function formatDistance(meters?: number): string {
  if (meters === undefined || meters === null) return "";
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds?: number): string {
  if (seconds === undefined || seconds === null) return "";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} h ${minutes} min`;
  }
  return `${minutes} min`;
}
