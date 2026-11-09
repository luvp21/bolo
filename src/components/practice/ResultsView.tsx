"use client";

import { PACE_GOOD_MAX, PACE_GOOD_MIN } from "@/lib/config";
import type { AnalyzeResponse, Stage } from "@/lib/types";
import type { SpeechState } from "@/hooks/useSpeech";
import { FactsCheck, FixCards } from "./FixCards";
import { GrammarMarks, ReadDiff } from "./InlineDiff";
import { ArrowIcon, MuteIcon, RetryIcon, SpeakerIcon } from "./icons";
import { ScoreRing } from "./ScoreRing";
import { StatTile } from "./StatTile";
import { StructureStrip } from "./StructureStrip";
import { VoiceButton } from "./VoiceButton";

export const COACH_CLIP = "coach";
export const IMPROVED_CLIP = "improved";

interface ResultsViewProps {
  stage: Stage;
  referenceText?: string;
  result: AnalyzeResponse;
  transcript: string;
  previousScore?: number;
  speech: SpeechState;
  isMuted: boolean;
  onToggleMute: () => void;
  onPlayCoach: () => void;
  onPlayImproved: () => void;
  onStopSpeech: () => void;
  onRetry: () => void;
  onNextStage?: () => void;
}

function Section({ title, index, aside, children }: { title: string; index: number; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="settle" style={{ ["--i" as string]: index }}>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function ResultsView(props: ResultsViewProps) {
  const { stage, referenceText, result, transcript, previousScore, speech } = props;
  const { feedback, metrics, read } = result;
  const isReadStage = stage === "read" || stage === "recall";
  const paceGood = metrics.wordsPerMinute >= PACE_GOOD_MIN && metrics.wordsPerMinute <= PACE_GOOD_MAX;
  const topFillers = Object.entries(metrics.fillers)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([w]) => `"${w}"`)
    .join(", ");

  return (
    <div className="grid gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      {/* Left: the verdict. Sticky on wide screens so the score stays in frame. */}
      <aside className="flex flex-col gap-8 lg:sticky lg:top-10 lg:self-start">
        <ScoreRing score={feedback.score} previousScore={previousScore} />

        <div className="settle flex flex-col gap-4" style={{ ["--i" as string]: 1 }}>
          <p className="text-center font-serif text-xl leading-snug text-ink-2 italic lg:text-left">{feedback.summary}</p>
          <CoachBar {...props} />
        </div>

        <div className="settle grid grid-cols-3 gap-4" style={{ ["--i" as string]: 2 }}>
          <StatTile
            label="Words a minute"
            value={`${metrics.wordsPerMinute}`}
            hint={`${PACE_GOOD_MIN} to ${PACE_GOOD_MAX} is a good pace`}
            isGood={paceGood}
          />
          <StatTile
            label="Fillers detected"
            value={`${metrics.fillerCount}`}
            hint={metrics.fillerCount ? topFillers : "None heard"}
            isGood={metrics.fillerCount === 0}
          />
          {read ? (
            <StatTile
              label="Read accuracy"
              value={`${Math.round(read.accuracy * 100)}%`}
              hint="words matched the text"
              isGood={read.accuracy >= 0.9}
            />
          ) : (
            <StatTile label="Words" value={`${metrics.wordCount}`} hint={`in ${Math.round(metrics.durationMs / 1000)} seconds`} />
          )}
        </div>

        <div className="settle flex flex-wrap gap-3" style={{ ["--i" as string]: 3 }}>
          <button
            type="button"
            onClick={props.onRetry}
            className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 py-3 font-medium text-accent-ink shadow-[0_12px_32px_-14px_var(--accent)] transition-transform hover:scale-[1.02] active:scale-95"
          >
            <RetryIcon className="size-5" />
            Try again
          </button>
          {props.onNextStage && (
            <button
              type="button"
              onClick={props.onNextStage}
              className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-line px-6 py-3 font-medium text-ink transition-colors hover:border-ink-3"
            >
              Next stage
              <ArrowIcon className="size-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Right: the proof sheet. */}
      <div className="flex min-w-0 flex-col gap-12">
        <Section title="What you said" index={2}>
          {isReadStage && read ? (
            <ReadDiff ops={read.ops} referenceText={referenceText} />
          ) : (
            <GrammarMarks transcript={transcript} fixes={feedback.grammar} />
          )}
        </Section>

        {feedback.grammar.length > 0 && (
          <Section title="Fix these first" index={3}>
            <FixCards fixes={feedback.grammar} />
          </Section>
        )}

        {stage !== "read" ? (
          <Section title="Structure" index={4}>
            <StructureStrip structure={feedback.structure} />
          </Section>
        ) : null}

        {feedback.factual.length > 0 && (
          <Section title="Facts check" index={5} aside={<span className="text-xs text-ink-3">Best effort</span>}>
            <FactsCheck facts={feedback.factual} />
          </Section>
        )}

        {feedback.improvedVersion && (
          <Section title="Say it better" index={6}>
            <div className="rounded-3xl bg-raised p-6 sm:p-8">
              <p className="font-serif text-[1.35rem] leading-[1.7] text-ink sm:text-2xl">{feedback.improvedVersion}</p>
              <div className="mt-6">
                <VoiceButton
                  label="Hear it"
                  clipKey={IMPROVED_CLIP}
                  speech={speech}
                  onPlay={props.onPlayImproved}
                  onStop={props.onStopSpeech}
                />
              </div>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function CoachBar({ speech, isMuted, onToggleMute, onPlayCoach, onStopSpeech }: ResultsViewProps) {
  const isCoach = speech.key === COACH_CLIP;
  const isTalking = isCoach && speech.status === "playing";
  const isBlocked = isCoach && speech.status === "blocked";

  return (
    <div className="flex items-center justify-center gap-2 lg:justify-start">
      {isTalking ? (
        <span className="inline-flex items-center gap-2 rounded-full bg-accent-dim px-4 py-2 text-sm text-accent">
          <SpeakerIcon className="breathe size-4" />
          Coach is talking
          <button type="button" onClick={onStopSpeech} className="ml-1 underline underline-offset-4">
            Stop
          </button>
        </span>
      ) : (
        <VoiceButton
          label={isBlocked ? "Play coach" : "Hear coach"}
          clipKey={COACH_CLIP}
          speech={speech}
          onPlay={onPlayCoach}
          onStop={onStopSpeech}
        />
      )}
      <button
        type="button"
        onClick={onToggleMute}
        aria-pressed={isMuted}
        aria-label={isMuted ? "Coach voice is off. Turn on auto play" : "Coach voice plays automatically. Turn off"}
        title={isMuted ? "Auto play off" : "Auto play on"}
        className="grid size-9 place-items-center rounded-full border border-line text-ink-2 transition-colors hover:text-ink"
      >
        {isMuted ? <MuteIcon className="size-4" /> : <SpeakerIcon className="size-4" />}
      </button>
    </div>
  );
}
