"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraStatus = "off" | "starting" | "on" | "denied";

/** Front camera for a mirror preview. Video only: scoring still uses the mic recording. */
export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("off");
  const streamRef = useRef<MediaStream | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
    setStatus("off");
  }, []);

  const start = useCallback(async () => {
    setStatus("starting");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = s;
      setStream(s);
      setStatus("on");
    } catch {
      // Camera is optional. A denied or missing camera must never block practice.
      setStatus("denied");
    }
  }, []);

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  return { stream, status, start, stop };
}
