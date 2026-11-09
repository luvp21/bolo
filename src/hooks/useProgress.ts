"use client";

import { useCallback, useSyncExternalStore } from "react";
import { addAttempt, LAST_PLACE_KEY, type LastPlace, type TaskProgress, taskKey } from "@/lib/progress";
import { writeStored } from "@/lib/storage";
import type { Stage, Track } from "@/lib/types";

const CHANGE_EVENT = "bolo:storage";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

// useSyncExternalStore needs a stable value per raw string, so parse once per change.
const parsedCache = new Map<string, { raw: string | null; value: unknown }>();

function parseCached<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  const hit = parsedCache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  parsedCache.set(key, { raw, value });
  return value;
}

const EMPTY_PROGRESS: TaskProgress = {};

/** Reads a stored JSON value. Renders the fallback on the server and during hydration. */
export function useStored<T>(key: string, fallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => parseCached(key, fallback),
    () => fallback,
  );
}

export function saveStored<T>(key: string, value: T): void {
  writeStored(key, value);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useTaskProgress(track: Track, taskId: string) {
  const key = taskKey(track, taskId);
  const progress = useStored<TaskProgress>(key, EMPTY_PROGRESS);

  const record = useCallback(
    (stage: Stage, score: number) => {
      const current = parseCached<TaskProgress>(key, EMPTY_PROGRESS);
      saveStored(key, addAttempt(current, stage, { score, at: Date.now() }));
    },
    [key],
  );

  return { progress, record };
}

export function useLastPlace(): LastPlace | null {
  return useStored<LastPlace | null>(LAST_PLACE_KEY, null);
}

export function saveLastPlace(place: LastPlace): void {
  saveStored(LAST_PLACE_KEY, place);
}
