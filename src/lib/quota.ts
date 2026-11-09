// Pure usage rules per signed-in account. Server enforcement is in quotaServer.ts.
// Each Google account gets FREE_ATTEMPTS scored attempts, plus small caps on the
// supporting calls so they cannot be farmed for free speech or text generation.

export type UsageKind = "analyze" | "stt" | "tts" | "chat" | "generate";
export type Usage = Partial<Record<UsageKind, number>>;

/** Scored attempts per account. One by default; raise with BOLO_FREE_ATTEMPTS. */
export const FREE_ATTEMPTS = Math.max(1, Number(process.env.BOLO_FREE_ATTEMPTS ?? 1) || 1);

export const LIMITS: Record<UsageKind, number> = {
  analyze: FREE_ATTEMPTS,
  // A short conversation needs a few transcriptions and replies before its one score.
  stt: 6 * FREE_ATTEMPTS,
  chat: 6 * FREE_ATTEMPTS,
  // Coach line, "Hear it", "Listen first" and conversation replies.
  tts: 12 * FREE_ATTEMPTS,
  generate: FREE_ATTEMPTS,
};

export function canUse(usage: Usage, kind: UsageKind, limits: Record<UsageKind, number> = LIMITS): boolean {
  return (usage[kind] ?? 0) < limits[kind];
}

export function bump(usage: Usage, kind: UsageKind, by = 1): Usage {
  return { ...usage, [kind]: Math.max(0, (usage[kind] ?? 0) + by) };
}

export function remaining(usage: Usage, kind: UsageKind, limits: Record<UsageKind, number> = LIMITS): number {
  return Math.max(0, limits[kind] - (usage[kind] ?? 0));
}

/** Comma separated owner emails that skip the limits (for testing and recording). */
export function isUnlimited(emails: string[], allowList: string | undefined): boolean {
  if (!allowList) return false;
  const allowed = new Set(allowList.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean));
  return emails.some((e) => allowed.has(e.toLowerCase()));
}

export function toUsage(raw: unknown): Usage {
  if (typeof raw !== "object" || raw === null) return {};
  const out: Usage = {};
  for (const kind of Object.keys(LIMITS) as UsageKind[]) {
    const v = (raw as Record<string, unknown>)[kind];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) out[kind] = Math.floor(v);
  }
  return out;
}
