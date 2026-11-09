import { GnaniError, transcribe } from "@/lib/gnani";

export const maxDuration = 30;

function parseList(v: FormDataEntryValue | null): string[] | undefined {
  if (typeof v !== "string" || !v.trim()) return undefined;
  try {
    const parsed = JSON.parse(v);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // fall through to comma split
  }
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const audio = form.get("audio");
    if (!(audio instanceof Blob) || audio.size === 0) {
      return Response.json({ error: { type: "NO_AUDIO", message: "No audio received" } }, { status: 400 });
    }
    const result = await transcribe({
      audio,
      languageCode: (form.get("language") as string) || undefined,
      format: (form.get("format") as "transcribe" | "codemix" | "verbatim" | "transliterate") || undefined,
      keyterms: parseList(form.get("keyterms")),
      topic: (form.get("topic") as string) || undefined,
      previousText: (form.get("previousText") as string) || undefined,
    });
    return Response.json(result);
  } catch (e) {
    if (e instanceof GnaniError) {
      return Response.json({ error: { type: e.type, message: e.message } }, { status: e.status });
    }
    if (e instanceof Error && e.name === "TimeoutError") {
      return Response.json({ error: { type: "TIMEOUT", message: "Upstream took too long" } }, { status: 504 });
    }
    const message = e instanceof Error ? e.message : "STT failed";
    return Response.json({ error: { type: "STT_FAILED", message } }, { status: 500 });
  }
}
