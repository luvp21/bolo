# Bolo: a speaking coach for engineers

**Live:** https://bolo-kohl.vercel.app · **Code:** https://github.com/luvp21/bolo · Built solo by Luv Patel for the Great Indian AI Internship Challenge.

## Problem
Engineering students and early career developers in India usually know the material. What fails is explaining it out loud in placement interviews, stand-ups, demos and on camera: filler words, tense slips, and answers with no shape. English tutors teach general English, not how to explain caching or a production bug, and practising alone gives no feedback.

## Solution
Bolo is a voice-first practice app. You speak for up to 30 seconds, and seconds later you see:
- **Your own words, marked up:** wrong or missed words struck in red with the fix in green.
- **Delivery:** words per minute against a 120 to 160 target, plus filler words detected.
- **Structure:** whether the answer had a hook, a problem, an action and a result.
- **A stronger version** of your answer, and a coach who **speaks** the one fix that matters.
- **Try again** shows "+N from last try", and a share card captures the progress.

Every task climbs a four-stage ladder: **Read it → Say it back → Build your own → Free speak**. With **Any topic**, you type anything (load balancers, OAuth, UPI, black holes) and Bolo writes a 30-second passage for it, so you learn the subject and how to explain it at the same time. There are four tracks: Tech Talk, Grammar (with the rule after each try), Creator (optional mirror camera) and Conversation (voice role-plays for stand-ups, HR rounds and bug explanations).

## How Gnani AI powers it
| Step | Model | How it is used |
|---|---|---|
| Hear | **Prisma v3.0** speech to text | `en-IN,hi-IN` so Hinglish is fine; `keyterms` and `topic` per task so JSON, Redis and Kubernetes are transcribed correctly |
| Check | Bolo logic + Gemini | Word-level diff against the text, pace and fillers in code; Gemini writes the grammar and structure feedback (text only) |
| Speak | **Timbre v2.5** text to speech | Coach voice (Shlok), read-along and "Say it better" (Girish), conversation replies |

## Who it is for and why it matters
Students facing campus placements, and developers whose growth depends on explaining their work. Speaking practice needs a listener; Bolo gives everyone one, in Indian English, for free.

## Built and verified
Next.js on Vercel. No accounts, and progress stays in the browser. Tested end to end on the live URL with real Prisma, Gemini and Timbre calls: one stage went from 37 to 96 on the retry.

**Honest limits:** 30 seconds per clip (REST limit). Prisma gives no word timestamps, so pace is measured in the browser. Fillers are "detected", and fact checks are best effort.

**Next:** Hindi and Gujarati coaching voices, pronunciation hints per word, and noisy phone-call practice for telephonic interviews.
