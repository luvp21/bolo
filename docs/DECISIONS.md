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
- 2026-11-09: Gemini default model is `gemini-3.8-flash` (`gemini-2.5-flash` returns 404 for new keys) with `thinkingLevel: low` (about 6 s instead of 11 s). Override with `GEMINI_MODEL` / `GEMINI_THINKING`.
- 2026-11-09: Every upstream call has a timeout (Gemini 19 s with one retry, Gnani 25 s, client 32 to 50 s) after a Gemini request hung with no end. Timeouts reach the UI as 504, "That took too long".
- 2026-11-09: Real end to end run (Timbre voice into a fake mic, real Prisma, Gemini, Timbre coach): 8 to 12 s from Stop to results.
- 2026-11-09: Live at https://bolo-kohl.vercel.app (Vercel project luvp21s-projects/bolo, deployed with the CLI; GitHub auto-deploy still needs the Vercel GitHub app to get repo access). Keys are Vercel env vars for Production and Preview.
- 2026-11-09: `.vercelignore` excludes `.env*` after the first CLI deploy uploaded the local `.env` (server-side only, never served, but keys belong in Vercel env vars).
- 2026-11-09: Live smoke test: pages 200, TTS 2.8 s, analyze 6.8 s, full read attempt at 390 px in headless Chromium took 7.9 s from Stop to results.
- 2026-11-09: One shared `Ladder` component drives every track; each track only supplies a `stageSpec(stage)` (prompt, reference text, panel, results extra). Grammar stage 2 reuses Say it back on the sentence.
- 2026-11-09: The camera stream lives in the Creator page (not the stage panel), so it stays on across stages and results; comfort seconds count only while recording with the camera on.
- 2026-11-09: Conversation opener is spoken after a "Start the conversation" tap (browsers block audio before a user gesture). `/api/chat` maxDuration raised to 45 s to fit two Gemini tries.
- 2026-11-09: Checked that Prisma keeps grammar mistakes ("he don't", "same request is coming") in every format, so the coach sees the user's real errors. "fix the" vs "fixed the" is acoustically ambiguous, not a correction.
- 2026-11-09: Share card appears on results after 2 or more tries on a stage (first kept score to this score, kept attempts count, first sentences of the improved version). `html-to-image` is loaded only on click.
- 2026-11-09: OG image uses a static Newsreader TTF in `assets/fonts` (Satori cannot read the variable font). Favicon is an SVG tally light; the default favicon.ico is removed.
- 2026-11-09: Final live run in a fresh browser profile, all four Tech Talk stages with real Prisma, Gemini and Timbre: read 37 then 96 on retry (+59), recall 72, build 72 (4 of 4 keywords), free 62. Stop to results took 8 to 19 s.
- 2026-11-09: "Any topic" (user request): `/api/generate` turns a typed topic into a 60 to 85 word passage with keyterms and keywords (Gemini, validated and trimmed in `src/lib/customTopic.ts`). Topics are stored in the browser (max 12) and use the normal Tech Talk ladder at `/tech/custom-<slug>-<id>`. The passage is labelled "Written by AI for practice".
