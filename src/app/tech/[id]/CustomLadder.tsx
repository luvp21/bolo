"use client";

import Link from "next/link";
import { useCustomTopics } from "@/hooks/useCustomTopics";
import type { Stage } from "@/lib/types";
import { TechLadder } from "./TechLadder";

/** A ladder for a passage the user generated. It lives in this browser only. */
export function CustomLadder({ id, initialStage }: { id: string; initialStage: Stage }) {
  const { topics } = useCustomTopics();
  const passage = topics.find((t) => t.id === id);
  if (!passage) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start justify-center gap-5 px-4 py-24 sm:px-8">
        <h1 className="font-serif text-4xl leading-tight">This topic is not in this browser</h1>
        <p className="text-lg text-ink-2">Topics you create are saved on the device you made them on. Make it again in a few seconds.</p>
        <Link href="/tech/new" className="rounded-full bg-accent px-6 py-3 font-medium text-accent-ink">
          Make a passage
        </Link>
      </main>
    );
  }
  return <TechLadder passage={passage} initialStage={initialStage} isGenerated />;
}
