// Run: node --experimental-strip-types scripts/test-diff.ts
import assert from "node:assert/strict";
import { diffWords } from "../src/lib/diff.ts";

const ref = "A REST API lets two programs talk over the internet.";

const perfect = diffWords(ref, "a rest api lets two programs talk over the internet");
assert.equal(perfect.accuracy, 1);

const wrong = diffWords(ref, "A REST API lets two programmes talk over internet");
assert.ok(wrong.ops.some((o) => o.type === "wrong" && o.ref === "programs" && o.said === "programmes"));
assert.ok(wrong.ops.some((o) => o.type === "missing" && o.ref === "the"));
assert.ok(wrong.accuracy > 0.6 && wrong.accuracy < 1);

const empty = diffWords(ref, "");
assert.equal(empty.accuracy, 0);

// Prisma writes "two" as "2"; that must still count as a match.
const digits = diffWords(ref, "A REST API lets 2 programs talk over the internet");
assert.equal(digits.accuracy, 1);
assert.equal(diffWords("I have 25 tabs", "I have 25 tabs").accuracy, 1);

console.log("diff tests passed");
