import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CONVO_SCENARIOS, findConvoScenario } from "@/content";
import { ConvoChat } from "./ConvoChat";

export function generateStaticParams() {
  return CONVO_SCENARIOS.map((c) => ({ id: c.id }));
}

export async function generateMetadata(props: PageProps<"/convo/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const scenario = findConvoScenario(id);
  return { title: scenario ? `${scenario.title} · Bolo` : "Bolo" };
}

export default async function ConvoPage(props: PageProps<"/convo/[id]">) {
  const { id } = await props.params;
  const scenario = findConvoScenario(id);
  if (!scenario) notFound();
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pt-6 pb-20 sm:px-8 sm:pt-10">
      <header className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm text-ink-3">
          <Link href="/convo" className="underline decoration-line underline-offset-4 hover:text-ink">
            Conversation
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink-2">{scenario.title}</span>
        </p>
        <p className="text-ink-2">{scenario.scenario}</p>
      </header>
      <ConvoChat scenario={scenario} />
    </main>
  );
}
