import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Bolo: explain tech out loud and get better every try";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#1b1814";
const INK = "#f3eee4";
const MUTED = "#9a9284";
const ACCENT = "#f2b33d";
const SLIP = "#e5705f";
const MEND = "#7fd39a";

export default async function Image() {
  const serif = await readFile(join(process.cwd(), "assets/fonts/Newsreader-Regular.ttf"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: BG, padding: 72, fontFamily: "Newsreader", color: INK }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 52, fontStyle: "italic" }}>Bolo</span>
          <span style={{ width: 14, height: 14, borderRadius: 7, background: ACCENT }} />
        </div>
        <div style={{ display: "flex", fontSize: 76, lineHeight: 1.05, maxWidth: 900 }}>Explain tech out loud. Get better every try.</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 40 }}>
            <span>The cache</span>
            <span style={{ color: SLIP, textDecoration: "line-through" }}>is showing</span>
            <span style={{ color: MEND }}>shows</span>
            <span>old data</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
            <span style={{ fontSize: 56, color: MUTED, textDecoration: "line-through" }}>42</span>
            <span style={{ fontSize: 104, color: ACCENT }}>81</span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Newsreader", data: serif, style: "normal", weight: 400 }] },
  );
}
