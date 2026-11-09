"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { type PracticeResult, PracticeSession } from "@/components/practice/PracticeSession";
import { saveLastPlace, useTaskProgress } from "@/hooks/useProgress";
import { lastScore, STAGE_ORDER } from "@/lib/progress";
import type { Stage, Track } from "@/lib/types";
import { LadderBar, ScoreHistory } from "./LadderBar";

/** What one stage of a task looks like. Each track builds these from its own content. */
export interface StageSpec {
  taskPrompt: string;
  /** Sent for read and recall so the word diff works. */
  referenceText?: string;
  keyterms?: string[];
  /** Build stage keyword chips, shown green in the results when said. */
  keywords?: string[];
  /** Content above the mic: the passage, chips, an angle picker, a camera. */
  panel: React.ReactNode;
  /** Extra card on the results screen, e.g. the grammar rule. */
  resultsExtra?: React.ReactNode;
}

export interface LadderProps {
  track: Track;
  taskId: string;
  title: string;
  backHref: string;
  backLabel: string;
  /** Context for Prisma so jargon and names are transcribed correctly. */
  topic?: string;
  initialStage: Stage;
  stageSpec: (stage: Stage) => StageSpec;
  onStageChange?: () => void;
  onRecordStart?: () => void;
  onRecordingChange?: (isRecording: boolean) => void;
}

/** The shared four-stage ladder screen used by every track. */
export function Ladder(props: LadderProps) {
  const { track, taskId, title, initialStage, stageSpec, onStageChange } = props;
  const { progress, record } = useTaskProgress(track, taskId);
  const [stage, setStage] = useState<Stage>(initialStage);

  useEffect(() => {
    saveLastPlace({ track, taskId, title, stage });
  }, [track, taskId, title, stage]);

  const selectStage = useCallback(
    (next: Stage) => {
      onStageChange?.();
      setStage(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [onStageChange],
  );

  const handleComplete = useCallback((r: PracticeResult) => record(stage, r.analysis.feedback.score), [record, stage]);

  const nextStage = STAGE_ORDER[STAGE_ORDER.indexOf(stage) + 1];
  const spec = stageSpec(stage);
  const scores = (progress[stage] ?? []).map((a) => a.score);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pt-6 pb-20 sm:px-8 sm:pt-10">
      <header className="flex flex-col gap-6">
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm text-ink-3">
          <Link href={props.backHref} className="underline decoration-line underline-offset-4 hover:text-ink">
            {props.backLabel}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink-2">{title}</span>
        </p>
        <LadderBar progress={progress} current={stage} onSelect={selectStage} />
        <ScoreHistory scores={scores} />
      </header>

      <PracticeSession
        key={stage}
        track={track}
        stage={stage}
        taskPrompt={spec.taskPrompt}
        referenceText={spec.referenceText}
        keyterms={spec.keyterms}
        topic={props.topic}
        keywords={spec.keywords}
        resultsExtra={spec.resultsExtra}
        scoreHistory={scores}
        trackLabel={props.backLabel}
        previousScore={lastScore(progress[stage])}
        onComplete={handleComplete}
        onRecordStart={props.onRecordStart}
        onRecordingChange={props.onRecordingChange}
        onNextStage={nextStage ? () => selectStage(nextStage) : undefined}
      >
        {spec.panel}
      </PracticeSession>
    </main>
  );
}
