"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { demoTrips } from "@/lib/demo-trips";
import { buildTrip, parseStoredTrips, validateTrip } from "@/lib/trips";
import type { Trip, TripDraft } from "@/lib/types";

const STORAGE_KEY = "registro-viajes.trips";

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>(demoTrips);
  const [selectedTripId, setSelectedTripId] = useState<string>(demoTrips[0]?.id ?? "");
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadedTrips = parseStoredTrips(window.localStorage.getItem(STORAGE_KEY), demoTrips);
    setTrips(loadedTrips);
    setSelectedTripId((currentId) =>
      loadedTrips.some((trip) => trip.id === currentId) ? currentId : loadedTrips[0]?.id ?? ""
    );
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ trips }));
  }, [isHydrated, trips]);

  const selectedTrip = useMemo(
    () => trips.find((trip) => trip.id === selectedTripId) ?? trips[0] ?? null,
    [selectedTripId, trips]
  );

  const addTrip = (draft: TripDraft) => {
    const validation = validateTrip(draft);
    if (!validation.valid) {
      setError(validation.errors.join(" "));
      return null;
    }

    const trip = buildTrip(draft);
    setTrips((currentTrips) => [trip, ...currentTrips]);
    setSelectedTripId(trip.id);
    setError(null);
    return trip;
  };

  const updateTrip = (id: string, draft: TripDraft) => {
    const validation = validateTrip(draft);
    if (!validation.valid) {
      setError(validation.errors.join(" "));
      return;
    }

    setTrips((currentTrips) =>
      currentTrips.map((trip) => (trip.id === id ? buildTrip(draft, trip) : trip))
    );
    setSelectedTripId(id);
    setError(null);
  };

  const deleteTrip = (id: string) => {
    setTrips((currentTrips) => {
      const nextTrips = currentTrips.filter((trip) => trip.id !== id);
      setSelectedTripId(nextTrips[0]?.id ?? "");
      return nextTrips;
    });
  };

  const replaceTrips = (nextTrips: Trip[]) => {
    setTrips(nextTrips);
    setSelectedTripId(nextTrips[0]?.id ?? "");
    setError(null);
  };

  const enrichTrip = useCallback((id: string, routeData: {
    routeGeometry?: [number, number][];
    distance?: number;
    duration?: number;
  }) => {
    setTrips((currentTrips) =>
      currentTrips.map((trip) =>
        trip.id === id
          ? { ...trip, ...routeData, updatedAt: new Date().toISOString() }
          : trip
      )
    );
  }, []);

  return {
    trips,
    selectedTripId,
    selectedTrip,
    isHydrated,
    error,
    addTrip,
    updateTrip,
    deleteTrip,
    replaceTrips,
    enrichTrip,
    selectTrip: setSelectedTripId,
    clearError: () => setError(null)
  };
}
