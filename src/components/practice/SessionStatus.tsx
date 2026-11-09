import Link from "next/link";
import type { FriendlyError } from "@/lib/errors";
import { CheckIcon, RetryIcon } from "./icons";

export type ProcessingStep = "transcribe" | "analyze";

const STEPS: { id: ProcessingStep; label: string }[] = [
  { id: "transcribe", label: "Listening back with Gnani Prisma" },
  { id: "analyze", label: "Checking your words and structure" },
];

/** Honest progress: each line is a real request that is in flight or done. */
export function ProcessingView({ step }: { step: ProcessingStep }) {
  const current = STEPS.findIndex((s) => s.id === step);
  return (
    <div className="flex flex-col items-center gap-8 py-16" role="status" aria-live="polite">
      <div className="flex h-10 items-end gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <span
            key={i}
            className="breathe w-1.5 rounded-full bg-accent"
            style={{ height: `${12 + ((i * 7) % 5) * 6}px`, animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
      <ol className="flex flex-col gap-3">
        {STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s.id} className={`flex items-center gap-3 text-sm ${done ? "text-ink-3" : active ? "text-ink" : "text-ink-3/60"}`}>
              <span className="grid size-5 place-items-center">
                {done ? <CheckIcon className="size-4 text-accent" /> : <span className={`size-1.5 rounded-full ${active ? "breathe bg-accent" : "bg-line"}`} />}
              </span>
              {s.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

interface ErrorPanelProps {
  error: FriendlyError;
  onRetry: () => void;
}

export function ErrorPanel({ error, onRetry }: ErrorPanelProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center" role="alert">
      <span className="size-2 rounded-full bg-slip" aria-hidden="true" />
      <h2 className="font-serif text-3xl leading-tight text-balance">{error.title}</h2>
      <p className="text-ink-2">{error.hint}</p>
      {error.action ? (
        <Link
          href={error.action.href}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-accent-ink transition-transform active:scale-95"
        >
          {error.action.label}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-medium text-bg transition-transform active:scale-95"
        >
          <RetryIcon className="size-5" />
          Try again
        </button>
      )}
    </div>
  );
}
