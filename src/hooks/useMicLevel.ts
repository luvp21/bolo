"use client";

import { useEffect, useState } from "react";

/** 0 to 1 loudness of a live stream, sampled every animation frame. */
export function useMicLevel(stream: MediaStream | null): number {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!stream) return;
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    let frame = 0;
    let smooth = 0;

    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (const v of data) {
        const x = (v - 128) / 128;
        sum += x * x;
      }
      const rms = Math.sqrt(sum / data.length);
      // Speech RMS rarely passes 0.3, so stretch it to fill the meter.
      smooth = smooth * 0.7 + Math.min(1, rms * 3.2) * 0.3;
      setLevel(smooth);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      source.disconnect();
      ctx.close().catch(() => undefined);
      setLevel(0);
    };
  }, [stream]);

  return level;
}
