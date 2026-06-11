import { describe, expect, it } from "vitest";
import { demoTrips } from "./demo-trips";
import {
  calculateBounds,
  importTripsFromJson,
  parseStoredTrips,
  validateTrip
} from "./trips";
import type { TripDraft } from "./types";

const validDraft: TripDraft = {
  title: "Viaje de prueba",
  startDate: "2026-06-10",
  endDate: "2026-06-14",
  origin: {
    name: "Bogota",
    lat: 4.711,
    lng: -74.0721,
    description: "Salida de prueba"
  },
  destination: { name: "Cartagena", lat: 10.391, lng: -75.4794 },
  stops: [{ name: "Medellin", lat: 6.2442, lng: -75.5812, description: "" }],
  notes: "Ruta de prueba",
  color: "#0f766e"
};

describe("validateTrip", () => {
  it("rejects missing required fields and invalid coordinates", () => {
    const result = validateTrip({
      ...validDraft,
      title: "",
      origin: { name: "", lat: 99, lng: -74.0721 }
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("El titulo es obligatorio.");
    expect(result.errors).toContain("El origen es obligatorio.");
    expect(result.errors.some((error) => error.includes("Coordenadas invalidas"))).toBe(true);
  });

  it("rejects an end date before the start date", () => {
    const result = validateTrip({
      ...validDraft,
      startDate: "2026-06-14",
      endDate: "2026-06-10"
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "La fecha de fin no puede ser anterior a la fecha de inicio."
    );
  });

  it("accepts points without descriptions", () => {
    const result = validateTrip({
      ...validDraft,
      origin: { name: "Bogota", lat: 4.711, lng: -74.0721 },
      destination: { name: "Cartagena", lat: 10.391, lng: -75.4794 },
      stops: [{ name: "Medellin", lat: 6.2442, lng: -75.5812 }]
    });

    expect(result.valid).toBe(true);
  });
});

describe("calculateBounds", () => {
  it("returns southwest and northeast bounds for a route", () => {
    expect(calculateBounds(validDraft)).toEqual([
      [-75.5812, 4.711],
      [-74.0721, 10.391]
    ]);
  });
});

describe("stored trips parsing", () => {
  it("loads valid trips from localStorage shape", () => {
    const parsed = parseStoredTrips(JSON.stringify({ trips: [demoTrips[0]] }), demoTrips);

    expect(parsed).toEqual([demoTrips[0]]);
  });

  it("falls back to demo trips when JSON is corrupt", () => {
    const parsed = parseStoredTrips("{bad json", demoTrips);

    expect(parsed).toEqual(demoTrips);
  });
});

describe("importTripsFromJson", () => {
  it("replaces only with valid trips", () => {
    const imported = importTripsFromJson(JSON.stringify({ trips: [demoTrips[1]] }));

    expect(imported).toEqual([demoTrips[1]]);
  });

  it("rejects invalid import payloads", () => {
    expect(() => importTripsFromJson(JSON.stringify({ trips: [{ title: "" }] }))).toThrow(
      "El archivo no contiene viajes validos."
    );
  });

  it("rejects points with invalid description types", () => {
    expect(() =>
      importTripsFromJson(
        JSON.stringify({
          trips: [
            {
              ...demoTrips[0],
              origin: { ...demoTrips[0].origin, description: 123 }
            }
          ]
        })
      )
    ).toThrow("El archivo no contiene viajes validos.");
  });
});
