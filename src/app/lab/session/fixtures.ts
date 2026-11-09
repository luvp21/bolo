// Sample results for previewing the results screen without spending API credits.
// Only used by /lab/session?demo=read and ?demo=free.

import { TECH_PASSAGES } from "@/content";
import { diffWords } from "@/lib/diff";
import { computeMetrics } from "@/lib/metrics";
import type { AnalyzeResponse, Stage } from "@/lib/types";

export interface DemoFixture {
  stage: Stage;
  transcript: string;
  result: AnalyzeResponse;
  previousScore: number;
}

const passage = TECH_PASSAGES[0];

const readTranscript =
  "A REST API lets two program talk over internet using simple requests. The client send a request to a URL and the server replies with data usually in JSON. Each request is independent so the server does not remember earlier calls. This make REST easy to scale because any server in a group can answer any request.";

const freeTranscript =
  "So basically caching is like you keep the copy of data near to the user. When same request is coming again we are returning the saved copy so it is very fast. But problem is if original data is changing then cache is showing old data until it expire.";

export const DEMO_FIXTURES: Record<"read" | "free", DemoFixture> = {
  read: {
    stage: "read",
    transcript: readTranscript,
    previousScore: 64,
    result: {
      read: diffWords(passage.text, readTranscript),
      metrics: computeMetrics(readTranscript, 24_000),
      feedback: {
        score: 81,
        summary: "Clear and steady. A few small words slipped, mostly plural and third person endings.",
        grammar: [],
        factual: [],
        structure: { hook: true, problem: true, action: true, result: true, note: "" },
        vocabulary: [],
        improvedVersion: passage.text,
        tips: ["Land the final s on plurals like programs."],
        spokenFeedback: "Nice and steady. Watch the small endings: two programs, the client sends, this makes. Read it once more and hit every s.",
      },
    },
  },
  free: {
    stage: "free",
    transcript: freeTranscript,
    previousScore: 42,
    result: {
      metrics: computeMetrics(freeTranscript, 21_000),
      feedback: {
        score: 68,
        summary: "You know the idea well. Tighten the tense and open with a hook.",
        grammar: [
          { original: "keep the copy of data near to the user", fixed: "keep a copy of the data close to the user", why: "Use 'a copy' for one of many, and 'close to' sounds more natural than 'near to'." },
          { original: "When same request is coming again", fixed: "When the same request comes again", why: "Repeated actions take the simple present, not the continuous." },
          { original: "we are returning", fixed: "we return", why: "Same rule: a general fact uses the simple present." },
          { original: "if original data is changing then cache is showing old data", fixed: "if the original data changes, the cache shows old data", why: "Add 'the' before specific nouns and use the simple present for conditions." },
          { original: "until it expire", fixed: "until it expires", why: "Third person singular takes an s." },
        ],
        factual: [],
        structure: { hook: false, problem: true, action: true, result: false, note: "Start with why caching matters, and end on the trade-off as your result." },
        vocabulary: [{ weak: "very fast", better: "much faster" }],
        improvedVersion:
          "Ever wondered why a page loads instantly the second time? That is caching. We keep a copy of the data close to the user, so repeat requests skip the slow work. The catch is freshness: if the original data changes, the cache can serve stale data until it expires.",
        tips: ["Open with a question to hook the listener."],
        spokenFeedback: "Good grasp of caching. Your biggest fix is tense: say the same request comes again, not is coming. Next time, open with a quick hook.",
      },
    },
  },
};
