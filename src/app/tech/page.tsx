import type { Metadata } from "next";
import { TaskList } from "@/components/ladder/TaskList";
import { LIST_PAGE, TrackIntro } from "@/components/ladder/TrackIntro";
import { TECH_PASSAGES } from "@/content";

export const metadata: Metadata = { title: "Tech Talk · Bolo" };

export default function TechPage() {
  return (
    <main className={LIST_PAGE}>
      <TrackIntro title="Tech Talk">
        Pick a topic. Read it, say it back, build your own version, then speak freely. Each stage opens after one try of the one before.
      </TrackIntro>
      <TaskList track="tech" items={TECH_PASSAGES.map((p) => ({ id: p.id, title: p.title, subtitle: p.text }))} />
    </main>
  );
}
