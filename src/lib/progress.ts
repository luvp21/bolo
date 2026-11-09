// Pure progress rules: attempts per task and stage, unlocks, best scores.
// Storage access lives in hooks/useProgress.ts so this file stays testable.

import type { Stage, Track } from "./types";

/** Ladder order. Mirrors STAGES in types.ts; kept here as a type-only import so node tests can load this file. */
export const STAGE_ORDER: Stage[] = ["read", "recall", "build", "free"];

export const MAX_ATTEMPTS_KEPT = 5;

export interface Attempt {
  score: number;
  at: number;
}

/** Attempts for one task, keyed by stage. */
export type TaskProgress = Partial<Record<Stage, Attempt[]>>;

export interface LastPlace {
  track: Track;
  taskId: string;
  title: string;
  stage: Stage;
}

export function taskKey(track: Track, taskId: string): string {
  return `bolo:progress:${track}:${taskId}`;
}

export const LAST_PLACE_KEY = "bolo:last-place";

/** Returns new progress with the attempt added, keeping only the newest few per stage. */
export function addAttempt(progress: TaskProgress, stage: Stage, attempt: Attempt): TaskProgress {
  const list = [...(progress[stage] ?? []), attempt].slice(-MAX_ATTEMPTS_KEPT);
  return { ...progress, [stage]: list };
}

export function bestScore(attempts: Attempt[] | undefined): number | undefined {
  if (!attempts?.length) return undefined;
  return Math.max(...attempts.map((a) => a.score));
}

export function lastScore(attempts: Attempt[] | undefined): number | undefined {
  return attempts?.length ? attempts[attempts.length - 1].score : undefined;
}

/** Stage 1 is always open; each later stage opens after one attempt of the stage before it. */
export function isUnlocked(progress: TaskProgress, stage: Stage): boolean {
  const index = STAGE_ORDER.indexOf(stage);
  if (index <= 0) return true;
  return (progress[STAGE_ORDER[index - 1]]?.length ?? 0) > 0;
}

/** The furthest unlocked stage that has not been tried yet, or the last stage. */
export function nextStageToTry(progress: TaskProgress): Stage {
  const open = STAGE_ORDER.filter((s) => isUnlocked(progress, s));
  const untried = open.find((s) => !progress[s]?.length);
  return untried ?? open[open.length - 1];
}

export function isStage(value: unknown): value is Stage {
  return STAGE_ORDER.includes(value as Stage);
}
