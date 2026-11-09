"use client";

import { useCallback, useEffect, useState } from "react";

export interface AttemptsState {
  /** null while loading or if the check failed (the server still enforces limits). */
  attemptsLeft: number | null;
  unlimited: boolean;
  refresh: () => void;
}

/** How many scored attempts this account has left, so the mic can say so before spending anything. */
export function useAttemptsLeft(): AttemptsState {
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [unlimited, setUnlimited] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch("/api/quota", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { attemptsLeft?: number; unlimited?: boolean } | null) => {
        if (!alive || !d) return;
        setAttemptsLeft(typeof d.attemptsLeft === "number" ? d.attemptsLeft : null);
        setUnlimited(d.unlimited === true);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [version]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  return { attemptsLeft, unlimited, refresh };
}
