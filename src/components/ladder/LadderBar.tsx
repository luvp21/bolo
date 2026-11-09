import { bestScore, isUnlocked, type TaskProgress } from "@/lib/progress";
import { STAGES, type Stage } from "@/lib/types";

interface LadderBarProps {
  progress: TaskProgress;
  current: Stage;
  onSelect: (stage: Stage) => void;
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden="true">
      <rect x="5.5" y="10.5" width="13" height="9" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </svg>
  );
}

/** The four rungs of the ladder. Locked rungs open after one try of the rung before. */
export function LadderBar({ progress, current, onSelect }: LadderBarProps) {
  return (
    <nav aria-label="Practice stages">
      <ol className="grid grid-cols-4 gap-2 sm:gap-3">
        {STAGES.map((s, i) => {
          const open = isUnlocked(progress, s.id);
          const active = s.id === current;
          const best = bestScore(progress[s.id]);
          return (
            <li key={s.id}>
              <button
                type="button"
                disabled={!open}
                onClick={() => onSelect(s.id)}
                aria-current={active ? "step" : undefined}
                className={`group flex w-full flex-col gap-2.5 text-left transition-opacity disabled:cursor-not-allowed ${
                  open ? "" : "opacity-45"
                }`}
              >
                <span
                  className={`h-1 rounded-full transition-colors ${
                    active ? "bg-accent" : best !== undefined ? "bg-ink-3" : "bg-line-soft group-hover:bg-line"
                  }`}
                />
                <span className="flex items-baseline justify-between gap-2">
                  <span className={`text-sm leading-tight ${active ? "text-ink" : "text-ink-2"}`}>
                    <span className="tabular hidden text-ink-3 sm:inline">{i + 1}. </span>
                    {s.label}
                  </span>
                  <span className="tabular shrink-0 text-xs text-ink-3">
                    {!open ? <LockIcon /> : best !== undefined ? <span className={active ? "text-accent" : ""}>{best}</span> : null}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface ScoreHistoryProps {
  scores: number[];
}

/** "42 → 58 → 71": the last few tries on this stage, oldest first. */
export function ScoreHistory({ scores }: ScoreHistoryProps) {
  if (scores.length < 2) return null;
  return (
    <p className="tabular flex flex-wrap items-baseline gap-x-2 text-sm text-ink-3" aria-label={`Your last tries: ${scores.join(", ")}`}>
      <span>Your tries</span>
      {scores.map((score, i) => (
        <span key={i} className="flex items-baseline gap-2">
          {i > 0 && <span aria-hidden="true">&rarr;</span>}
          <span className={`font-serif text-lg ${i === scores.length - 1 ? "text-accent" : "text-ink-2"}`}>{score}</span>
        </span>
      ))}
    </p>
  );
}
