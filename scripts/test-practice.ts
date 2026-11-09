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
  assert.equal(toFriendlyError({ name: "TimeoutError" }).kind, "slow");
  assert.equal(toFriendlyError(new ApiError(504, "HTTP_504", "x")).kind, "slow");
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

// keywordHits and progress rules.
{
  const { keywordHits } = await import("../src/lib/text.ts");
  const hits = keywordHits("The CACHE stores data, and stale data expires. Caches help!", ["cache", "stale data", "expiry", "JSON"]);
  assert.deepEqual(hits, { cache: true, "stale data": true, expiry: false, JSON: false });
  assert.equal(keywordHits("cached", ["cache"]).cache, true);
  assert.equal(keywordHits("cachet", ["cache"]).cache, false);

  const p = await import("../src/lib/progress.ts");
  let prog = {};
  assert.equal(p.isUnlocked(prog, "read"), true);
  assert.equal(p.isUnlocked(prog, "recall"), false);
  assert.equal(p.nextStageToTry(prog), "read");
  for (let i = 0; i < 7; i++) prog = p.addAttempt(prog, "read", { score: 40 + i * 5, at: i });
  assert.equal(prog.read.length, p.MAX_ATTEMPTS_KEPT);
  assert.equal(p.bestScore(prog.read), 70);
  assert.equal(p.lastScore(prog.read), 70);
  assert.equal(prog.read[0].score, 50);
  assert.equal(p.isUnlocked(prog, "recall"), true);
  assert.equal(p.isUnlocked(prog, "build"), false);
  assert.equal(p.nextStageToTry(prog), "recall");
  const before = prog;
  p.addAttempt(prog, "recall", { score: 1, at: 1 });
  assert.equal(before.recall, undefined, "addAttempt must not mutate");
  assert.equal(p.bestScore(undefined), undefined);
  assert.equal(p.isStage("free"), true);
  assert.equal(p.isStage("nope"), false);
  console.log("progress tests passed");
}

// Any-topic passages: input checks and cleaning the model output.
{
  const c = await import("../src/lib/customTopic.ts");
  assert.equal(c.checkTopicInput("  Load   balancers ").ok, true);
  assert.equal(c.checkTopicInput("x").ok, false);
  assert.equal(c.checkTopicInput(42).ok, false);
  assert.equal(c.checkTopicInput("a".repeat(81)).ok, false);
  assert.equal(c.slugify("OAuth 2.0 & PKCE!"), "oauth-2-0-pkce");
  const long = Array.from({ length: 30 }, (_, i) => `Sentence ${i} has five words.`).join(" ");
  const p = c.toPassage({ title: "LB", text: long, keyterms: ["Nginx", "nginx", 5, "HAProxy"], keywords: ["a", "b", "c", "d", "e"] }, "load balancers", "abc123");
  assert.ok(p);
  assert.ok(p.text.split(/\s+/).length <= c.PASSAGE_MAX_WORDS);
  assert.ok(p.text.endsWith("."));
  assert.deepEqual(p.keyterms, ["Nginx", "HAProxy"]);
  assert.equal(p.keywords.length, 4);
  assert.equal(p.id, "custom-load-balancers-abc123");
  assert.equal(p.subject, "load balancers");
  assert.equal(c.toPassage({ text: "too short" }, "x", "1"), null);
  assert.equal(c.toPassage("nope", "x", "1"), null);
  assert.equal(c.isCustomId(p.id), true);
  console.log("custom topic tests passed");
}
