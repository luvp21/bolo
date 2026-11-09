import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPassage, TECH_PASSAGES } from "@/content";
import { isCustomId } from "@/lib/customTopic";
import { isStage } from "@/lib/progress";
import { CustomLadder } from "./CustomLadder";
import { TechLadder } from "./TechLadder";

export function generateStaticParams() {
  return TECH_PASSAGES.map((p) => ({ id: p.id }));
}

export async function generateMetadata(props: PageProps<"/tech/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const passage = findPassage(id);
  if (isCustomId(id)) return { title: "Your topic · Bolo" };
  return { title: passage ? `${passage.title} · Bolo` : "Bolo" };
}

export default async function TechPassagePage(props: PageProps<"/tech/[id]">) {
  const { id } = await props.params;
  const { stage } = await props.searchParams;
  const initialStage = isStage(stage) ? stage : "read";
  if (isCustomId(id)) return <CustomLadder id={id} initialStage={initialStage} />;
  const passage = findPassage(id);
  if (!passage) notFound();
  return <TechLadder passage={passage} initialStage={isStage(stage) ? stage : "read"} />;
}
