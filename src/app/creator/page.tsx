import type { Metadata } from "next";
import { TaskList } from "@/components/ladder/TaskList";
import { LIST_PAGE, TrackIntro } from "@/components/ladder/TrackIntro";
import { CREATOR_PROMPTS } from "@/content";

export const metadata: Metadata = { title: "Creator · Bolo" };

export default function CreatorPage() {
  return (
    <main className={LIST_PAGE}>
      <TrackIntro title="Creator">
        Talk to the camera like a tech creator. Read a script, say it from memory, write your own hook, then go free. The camera is an optional
        mirror. Only your voice is scored.
      </TrackIntro>
      <TaskList track="creator" items={CREATOR_PROMPTS.map((c) => ({ id: c.id, title: c.title, subtitle: c.script }))} />
    </main>
  );
}
