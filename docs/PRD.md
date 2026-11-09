# Product spec: Bolo

## Who it is for
Engineering students and early career developers in India who know the technical material but struggle to explain it out loud in English: interviews, stand-ups, demos, and content creation.

## The promise
"Practice speaking about tech, get corrected on the spot, and watch your score go up in three tries."

## Core idea: one engine, four tracks, one ladder
Every practice session is the same loop:
prompt card -> record (max 30 s) -> transcribe (Prisma) -> analyze (diff, metrics, LLM) -> results -> hear coach feedback (Timbre) -> retry or next stage.

### The ladder (same in every track)
| Stage | What the user does | How it is scored |
|---|---|---|
| 1. Read it | Reads the text aloud | Word by word diff vs the text (objective), plus LLM comment |
| 2. Say it back | Reads once, then says it from memory | Diff for meaning kept, plus grammar of what they produced |
| 3. Build your own | Gets a topic and keywords, makes their own version | LLM: grammar, structure, keyword use, facts |
| 4. Free speak | Picks any angle, talks up to 30 s | LLM: structure (hook, problem, action, result), vocabulary, clarity |

Unlock rule: stage N+1 unlocks after one attempt of stage N (not a score gate, we do not have time for that). Show the best score per stage.

### The tracks
1. **Tech Talk** (primary, build first): tech blog style passages. User picks a passage, or in stage 3 and 4 picks a topic. Keyterms are sent to Prisma so jargon is transcribed correctly.
2. **Grammar**: short everyday sentences. Stage 1 read, stage 3 build a sentence using a pattern ("If I had... I would..."). Shows the rule after each attempt.
3. **Creator**: same as Tech Talk but with the camera on. Script to camera, then own hook, then free. Camera is for comfort: show a mirror preview and record audio only for scoring. No face analysis.
4. **Conversation**: turn based voice chat with a persona (stand-up, HR, bug explainer, project walk-through). User speaks, presses stop, coach replies by voice and shows at most one correction.

## Results screen (the screen that gets recorded for the demo)
Top to bottom:
1. Big score ring (0 to 100), with "+12 from last try" when retrying.
2. The user's transcript with inline marks: wrong words struck through in red with the fix in green, missing words underlined.
3. Three small stat tiles: words per minute (with a "good range 120 to 160" hint), fillers detected, read accuracy (stages 1 and 2).
4. "Fix these first": up to 3 grammar fixes as cards (original, fixed, why).
5. Structure strip: Hook, Problem, Action, Result, each lit or dim.
6. Facts check (only if something is wrong): claim, issue, correction. Label it "best effort".
7. "Say it better": improved version in a card with a "Hear it" button (Timbre).
8. Coach voice plays automatically after results load (`spokenFeedback`). Mute toggle.
9. Two buttons: **Try again** and **Next stage**.

## Share card (growth feature, build in Phase 6)
A 1080 x 1350 card made with `html-to-image`: "Tried 3 times. 42 -> 81." with the first and last scores, the improved sentence, the app name and the hashtags. Download button. This is what people post.

## Home screen
Track picker as four large cards, the ladder shown as four dots, a "Continue" button that resumes the last stage. Language hint line: "Speak English, Hinglish is fine."

## Voices
- Coach voice default: Timbre v2.5 `Shlok` (en-IN, conversational, warm).
- Storytelling/read-along voice: `Girish` (en-IN, expressive).
- Hinglish tips (optional, only if time): `Poorvi` with language `hi-en`.
- Voices are model specific. Do not mix v2.5 voices with another model.

## Explicitly out of scope
Accounts, payments, history across devices, leaderboards, pronunciation phoneme scoring, face or eye contact analysis, streaming/WebSocket audio, native mobile app, admin panel, more than 4 passages per track until everything else is done.

## Honesty notes for the submission
- Gnani models used: Prisma v3.0 (speech to text, with keyterms, topic and en-IN/hi-IN code mixing) and Timbre v2.5 (text to speech).
- Gemini is used only for text feedback. Say so.
