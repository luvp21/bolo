# Decisions log

One line per decision, newest at the bottom. Format: `date: decision (why)`.

- 2026-11-09: One Next.js repo on Vercel, no separate backend (fastest to ship solo).
- 2026-11-09: Prisma REST only, 30 s cap per recording (REST limit; streaming adds risk we cannot afford).
- 2026-11-09: Browser converts recordings to 16 kHz mono WAV (Chrome records WebM, which Gnani does not list as supported).
- 2026-11-09: Pace is computed in the browser from clip duration (Prisma gives no word timestamps).
- 2026-11-09: Gemini does text feedback, Gnani does all speech. Say this in the submission.
