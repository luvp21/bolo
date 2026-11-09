export type Track = "tech" | "grammar" | "convo" | "creator";

/** The same ladder is used in every track. */
export type Stage = "read" | "recall" | "build" | "free";

export const STAGES: { id: Stage; label: string; blurb: string }[] = [
  { id: "read", label: "Read it", blurb: "Read the text aloud, word for word." },
  { id: "recall", label: "Say it back", blurb: "Read it once, then say it from memory." },
  { id: "build", label: "Build your own", blurb: "Use the topic and keywords to make your own version." },
  { id: "free", label: "Free speak", blurb: "Pick any angle and talk for 30 seconds." },
];

export interface GrammarFix {
  original: string;
  fixed: string;
  why: string;
}

export interface FactIssue {
  claim: string;
  issue: string;
  correction: string;
}

export interface Feedback {
  /** 0 to 100 */
  score: number;
  /** One or two plain sentences. */
  summary: string;
  grammar: GrammarFix[];
  factual: FactIssue[];
  structure: {
    hook: boolean;
    problem: boolean;
    action: boolean;
    result: boolean;
    note: string;
  };
  vocabulary: { weak: string; better: string }[];
  /** The user's answer rewritten in a stronger shape, same meaning, spoken style. */
  improvedVersion: string;
  tips: string[];
  /** Max 40 words. This is what the coach says out loud through TTS. */
  spokenFeedback: string;
}

export interface Metrics {
  durationMs: number;
  wordCount: number;
  wordsPerMinute: number;
  fillerCount: number;
  fillers: Record<string, number>;
}

export type DiffOp =
  | { type: "match"; ref: string; said: string }
  | { type: "missing"; ref: string }
  | { type: "extra"; said: string }
  | { type: "wrong"; ref: string; said: string };

export interface ReadResult {
  accuracy: number; // 0 to 1
  ops: DiffOp[];
}

export interface AnalyzeResponse {
  feedback: Feedback;
  metrics: Metrics;
  read?: ReadResult;
}
