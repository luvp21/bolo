import type { DiffOp, ReadResult } from "./types";

// Prisma's default format writes small numbers as digits ("two" -> "2"), while our
// passages spell them out. Map both to words so reading "two" correctly is a match.
const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];

export function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}'\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => (/^\d+$/.test(w) && Number(w) < NUMBER_WORDS.length ? NUMBER_WORDS[Number(w)] : w));
}

/**
 * Word level alignment of what the user said against the reference text.
 * Uses LCS, then pairs up neighbouring missing/extra words as "wrong" so the UI
 * can show "you said X, expected Y".
 */
export function diffWords(reference: string, said: string): ReadResult {
  const ref = normalizeWords(reference);
  const hyp = normalizeWords(said);
  const n = ref.length;
  const m = hyp.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = ref[i] === hyp[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  type Raw = { type: "match" | "missing" | "extra"; ref?: string; said?: string };
  const raw: Raw[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (ref[i] === hyp[j]) {
      raw.push({ type: "match", ref: ref[i], said: hyp[j] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      raw.push({ type: "missing", ref: ref[i++] });
    } else {
      raw.push({ type: "extra", said: hyp[j++] });
    }
  }
  while (i < n) raw.push({ type: "missing", ref: ref[i++] });
  while (j < m) raw.push({ type: "extra", said: hyp[j++] });

  const ops: DiffOp[] = [];
  let k = 0;
  while (k < raw.length) {
    if (raw[k].type === "match") {
      ops.push({ type: "match", ref: raw[k].ref!, said: raw[k].said! });
      k++;
      continue;
    }
    const missing: string[] = [];
    const extra: string[] = [];
    while (k < raw.length && raw[k].type !== "match") {
      if (raw[k].type === "missing") missing.push(raw[k].ref!);
      else extra.push(raw[k].said!);
      k++;
    }
    const pairs = Math.min(missing.length, extra.length);
    for (let p = 0; p < pairs; p++) ops.push({ type: "wrong", ref: missing[p], said: extra[p] });
    for (let p = pairs; p < missing.length; p++) ops.push({ type: "missing", ref: missing[p] });
    for (let p = pairs; p < extra.length; p++) ops.push({ type: "extra", said: extra[p] });
  }

  const matches = ops.filter((o) => o.type === "match").length;
  return { accuracy: n === 0 ? 0 : matches / n, ops };
}
