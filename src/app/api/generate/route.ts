import { checkTopicInput, toPassage } from "@/lib/customTopic";
import { llmJson } from "@/lib/llm";
import { GENERATE_SYSTEM } from "@/lib/prompts";

// Two Gemini tries of up to 19 s each must fit.
export const maxDuration = 45;

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as { topic?: unknown } | null;
    const check = checkTopicInput(body?.topic);
    if (!check.ok) return Response.json({ error: { type: "BAD_TOPIC", message: check.error } }, { status: 400 });

    const raw = await llmJson<unknown>({ system: GENERATE_SYSTEM, user: `Topic: ${check.value}`, temperature: 0.5 });
    const passage = toPassage(raw, check.value, crypto.randomUUID().slice(0, 6));
    if (!passage) {
      return Response.json({ error: { type: "NO_PASSAGE", message: "Could not write a passage for that topic. Try another one." } }, { status: 422 });
    }
    return Response.json({ passage });
  } catch (e) {
    if (e instanceof Error && e.name === "TimeoutError") {
      return Response.json({ error: { type: "TIMEOUT", message: "Upstream took too long" } }, { status: 504 });
    }
    const message = e instanceof Error ? e.message : "Generate failed";
    return Response.json({ error: { type: "GENERATE_FAILED", message } }, { status: 500 });
  }
}
