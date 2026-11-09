# Build plan

Check boxes as you go. Do not start a phase before the gate of the previous one passes.
Times are IST. Today is Mon 9 Nov. The challenge closes Tue 10 Nov 11:59 PM, but we aim to submit by 8 PM.

| Clock | What |
|---|---|
| Mon 4:00 to 4:45 PM | Phase 0: keys and smoke test |
| Mon 4:45 to 8:30 PM | Phase 1 and 2: practice engine, results screen, Tech Talk ladder |
| Mon 8:30 to 9:15 PM | Phase 3: deploy to Vercel and test on a phone |
| Mon 9:15 to 10:30 PM | Phase 4: Grammar track |
| Mon 10:30 PM to 1:00 AM | Phase 5: Creator track, then sleep |
| Tue 8:00 to 10:00 AM | Phase 6: Conversation track (cut first if behind) |
| Tue 10:00 to 11:00 AM | Phase 7: polish and share card. **Feature freeze at 11:00 AM** |
| Tue 11:00 AM to 1:00 PM | Phase 8: record demo, write posts, **posts live by 1:00 PM** |
| Tue 1:00 to 7:00 PM | Bug fixes only, reply to comments, share the post |
| Tue 7:00 to 8:00 PM | Submit the form. Buffer until 11:59 PM |

**Cut order if behind schedule:** Conversation first, then Creator camera preview, then Grammar stage 3. Never cut the Tech Talk ladder, the results screen or the share card.

---

## Phase 0: keys and smoke test (gate: /lab works end to end)
- [ ] `npm install`, copy `.env.example` to `.env.local`, add `GNANI_API_KEY` and `GEMINI_API_KEY`.
- [ ] Run the two curl commands in `docs/GNANI_API.md` to prove the key works. Save `out.wav` and listen to it.
- [ ] `npm run dev`, open `/lab`, record yourself reading the passage, press Score it. You should see a transcript, JSON feedback and hear the coach voice.
- [ ] If Chrome blocks the mic, check the site permission. If STT returns 400, read `error.type` and fix per `docs/GNANI_API.md`.
- [ ] Try the same passage with `language` set to `en-IN` only, and with `en-IN,hi-IN`. Keep the better one in `src/app/lab/page.tsx` and in a constant `STT_LANGUAGE` in `src/lib/config.ts`. Note the result in `docs/DECISIONS.md`.
- [ ] Listen to `Shlok`, `Girish`, `Trupti` and `Pranav` saying a short coaching sentence with technical words. Pick the coach voice. Put it in `src/lib/config.ts` as `COACH_VOICE`.
- [ ] `git init` is done already. Create a GitHub repo, push `main`.

## Phase 1: practice engine and results screen (the heart of the app)
Build these as reusable components under `src/components/practice/`.
- [x] `PracticeSession`: props `{ track, stage, taskPrompt, referenceText?, keyterms?, topic?, onComplete }`. State machine: `ready -> recording -> processing -> results | error`. Uses `useRecorder`, calls `/api/stt`, then `/api/analyze`, then `/api/tts` for `spokenFeedback`.
- [x] Recording UI: big round mic button, live timer with a 30 s ring, a simple waveform or pulsing level indicator (use an `AnalyserNode` on the stream, keep it small), "Stop" and "Cancel".
- [x] `ScoreRing` (animated 0 to score).
- [x] `InlineDiff`: renders `read.ops` over the transcript (match plain, wrong struck red with green fix, missing underlined, extra faded). For stages 3 and 4 show the transcript with `feedback.grammar[].original` highlighted and the fix in a tooltip or beneath.
- [x] `StatTile` x3: words per minute (hint text "120 to 160 is a good pace"), fillers detected, read accuracy.
- [x] `StructureStrip`: Hook, Problem, Action, Result.
- [x] `FixCard` list (max 3 shown, "show more" for the rest).
- [x] `ImprovedVersion` card with a "Hear it" button (calls `/api/tts` with `Girish`, split into lines under 40 words).
- [x] Coach voice auto plays after results, with a mute toggle remembered in localStorage.
- [x] Error states: mic denied, 402 out of credits ("Out of API credits"), 429 ("Slow down, try again in a few seconds"), empty transcript ("We did not hear anything, check your mic"), network.
- [ ] Gate: reading a passage in `/lab`-like page shows the full results screen with real data.

## Phase 2: Tech Talk track with the full ladder
- [x] Routes: `/tech` (passage list), `/tech/[id]` (the ladder for one passage).
- [x] `LadderBar` showing the 4 stages, current stage highlighted, locked stages dim, best score per stage.
- [x] Stage 1 Read it: show `text`, big and readable, a "Listen first" button that plays the text with `Girish`.
- [x] Stage 2 Say it back: show the text for 10 seconds with a countdown, then hide it behind a "Peek" button (peeking is allowed, no penalty). Send `referenceText` so the diff works.
- [x] Stage 3 Build your own: show `topic` and `keywords` as chips. Pass `keyterms` and `topic` to Prisma. Track keyword use in the results (green chip if said).
- [x] Stage 4 Free speak: show a "pick your angle" row with 3 to 4 chips per passage (e.g. "Explain to a friend", "Interview answer", "30 second reel script"). The chosen angle becomes the `taskPrompt`.
- [x] Attempts: keep the last 5 attempts per task in localStorage. After a retry show "+N from last try". Show a mini score history.
- [x] Home page `/`: hero, the four track cards (only Tech Talk enabled for now, others "Soon" or hidden), "Continue where you left off".
- [ ] Gate: you can go through all 4 stages of one passage and see scores improve on a retry.

## Phase 3: deploy
- [ ] Import the GitHub repo into Vercel. Add `GNANI_API_KEY`, `GEMINI_API_KEY` (and `GEMINI_MODEL` if you changed it).
- [ ] Open the Vercel URL on your phone. The mic needs HTTPS, which Vercel provides. Check iPhone Safari too if you can: Safari records MP4/AAC, the decode in `wav.ts` should handle it. If not, note it and move on.
- [ ] Run the full ladder once on the deployed URL. Fix anything that only breaks there (body size, timeouts, env vars).

## Phase 4: Grammar track (about 1 hour)
- [ ] `/grammar` list from `GRAMMAR_ITEMS`, same ladder component, reuse `PracticeSession`.
- [ ] Stage 1 read the sentence, stage 3 `buildPrompt`, stage 4 free: "Describe your day in 5 sentences".
- [ ] After each attempt show the `rule` card in plain words.

## Phase 5: Creator track (about 2 hours)
- [ ] `/creator` with `CREATOR_PROMPTS`, same ladder.
- [ ] `CameraPreview`: `getUserMedia({ video: true })` shown as a mirrored `<video>` (transform scaleX(-1)). Camera off by default with a "Turn on camera" button. Camera permission denied must not block practice.
- [ ] Audio recording and scoring are unchanged. The copy says "Look at the lens, not at yourself."
- [ ] A small "camera comfort" counter: seconds spent looking at the preview while recording (just the recording time with camera on). No face analysis.
- [ ] Stage 3 and 4 scoring prompt uses `track: "creator"` (hook strength matters).

## Phase 6: Conversation track (cut first if behind)
- [ ] `/convo` scenario cards, `/convo/[id]` chat screen.
- [ ] Turn loop: coach opener spoken with TTS, user records, STT, `/api/chat`, show reply bubble with the optional correction chip, speak the reply.
- [ ] Keep the last 10 turns in state. End button shows a short summary using `/api/analyze` on the joined user turns (stage `free`, track `convo`).
- [ ] Do not build streaming or barge in. Turn based only.

## Phase 7: polish and share card (feature freeze at Tue 11:00 AM)
- [ ] Visual pass with the `frontend-design` skill: type scale, spacing, one accent color, dark theme, motion on the score ring and result cards.
- [ ] `ShareCard`: 1080 x 1350 DOM node rendered with `html-to-image` (`npm i html-to-image`). Content: first score, last score, the improved sentence, "Bolo", hashtags `#GnaniAI #GreatIndianAIInternshipChallenge`. "Download image" button on the results screen after at least 2 attempts.
- [ ] Meta tags and a simple OG image so the link looks good when pasted.
- [ ] Empty states, loading skeletons, 404 page, favicon.
- [ ] Mobile layout check at 390 px width.
- [ ] README with a screenshot, how it works, the Gnani models used, and run instructions.
- [ ] Final deploy. Smoke test the whole ladder on the live URL with a fresh browser profile.

## Phase 8: launch (see `docs/LAUNCH.md`)
- [ ] Record the 60 second demo.
- [ ] Posts live on LinkedIn and X by 1:00 PM with both hashtags and Gnani AI tagged.
- [ ] Nominated post links ready for the form.
- [ ] Submit the form by 8:00 PM.

## Later (do not touch before everything above is done)
- More passages and more tracks per topic area (system design, behavioural answers).
- Hinglish coach tips with `Poorvi`.
- Accounts and cross device history.
- Per word pronunciation scoring.
