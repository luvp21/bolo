"use client";

import { useRef, useState } from "react";

interface ShareCardProps {
  firstScore: number;
  lastScore: number;
  attempts: number;
  /** A line from the improved version. */
  sentence: string;
  trackLabel: string;
}

const WIDTH = 1080;
const HEIGHT = 1350;
const PREVIEW_SCALE = 0.3;
const HASHTAGS = "#GnaniAI #GreatIndianAIInternshipChallenge";

/** First one or two sentences, so the card never overflows. */
function shortLine(text: string, maxWords = 32): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  let out = "";
  for (const s of sentences) {
    const next = out ? `${out} ${s}` : s;
    if (next.split(/\s+/).length > maxWords) break;
    out = next;
  }
  return out || text.split(/\s+/).slice(0, maxWords).join(" ");
}

/** A 1080 x 1350 progress card people can post. Rendered as a real DOM node, saved with html-to-image. */
export function ShareCard({ firstScore, lastScore, attempts, sentence, trackLabel }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");

  const download = async () => {
    if (!cardRef.current) return;
    setStatus("working");
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(cardRef.current, { width: WIDTH, height: HEIGHT, pixelRatio: 1, cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = `bolo-${firstScore}-to-${lastScore}.png`;
      a.click();
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
      <div
        className="shrink-0 overflow-hidden rounded-2xl shadow-[0_24px_60px_-30px_oklch(0_0_0/0.9)]"
        style={{ width: WIDTH * PREVIEW_SCALE, height: HEIGHT * PREVIEW_SCALE }}
        aria-hidden="true"
      >
        <div style={{ transform: `scale(${PREVIEW_SCALE})`, transformOrigin: "top left" }}>
          <CardFace ref={cardRef} {...{ firstScore, lastScore, attempts, trackLabel }} sentence={shortLine(sentence)} />
        </div>
      </div>
      <div className="flex flex-col items-start gap-3">
        <p className="max-w-xs text-ink-2">
          {firstScore} to {lastScore} in {attempts} tries. Post it and tag Gnani AI.
        </p>
        <button
          type="button"
          onClick={download}
          disabled={status === "working"}
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg transition-transform active:scale-95 disabled:opacity-60"
        >
          {status === "working" ? "Making image..." : "Download image"}
        </button>
        {status === "error" && <p className="text-sm text-slip">Could not make the image. Try again.</p>}
      </div>
    </div>
  );
}

interface CardFaceProps {
  firstScore: number;
  lastScore: number;
  attempts: number;
  sentence: string;
  trackLabel: string;
  ref: React.Ref<HTMLDivElement>;
}

function CardFace({ firstScore, lastScore, attempts, sentence, trackLabel, ref }: CardFaceProps) {
  return (
    <div
      ref={ref}
      style={{ width: WIDTH, height: HEIGHT }}
      className="flex flex-col justify-between bg-bg p-[88px] text-ink [background:radial-gradient(120%_60%_at_50%_-10%,oklch(0.26_0.03_75),transparent_60%),var(--bg)]"
    >
      <div className="flex items-baseline justify-between">
        <span className="flex items-baseline gap-3">
          <span className="font-serif text-[64px] italic">Bolo</span>
          <span className="size-4 rounded-full bg-accent" />
        </span>
        <span className="text-[30px] text-ink-3">{trackLabel}</span>
      </div>

      <div className="flex flex-col gap-10">
        <p className="text-[40px] text-ink-2">Tried {attempts} times.</p>
        <div className="flex items-end gap-10">
          <span className="tabular font-serif text-[200px] leading-none font-light text-ink-3 line-through decoration-[6px]">{firstScore}</span>
          <span className="pb-12 text-[80px] text-ink-3">&rarr;</span>
          <span className="tabular font-serif text-[340px] leading-[0.8] font-light text-accent">{lastScore}</span>
        </div>
      </div>

      <p className="font-serif text-[46px] leading-[1.45] text-ink">&ldquo;{sentence}&rdquo;</p>

      <div className="flex flex-col gap-2 border-t border-line pt-8 text-[28px] text-ink-3">
        <span className="text-ink-2">{HASHTAGS}</span>
        <span>Speaking practice for engineers. Speech by Gnani AI.</span>
      </div>
    </div>
  );
}
