// Shared constants, safe for client and server. No secrets here.

/** Language hint sent to Prisma. Phase 0 compares `en-IN` against `en-IN,hi-IN`; see docs/DECISIONS.md. */
export const STT_LANGUAGE = "en-IN,hi-IN";

/** Timbre v2.5 voice that speaks the coaching line after results. */
export const COACH_VOICE = "Shlok";

/** Timbre v2.5 voice for read-along and the improved version. */
export const READ_VOICE = "Girish";

export const TTS_LANGUAGE = "en-IN";

/** Gnani REST rejects audio over 30 s. Do not raise this. */
export const MAX_RECORD_SECONDS = 30;

/** Keep each TTS request short so responses stay small and fast. */
export const TTS_MAX_WORDS = 40;

export const PACE_GOOD_MIN = 120;
export const PACE_GOOD_MAX = 160;
