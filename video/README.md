# Pitch video pipeline

The submission videos are rendered in code from real screens of the live app.

1. `capture.mjs`, `capture-any.mjs`: Playwright drives https://bolo-kohl.vercel.app with a fake mic that plays Timbre-generated speech, and saves real screens and analysis JSON to `$V/shots`.
2. `narration.json`: narrator lines, generated with Gnani Timbre v2.5 (voice Girish, speed 0.9) into `$V/narr`.
3. `cut-master.json` (2:50, for the form) and `cut-60.json` (58.7 s, for X): edit decision lists. `${V}` stands for the work folder.
4. `build.mjs` turns a cut into `timeline.js` + `audio.json`. `film/` is a deterministic HTML film: `render(t)` draws any moment.
5. `render.mjs` renders frames at 30 fps (1920x1080). `mix.py` places voices at their cue times over a ducked pad (-16 LUFS). `encode.sh` makes the H.264/AAC MP4.

Media (shots, audio, frames, MP4s) is not committed; the final files are in `/submission` locally.
