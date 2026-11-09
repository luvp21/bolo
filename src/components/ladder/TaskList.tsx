"use client";

import Link from "next/link";
import { ArrowIcon } from "@/components/practice/icons";
import { useTaskProgress } from "@/hooks/useProgress";
import { bestScore, nextStageToTry, STAGE_ORDER } from "@/lib/progress";
import type { Track } from "@/lib/types";
import { LadderDots } from "./LadderDots";

export interface TaskListItem {
  id: string;
  title: string;
  subtitle: string;
}

interface TaskListProps {
  track: Track;
  items: TaskListItem[];
}

/** A list of tasks for one track, each with its ladder progress and best score. */
export function TaskList({ track, items }: TaskListProps) {
  return (
    <ul className="flex flex-col">
      {items.map((item) => (
        <TaskRow key={item.id} track={track} item={item} />
      ))}
    </ul>
  );
}

function TaskRow({ track, item }: { track: Track; item: TaskListItem }) {
  const { progress } = useTaskProgress(track, item.id);
  const best = Math.max(-1, ...STAGE_ORDER.map((s) => bestScore(progress[s]) ?? -1));
  const stage = nextStageToTry(progress);

  return (
    <li className="border-t border-line-soft last:border-b">
      <Link
        href={`/${track}/${item.id}?stage=${stage}`}
        className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 py-6 sm:grid-cols-[minmax(0,1fr)_8rem_auto]"
      >
        <span className="flex min-w-0 flex-col gap-1.5">
          <span className="font-serif text-2xl leading-tight text-ink transition-colors group-hover:text-accent sm:text-3xl">
            {item.title}
          </span>
          <span className="line-clamp-1 text-sm text-ink-3">{item.subtitle}</span>
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
