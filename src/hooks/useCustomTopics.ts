"use client";

import { useCallback } from "react";
import type { TechPassage } from "@/content";
import { CUSTOM_TOPICS_KEY, MAX_CUSTOM_TOPICS } from "@/lib/customTopic";
import { saveStored, useStored } from "./useProgress";

const EMPTY: TechPassage[] = [];

/** Passages the user generated with "Any topic", newest first. Stored in this browser only. */
export function useCustomTopics() {
  const topics = useStored<TechPassage[]>(CUSTOM_TOPICS_KEY, EMPTY);

  const add = useCallback(
    (passage: TechPassage) => {
      const next = [passage, ...topics.filter((t) => t.id !== passage.id)].slice(0, MAX_CUSTOM_TOPICS);
      saveStored(CUSTOM_TOPICS_KEY, next);
    },
    [topics],
  );

  const remove = useCallback(
    (id: string) => saveStored(CUSTOM_TOPICS_KEY, topics.filter((t) => t.id !== id)),
    [topics],
  );

  return { topics, add, remove };
}
