"use client";

import { useEffect, useRef } from "react";
import type { CameraStatus } from "@/hooks/useCamera";

interface CameraPreviewProps {
  stream: MediaStream | null;
  status: CameraStatus;
  cameraSeconds: number;
  onStart: () => void;
  onStop: () => void;
}

/** A mirror so talking to a camera feels normal. Nothing is recorded or analysed from it. */
export function CameraPreview({ stream, status, cameraSeconds, onStart, onStop }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video && video.srcObject !== stream) video.srcObject = stream;
  }, [stream]);

  if (status !== "on") {
    return (
      <div className="flex flex-col items-start gap-2 rounded-3xl border border-dashed border-line p-5">
        <button
          type="button"
          onClick={onStart}
          disabled={status === "starting"}
          className="rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {status === "starting" ? "Starting camera..." : "Turn on camera"}
        </button>
        <p className="text-sm text-ink-3">
          {status === "denied"
            ? "Camera is blocked. That is fine, you can still practise with just your voice."
            : "Optional. A mirror to get used to the lens. Only your voice is scored."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-3xl bg-sunk">
        <video ref={videoRef} autoPlay muted playsInline className="aspect-[4/3] w-full -scale-x-100 object-cover" />
        <span className="absolute top-3 left-3 rounded-full bg-bg/70 px-3 py-1 text-xs text-ink-2">Look at the lens, not at yourself.</span>
      </div>
      <div className="flex items-center justify-between gap-3 text-sm text-ink-3">
        <span className="tabular" aria-live="polite">
          Camera comfort: {cameraSeconds}s on camera
        </span>
        <button type="button" onClick={onStop} className="underline decoration-line underline-offset-4 hover:text-ink">
          Turn off camera
        </button>
      </div>
    </div>
  );
}
