import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findGrammarItem, GRAMMAR_ITEMS } from "@/content";
import { isStage } from "@/lib/progress";
import { GrammarLadder } from "./GrammarLadder";

export function generateStaticParams() {
  return GRAMMAR_ITEMS.map((g) => ({ id: g.id }));
}

export async function generateMetadata(props: PageProps<"/grammar/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const item = findGrammarItem(id);
  return { title: item ? `${item.title} · Bolo` : "Bolo" };
}

export default async function GrammarItemPage(props: PageProps<"/grammar/[id]">) {
  const { id } = await props.params;
  const { stage } = await props.searchParams;
  const item = findGrammarItem(id);
  if (!item) notFound();
  return <GrammarLadder item={item} initialStage={isStage(stage) ? stage : "read"} />;
}
