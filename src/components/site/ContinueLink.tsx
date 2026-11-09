"use client";

import Link from "next/link";
import { ArrowIcon } from "@/components/practice/icons";
import { useLastPlace } from "@/hooks/useProgress";
import { STAGES } from "@/lib/types";

const PRIMARY =
  "inline-flex w-fit items-center gap-3 rounded-full bg-accent px-7 py-3.5 text-base font-medium text-accent-ink shadow-[0_14px_36px_-16px_var(--accent)] transition-transform hover:scale-[1.02] active:scale-95";

/** "Continue where you left off" when there is a last place, otherwise a plain start. */
export function ContinueLink() {
  const place = useLastPlace();
  if (!place) {
    return (
      <Link href="/tech" className={PRIMARY}>
        Start with Tech Talk
        <ArrowIcon className="size-5" />
      </Link>
    );
  }
  const stageLabel = STAGES.find((s) => s.id === place.stage)?.label ?? "";
  return (
    <div className="flex flex-col items-start gap-3">
      <Link href={`/${place.track}/${place.taskId}?stage=${place.stage}`} className={PRIMARY}>
        Continue where you left off
        <ArrowIcon className="size-5" />
      </Link>
      <p className="text-sm text-ink-3">
        {place.title}, {stageLabel}
      </p>
    </div>
  );
}
