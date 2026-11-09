import { takeQuota } from "@/lib/quotaServer";
import { llmJson } from "@/lib/llm";
import { CHAT_SYSTEM } from "@/lib/prompts";

// Two Gemini tries of up to 19 s each must fit.
export const maxDuration = 45;

interface Body {
  scenario: string;
  persona: string;
  history: { role: "user" | "coach"; text: string }[];
  userText: string;
}

export async function POST(req: Request) {
  // Signed-in accounts only, with a small free allowance each (see src/lib/quota.ts).
  const quota = await takeQuota("chat");
  if (!quota.ok) return quota.response;
  try {
    const { scenario, persona, history, userText } = (await req.json()) as Body;
    const transcript = history
      .slice(-10)
      .map((h) => `${h.role === "user" ? "User" : "You"}: ${h.text}`)
      .join("\n");
    const out = await llmJson<{ reply: string; correction: string | null }>({
      system: CHAT_SYSTEM(scenario, persona),
      user: `${transcript ? transcript + "\n" : ""}User: ${userText}`,
      temperature: 0.7,
    });
    return Response.json(out);
  } catch (e) {
    await quota.refund();
    if (e instanceof Error && e.name === "TimeoutError") {
      return Response.json({ error: { type: "TIMEOUT", message: "Upstream took too long" } }, { status: 504 });
    }
    const message = e instanceof Error ? e.message : "Chat failed";
    return Response.json({ error: { type: "CHAT_FAILED", message } }, { status: 500 });
  }
}
