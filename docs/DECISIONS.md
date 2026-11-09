# Decisions log

One line per decision, newest at the bottom. Format: `date: decision (why)`.

- 2026-11-09: One Next.js repo on Vercel, no separate backend (fastest to ship solo).
- 2026-11-09: Prisma REST only, 30 s cap per recording (REST limit; streaming adds risk we cannot afford).
- 2026-11-09: Browser converts recordings to 16 kHz mono WAV (Chrome records WebM, which Gnani does not list as supported).
- 2026-11-09: Pace is computed in the browser from clip duration (Prisma gives no word timestamps).
- 2026-11-09: Gemini does text feedback, Gnani does all speech. Say this in the submission.
- 2026-11-09: `STT_LANGUAGE`, `COACH_VOICE` (Shlok) and `READ_VOICE` (Girish) live in `src/lib/config.ts`; defaults until the Phase 0 listening test picks the final ones.
- 2026-11-09: Visual direction "proof sheet in a recording booth": warm charcoal, Newsreader serif for the user's words, Instrument Sans for UI, marigold as the single accent; red and green only for corrections.
- 2026-11-09: TTS audio is cached per text and voice for the page's life, so pressing "Hear it" twice spends credits once.
- 2026-11-09: `/lab/session?demo=read|free` renders the results screen from fixtures, to design and record it without spending credits.
- 2026-11-09: Structure strip is hidden on the "read" stage (the passage's structure is not the speaker's).
- 2026-11-09: Phase 0 curl checks pass with the Gnani key (TTS 200 in 1.4 s, 48 kHz WAV; STT 200). On synthetic speech `en-IN` and `en-IN,hi-IN` gave identical transcripts, so `en-IN,hi-IN` stays until a real-voice test says otherwise.
- 2026-11-09: Prisma writes small numbers as digits ("two" -> "2"); `normalizeWords` maps 0 to 20 back to words so the read diff does not count them as wrong.
- 2026-11-09: Stage 4 angles are one shared list (`TECH_ANGLES`) applied to each passage's `subject`, not hand-written per passage.
- 2026-11-09: Say it back uses a Peek/Hide toggle rather than press-and-hold (long press is unreliable on phones).
- 2026-11-09: Progress is stored per task as `bolo:progress:<track>:<id>` (last 5 attempts per stage) and read with useSyncExternalStore so server render and hydration match.
