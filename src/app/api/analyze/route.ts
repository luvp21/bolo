import { diffWords } from "@/lib/diff";
import { llmJson } from "@/lib/llm";
import { computeMetrics } from "@/lib/metrics";
import { ANALYZE_SYSTEM, analyzeUserPrompt } from "@/lib/prompts";
import type { AnalyzeResponse, Feedback, Stage, Track } from "@/lib/types";

export const maxDuration = 45;

interface Body {
  track: Track;
  stage: Stage;
  taskPrompt: string;
  referenceText?: string;
  transcript: string;
  durationMs: number;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const metrics = computeMetrics(body.transcript, body.durationMs);

    // Stage 1 (read aloud) gets a deterministic word-by-word check against the text.
    const read =
      (body.stage === "read" || body.stage === "recall") && body.referenceText
        ? diffWords(body.referenceText, body.transcript)
        : undefined;
    const wrongWords = read?.ops
      .filter((o) => o.type === "missing" || o.type === "wrong")
      .map((o) => (o.type === "wrong" ? `${o.said} (should be ${o.ref})` : (o as { ref: string }).ref));

    const feedback = await llmJson<Feedback>({
      system: ANALYZE_SYSTEM,
      user: analyzeUserPrompt({
        track: body.track,
        stage: body.stage,
        taskPrompt: body.taskPrompt,
        referenceText: body.referenceText,
        transcript: body.transcript,
        wordsPerMinute: metrics.wordsPerMinute,
        fillerCount: metrics.fillerCount,
        readAccuracy: read?.accuracy,
        wrongWords,
      }),
    });

    // Blend the model's score with the objective read accuracy on the read stage.
    if (read && body.stage === "read") {
      feedback.score = Math.round(read.accuracy * 70 + Math.min(100, feedback.score) * 0.3);
    }

    const out: AnalyzeResponse = { feedback, metrics, read };
    return Response.json(out);
  } catch (e) {
    if (e instanceof Error && e.name === "TimeoutError") {
      return Response.json({ error: { type: "TIMEOUT", message: "Upstream took too long" } }, { status: 504 });
    }
    const message = e instanceof Error ? e.message : "Analyze failed";
    return Response.json({ error: { type: "ANALYZE_FAILED", message } }, { status: 500 });
  }
}
