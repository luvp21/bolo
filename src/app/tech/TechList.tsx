"use client";

import Link from "next/link";
import { LadderDots } from "@/components/ladder/LadderDots";
import { ArrowIcon } from "@/components/practice/icons";
import type { TechPassage } from "@/content";
import { useTaskProgress } from "@/hooks/useProgress";
import { bestScore, nextStageToTry, STAGE_ORDER } from "@/lib/progress";

export function TechList({ passages }: { passages: TechPassage[] }) {
  return (
    <ul className="flex flex-col">
      {passages.map((p) => (
        <PassageRow key={p.id} passage={p} />
      ))}
    </ul>
  );
}

function PassageRow({ passage }: { passage: TechPassage }) {
  const { progress } = useTaskProgress("tech", passage.id);
  const best = Math.max(-1, ...STAGE_ORDER.map((s) => bestScore(progress[s]) ?? -1));
  const stage = nextStageToTry(progress);

  return (
    <li className="border-t border-line-soft last:border-b">
      <Link
        href={`/tech/${passage.id}?stage=${stage}`}
        className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 py-6 transition-colors sm:grid-cols-[minmax(0,1fr)_8rem_auto]"
      >
        <span className="flex min-w-0 flex-col gap-1.5">
          <span className="font-serif text-2xl leading-tight text-ink transition-colors group-hover:text-accent sm:text-3xl">
            {passage.title}
          </span>
          <span className="line-clamp-1 text-sm text-ink-3">{passage.text}</span>
          <span className="mt-1 flex items-center gap-3 sm:hidden">
            <LadderDots progress={progress} />
            {best >= 0 && <span className="tabular text-xs text-ink-3">Best {best}</span>}
          </span>
        </span>
        <span className="hidden flex-col items-start gap-2 sm:flex">
          <LadderDots progress={progress} />
          <span className="tabular text-xs text-ink-3">{best >= 0 ? `Best ${best}` : "Not started"}</span>
        </span>
        <ArrowIcon className="size-5 text-ink-3 transition-transform group-hover:translate-x-1 group-hover:text-accent" />
      </Link>
    </li>
  );
}
