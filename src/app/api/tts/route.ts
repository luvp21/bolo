import { GnaniError, speak } from "@/lib/gnani";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { text, voice, language, speed } = await req.json();
    if (typeof text !== "string" || !text.trim()) {
      return Response.json({ error: { type: "NO_TEXT", message: "text is required" } }, { status: 400 });
    }
    // Keep replies short: Vercel caps responses at 4.5 MB, 48 kHz mono WAV is ~96 KB/s.
    const audio = await speak({ text: text.slice(0, 600), voice, language, speed });
    return new Response(audio, { headers: { "Content-Type": "audio/wav", "Cache-Control": "no-store" } });
  } catch (e) {
    if (e instanceof GnaniError) {
      return Response.json({ error: { type: e.type, message: e.message } }, { status: e.status });
    }
    if (e instanceof Error && e.name === "TimeoutError") {
      return Response.json({ error: { type: "TIMEOUT", message: "Upstream took too long" } }, { status: 504 });
    }
    const message = e instanceof Error ? e.message : "TTS failed";
    return Response.json({ error: { type: "TTS_FAILED", message } }, { status: 500 });
  }
}
