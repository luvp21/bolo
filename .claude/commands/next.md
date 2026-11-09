---
description: Do the next unchecked task in docs/BUILD_PLAN.md
---
Open docs/BUILD_PLAN.md and find the first unchecked task (`- [ ]`) in the earliest unfinished phase.

1. Say in one line which task you are doing.
2. Do it, following CLAUDE.md and docs/PRD.md. Keep the change small.
3. Run `npx tsc --noEmit`. If the task touched routes or config, also run `npm run build`.
4. Tick the box in docs/BUILD_PLAN.md and commit with a plain message.
5. If the phase gate is now satisfied, say so and name the next phase. Do not start work outside the plan.

Arguments (optional): $ARGUMENTS
