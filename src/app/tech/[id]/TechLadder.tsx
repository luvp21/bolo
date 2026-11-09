"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnglePicker, BuildPanel, ReadPanel, RecallPanel } from "@/components/ladder/StagePanels";
import { LadderBar, ScoreHistory } from "@/components/ladder/LadderBar";
import { type PracticeResult, PracticeSession } from "@/components/practice/PracticeSession";
import { VoiceButton } from "@/components/practice/VoiceButton";
import { TECH_ANGLES, type TechPassage } from "@/content";
import { saveLastPlace, useTaskProgress } from "@/hooks/useProgress";
import { useSpeech } from "@/hooks/useSpeech";
import { READ_VOICE, TTS_MAX_WORDS } from "@/lib/config";
import { lastScore, STAGE_ORDER } from "@/lib/progress";
import { splitForTts } from "@/lib/text";
import type { Stage } from "@/lib/types";

const LISTEN_CLIP = "listen";

interface TechLadderProps {
  passage: TechPassage;
  initialStage: Stage;
}

function taskPromptFor(stage: Stage, passage: TechPassage, angleId: string): string {
  switch (stage) {
    case "read":
      return "Read this aloud, clearly and at an easy pace.";
    case "recall":
      return "Read it once, then say it back from memory.";
    case "build":
      return passage.topic;
    case "free": {
      const angle = TECH_ANGLES.find((a) => a.id === angleId) ?? TECH_ANGLES[0];
      return angle.prompt(passage.subject);
    }
  }
}

export function TechLadder({ passage, initialStage }: TechLadderProps) {
  const { progress, record } = useTaskProgress("tech", passage.id);
  const [stage, setStage] = useState<Stage>(initialStage);
  const [angleId, setAngleId] = useState(TECH_ANGLES[0].id);
  const listen = useSpeech();

  useEffect(() => {
    saveLastPlace({ track: "tech", taskId: passage.id, title: passage.title, stage });
  }, [passage.id, passage.title, stage]);

  const stageIndex = STAGE_ORDER.indexOf(stage);
  const nextStage = STAGE_ORDER[stageIndex + 1];
  const isReadStage = stage === "read" || stage === "recall";

  const selectStage = useCallback(
    (next: Stage) => {
      listen.stop();
      setStage(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [listen],
  );

  const handleComplete = useCallback((r: PracticeResult) => record(stage, r.analysis.feedback.score), [record, stage]);

  const scores = (progress[stage] ?? []).map((a) => a.score);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pt-6 pb-20 sm:px-8 sm:pt-10">
      <header className="flex flex-col gap-6">
        <p className="flex flex-wrap items-baseline gap-x-2 text-sm text-ink-3">
          <Link href="/tech" className="underline decoration-line underline-offset-4 hover:text-ink">
            Tech Talk
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink-2">{passage.title}</span>
        </p>
        <LadderBar progress={progress} current={stage} onSelect={selectStage} />
        <ScoreHistory scores={scores} />
      </header>

      <PracticeSession
        key={stage}
        track="tech"
        stage={stage}
        taskPrompt={taskPromptFor(stage, passage, angleId)}
        referenceText={isReadStage ? passage.text : undefined}
        keyterms={stage === "build" ? [...passage.keyterms, ...passage.keywords] : passage.keyterms}
        topic={passage.title}
        keywords={stage === "build" ? passage.keywords : undefined}
        previousScore={lastScore(progress[stage])}
        onComplete={handleComplete}
        onRecordStart={listen.stop}
        onNextStage={nextStage ? () => selectStage(nextStage) : undefined}
      >
        {stage === "read" && (
          <ReadPanel
            text={passage.text}
            listenButton={
              <VoiceButton
                label="Listen first"
                clipKey={LISTEN_CLIP}
                speech={listen.state}
                onPlay={() => listen.play(LISTEN_CLIP, splitForTts(passage.text, TTS_MAX_WORDS), READ_VOICE)}
                onStop={listen.stop}
              />
            }
          />
        )}
        {stage === "recall" && <RecallPanel text={passage.text} />}
        {stage === "build" && <BuildPanel topic="Use the topic above. Say it your own way." keywords={passage.keywords} />}
        {stage === "free" && <AnglePicker angles={TECH_ANGLES} selected={angleId} onSelect={setAngleId} />}
      </PracticeSession>
    </main>
  );
}
