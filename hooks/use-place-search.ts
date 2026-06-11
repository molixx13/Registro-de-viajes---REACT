"use client";

import { useEffect, useRef, useState } from "react";
import {
  fetchPlaceOptions,
  rememberCachedSearch,
  type PlaceOption,
} from "@/lib/place-search";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 400;

export function usePlaceSearch(query: string) {
  const [options, setOptions] = useState<PlaceOption[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "empty" | "error">(
    "idle"
  );
  const cacheRef = useRef(new Map<string, PlaceOption[]>());

  useEffect(() => {
    const normalizedQuery = query.trim();
    const cacheKey = normalizedQuery.toLowerCase();

    if (normalizedQuery.length < MIN_QUERY_LENGTH) {
      setOptions([]);
      setStatus("idle");
      return;
    }

    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setOptions(cached);
      setStatus(cached.length > 0 ? "success" : "empty");
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setStatus("loading");

      try {
        const nextOptions = await fetchPlaceOptions(normalizedQuery, undefined, (input, init) =>
          fetch(input, { ...init, signal: controller.signal })
        );
        if (controller.signal.aborted) return;
        rememberCachedSearch(cacheRef.current, normalizedQuery, nextOptions);
        setOptions(nextOptions);
        setStatus(nextOptions.length > 0 ? "success" : "empty");
      } catch (error) {
        if (controller.signal.aborted) return;
        setOptions([]);
        setStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  return { options, status };
}
