import { llmJson } from "@/lib/llm";
import { CHAT_SYSTEM } from "@/lib/prompts";

export const maxDuration = 30;

interface Body {
  scenario: string;
  persona: string;
  history: { role: "user" | "coach"; text: string }[];
  userText: string;
}

export async function POST(req: Request) {
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
    const message = e instanceof Error ? e.message : "Chat failed";
    return Response.json({ error: { type: "CHAT_FAILED", message } }, { status: 500 });
  }
}
