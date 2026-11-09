# Paste this into Claude Code as your first message

```
Read CLAUDE.md, then docs/PRD.md, docs/BUILD_PLAN.md and docs/GNANI_API.md in full.
We are building Bolo for a contest with a hard deadline, so work through docs/BUILD_PLAN.md in order.

Start with Phase 0. I will put my keys in .env.local myself. Run npm install, check that
`npx tsc --noEmit` passes, and tell me exactly which manual steps I need to do (keys, curl checks, trying /lab).
While I do those, start Phase 1 (the practice engine and results screen). Use the frontend-design skill for the UI
and make it look distinctive, not like a template. Commit after each finished task and tick the boxes in
docs/BUILD_PLAN.md. Do not add anything that is not in the plan. If you are blocked on a key or an account, say so and
keep working on something else.
```

## Handy follow-up prompts
- `/next` runs the slash command in `.claude/commands/next.md`: picks the next unchecked task and does it.
- "Run the whole Tech Talk ladder in a headless browser and tell me what is broken." (use Claude in Chrome or Playwright)
- "Review the results screen for mobile at 390 px and fix spacing."
- "I am 30 minutes behind. Apply the cut order in docs/BUILD_PLAN.md and update the plan."
- "Write the README with a screenshot, the Gnani models used and the run steps."
