// Turns any failure in the practice pipeline into one plain message for the UI.

export type ErrorKind = "mic" | "signin" | "quota" | "credits" | "rate" | "empty" | "network" | "slow" | "audio" | "server";

export interface FriendlyError {
  kind: ErrorKind;
  title: string;
  hint: string;
  /** A link that makes more sense than "Try again", e.g. sign in or watch the demo. */
  action?: { label: string; href: string };
}

/** Thrown by the client API helpers so the UI can map it. */
export class ApiError extends Error {
  status: number;
  type: string;
  constructor(status: number, type: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.type = type;
  }
}

export class EmptyTranscriptError extends Error {
  constructor() {
    super("Empty transcript");
    this.name = "EmptyTranscriptError";
  }
}

const MESSAGES: Record<ErrorKind, Omit<FriendlyError, "kind">> = {
  signin: {
    title: "Sign in to try Bolo",
    hint: "Sign in with Google. Each account gets one free try.",
    action: { label: "Sign in", href: "/sign-in" },
  },
  quota: {
    title: "You have used your free try",
    hint: "Thanks for trying Bolo. Watch the demo to see the full loop, retries included.",
    action: { label: "Watch the demo", href: "/#demo" },
  },
  mic: {
    title: "We cannot use your microphone",
    hint: "Allow mic access in the address bar, then try again.",
  },
  credits: {
    title: "Out of API credits",
    hint: "The speech service has no credits left. Try again later.",
  },
  rate: {
    title: "Slow down, try again in a few seconds",
    hint: "Too many requests at once. Wait a moment and retry.",
  },
  empty: {
    title: "We did not hear anything, check your mic",
    hint: "Speak a little louder or move closer, then record again.",
  },
  network: {
    title: "Connection problem",
    hint: "Check your internet and try again.",
  },
  slow: {
    title: "That took too long",
    hint: "The service is slow right now. Try again.",
  },
  audio: {
    title: "That recording did not work",
    hint: "Record again. Keep it under 30 seconds.",
  },
  server: {
    title: "Something went wrong on our side",
    hint: "Try again. If it keeps happening, reload the page.",
  },
};

export function friendlyError(kind: ErrorKind): FriendlyError {
  return { kind, ...MESSAGES[kind] };
}

/** Browser errors from getUserMedia when the user or the OS blocks the mic. */
const MIC_ERROR_NAMES = ["NotAllowedError", "SecurityError", "NotFoundError", "NotReadableError", "OverconstrainedError"];

export function toFriendlyError(err: unknown): FriendlyError {
  if (err instanceof EmptyTranscriptError) return friendlyError("empty");
  if (err instanceof ApiError) {
    if (err.status === 401 || err.type === "SIGN_IN_REQUIRED") return friendlyError("signin");
    if (err.type === "QUOTA_EXCEEDED") return friendlyError("quota");
    if (err.status === 402) return friendlyError("credits");
    if (err.status === 429 || err.type === "RATE_LIMITED") return friendlyError("rate");
    if (err.status === 504) return friendlyError("slow");
    if (err.type === "NO_AUDIO" || err.type === "AUDIO_CONVERSION_ERROR" || err.type === "MAX_AUDIO_DURATION_EXCEEDED") {
      return friendlyError("audio");
    }
    return friendlyError("server");
  }
  if (err instanceof Error || (typeof err === "object" && err !== null && "name" in err)) {
    const name = (err as { name: string }).name;
    if (MIC_ERROR_NAMES.includes(name)) return friendlyError("mic");
    // fetch() rejects with a TypeError when the network is down.
    if (name === "TypeError") return friendlyError("network");
    // AbortSignal.timeout() rejects with a TimeoutError.
    if (name === "TimeoutError") return friendlyError("slow");
  }
  return friendlyError("server");
}
