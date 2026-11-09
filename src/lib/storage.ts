// localStorage can throw in private mode or with blocked site data. Never let that break the app.

export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeStored<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage is a convenience here, the app works without it.
  }
}

export const STORAGE_KEYS = {
  coachMuted: "bolo:coach-muted",
} as const;
