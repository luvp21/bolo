"use client";

import Link from "next/link";
import { ArrowIcon } from "@/components/practice/icons";
import { useCustomTopics } from "@/hooks/useCustomTopics";
import { TaskList } from "./TaskList";

/** "Any topic" entry point plus the topics this browser has generated. */
export function YourTopics() {
  const { topics } = useCustomTopics();
  return (
    <section className="flex flex-col gap-6">
      <Link
        href="/tech/new"
        className="group flex items-center justify-between gap-6 rounded-3xl border border-dashed border-accent/50 px-7 py-6 transition-colors hover:border-accent"
      >
        <span className="flex flex-col gap-1.5">
          <span className="font-serif text-3xl text-ink transition-colors group-hover:text-accent">Any topic</span>
          <span className="text-ink-2">Name anything. Bolo writes a passage and you practise explaining it.</span>
        </span>
        <ArrowIcon className="size-6 shrink-0 text-accent transition-transform group-hover:translate-x-1" />
      </Link>
      {topics.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm text-ink-3">Your topics</h2>
          <TaskList track="tech" items={topics.map((t) => ({ id: t.id, title: t.title, subtitle: t.text }))} />
        </div>
      )}
    </section>
  );
}
