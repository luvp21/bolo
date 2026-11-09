# Launch kit

> Update 9 Nov: posting on X only. Use `docs/SUBMISSION.md` for the final form answers and thread.

Engagement on your nominated public posts decides the shortlist, and it is counted at the closing cutoff. So: **post early, post a clear before and after, reply to every comment.** Follow the contest's authenticity rules: no bought engagement, no bots, no engagement swaps, no paid promotion.

## The 60 second demo (record at 1080p, phone or screen recorder, keep it under 60 s)
| Seconds | Shot |
|---|---|
| 0 to 4 | Face or screen, one line hook: "I can build the thing but I freeze when I have to explain it. So I built a coach." |
| 4 to 10 | Home screen, tap a tech passage, say what it does in one line |
| 10 to 22 | First attempt: explain "caching" badly on purpose (fillers, a grammar slip). Score appears: **42** |
| 22 to 35 | Show corrections inline, the structure strip, hear the coach voice (Gnani Timbre) |
| 35 to 50 | Retry with the improved version. Score appears: **81**. Show the +39 |
| 50 to 58 | Share card, then the line: "Built solo on Gnani Prisma v3.0 and Timbre v2.5" |
| 58 to 60 | Tag @GnaniAI, hashtags |

Tips: record audio clean (no music over the speech), captions on, first frame must have text ("42 to 81 in 3 tries"). Do one rehearsal take first so the scripted bad answer sounds natural, but keep the real scores real. Do not fake the demo: misleading demos are grounds for disqualification.

## LinkedIn post (edit into your own voice before posting)
```
I can explain my code to a compiler. Explaining it to a person out loud is harder.

So for the Great Indian AI Internship Challenge by Gnani AI, I built Bolo: a speaking coach for engineers.

You read a tech passage, say it from memory, build your own version, then speak freely. After every try it shows the exact words you got wrong, fixes your grammar, checks the structure of your answer, and talks back to you.

In the demo, one answer went from 42 to 81 in three tries.

Built solo on:
- Gnani Prisma v3.0 for speech to text (jargon like Kubernetes and JSON come out right because of keyterms, and Hinglish is fine)
- Gnani Timbre v2.5 for the coach's voice
- Gemini for the grammar and structure feedback

Try it: <your-vercel-link>
Code: <your-github-link>

@Gnani AI #GnaniAI #GreatIndianAIInternshipChallenge
```

## X post (thread of 3)
```
1/ I can explain my code to a compiler. Explaining it to a human out loud? Much harder.
I built Bolo, a speaking coach for engineers, for the @GnaniAI internship challenge.
42 -> 81 in three tries. Demo below. #GnaniAI #GreatIndianAIInternshipChallenge

2/ How it works: read a tech passage, say it from memory, build your own, speak freely.
Gnani Prisma v3.0 hears you (keyterms keep "Kubernetes" from becoming "cuban eighties").
Timbre v2.5 talks back. Every wrong word gets marked.

3/ Built solo in under 2 days. Try it: <link>
Code: <link>
```

## Submission form: what to prepare (fields from the contest page)
- Project title: Bolo, a speaking coach for engineers
- Problem: Engineers know the material but freeze when explaining it out loud in interviews, stand-ups and on camera. English tutors teach general English, not how to explain a database index or a bug.
- Who will use it: Engineering students preparing for placements, and early career developers.
- Gnani models and APIs used: Prisma v3.0 speech to text REST (`language_code=en-IN,hi-IN`, `keyterms`, `topic`), Timbre v2.5 text to speech REST (voices Shlok and Girish). Mention Gemini is used for text feedback only.
- Contribution: solo, everything (design, frontend, backend, prompts, content).
- Demo video: upload the same video.
- Nominated posts: one LinkedIn link and one X link (the live posts, not drafts).
- Written explanation: 150 to 250 words. Problem, the four stage ladder, what the Gnani models do in the loop, one honest limitation (30 s per clip, no word timestamps so pace is measured in the browser).

## Final checklist before pressing submit
- [ ] Both posts are public and live, with `#GnaniAI` and `#GreatIndianAIInternshipChallenge`, and Gnani AI tagged.
- [ ] The demo video plays on both platforms.
- [ ] The Vercel URL works in an incognito window and on a phone.
- [ ] The GitHub repo is public, README has a screenshot, no secrets committed (`git log -p | grep -i api_key` shows nothing real).
- [ ] The form is saved before 8:00 PM IST on 10 Nov. Deadline is 11:59 PM IST, no extensions.

## Ways to earn honest engagement
- Tag friends who are about to face placements and ask them to try it and post their score.
- Post in your college WhatsApp groups and CSI channels with the link to the post (not a request to like it).
- Reply to every comment with a useful answer in the first hours.
- Offer to run a comment's sentence through the app and reply with the result.
