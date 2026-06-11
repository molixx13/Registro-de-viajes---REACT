"use client";

import { useMemo, useState } from "react";
import { Plus, Save, Trash2, X, Loader2 } from "lucide-react";
import { PlaceAutocomplete } from "@/components/place-autocomplete";
import type { Trip, TripDraft, TripPoint } from "@/lib/types";

type TripFormProps = {
  trip: Trip | null;
  onSave: (trip: TripDraft) => void;
  onCancel: () => void;
  isSaving?: boolean;
};

const colors = ["#0f766e", "#2563eb", "#d97706", "#be123c", "#7c3aed"];

const emptyDraft: TripDraft = {
  title: "",
  startDate: "2026-06-10",
  endDate: "2026-06-12",
  origin: { name: "", lat: 4.711, lng: -74.0721, description: "" },
  destination: { name: "", lat: 6.2442, lng: -75.5812, description: "" },
  stops: [],
  notes: "",
  color: colors[0]
};

function pointToInputs(
  prefix: string,
  point: TripPoint,
  setPoint: (point: TripPoint) => void,
  options?: { autocomplete?: boolean }
) {
  return (
    <div className="point-editor">
      {options?.autocomplete ? (
        <PlaceAutocomplete label={prefix} point={point} onChange={setPoint} />
      ) : (
        <label>
          <span>{prefix}</span>
          <input
            value={point.name}
            onChange={(event) => setPoint({ ...point, name: event.target.value })}
            placeholder="Nombre del lugar"
          />
        </label>
      )}
      <label>
        <span>Descripcion</span>
        <textarea
          value={point.description ?? ""}
          onChange={(event) => setPoint({ ...point, description: event.target.value })}
          rows={2}
          placeholder="Detalle breve de este punto"
        />
      </label>
      <div className="point-grid">
      <label>
        <span>Latitud</span>
        <input
          type="number"
          step="0.0001"
          value={point.lat}
          onChange={(event) => setPoint({ ...point, lat: Number(event.target.value) })}
        />
      </label>
      <label>
        <span>Longitud</span>
        <input
          type="number"
          step="0.0001"
          value={point.lng}
          onChange={(event) => setPoint({ ...point, lng: Number(event.target.value) })}
        />
      </label>
      </div>
    </div>
  );
}

export function TripForm({ trip, onSave, onCancel, isSaving }: TripFormProps) {
  const initialDraft = useMemo<TripDraft>(() => {
    if (!trip) return emptyDraft;
    return {
      title: trip.title,
      startDate: trip.startDate,
      endDate: trip.endDate,
      origin: trip.origin,
      destination: trip.destination,
      stops: trip.stops,
      notes: trip.notes,
      color: trip.color
    };
  }, [trip]);
  const [draft, setDraft] = useState<TripDraft>(initialDraft);

  const save = () => {
    onSave(draft);
  };

  const updateStop = (index: number, stop: TripPoint) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      stops: currentDraft.stops.map((currentStop, currentIndex) =>
        currentIndex === index ? stop : currentStop
      )
    }));
  };

  const addStop = () => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      stops: [
        ...currentDraft.stops,
        {
          name: "",
          lat: currentDraft.origin.lat,
          lng: currentDraft.origin.lng,
          description: ""
        }
      ]
    }));
  };

  const removeStop = (index: number) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      stops: currentDraft.stops.filter((_, currentIndex) => currentIndex !== index)
    }));
  };

  return (
    <form
      className="trip-form"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <div className="form-header">
        <h2>{trip ? "Editar viaje" : "Nuevo viaje"}</h2>
        {trip && (
          <button className="icon-button" type="button" title="Cancelar" onClick={onCancel} disabled={isSaving}>
            <X size={18} aria-hidden="true" />
            <span className="sr-only">Cancelar edicion</span>
          </button>
        )}
      </div>

      <fieldset disabled={isSaving} style={{ border: "none", padding: 0, margin: 0, display: "contents" }}>
        <label>
          <span>Titulo</span>
          <input
            value={draft.title}
            onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            placeholder="Ej. Costa mediterranea"
          />
        </label>

        <div className="date-grid">
          <label>
            <span>Fecha de inicio</span>
            <input
              type="date"
              value={draft.startDate}
              onChange={(event) => setDraft({ ...draft, startDate: event.target.value })}
            />
          </label>
          <label>
            <span>Fecha de fin</span>
            <input
              type="date"
              value={draft.endDate}
              onChange={(event) => setDraft({ ...draft, endDate: event.target.value })}
            />
          </label>
        </div>

        {pointToInputs("Origen", draft.origin, (origin) => setDraft({ ...draft, origin }), {
          autocomplete: true
        })}
        {pointToInputs(
          "Destino",
          draft.destination,
          (destination) => setDraft({ ...draft, destination }),
          {
            autocomplete: true
          }
        )}

        <section className="stops-editor" aria-label="Paradas intermedias">
          <div className="section-header">
            <h3>Paradas intermedias</h3>
            <button className="button compact" type="button" onClick={addStop}>
              <Plus size={16} aria-hidden="true" />
              Añadir
            </button>
          </div>
          {draft.stops.length === 0 && <p className="empty-copy">Sin paradas intermedias.</p>}
          {draft.stops.map((stop, index) => (
            <div className="stop-card" key={`${index}-${stop.name}`}>
              <div className="section-header">
                <h4>Parada {index + 1}</h4>
                <button
                  className="icon-button"
                  type="button"
                  title="Eliminar parada"
                  aria-label={`Eliminar parada ${index + 1}`}
                  onClick={() => removeStop(index)}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
              {pointToInputs(`Nombre de parada ${index + 1}`, stop, (nextStop) =>
                updateStop(index, nextStop)
              )}
            </div>
          ))}
        </section>

        <label>
          <span>Notas</span>
          <textarea
            value={draft.notes}
            onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
            rows={3}
            placeholder="Recuerdos, pendientes o contexto del viaje"
          />
        </label>

        <fieldset className="color-field">
          <legend>Color de ruta</legend>
          <div className="swatches">
            {colors.map((color) => (
              <label key={color} className="swatch-label">
                <input
                  type="radio"
                  name="route-color"
                  value={color}
                  checked={draft.color === color}
                  onChange={() => setDraft({ ...draft, color })}
                />
                <span className="swatch" style={{ background: color }} />
              </label>
            ))}
          </div>
        </fieldset>

        <button className="button primary" type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              Calculando ruta...
            </>
          ) : (
            <>
              <Save size={18} aria-hidden="true" />
              Guardar viaje
            </>
          )}
        </button>
      </fieldset>
    </form>
  );
}
