// SERVER ONLY. Never import this from a client component, it reads the API key.
// Verified against docs.gnani.ai on 2026-11-09. See docs/GNANI_API.md.

const BASE = process.env.GNANI_BASE_URL ?? "https://api.vachana.ai";

// Fail clearly instead of hanging until the platform kills the function (30 s on our routes).
const REQUEST_TIMEOUT_MS = 25_000;

export class GnaniError extends Error {
  status: number;
  type: string;
  constructor(status: number, type: string, message: string) {
    super(message);
    this.status = status;
    this.type = type;
  }
}

function apiKey(): string {
  const key = process.env.GNANI_API_KEY;
  if (!key) throw new GnaniError(500, "MISSING_ENV", "GNANI_API_KEY is not set");
  return key;
}

async function toError(res: Response): Promise<GnaniError> {
  let type = `HTTP_${res.status}`;
  let message = res.statusText;
  try {
    const body = await res.json();
    if (body?.error?.type) {
      type = body.error.type;
      message = body.error.message ?? message;
    } else if (body?.detail?.error_code) {
      type = body.detail.error_code;
      message = body.detail.message ?? message;
    } else if (body?.detail) {
      message = JSON.stringify(body.detail);
    }
  } catch {
    // body was not JSON, keep the defaults
  }
  if (res.status === 402) message = `Out of Gnani credits. ${message}`;
  return new GnaniError(res.status, type, message);
}

export interface TranscribeOptions {
  /** WAV is safest. Max 30 seconds per request. */
  audio: Blob;
  /** Hints, not a lock. 1 to 4 codes, comma separated, or "indic-auto". */
  languageCode?: string;
  /** verbatim | transcribe | codemix | transliterate */
  format?: "verbatim" | "transcribe" | "codemix" | "transliterate";
  /** Up to 200 terms the model should favour (names, jargon). */
  keyterms?: string[];
  /** Up to 1600 chars of context about what the speaker is talking about. */
  topic?: string;
  /** Text spoken just before this clip. Last 600 chars are used. */
  previousText?: string;
}

export interface TranscribeResult {
  transcript: string;
  detectedLanguage?: string;
  truncated?: boolean;
  latencyS?: number;
}

export async function transcribe(opts: TranscribeOptions): Promise<TranscribeResult> {
  const fd = new FormData();
  fd.append("audio_file", opts.audio, "audio.wav");
  fd.append("model", "prisma-v3.0");
  fd.append("language_code", opts.languageCode ?? "en-IN,hi-IN");
  if (opts.format) fd.append("format", opts.format);
  if (opts.keyterms?.length) fd.append("keyterms", JSON.stringify(opts.keyterms.slice(0, 200)));
  if (opts.topic) fd.append("topic", opts.topic.slice(0, 1600));
  if (opts.previousText) fd.append("previous_text", opts.previousText.slice(-600));

  const res = await fetch(`${BASE}/stt/v3`, {
    method: "POST",
    headers: { "X-API-Key-ID": apiKey() },
    body: fd,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw await toError(res);
  const body = await res.json();
  return {
    transcript: String(body.transcript ?? "").trim(),
    detectedLanguage: body.detected_language_code,
    truncated: body.truncated === true,
    latencyS: body.end_to_end_latency,
  };
}

export interface SpeakOptions {
  text: string;
  /** Timbre v2.5 voice. English: Kaveri, Trupti, Devika, Pranav, Shlok, Girish. Hindi: Nalini, Vikrant, ... */
  voice?: string;
  /** en-IN, hi-IN, ... Use the voice's preferred language. */
  language?: string;
  speed?: number;
}

/** Returns a WAV file as bytes. */
export async function speak(opts: SpeakOptions): Promise<ArrayBuffer> {
  const sampleRate = Number(process.env.GNANI_TTS_SAMPLE_RATE ?? 48000);
  const res = await fetch(`${BASE}/api/v1/tts/inference`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-Key-ID": apiKey() },
    body: JSON.stringify({
      text: opts.text,
      voice: opts.voice ?? "Shlok",
      model: "timbre-v2.5",
      language: opts.language ?? "en-IN",
      speed: opts.speed ?? 1.0,
      audio_config: {
        sample_rate: sampleRate,
        num_channels: 1,
        sample_width: 2,
        encoding: "linear_pcm",
        container: "wav",
      },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw await toError(res);
  return res.arrayBuffer();
}
