"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRecorder } from "@/hooks/useRecorder";
import { useSpeech } from "@/hooks/useSpeech";
import { analyzeAttempt, transcribeClip } from "@/lib/api";
import { COACH_VOICE, MAX_RECORD_SECONDS, READ_VOICE, TTS_MAX_WORDS } from "@/lib/config";
import { type FriendlyError, friendlyError, toFriendlyError } from "@/lib/errors";
import { readStored, STORAGE_KEYS, writeStored } from "@/lib/storage";
import { splitForTts } from "@/lib/text";
import type { AnalyzeResponse, Stage, Track } from "@/lib/types";
import { RecorderPanel } from "./RecorderPanel";
import { COACH_CLIP, IMPROVED_CLIP, ResultsView } from "./ResultsView";
import { ErrorPanel, type ProcessingStep, ProcessingView } from "./SessionStatus";

export interface PracticeResult {
  transcript: string;
  analysis: AnalyzeResponse;
}

export interface PracticeSessionProps {
  track: Track;
  stage: Stage;
  /** What the user is asked to do, shown above the mic and sent to the coach. */
  taskPrompt: string;
  /** Text to compare against on read and recall stages. */
  referenceText?: string;
  /** Jargon for Prisma so technical words are transcribed correctly. */
  keyterms?: string[];
  topic?: string;
  /** Score of the last try on this task, so the first result can show "+N from last try". */
  previousScore?: number;
  /** Stage specific content: the passage, the keyword chips, the angle picker. */
  children?: React.ReactNode;
  onComplete?: (result: PracticeResult) => void;
  onNextStage?: () => void;
}

type View =
  | { kind: "idle" }
  | { kind: "processing"; step: ProcessingStep }
  | { kind: "results"; result: AnalyzeResponse; transcript: string; previousScore?: number }
  | { kind: "error"; error: FriendlyError };

const IDLE: View = { kind: "idle" };

/** One practice attempt: ready -> recording -> processing -> results | error. */
export function PracticeSession(props: PracticeSessionProps) {
  const { track, stage, taskPrompt, referenceText, keyterms, topic } = props;
  const rec = useRecorder(MAX_RECORD_SECONDS);
  const speech = useSpeech();
  const [view, setView] = useState<View>(IDLE);
  // Results only render after a client interaction, so reading storage here cannot cause a hydration mismatch.
  const [isMuted, setIsMuted] = useState(() => readStored(STORAGE_KEYS.coachMuted, false));
  const lastScoreRef = useRef<number | undefined>(props.previousScore);
  const handledRef = useRef<Blob | null>(null);
  const attemptRef = useRef(0);
  const callbacksRef = useRef({ onComplete: props.onComplete });

  useEffect(() => {
    callbacksRef.current = { onComplete: props.onComplete };
  }, [props.onComplete]);

  useEffect(() => {
    lastScoreRef.current = props.previousScore;
  }, [props.previousScore]);

  const playCoach = useCallback(
    (text: string) => speech.play(COACH_CLIP, splitForTts(text, TTS_MAX_WORDS), COACH_VOICE),
    [speech],
  );

  const runPipeline = useCallback(
    async (wav: Blob, durationMs: number) => {
      const attempt = ++attemptRef.current;
      const isCurrent = () => attempt === attemptRef.current;
      try {
        setView({ kind: "processing", step: "transcribe" });
        const transcript = await transcribeClip({ wav, keyterms, topic });
        if (!isCurrent()) return;
        setView({ kind: "processing", step: "analyze" });
        const result = await analyzeAttempt({ track, stage, taskPrompt, referenceText, transcript, durationMs });
        if (!isCurrent()) return;
        const previousScore = lastScoreRef.current;
        lastScoreRef.current = result.feedback.score;
        setView({ kind: "results", result, transcript, previousScore });
        callbacksRef.current.onComplete?.({ transcript, analysis: result });
        if (!readStored(STORAGE_KEYS.coachMuted, false) && result.feedback.spokenFeedback) {
          void playCoach(result.feedback.spokenFeedback);
        }
      } catch (err) {
        if (isCurrent()) setView({ kind: "error", error: toFriendlyError(err) });
      }
    },
    [keyterms, playCoach, referenceText, stage, taskPrompt, topic, track],
  );

  // A finished recording starts the pipeline exactly once.
  useEffect(() => {
    const clip = rec.recording;
    if (!clip || handledRef.current === clip.wav) return;
    handledRef.current = clip.wav;
    void runPipeline(clip.wav, clip.durationMs);
  }, [rec.recording, runPipeline]);

  const reset = useCallback(() => {
    attemptRef.current += 1;
    speech.stop();
    rec.reset();
    setView(IDLE);
  }, [rec, speech]);

  const toggleMute = useCallback(() => {
    setIsMuted((was) => {
      const next = !was;
      writeStored(STORAGE_KEYS.coachMuted, next);
      if (next && speech.state.key === COACH_CLIP) speech.stop();
      return next;
    });
  }, [speech]);

  const start = useCallback(() => {
    speech.stop();
    void rec.start();
  }, [rec, speech]);

  if (view.kind === "results") {
    return (
      <ResultsView
        stage={stage}
        referenceText={referenceText}
        result={view.result}
        transcript={view.transcript}
        previousScore={view.previousScore}
        speech={speech.state}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onPlayCoach={() => playCoach(view.result.feedback.spokenFeedback)}
        onPlayImproved={() =>
          speech.play(IMPROVED_CLIP, splitForTts(view.result.feedback.improvedVersion, TTS_MAX_WORDS), READ_VOICE)
        }
        onStopSpeech={speech.stop}
        onRetry={reset}
        onNextStage={props.onNextStage}
      />
    );
  }

  const recorderError =
    rec.state === "error"
      ? rec.errorName
        ? toFriendlyError({ name: rec.errorName })
        : friendlyError("audio")
      : null;
  const error = view.kind === "error" ? view.error : recorderError;
  if (error) return <ErrorPanel error={error} onRetry={reset} />;

  if (view.kind === "processing" || rec.state === "processing") {
    return <ProcessingView step={view.kind === "processing" ? view.step : "transcribe"} />;
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <h1 className="font-serif text-3xl leading-tight text-balance sm:text-4xl">{taskPrompt}</h1>
        {props.children}
      </div>
      <RecorderPanel
        isRecording={rec.state === "recording"}
        isStarting={rec.state === "requesting"}
        elapsedMs={rec.elapsedMs}
        maxSeconds={rec.maxSeconds}
        stream={rec.stream}
        onStart={start}
        onStop={rec.stop}
        onCancel={rec.cancel}
      />
    </div>
  );
}
