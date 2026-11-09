import Link from "next/link";
import { ArrowIcon } from "@/components/practice/icons";
import { ContinueLink } from "@/components/site/ContinueLink";
import { STAGES } from "@/lib/types";

const TRACKS = [
  {
    id: "tech",
    name: "Tech Talk",
    blurb: "Explain APIs, caching, Git and Docker out loud, from reading a passage to speaking freely.",
    href: "/tech",
  },
  { id: "grammar", name: "Grammar", blurb: "Everyday sentences and patterns, with the rule in plain words.", href: "/grammar" },
  { id: "creator", name: "Creator", blurb: "Talk to the camera like a tech creator: hook, point, call to action.", href: "/creator" },
  { id: "convo", name: "Conversation", blurb: "Stand-ups, HR rounds and bug explanations, by voice.", href: null },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-4 pt-14 pb-24 sm:px-8 sm:pt-24">
      <section className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-8">
          <h1 className="font-serif text-[clamp(3rem,7vw,5.5rem)] leading-[0.98] tracking-[-0.025em] text-balance">
            Explain tech out loud. Get better every try.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-ink-2">
            Speak for up to 30 seconds. Bolo marks your mistakes on your own words, a coach tells you the one fix that matters, and you try
            again until the score climbs.
          </p>
          <ContinueLink />
        </div>
        <Specimen />
      </section>

      <section aria-labelledby="tracks" className="flex flex-col gap-6">
        <h2 id="tracks" className="font-serif text-3xl tracking-tight">
          Four ways to practise
        </h2>
        <ul className="flex flex-col">
          {TRACKS.map((t) => (
            <li key={t.id} className="border-t border-line-soft last:border-b">
              {t.href ? (
                <Link href={t.href} className="group grid grid-cols-[1fr_auto] items-center gap-6 py-7">
                  <TrackText name={t.name} blurb={t.blurb} isLive />
                  <ArrowIcon className="size-6 text-accent transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <div className="grid grid-cols-[1fr_auto] items-center gap-6 py-7" aria-disabled="true">
                  <TrackText name={t.name} blurb={t.blurb} />
                  <span className="rounded-full border border-line px-3 py-1 text-xs text-ink-3">Soon</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      <footer className="flex flex-col gap-2 text-sm text-ink-3">
        <p>Speech to text by Gnani Prisma v3.0. Coach voice by Gnani Timbre v2.5. Written feedback by Gemini.</p>
        <p>Your progress stays in this browser.</p>
      </footer>
    </main>
  );
}

function TrackText({ name, blurb, isLive }: { name: string; blurb: string; isLive?: boolean }) {
  return (
    <span className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-8">
      <span
        className={`w-56 shrink-0 font-serif text-3xl leading-tight sm:text-4xl ${
          isLive ? "text-ink transition-colors group-hover:text-accent" : "text-ink-3"
        }`}
      >
        {name}
      </span>
      <span className={`max-w-lg leading-relaxed ${isLive ? "text-ink-2" : "text-ink-3"}`}>{blurb}</span>
    </span>
  );
}

/** A small, static sample of the results screen so the mechanism is clear at a glance. */
function Specimen() {
  return (
    <figure className="flex flex-col gap-6 rounded-[2rem] bg-raised p-7 shadow-[0_30px_80px_-40px_oklch(0_0_0/0.8)] sm:p-9" aria-label="Example of Bolo feedback">
      <div className="flex items-baseline justify-between gap-4">
        <span className="tabular font-serif text-5xl font-light text-ink-3 line-through decoration-1">42</span>
        <span className="h-px flex-1 bg-line" aria-hidden="true" />
        <span className="tabular font-serif text-7xl font-light text-accent">81</span>
      </div>
      <p className="font-serif text-2xl leading-[1.7]">
        The cache{" "}
        <del className="text-slip decoration-2">is showing</del>{" "}
        <ins className="rounded bg-mend-dim px-1 text-mend no-underline">shows</ins> old data until it{" "}
        <del className="text-slip decoration-2">expire</del>{" "}
        <ins className="rounded bg-mend-dim px-1 text-mend no-underline">expires</ins>.
      </p>
      <ol className="grid grid-cols-4 gap-2 text-xs text-ink-3">
        {STAGES.map((s, i) => (
          <li key={s.id} className="flex flex-col gap-2">
            <span className={`h-1 rounded-full ${i < 3 ? "bg-accent" : "bg-line-soft"}`} />
            {s.label}
          </li>
        ))}
      </ol>
      <figcaption className="text-sm text-ink-3">Three tries on one answer. Example only.</figcaption>
    </figure>
  );
}
