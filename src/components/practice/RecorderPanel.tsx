"use client";

import { useMicLevel } from "@/hooks/useMicLevel";
import { formatSeconds } from "@/lib/text";
import { MicIcon, StopIcon } from "./icons";

interface RecorderPanelProps {
  isRecording: boolean;
  isStarting: boolean;
  /** Mic button off while something else is happening, e.g. the coach is replying. */
  isDisabled?: boolean;
  elapsedMs: number;
  maxSeconds: number;
  stream: MediaStream | null;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
}

const SIZE = 168;
const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const BAR_COUNT = 5;
/** Bars further from the centre react a little less, so the meter reads as a voice shape. */
const BAR_WEIGHTS = [0.55, 0.8, 1, 0.8, 0.55];

export function RecorderPanel({
  isRecording,
  isStarting,
  isDisabled,
  elapsedMs,
  maxSeconds,
  stream,
  onStart,
  onStop,
  onCancel,
}: RecorderPanelProps) {
  const level = useMicLevel(isRecording ? stream : null);
  const progress = Math.min(1, elapsedMs / (maxSeconds * 1000));
  const remaining = maxSeconds * 1000 - elapsedMs;
  const nearEnd = isRecording && remaining < 5000;

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        {/* Halo grows with your voice, so you can see the mic is hearing you. */}
        <div
          aria-hidden="true"
          className="absolute inset-3 rounded-full bg-accent transition-[transform,opacity] duration-100"
          style={{
            opacity: isRecording ? 0.1 + level * 0.25 : 0,
            transform: `scale(${isRecording ? 1 + level * 0.18 : 0.9})`,
          }}
        />
        <svg width={SIZE} height={SIZE} className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--line-soft)" strokeWidth={3} />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={nearEnd ? "var(--wrong)" : "var(--accent)"}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
            className="transition-[stroke-dashoffset] duration-100 ease-linear"
          />
        </svg>
        <button
          type="button"
          onClick={isRecording ? onStop : onStart}
          disabled={isStarting || isDisabled}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          className={`absolute inset-6 grid place-items-center rounded-full transition-[transform,background-color,box-shadow] duration-300 ease-out-expo active:scale-95 disabled:opacity-60 ${
            isRecording
              ? "bg-ink text-bg shadow-[0_10px_30px_-8px_oklch(0_0_0/0.6)]"
              : "bg-accent text-accent-ink shadow-[0_14px_40px_-12px_var(--accent)] hover:scale-[1.03]"
          }`}
        >
          {isRecording ? <StopIcon className="size-9" /> : <MicIcon className="size-10" />}
        </button>
      </div>

      <div className="flex h-6 items-end gap-1" aria-hidden="true">
        {BAR_WEIGHTS.slice(0, BAR_COUNT).map((w, i) => (
          <span
            key={i}
            className="w-1.5 rounded-full bg-accent transition-[height,opacity] duration-75"
            style={{
              height: `${4 + (isRecording ? level * w * 20 : 0)}px`,
              opacity: isRecording ? 0.5 + level * 0.5 : 0.25,
            }}
          />
        ))}
      </div>

      <p className="tabular text-sm text-ink-2" aria-live="polite">
        {isRecording ? (
          <>
            <span className={nearEnd ? "text-slip" : "text-ink"}>{formatSeconds(elapsedMs)}</span>
            <span className="text-ink-3"> / {formatSeconds(maxSeconds * 1000)}</span>
          </>
        ) : isStarting ? (
          "Asking for your mic..."
        ) : (
          `Tap the mic and speak. Up to ${maxSeconds} seconds.`
        )}
      </p>

      {isRecording && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onStop}
            className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-bg transition-transform active:scale-95"
          >
            Stop
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-line px-5 py-2 text-sm text-ink-2 transition-colors hover:border-ink-3 hover:text-ink"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
