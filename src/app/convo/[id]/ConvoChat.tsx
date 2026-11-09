"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatBubble, type ConvoTurn } from "@/components/convo/ChatBubble";
import { RecorderPanel } from "@/components/practice/RecorderPanel";
import { COACH_CLIP, IMPROVED_CLIP, ResultsView } from "@/components/practice/ResultsView";
import type { ConvoScenario } from "@/content";
import { saveLastPlace } from "@/hooks/useProgress";
import { useRecorder } from "@/hooks/useRecorder";
import { useSpeech } from "@/hooks/useSpeech";
import { analyzeAttempt, chatReply, transcribeClip } from "@/lib/api";
import { COACH_VOICE, MAX_RECORD_SECONDS, READ_VOICE, TTS_MAX_WORDS } from "@/lib/config";
import { type FriendlyError, toFriendlyError } from "@/lib/errors";
import { splitForTts } from "@/lib/text";
import type { AnalyzeResponse } from "@/lib/types";

const MAX_TURNS = 10;
const REPLY_CLIP = "reply";

type Phase = "intro" | "talking" | "thinking" | "summarising" | "summary";

export function ConvoChat({ scenario }: { scenario: ConvoScenario }) {
  const rec = useRecorder(MAX_RECORD_SECONDS);
  const speech = useSpeech();
  const [phase, setPhase] = useState<Phase>("intro");
  const [turns, setTurns] = useState<ConvoTurn[]>([{ role: "coach", text: scenario.opener }]);
  const [error, setError] = useState<FriendlyError | null>(null);
  const [summary, setSummary] = useState<AnalyzeResponse | null>(null);
  const spokenMsRef = useRef(0);
  const handledRef = useRef<Blob | null>(null);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    saveLastPlace({ track: "convo", taskId: scenario.id, title: scenario.title, stage: "free" });
  }, [scenario.id, scenario.title]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length, phase]);

  const sayCoach = useCallback(
    (text: string) => speech.play(REPLY_CLIP, splitForTts(text, TTS_MAX_WORDS), COACH_VOICE),
    [speech],
  );

  const begin = () => {
    setPhase("talking");
    void sayCoach(scenario.opener);
  };

  const sendTurn = useCallback(
    async (wav: Blob, durationMs: number) => {
      setPhase("thinking");
      setError(null);
      try {
        const userText = await transcribeClip({ wav, topic: scenario.scenario });
        spokenMsRef.current += durationMs;
        const history = turns.slice(-MAX_TURNS).map(({ role, text }) => ({ role, text }));
        setTurns((t) => [...t, { role: "user" as const, text: userText }].slice(-MAX_TURNS));
        const out = await chatReply({ scenario: scenario.scenario, persona: scenario.persona, history, userText });
        setTurns((t) => [...t, { role: "coach" as const, text: out.reply, correction: out.correction }].slice(-MAX_TURNS));
        void sayCoach(out.reply);
      } catch (err) {
        setError(toFriendlyError(err));
      } finally {
        rec.reset();
        setPhase("talking");
      }
    },
    [rec, sayCoach, scenario, turns],
  );

  useEffect(() => {
    const clip = rec.recording;
    if (!clip || handledRef.current === clip.wav) return;
    handledRef.current = clip.wav;
    void sendTurn(clip.wav, clip.durationMs);
  }, [rec.recording, sendTurn]);

  const end = async () => {
    speech.stop();
    const userText = turns.filter((t) => t.role === "user").map((t) => t.text).join(" ");
    if (!userText) return;
    setPhase("summarising");
    try {
      const result = await analyzeAttempt({
        track: "convo",
        stage: "free",
        taskPrompt: `${scenario.title}. ${scenario.scenario}`,
        transcript: userText,
        durationMs: Math.max(1000, spokenMsRef.current),
      });
      setSummary(result);
      setPhase("summary");
    } catch (err) {
      setError(toFriendlyError(err));
      setPhase("talking");
    }
  };

  const restart = () => {
    speech.stop();
    rec.reset();
    spokenMsRef.current = 0;
    setTurns([{ role: "coach", text: scenario.opener }]);
    setSummary(null);
    setError(null);
    setPhase("intro");
  };

  if (phase === "summary" && summary) {
    const transcript = turns.filter((t) => t.role === "user").map((t) => t.text).join(" ");
    return (
      <ResultsView
        stage="free"
        result={summary}
        transcript={transcript}
        speech={speech.state}
        isMuted={false}
        onToggleMute={speech.stop}
        onPlayCoach={() => speech.play(COACH_CLIP, splitForTts(summary.feedback.spokenFeedback, TTS_MAX_WORDS), COACH_VOICE)}
        onPlayImproved={() => speech.play(IMPROVED_CLIP, splitForTts(summary.feedback.improvedVersion, TTS_MAX_WORDS), READ_VOICE)}
        onStopSpeech={speech.stop}
        onRetry={restart}
      />
    );
  }

  const userTurns = turns.filter((t) => t.role === "user").length;
  const isBusy = phase === "thinking" || phase === "summarising";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <ol className="flex flex-col gap-4" aria-live="polite">
        {turns.map((turn, i) => (
          <ChatBubble key={i} turn={turn} isSpeaking={i === turns.length - 1 && turn.role === "coach" && speech.state.status === "playing"} />
        ))}
        {phase === "thinking" && <li className="breathe text-sm text-ink-3">Listening and thinking of a reply...</li>}
        {phase === "summarising" && <li className="breathe text-sm text-ink-3">Scoring the whole conversation...</li>}
      </ol>
      <div ref={listEndRef} />

      {error && (
        <div role="alert" className="rounded-2xl border border-line px-5 py-4">
          <p className="font-medium text-ink">{error.title}</p>
          <p className="mt-1 text-sm text-ink-3">{error.hint}</p>
        </div>
      )}

      {phase === "intro" ? (
        <button
          type="button"
          onClick={begin}
          className="self-center rounded-full bg-accent px-7 py-3.5 font-medium text-accent-ink shadow-[0_14px_36px_-16px_var(--accent)] transition-transform hover:scale-[1.02] active:scale-95"
        >
          Start the conversation
        </button>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <RecorderPanel
            isRecording={rec.state === "recording"}
            isStarting={rec.state === "requesting"}
            isDisabled={isBusy}
            elapsedMs={isBusy ? 0 : rec.elapsedMs}
            maxSeconds={rec.maxSeconds}
            stream={rec.stream}
            onStart={() => {
              speech.stop();
              void rec.start();
            }}
            onStop={rec.stop}
            onCancel={rec.cancel}
          />
          {rec.state === "error" && <p className="text-sm text-slip">{toFriendlyError({ name: rec.errorName ?? "Error" }).title}</p>}
          {userTurns > 0 && rec.state !== "recording" && (
            <button
              type="button"
              onClick={end}
              disabled={isBusy}
              className="rounded-full border border-line px-5 py-2 text-sm text-ink-2 transition-colors hover:text-ink disabled:opacity-50"
            >
              End and get my score
            </button>
          )}
        </div>
      )}
    </div>
  );
}
