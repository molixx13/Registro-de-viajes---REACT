import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { demoTrips } from "@/lib/demo-trips";
import { useTrips } from "./use-trips";

describe("useTrips", () => {
  it("hydrates valid stored trips", async () => {
    window.localStorage.setItem(
      "registro-viajes.trips",
      JSON.stringify({ trips: [demoTrips[2]] })
    );

    const { result } = renderHook(() => useTrips());

    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    expect(result.current.trips).toEqual([demoTrips[2]]);
  });

  it("recovers demo trips when stored JSON is corrupt", async () => {
    window.localStorage.setItem("registro-viajes.trips", "{bad json");

    const { result } = renderHook(() => useTrips());

    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    expect(result.current.trips).toEqual(demoTrips);
  });

  it("adds valid trips and persists them", async () => {
    window.localStorage.clear();
    const { result } = renderHook(() => useTrips());

    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => {
      result.current.addTrip({
        title: "Nuevo viaje",
        startDate: "2026-08-01",
        endDate: "2026-08-02",
        origin: {
          name: "Quito",
          lat: -0.1807,
          lng: -78.4678,
          description: "Salida"
        },
        destination: { name: "Cuenca", lat: -2.9001, lng: -79.0059 },
        stops: [],
        notes: "Fin de semana",
        color: "#2563eb"
      });
    });

    expect(result.current.trips[0].title).toBe("Nuevo viaje");
    expect(window.localStorage.getItem("registro-viajes.trips")).toContain("Nuevo viaje");
  });
});
