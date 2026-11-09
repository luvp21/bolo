// Builds film/timeline.js and an audio cue list from a cut definition.
// Usage: node build.mjs <cut.json> <outDir>
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const V = process.env.V;
const [cutFile, outDir] = process.argv.slice(2);
const cut = JSON.parse(fs.readFileSync(cutFile, "utf8"));
const narration = JSON.parse(fs.readFileSync(`${V}/narration.json`, "utf8"));
const dur = (f) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

let t = 0;
const cues = [], captions = [], audio = [];
for (const c of cut.cues) {
  const start = t + (c.lead ?? 0.35);
  let at = start;
  // Each cue plays its sounds in order: narration keys ("n01") or clip objects.
  for (const snd of c.sounds || []) {
    if (typeof snd === "string") {
      const file = `${V}/narr/${snd}.wav`; const d = dur(file);
      audio.push({ file, at, gain: 1.0 });
      captions.push({ start: at, end: at + d, text: narration[snd] });
      at += d + (c.gap ?? 0.25);
    } else {
      const d = snd.len ?? dur(snd.file);
      audio.push({ file: snd.file, at, gain: snd.gain ?? 1.0, len: snd.len });
      if (snd.caption) captions.push({ start: at, end: at + d, text: snd.caption });
      at += d + (c.gap ?? 0.25);
    }
  }
  const length = Math.max(c.min ?? 0, at - start) + (c.tail ?? 0.4);
  cues.push({ id: c.id, scene: c.scene, start: t, dur: length + (start - t), params: c.params });
  c._soundStart = start - t;
  t += length + (start - t);
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(`${outDir}/timeline.js`, `window.TIMELINE = ${JSON.stringify({ cues, captions, total: t })};`);
fs.writeFileSync(`${outDir}/audio.json`, JSON.stringify({ total: t, audio }, null, 1));
console.log("total", t.toFixed(2), "cues", cues.length);
for (const c of cues) console.log(c.id.padEnd(14), c.start.toFixed(2), c.dur.toFixed(2));
