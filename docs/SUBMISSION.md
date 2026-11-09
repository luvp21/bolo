# Submission kit (X only)

Live app: https://bolo-kohl.vercel.app
Code: https://github.com/luvp21/bolo

## Form answers

**Project title:** Bolo, a speaking coach for engineers

**Problem:** Engineers know the material but freeze when they explain it out loud in interviews, stand-ups and on camera. English tutors teach general English, not how to explain a database index or a production bug.

**Who will use it:** Engineering students preparing for placements, and early career developers in India.

**Gnani models and APIs used:**
- Prisma v3.0 speech to text (REST `/stt/v3`) with `language_code=en-IN,hi-IN` so Hinglish is fine, plus `keyterms` and `topic` so jargon like JSON, Redis and Kubernetes is transcribed correctly.
- Timbre v2.5 text to speech (REST `/api/v1/tts/inference`): voice Shlok for the coach, Girish for read-along and "Say it better".
- Gemini (gemini-3.8-flash) is used only for the written feedback (grammar, structure, best-effort fact check). It is not a Gnani model.

**Contribution:** Solo. Product, design, frontend, backend, prompts and content.

**Written explanation (about 200 words):**
Bolo helps engineers practise explaining tech out loud. Every task climbs the same four-stage ladder: read a passage aloud, say it back from memory, build your own version from a topic and keywords, then speak freely from an angle like "interview answer". There are four tracks: Tech Talk, Grammar, Creator (with an optional mirror camera) and Conversation (voice role-plays such as a stand-up or an HR round).

After each try of up to 30 seconds, Gnani Prisma v3.0 transcribes the speech, with keyterms so technical words come out right. Bolo then checks the words against the text, measures pace and filler words, and asks an LLM for grammar fixes and the structure of the answer. The results screen marks mistakes directly on the user's own sentence, shows a stronger version, and Gnani Timbre v2.5 speaks the coaching aloud. The user retries and sees "+N from last try", then downloads a share card of their progress.

Honest limits: each clip is capped at 30 seconds by the REST API. Prisma returns no word timestamps, so pace is measured in the browser. Fillers are "detected", not guaranteed. Fact checks are best effort. Progress lives only in the browser.

**Demo video:** upload the same file you post on X.

**Nominated post:** the X post link. If the form requires a LinkedIn link as well, check the contest rules on whether one platform is allowed before leaving it empty.

## X thread (edit into your own voice)
```
1/ I can explain my code to a compiler. Explaining it to a human out loud is much harder.
So I built Bolo, a speaking coach for engineers, for the @GnaniAI internship challenge.
[video] #GnaniAI #GreatIndianAIInternshipChallenge

2/ Read a tech passage, say it from memory, build your own, then speak freely.
Gnani Prisma v3.0 hears you (keyterms keep JSON and Redis right, Hinglish is fine).
Gnani Timbre v2.5 is the coach's voice. Every slip is marked on your own sentence.

3/ Built solo. Try it: https://bolo-kohl.vercel.app
Code: https://github.com/luvp21/bolo
```

## Final checklist
- [ ] X post is public, with both hashtags and @GnaniAI tagged, and the video plays.
- [ ] Live URL works in an incognito window and on a phone.
- [ ] Repo is public with the README screenshot; no secrets in history (checked 9 Nov).
- [ ] Form saved before 8:00 PM IST on 10 Nov (hard deadline 11:59 PM).
