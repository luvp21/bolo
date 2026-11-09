import type { Metadata } from "next";
import Link from "next/link";
import { LIST_PAGE, TrackIntro } from "@/components/ladder/TrackIntro";
import { ArrowIcon } from "@/components/practice/icons";
import { CONVO_SCENARIOS } from "@/content";

export const metadata: Metadata = { title: "Conversation · Bolo" };

export default function ConvoListPage() {
  return (
    <main className={LIST_PAGE}>
      <TrackIntro title="Conversation">
        Talk with a coach who plays a role. Speak, press stop, and they reply by voice with at most one correction. End when you like to get a
        score for the whole conversation.
      </TrackIntro>
      <ul className="flex flex-col">
        {CONVO_SCENARIOS.map((c) => (
          <li key={c.id} className="border-t border-line-soft last:border-b">
            <Link href={`/convo/${c.id}`} className="group grid grid-cols-[1fr_auto] items-center gap-6 py-6">
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className="font-serif text-2xl leading-tight text-ink transition-colors group-hover:text-accent sm:text-3xl">{c.title}</span>
                <span className="text-sm text-ink-3 italic">&ldquo;{c.opener}&rdquo;</span>
              </span>
              <ArrowIcon className="size-5 text-ink-3 transition-transform group-hover:translate-x-1 group-hover:text-accent" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
