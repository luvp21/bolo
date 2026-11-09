"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { blobToWav16k } from "@/lib/wav";

export type RecState = "idle" | "requesting" | "recording" | "processing" | "done" | "error";

export interface Recording {
  wav: Blob;
  durationMs: number;
  /** object URL for an <audio> element, revoked on reset/unmount */
  url: string;
}

/**
 * Mic recorder that returns 16 kHz mono WAV. Auto-stops at maxSeconds because
 * the Gnani REST endpoint rejects clips longer than 30 s.
 */
export function useRecorder(maxSeconds = 30) {
  const [state, setState] = useState<RecState>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** DOMException name from getUserMedia, e.g. NotAllowedError when the mic is blocked. */
  const [errorName, setErrorName] = useState<string | null>(null);
  /** Live mic stream while recording, for a level meter. */
  const [stream, setStream] = useState<MediaStream | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);
  const urlRef = useRef<string | null>(null);
  const cancelledRef = useRef(false);

  const cleanupStream = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  const reset = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setRecording(null);
    setElapsedMs(0);
    setError(null);
    setErrorName(null);
    setState("idle");
  }, []);

  useEffect(() => {
    return () => {
      cleanupStream();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [cleanupStream]);

  const stop = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  }, []);

  /** Stop without keeping the clip. */
  const cancel = useCallback(() => {
    cancelledRef.current = true;
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
    else cleanupStream();
    reset();
  }, [cleanupStream, reset]);

  const start = useCallback(async () => {
    reset();
    cancelledRef.current = false;
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
      });
      streamRef.current = stream;
      setStream(stream);
      chunksRef.current = [];
      const rec = new MediaRecorder(stream);
      recorderRef.current = rec;
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        cleanupStream();
        if (cancelledRef.current) return;
        setState("processing");
        try {
          const raw = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
          const { wav, durationMs } = await blobToWav16k(raw);
          const url = URL.createObjectURL(wav);
          urlRef.current = url;
          setRecording({ wav, durationMs, url });
          setState("done");
        } catch (e) {
          setError(e instanceof Error ? e.message : "Could not process the recording");
          setState("error");
        }
      };
      rec.start(250);
      startedAtRef.current = Date.now();
      setState("recording");
      timerRef.current = setInterval(() => {
        const ms = Date.now() - startedAtRef.current;
        setElapsedMs(ms);
        if (ms >= maxSeconds * 1000) stop();
      }, 100);
    } catch (e) {
      cleanupStream();
      setErrorName(e instanceof Error ? e.name : "NotAllowedError");
      setError(e instanceof Error ? e.message : "Microphone permission denied");
      setState("error");
    }
  }, [cleanupStream, maxSeconds, reset, stop]);

  return { state, elapsedMs, recording, error, errorName, stream, start, stop, cancel, reset, maxSeconds };
}
