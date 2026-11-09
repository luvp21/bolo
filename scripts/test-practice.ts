// Run: node --experimental-strip-types scripts/test-practice.ts
import assert from "node:assert/strict";
import { formatSeconds, markGrammar, splitForTts } from "../src/lib/text.ts";
import { ApiError, EmptyTranscriptError, toFriendlyError } from "../src/lib/errors.ts";

// splitForTts keeps every chunk under the word limit and keeps all words.
{
  const text = "One two three. Four five six seven. Eight nine.";
  const chunks = splitForTts(text, 5);
  assert.deepEqual(chunks, ["One two three.", "Four five six seven.", "Eight nine."]);
  assert.deepEqual(splitForTts("a b c. d e.", 10), ["a b c. d e."]);
  const long = Array.from({ length: 23 }, (_, i) => `w${i}`).join(" ");
  const parts = splitForTts(long, 10);
  assert.equal(parts.length, 3);
  assert.ok(parts.every((p) => p.split(" ").length <= 10));
  assert.equal(parts.join(" "), long);
  assert.deepEqual(splitForTts("   ", 10), []);
}

// markGrammar highlights quoted originals case-insensitively and skips misses.
{
  const transcript = "Yesterday I go to the office and he don't know the answer.";
  const fixes = [
    { original: "I go", fixed: "I went", why: "past tense" },
    { original: "he don't", fixed: "he doesn't", why: "third person" },
    { original: "not in transcript", fixed: "x", why: "y" },
  ];
  const segs = markGrammar(transcript, fixes);
  assert.equal(segs.map((s) => s.text).join(""), transcript);
  const marked = segs.filter((s) => s.kind === "fix");
  assert.equal(marked.length, 2);
  assert.equal(marked[0].text, "I go");
  assert.equal(marked[1].kind === "fix" && marked[1].index, 1);
  assert.equal(markGrammar("", fixes).length, 0);
  // Overlapping originals: second one is skipped rather than double-marked.
  const overlap = markGrammar("he don't know", [
    { original: "he don't", fixed: "a", why: "" },
    { original: "don't know", fixed: "b", why: "" },
  ]);
  assert.equal(overlap.filter((s) => s.kind === "fix").length, 1);
  // Original casing differs from the transcript.
  assert.equal(markGrammar("I Go home", [{ original: "i go", fixed: "I went", why: "" }])[0].text, "I Go");
}

// toFriendlyError maps statuses and browser errors to plain messages.
{
  assert.equal(toFriendlyError(new ApiError(402, "HTTP_402", "x")).kind, "credits");
  assert.equal(toFriendlyError(new ApiError(429, "RATE_LIMITED", "x")).kind, "rate");
  assert.equal(toFriendlyError(new ApiError(400, "AUDIO_CONVERSION_ERROR", "x")).kind, "audio");
  assert.equal(toFriendlyError(new ApiError(500, "ANALYZE_FAILED", "x")).kind, "server");
  assert.equal(toFriendlyError(new EmptyTranscriptError()).kind, "empty");
  assert.equal(toFriendlyError(new TypeError("Failed to fetch")).kind, "network");
  assert.equal(toFriendlyError({ name: "NotAllowedError" }).kind, "mic");
  assert.equal(toFriendlyError("weird").kind, "server");
  assert.equal(toFriendlyError(new ApiError(429, "x", "x")).title, "Slow down, try again in a few seconds");
}

assert.equal(formatSeconds(0), "0:00");
assert.equal(formatSeconds(12_400), "0:12");
assert.equal(formatSeconds(30_000), "0:30");

console.log("practice tests passed");

// casedWords lines up one to one with diff.ts normalizeWords.
{
  const { normalizeWords } = await import("../src/lib/diff.ts");
  const { casedWords } = await import("../src/lib/text.ts");
  const ref = "A REST API, usually in JSON. It's the trade-off!";
  const cased = casedWords(ref);
  assert.deepEqual(cased.map((w) => w.toLowerCase()), normalizeWords(ref));
  assert.equal(cased[1], "REST");
  console.log("casing tests passed");
}
