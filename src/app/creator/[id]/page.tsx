import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CREATOR_PROMPTS, findCreatorPrompt } from "@/content";
import { isStage } from "@/lib/progress";
import { CreatorLadder } from "./CreatorLadder";

export function generateStaticParams() {
  return CREATOR_PROMPTS.map((c) => ({ id: c.id }));
}

export async function generateMetadata(props: PageProps<"/creator/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const prompt = findCreatorPrompt(id);
  return { title: prompt ? `${prompt.title} · Bolo` : "Bolo" };
}

export default async function CreatorPromptPage(props: PageProps<"/creator/[id]">) {
  const { id } = await props.params;
  const { stage } = await props.searchParams;
  const prompt = findCreatorPrompt(id);
  if (!prompt) notFound();
  return <CreatorLadder prompt={prompt} initialStage={isStage(stage) ? stage : "read"} />;
}
