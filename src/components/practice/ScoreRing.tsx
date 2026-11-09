"use client";

import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  /** Score of the previous try on the same task, for "+12 from last try". */
  previousScore?: number;
}

const VIEW = 300;
const CENTER = VIEW / 2;
const TICKS = 60;
const INNER = 116;
const OUTER = 136;
const DURATION_MS = 1600;

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** Counts from 0 to `target` once, respecting reduced motion. */
function useCountUp(target: number): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? 1 : DURATION_MS;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(target * easeOutExpo(t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return value;
}

function tickPath(i: number, long: boolean): string {
  const angle = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
  const inner = long ? INNER - 8 : INNER;
  const x1 = CENTER + Math.cos(angle) * inner;
  const y1 = CENTER + Math.sin(angle) * inner;
  const x2 = CENTER + Math.cos(angle) * OUTER;
  const y2 = CENTER + Math.sin(angle) * OUTER;
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/** The hero of the results screen: a level-meter dial that lights up to your score. */
export function ScoreRing({ score, previousScore }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const value = useCountUp(clamped);
  const lit = Math.round((value / 100) * TICKS);
  const shown = Math.round(value);
  const delta = previousScore === undefined ? undefined : clamped - Math.round(previousScore);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative w-full max-w-[18rem]"
        role="img"
        aria-label={`Score ${clamped} out of 100`}
      >
        <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="block w-full" aria-hidden="true">
          {Array.from({ length: TICKS }, (_, i) => {
            const on = i < lit;
            const head = on && i === lit - 1;
            return (
              <path
                key={i}
                d={tickPath(i, head)}
                stroke={on ? "var(--accent)" : "var(--line)"}
                strokeWidth={head ? 5 : 3.5}
                strokeLinecap="round"
                opacity={on ? 0.55 + 0.45 * (i / Math.max(1, lit)) : 1}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="tabular font-serif text-[clamp(4.5rem,11vw,6rem)] leading-none font-light tracking-[-0.03em] text-ink">
            {shown}
          </span>
          <span className="mt-1 text-xs tracking-wide text-ink-3">out of 100</span>
        </div>
      </div>
      {delta !== undefined && (
        <p
          className={`settle rounded-full px-3 py-1 text-sm font-medium tabular ${
            delta > 0 ? "bg-accent-dim text-accent" : "bg-raised text-ink-2"
          }`}
          style={{ ["--i" as string]: 6 }}
        >
          {delta > 0 ? `+${delta} from last try` : delta === 0 ? "Same as last try" : `${delta} from last try`}
        </p>
      )}
    </div>
  );
}
