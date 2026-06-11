"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, FileText, FileUp, MapPin, Plus, Search, Trash2 } from "lucide-react";
import { TripForm } from "@/components/trip-form";
import { TripMap, type CaptureMapImage } from "@/components/trip-map";
import { TripItinerary } from "@/components/trip-itinerary";
import { useTrips } from "@/hooks/use-trips";
import { printPageWithMapCapture } from "@/lib/print";
import { fetchRoute, getTripPoints, importTripsFromJson, tripToLineString } from "@/lib/trips";
import type { Trip } from "@/lib/types";

export default function Home() {
  const {
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
    selectTrip,
    clearError
  } = useTrips();
  const [query, setQuery] = useState("");
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [printMapImage, setPrintMapImage] = useState<string | null>(null);
  const [printMapError, setPrintMapError] = useState(false);
  const captureMapRef = useRef<CaptureMapImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTrips = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return trips;

    return trips.filter((trip) =>
      [trip.title, trip.origin.name, trip.destination.name, trip.notes]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [query, trips]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({ trips }, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `viajes-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    setImportError(null);

    try {
      const content = await file.text();
      const parsedTrips = importTripsFromJson(content);
      replaceTrips(parsedTrips);
      setEditingTrip(null);
    } catch (caughtError) {
      setImportError(
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo importar el archivo."
      );
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCaptureReady = useCallback((capture: CaptureMapImage | null) => {
    captureMapRef.current = capture;
  }, []);

  const handlePrintPdf = () => {
    void printPageWithMapCapture({
      captureMapImage: captureMapRef.current,
      setPrintMapImage,
      setPrintMapError
    });
  };

  const handleSave = async (tripInput: Omit<Trip, "id" | "createdAt" | "updatedAt">) => {
    setIsSaving(true);

    try {
      const points = getTripPoints(tripInput);
      const route = await fetchRoute(points);
      const enriched = { ...tripInput, ...route };

      if (editingTrip) {
        updateTrip(editingTrip.id, enriched);
        setEditingTrip(null);
        return;
      }

      const created = addTrip(enriched);
      if (created) {
        selectTrip(created.id);
      }
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!selectedTrip || selectedTrip.routeGeometry || !isHydrated) return;

    const controller = new AbortController();

    const loadRoute = async () => {
      const points = getTripPoints(selectedTrip);
      const route = await fetchRoute(points, controller.signal);
      if (route && !controller.signal.aborted) {
        enrichTrip(selectedTrip.id, route);
      }
    };

    loadRoute();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrip?.id, isHydrated, enrichTrip]);

  return (
    <main className="shell">
      <section className="app-header" aria-labelledby="app-title">
        <div>
          <p className="eyebrow">Bitacora geogrÃ¡fica</p>
          <h1 id="app-title">Registro de viajes</h1>
          <p className="subtitle">
            Guarda rutas, revisa paradas y conserva tu historial en JSON.
          </p>
        </div>
        <div className="header-actions">
          <button className="button ghost" type="button" onClick={handleExport}>
            <Download size={18} aria-hidden="true" />
            JSON
          </button>
          <button className="button ghost" type="button" onClick={handlePrintPdf}>
            <FileText size={18} aria-hidden="true" />
            PDF
          </button>
          <button
            className="button ghost"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp size={18} aria-hidden="true" />
            Importar
          </button>
          <input
            ref={fileInputRef}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            aria-label="Importar viajes en JSON"
            onChange={(event) => void handleImport(event.target.files?.[0])}
          />
        </div>
      </section>

      {(error || importError) && (
        <div className="notice error" role="alert">
          <span>{error ?? importError}</span>
          <button type="button" onClick={() => (error ? clearError() : setImportError(null))}>
            Cerrar
          </button>
        </div>
      )}

      {!isHydrated && <div className="notice">Cargando viajes guardados...</div>}

      <section className="dashboard" aria-label="Panel de viajes">
        <aside className="sidebar">
          <div className="toolbar">
            <label className="search-box">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Buscar viajes</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar viaje, destino o nota"
              />
            </label>
            <button
              className="icon-button"
              type="button"
              title="Crear viaje"
              aria-label="Crear viaje"
              onClick={() => {
                setEditingTrip(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <Plus size={19} aria-hidden="true" />
            </button>
          </div>

          <div className="trip-list" aria-label="Viajes guardados">
            {filteredTrips.map((trip) => (
              <button
                key={trip.id}
                className={`trip-item ${trip.id === selectedTripId ? "active" : ""}`}
                type="button"
                onClick={() => selectTrip(trip.id)}
              >
                <span className="route-dot" style={{ background: trip.color }} />
                <span>
                  <strong>{trip.title}</strong>
                  <small>
                    {trip.origin.name} a {trip.destination.name}
                  </small>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="map-panel" aria-label="Mapa de rutas">
          <TripMap
            trips={trips}
            selectedTripId={selectedTripId}
            onSelectTrip={selectTrip}
            onCaptureReady={handleCaptureReady}
          />
          <div className="print-map">
            {printMapImage ? (
              <img src={printMapImage} alt="Mapa de la ruta seleccionada" />
            ) : printMapError ? (
              <p>Mapa no disponible para impresion.</p>
            ) : null}
          </div>
        </section>

        <aside className="details-panel">
          <div className="selected-trip">
            {selectedTrip ? (
              <>
                <div className="details-title">
                  <span className="route-dot large" style={{ background: selectedTrip.color }} />
                  <div>
                    <h2>{selectedTrip.title}</h2>
                    <p>
                      {selectedTrip.startDate} - {selectedTrip.endDate}
                    </p>
                  </div>
                </div>
                <div className="route-summary">
                  <MapPin size={18} aria-hidden="true" />
                  <span>
                    {selectedTrip.origin.name} {"->"} {selectedTrip.destination.name}
                  </span>
                </div>
                <p className="notes">{selectedTrip.notes}</p>
                <TripItinerary trip={selectedTrip} />
                <div className="stats">
                  <span>{selectedTrip.stops.length} paradas</span>
                  <span>
                    {tripToLineString(selectedTrip).geometry.coordinates.length} puntos
                  </span>
                </div>
                <div className="detail-actions">
                  <button
                    className="button"
                    type="button"
                    onClick={() => setEditingTrip(selectedTrip)}
                  >
                    Editar
                  </button>
                  <button
                    className="button danger"
                    type="button"
                    onClick={() => deleteTrip(selectedTrip.id)}
                  >
                    <Trash2 size={17} aria-hidden="true" />
                    Eliminar
                  </button>
                </div>
              </>
            ) : (
              <p>Selecciona un viaje para ver detalles.</p>
            )}
          </div>

          <TripForm
            key={editingTrip?.id ?? "new-trip"}
            trip={editingTrip}
            onCancel={() => setEditingTrip(null)}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </aside>
      </section>
    </main>
  );
}

