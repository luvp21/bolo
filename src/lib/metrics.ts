import type { Metrics } from "./types";
import { normalizeWords } from "./diff";

// Prisma usually drops "um" and "uh", so we count the fillers that survive in
// the transcript. Say this honestly in the UI: "fillers detected", not "all fillers".
const SINGLE_FILLERS = ["um", "uh", "umm", "uhh", "like", "basically", "actually", "literally", "so", "right", "okay", "yaar", "matlab"];
const PHRASE_FILLERS = ["you know", "i mean", "kind of", "sort of"];

export function computeMetrics(transcript: string, durationMs: number): Metrics {
  const words = normalizeWords(transcript);
  const wordCount = words.length;
  const minutes = Math.max(durationMs, 1) / 60000;
  const wordsPerMinute = Math.round(wordCount / minutes);

  const fillers: Record<string, number> = {};
  for (const w of words) {
    if (SINGLE_FILLERS.includes(w)) fillers[w] = (fillers[w] ?? 0) + 1;
  }
  const joined = ` ${words.join(" ")} `;
  for (const p of PHRASE_FILLERS) {
    const count = joined.split(` ${p} `).length - 1;
    if (count > 0) fillers[p] = count;
  }
  const fillerCount = Object.values(fillers).reduce((a, b) => a + b, 0);

  return { durationMs, wordCount, wordsPerMinute, fillerCount, fillers };
}
