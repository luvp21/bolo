// Pure helpers for "any topic" passages: input checks, cleaning the model output, ids.
// Type-only imports so node tests can load this file.

import type { TechPassage } from "../content";

export const TOPIC_MIN = 2;
export const TOPIC_MAX = 80;
/** About 30 seconds of speech at a calm pace. */
export const PASSAGE_MAX_WORDS = 85;
export const CUSTOM_PREFIX = "custom-";
export const CUSTOM_TOPICS_KEY = "bolo:custom-topics";
export const MAX_CUSTOM_TOPICS = 12;

export type TopicCheck = { ok: true; value: string } | { ok: false; error: string };

export function checkTopicInput(raw: unknown): TopicCheck {
  if (typeof raw !== "string") return { ok: false, error: "Type a topic." };
  const value = raw.replace(/\s+/g, " ").trim();
  if (value.length < TOPIC_MIN) return { ok: false, error: "Type a topic." };
  if (value.length > TOPIC_MAX) return { ok: false, error: `Keep it under ${TOPIC_MAX} characters.` };
  return { ok: true, value };
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "topic";
}

function cleanString(v: unknown, max: number): string {
  return typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function cleanList(v: unknown, maxItems: number): string[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of v) {
    const s = cleanString(item, 40);
    if (s && !seen.has(s.toLowerCase())) {
      seen.add(s.toLowerCase());
      out.push(s);
    }
    if (out.length >= maxItems) break;
  }
  return out;
}

/** Keeps whole sentences up to the word limit, so the passage fits a 30 s recording. */
export function fitWords(text: string, maxWords: number): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  let out = "";
  for (const s of sentences) {
    const next = out ? `${out} ${s}` : s;
    if (next.split(/\s+/).length > maxWords) break;
    out = next;
  }
  return out || text.split(/\s+/).slice(0, maxWords).join(" ");
}

/** Turns whatever the model returned into a safe passage, or null if it is unusable. */
export function toPassage(raw: unknown, topic: string, suffix: string): TechPassage | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const text = fitWords(cleanString(r.text, 900), PASSAGE_MAX_WORDS);
  if (text.split(/\s+/).length < 25) return null;
  const title = cleanString(r.title, 70) || topic;
  return {
    id: `${CUSTOM_PREFIX}${slugify(topic)}-${suffix}`,
    title,
    subject: cleanString(r.subject, 50) || topic,
    text,
    keyterms: cleanList(r.keyterms, 15),
    topic: cleanString(r.topic, 200) || `Explain ${topic} in your own words.`,
    keywords: cleanList(r.keywords, 4),
  };
}

export function isCustomId(id: string): boolean {
  return id.startsWith(CUSTOM_PREFIX);
}
