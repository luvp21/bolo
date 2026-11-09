// CLIENT helpers for our own route handlers. No keys here: the routes call Gnani and Gemini.

import { STT_LANGUAGE, TTS_LANGUAGE } from "./config";
import { ApiError, EmptyTranscriptError } from "./errors";
import type { TechPassage } from "../content";
import type { AnalyzeResponse, Stage, Track } from "./types";

// Slightly longer than each route's own server limit, so the server's error wins when it has one.
const TIMEOUT_MS = { stt: 35_000, analyze: 50_000, tts: 32_000, chat: 40_000, generate: 50_000 } as const;

async function readError(res: Response): Promise<ApiError> {
  try {
    const body = await res.json();
    return new ApiError(res.status, body?.error?.type ?? `HTTP_${res.status}`, body?.error?.message ?? res.statusText);
  } catch {
    return new ApiError(res.status, `HTTP_${res.status}`, res.statusText);
  }
}

export interface SttInput {
  wav: Blob;
  keyterms?: string[];
  topic?: string;
}

export async function transcribeClip({ wav, keyterms, topic }: SttInput): Promise<string> {
  const fd = new FormData();
  fd.append("audio", wav, "audio.wav");
  fd.append("language", STT_LANGUAGE);
  if (keyterms?.length) fd.append("keyterms", JSON.stringify(keyterms));
  if (topic) fd.append("topic", topic);
  const res = await fetch("/api/stt", { method: "POST", body: fd, signal: AbortSignal.timeout(TIMEOUT_MS.stt) });
  if (!res.ok) throw await readError(res);
  const body = (await res.json()) as { transcript?: string };
  const transcript = (body.transcript ?? "").trim();
  if (!transcript) throw new EmptyTranscriptError();
  return transcript;
}

export interface AnalyzeInput {
  track: Track;
  stage: Stage;
  taskPrompt: string;
  referenceText?: string;
  transcript: string;
  durationMs: number;
}

export async function analyzeAttempt(input: AnalyzeInput): Promise<AnalyzeResponse> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(TIMEOUT_MS.analyze),
  });
  if (!res.ok) throw await readError(res);
  return (await res.json()) as AnalyzeResponse;
}

/** Writes a short practice passage for any topic. */
export async function generatePassage(topic: string): Promise<TechPassage> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
    signal: AbortSignal.timeout(TIMEOUT_MS.generate),
  });
  if (!res.ok) throw await readError(res);
  return ((await res.json()) as { passage: TechPassage }).passage;
}

export interface ChatTurn {
  role: "user" | "coach";
  text: string;
}

export interface ChatReply {
  reply: string;
  correction: string | null;
}

export async function chatReply(input: { scenario: string; persona: string; history: ChatTurn[]; userText: string }): Promise<ChatReply> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(TIMEOUT_MS.chat),
  });
  if (!res.ok) throw await readError(res);
  return (await res.json()) as ChatReply;
}

// Same text and voice always gives the same audio, so cache it for the page's life.
// This saves credits when the user presses "Hear it" again.
const ttsCache = new Map<string, Promise<string>>();

export function speechUrl(text: string, voice: string): Promise<string> {
  const key = `${voice}::${text}`;
  const cached = ttsCache.get(key);
  if (cached) return cached;
  const pending = (async () => {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice, language: TTS_LANGUAGE }),
      signal: AbortSignal.timeout(TIMEOUT_MS.tts),
    });
    if (!res.ok) throw await readError(res);
    return URL.createObjectURL(await res.blob());
  })();
  ttsCache.set(key, pending);
  // A failed request should be retryable, so do not keep it in the cache.
  pending.catch(() => ttsCache.delete(key));
  return pending;
}
