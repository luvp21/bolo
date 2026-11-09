"use client";

import { useState } from "react";
import { useRecorder } from "@/hooks/useRecorder";
import { TECH_PASSAGES } from "@/content";
import type { AnalyzeResponse } from "@/lib/types";

/**
 * Smoke test for the whole pipeline: mic -> WAV -> /api/stt -> /api/analyze -> /api/tts.
 * If this page works end to end, every feature after it is just UI and content.
 * Replace or delete once the real tracks exist.
 */
export default function Lab() {
  const rec = useRecorder(30);
  const passage = TECH_PASSAGES[0];
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ttsUrl, setTtsUrl] = useState("");

  async function run() {
    if (!rec.recording) return;
    setBusy(true);
    setErr("");
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("audio", rec.recording.wav, "audio.wav");
      fd.append("language", "en-IN,hi-IN");
      fd.append("keyterms", JSON.stringify(passage.keyterms));
      fd.append("topic", passage.title);
      const stt = await fetch("/api/stt", { method: "POST", body: fd });
      const sttJson = await stt.json();
      if (!stt.ok) throw new Error(`STT: ${sttJson.error?.type} ${sttJson.error?.message}`);
      setTranscript(sttJson.transcript);

      const an = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track: "tech",
          stage: "read",
          taskPrompt: "Read the passage aloud.",
          referenceText: passage.text,
          transcript: sttJson.transcript,
          durationMs: rec.recording.durationMs,
        }),
      });
      const anJson = await an.json();
      if (!an.ok) throw new Error(`Analyze: ${anJson.error?.message}`);
      setResult(anJson);

      const tts = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: anJson.feedback.spokenFeedback, voice: "Shlok", language: "en-IN" }),
      });
      if (!tts.ok) throw new Error(`TTS: ${(await tts.json()).error?.message}`);
      setTtsUrl(URL.createObjectURL(await tts.blob()));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Pipeline smoke test</h1>
      <p className="rounded border p-3 text-sm leading-6">{passage.text}</p>

      <div className="flex gap-2">
        <button className="rounded bg-black px-4 py-2 text-white disabled:opacity-40" onClick={rec.start} disabled={rec.state === "recording"}>
          Record
        </button>
        <button className="rounded border px-4 py-2 disabled:opacity-40" onClick={rec.stop} disabled={rec.state !== "recording"}>
          Stop ({Math.round(rec.elapsedMs / 1000)}s / {rec.maxSeconds}s)
        </button>
        <button className="rounded border px-4 py-2 disabled:opacity-40" onClick={run} disabled={!rec.recording || busy}>
          {busy ? "Working..." : "Score it"}
        </button>
      </div>

      <p className="text-sm text-zinc-500">State: {rec.state}</p>
      {rec.recording && <audio controls src={rec.recording.url} />}
      {(err || rec.error) && <p className="text-sm text-red-600">{err || rec.error}</p>}
      {transcript && (
        <p className="text-sm">
          <b>Transcript:</b> {transcript}
        </p>
      )}
      {result && (
        <pre className="overflow-auto rounded bg-zinc-100 p-3 text-xs dark:bg-zinc-900">{JSON.stringify(result, null, 2)}</pre>
      )}
      {ttsUrl && <audio controls autoPlay src={ttsUrl} />}
    </main>
  );
}
