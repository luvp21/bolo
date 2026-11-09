import type { Metadata } from "next";
import { TaskList } from "@/components/ladder/TaskList";
import { LIST_PAGE, TrackIntro } from "@/components/ladder/TrackIntro";
import { GRAMMAR_ITEMS } from "@/content";

export const metadata: Metadata = { title: "Grammar · Bolo" };

export default function GrammarPage() {
  return (
    <main className={LIST_PAGE}>
      <TrackIntro title="Grammar">
        Short everyday sentences. Read one, say it back, build your own with the same pattern, then talk about your day. The rule is shown after
        every try.
      </TrackIntro>
      <TaskList track="grammar" items={GRAMMAR_ITEMS.map((g) => ({ id: g.id, title: g.title, subtitle: g.sentence }))} />
    </main>
  );
}
