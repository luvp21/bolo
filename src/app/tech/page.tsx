import type { Metadata } from "next";
import { TECH_PASSAGES } from "@/content";
import { TechList } from "./TechList";

export const metadata: Metadata = { title: "Tech Talk · Bolo" };

export default function TechPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 pt-10 pb-20 sm:px-8 sm:pt-16">
      <div className="flex max-w-2xl flex-col gap-4">
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-balance sm:text-6xl">Tech Talk</h1>
        <p className="text-lg leading-relaxed text-ink-2">
          Pick a topic. Read it, say it back, build your own version, then speak freely. Each stage opens after one try of the one before.
        </p>
      </div>
      <TechList passages={TECH_PASSAGES} />
    </main>
  );
}
