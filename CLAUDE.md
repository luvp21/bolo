# Bolo: speaking coach for engineers

Solo build for the Great Indian AI Internship Challenge by Gnani AI.
**Hard deadline: Tuesday 10 Nov 2026, 11:59 PM IST.** Treat 8 PM IST on 10 Nov as the real deadline.
Engagement on the public demo post decides the shortlist, so the post must go live by about 1 PM IST on 10 Nov. The app must look good on screen, in a 60 second recording.

Read these before writing code, in this order:
1. `docs/PRD.md` (what we are building and what we are NOT)
2. `docs/BUILD_PLAN.md` (phases, checkboxes, time budget, cut list)
3. `docs/GNANI_API.md` (verified API facts and gotchas, do not guess these)
4. `AGENTS.md` (this Next.js version has breaking changes, check `node_modules/next/dist/docs/` when unsure)

## One sentence
The user speaks, Gnani Prisma transcribes, an LLM and some deterministic checks score and correct them, Gnani Timbre speaks the coaching back, and the user retries and watches their score go up.

## Stack (do not change it)
- Next.js (App Router, TypeScript, Tailwind) in one repo, deployed on Vercel. No separate backend.
- Gnani Prisma v3.0 (speech to text) and Timbre v2.5 (text to speech), REST only, called from route handlers in `src/app/api/*`.
- Gemini via plain REST (`src/lib/llm.ts`) for grammar, structure and fact feedback. Not a Gnani model, say so honestly in the submission.
- No database, no auth. Progress lives in `localStorage` (wrap in try/catch).
- No new dependencies unless the plan says so. Prefer plain CSS and Tailwind over component libraries. Allowed to add: `framer-motion` (optional), `html-to-image` (share card).

## What already exists and works
- `src/lib/gnani.ts`: `transcribe()` and `speak()`. Server only.
- `src/lib/wav.ts` and `src/hooks/useRecorder.ts`: browser mic to 16 kHz mono WAV, auto stop at 30 s.
- `src/lib/diff.ts`: word by word read-aloud check (`scripts/test-diff.ts` tests it).
- `src/lib/metrics.ts`: words per minute and filler words from transcript and duration.
- `src/lib/prompts.ts`, `src/lib/llm.ts`: feedback and chat prompts, JSON output.
- `src/app/api/{stt,tts,analyze,chat}/route.ts`: all four endpoints.
- `src/content/index.ts`: seed passages, grammar items, conversation scenarios, creator prompts.
- `src/app/lab/page.tsx`: pipeline smoke test. **Phase 0 is making this page work with real keys.**

## Rules of the road
- Work in the order of `docs/BUILD_PLAN.md`. Finish a phase, run the checks, commit, then start the next.
- After every meaningful change run `npx tsc --noEmit`. Before every commit run `npm run build`. Run `node --experimental-strip-types scripts/test-diff.ts` if you touched `diff.ts`.
- Commit small and often with plain messages (`feat: tech track stage 1`). Push to GitHub so Vercel deploys on every push.
- If something is unclear, make the simplest choice that works and write one line in `docs/DECISIONS.md`. Do not stop to ask unless an API key or an account is needed.
- Anything that is not on the plan is out of scope. If you think of a new feature, add it to the "Later" list in `docs/BUILD_PLAN.md` and keep going.
- Never import `src/lib/gnani.ts` or `src/lib/llm.ts` from client code. Never expose keys to the browser.
- The Gnani REST endpoint rejects audio over 30 seconds. The recorder already caps at 30 s. Do not remove the cap.
- Gnani returns no word timestamps. Pace comes from `wordCount / durationMs` measured in the browser.
- Keep TTS lines short (under about 40 words). Vercel limits responses to 4.5 MB.
- UI copy is plain and friendly. No emojis in code. Short labels. No jargon in buttons.
- Be honest in the UI: fillers are "detected", fact checks are "best effort".

## Definition of done for each feature
1. Works with the real Gnani API on the deployed Vercel URL, not just localhost.
2. Shows a clear loading state, a clear error state (402 out of credits, 429 slow down, mic denied) and an empty state.
3. Looks good at 1280 px wide and on a phone.
4. Typecheck and build pass.

## Design direction
Calm, focused, a little playful. Dark background, one accent color, large type, generous spacing.
One big score ring is the hero of the results screen. Corrections are shown inline on the user's own words (red strike, green fix). The improved version appears below with a "Hear it" button. A retry button is always visible. See `docs/PRD.md` for the results screen layout.
Use the `frontend-design` skill if available, and avoid generic template looks.

## Commands
```
npm install
cp .env.example .env.local   # then fill GNANI_API_KEY and GEMINI_API_KEY
npm run dev                  # http://localhost:3000, mic works on localhost
npx tsc --noEmit
npm run build
node --experimental-strip-types scripts/test-diff.ts
```
