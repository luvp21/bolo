"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { speechUrl } from "@/lib/api";

export type SpeechStatus = "idle" | "loading" | "playing" | "blocked" | "error";

export interface SpeechState {
  /** Which clip is active, so only that button shows a playing state. */
  key: string | null;
  status: SpeechStatus;
}

const IDLE: SpeechState = { key: null, status: "idle" };

/**
 * One shared player for every voice on the page, so the coach and "Hear it"
 * never talk over each other. Plays a list of short lines in order and fetches
 * the next line while the current one plays.
 */
export function useSpeech() {
  const [state, setState] = useState<SpeechState>(IDLE);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const runRef = useRef(0);

  const stop = useCallback(() => {
    runRef.current += 1;
    audioRef.current?.pause();
    setState(IDLE);
  }, []);

  useEffect(() => () => {
    runRef.current += 1;
    audioRef.current?.pause();
  }, []);

  const play = useCallback(async (key: string, lines: string[], voice: string) => {
    const run = ++runRef.current;
    audioRef.current?.pause();
    if (!lines.length) return;
    // A fresh element per run keeps an old run's handlers from firing on the new one.
    const audio = new Audio();
    audioRef.current = audio;
    setState({ key, status: "loading" });

    try {
      let next = speechUrl(lines[0], voice);
      for (let i = 0; i < lines.length; i++) {
        const url = await next;
        if (run !== runRef.current) return;
        if (i + 1 < lines.length) next = speechUrl(lines[i + 1], voice);
        audio.src = url;
        try {
          await audio.play();
        } catch (err) {
          // Autoplay was blocked (Safari, or no tap yet). Let the user press play.
          if (err instanceof DOMException && err.name === "NotAllowedError") {
            setState({ key, status: "blocked" });
            return;
          }
          throw err;
        }
        setState({ key, status: "playing" });
        await new Promise<void>((resolve, reject) => {
          audio.onended = () => resolve();
          audio.onpause = () => resolve();
          audio.onerror = () => reject(new Error("Audio playback failed"));
        });
        if (run !== runRef.current) return;
      }
      setState(IDLE);
    } catch {
      if (run === runRef.current) setState({ key, status: "error" });
    }
  }, []);

  return { state, play, stop };
}
