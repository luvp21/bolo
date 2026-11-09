import type { Metadata } from "next";
import { LIST_PAGE, TrackIntro } from "@/components/ladder/TrackIntro";
import { AnyTopicForm } from "./AnyTopicForm";

export const metadata: Metadata = { title: "Any topic · Bolo" };

export default function AnyTopicPage() {
  return (
    <main className={LIST_PAGE}>
      <TrackIntro title="Any topic">
        Name anything you want to learn to explain. Bolo writes a short passage about it, and you climb the same four stages: read it, say it
        back, build your own, speak freely. You learn the topic and how to say it.
      </TrackIntro>
      <AnyTopicForm />
      <p className="text-sm text-ink-3">Passages are written by AI for practice. Check facts that matter. Your topics stay in this browser.</p>
    </main>
  );
}
