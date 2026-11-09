# Bolo

A speaking coach for engineers. Read a tech passage, say it from memory, build your own version, then speak freely. After every try you see the exact words you got wrong, grammar fixes, the structure of your answer, and a coach who talks back.

Built solo for the Great Indian AI Internship Challenge by Gnani AI.

## How it works
1. The browser records your voice and converts it to 16 kHz WAV.
2. **Gnani Prisma v3.0** transcribes it (English with Hindi mixed in is fine, jargon is boosted with keyterms).
3. Deterministic checks compare it with the text (word accuracy) and measure pace and filler words.
4. Gemini gives grammar, structure and fact feedback as JSON.
5. **Gnani Timbre v2.5** speaks the coaching back.

## Run it
```bash
npm install
cp .env.example .env.local   # add GNANI_API_KEY and GEMINI_API_KEY
npm run dev                  # open http://localhost:3000/lab to test the pipeline
```

## Working on it with Claude Code
Start with `CLAUDE.md`, then `docs/KICKOFF_PROMPT.md`.
