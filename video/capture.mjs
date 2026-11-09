// Captures real Bolo screens from the live site for the pitch film.
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/luv/.npm/_npx/6bcb61ec6d5aea22/node_modules/playwright");
const V = process.env.V, KEY = process.env.GNANI_API_KEY, URL = "https://bolo-kohl.vercel.app";
const OUT = `${V}/shots`;
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

async function tts(text, voice, file) {
  const res = await fetch("https://api.vachana.ai/api/v1/tts/inference", {
    method: "POST", headers: { "Content-Type": "application/json", "X-API-Key-ID": KEY },
    body: JSON.stringify({ text, voice, model: "timbre-v2.5", language: "en-IN", speed: 1.0,
      audio_config: { sample_rate: 48000, num_channels: 1, sample_width: 2, encoding: "linear_pcm", container: "wav" } }),
  });
  if (!res.ok) throw new Error("tts " + res.status);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
let current = `${V}/audio/warm.wav`;
await ctx.route((u) => u.pathname === "/__demo.wav", (r) => r.fulfill({ body: fs.readFileSync(current), contentType: "audio/wav" }));
await ctx.addInitScript(() => {
  window.__fakeDone = false;
  navigator.mediaDevices.getUserMedia = async () => {
    window.__fakeDone = false;
    const ac = new AudioContext();
    const buf = await ac.decodeAudioData(await (await fetch("/__demo.wav?" + Math.random())).arrayBuffer());
    const dest = ac.createMediaStreamDestination();
    const src = ac.createBufferSource();
    src.buffer = buf; src.connect(dest); src.onended = () => { window.__fakeDone = true; };
    src.start();
    return dest.stream;
  };
});
const p = await ctx.newPage();
const analyses = [];
p.on("response", async (r) => { if (r.url().endsWith("/api/analyze") && r.ok()) analyses.push(await r.json().catch(() => null)); });
const shot = async (name, opts = {}) => { await p.screenshot({ path: `${OUT}/${name}.png`, ...opts }); log("shot", name); };

async function attempt({ midShot, burst } = {}) {
  await p.getByRole("button", { name: "Start recording" }).click();
  if (midShot) { await p.waitForTimeout(3500); await shot(midShot); }
  await p.waitForFunction(() => window.__fakeDone === true, null, { timeout: 60000 });
  await p.getByRole("button", { name: "Stop", exact: true }).click();
  if (burst) { await p.waitForTimeout(1200); await shot(`${burst}-processing`); }
  await p.getByRole("button", { name: /Try again/ }).first().waitFor({ timeout: 90000 });
  if (burst) for (let i = 0; i < 24; i++) { await shot(`${burst}-reveal-${String(i).padStart(2, "0")}`); await p.waitForTimeout(70); }
  await p.waitForTimeout(2600);
}

// Warm-up off camera: real attempts unlock the ladder.
await p.goto(`${URL}/tech/caching?stage=read`);
for (const stage of ["read", "recall", "build"]) {
  if (stage !== "read") { await p.getByRole("button", { name: /Next stage/ }).click(); await p.waitForTimeout(800); }
  await attempt(); log("warm", stage);
}
await p.goto(`${URL}/`); await p.waitForTimeout(2500); await shot("home");
await p.goto(`${URL}/tech`); await p.waitForTimeout(1500); await shot("tech-list");
await p.goto(`${URL}/tech/caching?stage=free`); await p.waitForTimeout(1500);
await p.getByRole("radio", { name: "Interview answer" }).click(); await p.waitForTimeout(600);
await shot("free-ready");
current = `${V}/audio/u1.wav`;
await attempt({ midShot: "free-recording", burst: "r1" });
await shot("r1-top");
await shot("r1-full", { fullPage: true });
const a1 = analyses.at(-1);
fs.writeFileSync(`${OUT}/a1.json`, JSON.stringify(a1, null, 2));
await tts(a1.feedback.improvedVersion, "Trupti", `${V}/audio/u2.wav`);
current = `${V}/audio/u2.wav`;
await p.getByRole("button", { name: /Try again/ }).first().click(); await p.waitForTimeout(700);
await attempt({ burst: "r2" });
await shot("r2-top");
await shot("r2-full", { fullPage: true });
fs.writeFileSync(`${OUT}/a2.json`, JSON.stringify(analyses.at(-1), null, 2));
// Other tracks
await p.goto(`${URL}/grammar/g2?stage=read`); await p.waitForTimeout(1200); await shot("grammar-ready");
current = `${V}/audio/g2.wav`;
await tts("If I have more time, I would learn another language.", "Trupti", current);
await attempt(); await shot("grammar-results-full", { fullPage: true });
await p.goto(`${URL}/creator/c1?stage=read`); await p.waitForTimeout(1200); await shot("creator-ready");
await p.goto(`${URL}/convo/standup`); await p.waitForTimeout(1000);
await p.getByRole("button", { name: "Start the conversation" }).click(); await p.waitForTimeout(800);
current = `${V}/audio/c1.wav`;
await tts("Yesterday I fixed the login bug. Today I am working on the payment page, and I have no blockers.", "Trupti", current);
await p.getByRole("button", { name: "Start recording" }).click();
await p.waitForFunction(() => window.__fakeDone === true, null, { timeout: 60000 });
await p.getByRole("button", { name: "Stop", exact: true }).click();
await p.getByRole("button", { name: "End and get my score" }).waitFor({ timeout: 60000 });
await p.waitForFunction(() => !document.body.innerText.includes("Listening and thinking"), null, { timeout: 60000 });
await p.waitForTimeout(1500); await shot("convo-chat");
await b.close();
log("done", JSON.stringify({ s1: a1.feedback.score, s2: analyses.at(-2)?.feedback?.score }));
