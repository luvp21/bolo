// Pure text helpers for the results screen. Safe for client and server.

import type { GrammarFix } from "./types";

/**
 * Splits text into chunks of at most `maxWords` words, breaking on sentence ends
 * where possible, so each TTS request stays short.
 */
export function splitForTts(text: string, maxWords: number): string[] {
  const sentences = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  const chunks: string[] = [];
  let current: string[] = [];
  const flush = () => {
    if (current.length) chunks.push(current.join(" "));
    current = [];
  };

  for (const sentence of sentences) {
    const words = sentence.split(" ");
    if (words.length > maxWords) {
      flush();
      for (let i = 0; i < words.length; i += maxWords) chunks.push(words.slice(i, i + maxWords).join(" "));
      continue;
    }
    if (current.length + words.length > maxWords) flush();
    current = [...current, ...words];
  }
  flush();
  return chunks;
}

export type MarkedSegment =
  | { kind: "text"; text: string }
  | { kind: "fix"; text: string; fix: GrammarFix; index: number };

/**
 * Finds each grammar fix's `original` inside the transcript (case-insensitive,
 * first non-overlapping match) and returns segments to render. Fixes the model
 * paraphrased instead of quoting are skipped here and still show as fix cards.
 */
export function markGrammar(transcript: string, fixes: GrammarFix[]): MarkedSegment[] {
  const lower = transcript.toLowerCase();
  type Hit = { start: number; end: number; fix: GrammarFix; index: number };
  const hits: Hit[] = [];

  fixes.forEach((fix, index) => {
    const needle = fix.original.trim().toLowerCase();
    if (!needle) return;
    let from = 0;
    while (from <= lower.length) {
      const start = lower.indexOf(needle, from);
      if (start === -1) return;
      const end = start + needle.length;
      const overlaps = hits.some((h) => start < h.end && end > h.start);
      if (!overlaps) {
        hits.push({ start, end, fix, index });
        return;
      }
      from = start + 1;
    }
  });

  const sorted = [...hits].sort((a, b) => a.start - b.start);
  const segments: MarkedSegment[] = [];
  let cursor = 0;
  for (const h of sorted) {
    if (h.start > cursor) segments.push({ kind: "text", text: transcript.slice(cursor, h.start) });
    segments.push({ kind: "fix", text: transcript.slice(h.start, h.end), fix: h.fix, index: h.index });
    cursor = h.end;
  }
  if (cursor < transcript.length) segments.push({ kind: "text", text: transcript.slice(cursor) });
  return segments;
}

export function formatSeconds(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `0:${String(total).padStart(2, "0")}`;
}

/**
 * The reference text split exactly like `normalizeWords` in diff.ts, but keeping
 * the original casing, so "rest api" can be shown as "REST API".
 */
export function casedWords(text: string): string[] {
  return text
    .replace(/[^\p{L}\p{N}'\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Which keywords the speaker actually said. Matches whole words, ignores case and
 * punctuation, and lets a plural or "-ing" form count ("caches" counts for "cache").
 */
export function keywordHits(transcript: string, keywords: string[]): Record<string, boolean> {
  const spoken = ` ${casedWords(transcript.toLowerCase()).join(" ")} `;
  const hits: Record<string, boolean> = {};
  for (const keyword of keywords) {
    const words = casedWords(keyword.toLowerCase());
    if (!words.length) {
      hits[keyword] = false;
      continue;
    }
    const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = new RegExp(` ${escaped.join(" ")}(s|es|ing|d|ed)? `);
    hits[keyword] = pattern.test(spoken);
  }
  return hits;
}
