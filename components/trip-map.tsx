"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import { calculateBounds, getTripPoints, tripsToFeatureCollection } from "@/lib/trips";
import { captureMapAsDataURL } from "@/lib/map-capture";
import type { Trip } from "@/lib/types";

export type CaptureMapImage = () => Promise<string | null>;

type TripMapProps = {
  trips: Trip[];
  selectedTripId: string;
  onSelectTrip: (id: string) => void;
  onCaptureReady?: (capture: CaptureMapImage | null) => void;
};

const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

function getPointRole(index: number, stopsLength: number) {
  if (index === 0) return "Salida";
  if (index === stopsLength + 1) return "Llegada";
  return `Parada ${index}`;
}

function getMarkerTooltip(trip: Trip, index: number) {
  const point = getTripPoints(trip)[index];
  const lines = [
    `${getPointRole(index, trip.stops.length)}: ${point.name}`,
    `Latitud: ${point.lat.toFixed(5)}`,
    `Longitud: ${point.lng.toFixed(5)}`,
  ];

  if (point.description?.trim()) {
    lines.push(point.description.trim());
  }

  return lines.join("\n");
}

export function TripMap({ trips, selectedTripId, onSelectTrip, onCaptureReady }: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    let cancelled = false;

    async function loadMap() {
      try {
        const maplibregl = await import("maplibre-gl");
        if (cancelled || !mapContainer.current) return;

        const map = new maplibregl.Map({
          container: mapContainer.current,
          style: STYLE_URL,
          center: [-74.0721, 4.711],
          zoom: 3,
          preserveDrawingBuffer: true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        mapRef.current = map;
        onCaptureReady?.(() => captureMapAsDataURL(map));

        map.on("load", () => {
          if (!map.getSource("routes")) {
            map.addSource("routes", {
              type: "geojson",
              data: tripsToFeatureCollection([]),
            });
            map.addLayer({
              id: "routes-line",
              type: "line",
              source: "routes",
              paint: {
                "line-color": ["get", "color"],
                "line-width": 4,
                "line-opacity": 0.9,
              },
            });
          }
          setStatus("loaded");
        });

        map.on("error", () => {
          setStatus("error");
        });
      } catch {
        setStatus("error");
      }
    }

    void loadMap();

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      onCaptureReady?.(null);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onCaptureReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "loaded") return;

    const source = map.getSource("routes") as GeoJSONSource | undefined;
    if (source) {
      source.setData(tripsToFeatureCollection(trips));
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    void import("maplibre-gl").then((maplibregl) => {
      trips.forEach((trip) => {
        getTripPoints(trip).forEach((point, index) => {
          const markerElement = document.createElement("button");
          markerElement.className = `map-marker ${trip.id === selectedTripId ? "active" : ""}`;
          markerElement.style.background = trip.color;
          markerElement.type = "button";
          markerElement.title = getMarkerTooltip(trip, index);
          markerElement.setAttribute("aria-label", `Seleccionar ${trip.title}`);
          markerElement.textContent =
            index === 0 ? "O" : index === trip.stops.length + 1 ? "D" : `${index}`;
          markerElement.addEventListener("click", () => onSelectTrip(trip.id));

          const marker = new maplibregl.Marker({ element: markerElement })
            .setLngLat([point.lng, point.lat])
            .addTo(map);

          markersRef.current.push(marker);
        });
      });
    });
  }, [onSelectTrip, selectedTripId, status, trips]);

  useEffect(() => {
    const map = mapRef.current;
    const selectedTrip = trips.find((trip) => trip.id === selectedTripId);
    if (!map || !selectedTrip || status !== "loaded") return;

    const bounds = calculateBounds(selectedTrip);
    map.fitBounds(bounds, {
      padding: 90,
      maxZoom: 8,
      duration: 700,
    });
  }, [selectedTripId, status, trips]);

  return (
    <div className="map-shell">
      <div ref={mapContainer} className="map-container" />
      {status === "loading" && <div className="map-state">Cargando mapa...</div>}
      {status === "error" && (
        <div className="map-state error">
          No se pudo cargar el mapa. Revisa la conexion o intenta de nuevo mas tarde.
        </div>
      )}
    </div>
  );
}
