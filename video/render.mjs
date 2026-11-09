// Renders a film timeline to JPEG frames. Usage: node render.mjs <outDir> [fps] [onlyTimes,comma]
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/luv/.npm/_npx/6bcb61ec6d5aea22/node_modules/playwright");
const [out, fpsArg, only] = process.argv.slice(2);
const fps = Number(fpsArg || 30);
for (const f of ["index.html", "scenes.js"]) fs.copyFileSync(`${process.env.V}/film/${f}`, `${out}/${f}`);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(`file://${out}/index.html`);
await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))); });
const total = await p.evaluate(() => window.TIMELINE.total);
fs.mkdirSync(`${out}/frames`, { recursive: true });
const times = only ? only.split(",").map(Number) : Array.from({ length: Math.ceil(total * fps) }, (_, i) => i / fps);
let n = 0;
for (const t of times) {
  await p.evaluate((tt) => window.render(tt), t);
  await p.screenshot({ path: only ? `${out}/still-${t}.jpg` : `${out}/frames/${String(n).padStart(5, "0")}.jpg`, type: "jpeg", quality: 90 });
  n++;
  if (n % 300 === 0) console.log("frames", n, "/", times.length);
}
await b.close();
console.log("done", n, "frames", total.toFixed(2), "s");
