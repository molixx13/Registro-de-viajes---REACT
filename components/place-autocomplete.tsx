"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPinned } from "lucide-react";
import { usePlaceSearch } from "@/hooks/use-place-search";
import type { PlaceOption } from "@/lib/place-search";
import type { TripPoint } from "@/lib/types";

type PlaceAutocompleteProps = {
  label: string;
  point: TripPoint;
  onChange: (point: TripPoint) => void;
};

export function PlaceAutocomplete({ label, point, onChange }: PlaceAutocompleteProps) {
  const [query, setQuery] = useState(point.name);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { options, status } = usePlaceSearch(query);

  useEffect(() => {
    setQuery(point.name);
  }, [point.name]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const selectPlace = (option: PlaceOption) => {
    onChange({
      name: option.name,
      lat: option.lat,
      lng: option.lng,
      description: point.description || option.description
    });
    setQuery(option.name);
    setIsOpen(false);
  };

  return (
    <div className="place-autocomplete" ref={wrapperRef}>
      <label>
        <span>{label}</span>
        <input
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            const name = event.target.value;
            setQuery(name);
            setIsOpen(true);
            onChange({ ...point, name });
          }}
          placeholder="Buscar ciudad o lugar"
          autoComplete="off"
        />
      </label>

      {isOpen && query.trim().length >= 3 && (
        <div className="autocomplete-menu" role="listbox" aria-label={`Resultados para ${label}`}>
          {status === "loading" && (
            <div className="autocomplete-status">
              <Loader2 size={15} aria-hidden="true" className="animate-spin" />
              Buscando lugares...
            </div>
          )}
          {status === "error" && (
            <div className="autocomplete-status error">
              No se pudo consultar Photon. Puedes escribir coordenadas manualmente.
            </div>
          )}
          {status === "empty" && (
            <div className="autocomplete-status">No hay resultados para esa busqueda.</div>
          )}
          {options.map((option) => (
            <button
              key={`${option.label}-${option.lat}-${option.lng}`}
              type="button"
              className="autocomplete-option"
              role="option"
              aria-selected={false}
              onClick={() => selectPlace(option)}
            >
              <MapPinned size={16} aria-hidden="true" />
              <span>
                <strong>{option.name}</strong>
                <small>{option.label}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
