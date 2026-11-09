"use client";

import { useState } from "react";
import { Ladder, type StageSpec } from "@/components/ladder/Ladder";
import { AnglePicker, BuildPanel, ReadPanel, RecallPanel } from "@/components/ladder/StagePanels";
import { VoiceButton } from "@/components/practice/VoiceButton";
import { TECH_ANGLES, type TechPassage } from "@/content";
import { useSpeech } from "@/hooks/useSpeech";
import { READ_VOICE, TTS_MAX_WORDS } from "@/lib/config";
import { splitForTts } from "@/lib/text";
import type { Stage } from "@/lib/types";

const LISTEN_CLIP = "listen";

interface TechLadderProps {
  passage: TechPassage;
  initialStage: Stage;
}

export function TechLadder({ passage, initialStage }: TechLadderProps) {
  const [angleId, setAngleId] = useState(TECH_ANGLES[0].id);
  const listen = useSpeech();

  const stageSpec = (stage: Stage): StageSpec => {
    switch (stage) {
      case "read":
        return {
          taskPrompt: "Read this aloud, clearly and at an easy pace.",
          referenceText: passage.text,
          keyterms: passage.keyterms,
          panel: (
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
          ),
        };
      case "recall":
        return {
          taskPrompt: "Read it once, then say it back from memory.",
          referenceText: passage.text,
          keyterms: passage.keyterms,
          panel: <RecallPanel text={passage.text} />,
        };
      case "build":
        return {
          taskPrompt: passage.topic,
          keyterms: [...passage.keyterms, ...passage.keywords],
          keywords: passage.keywords,
          panel: <BuildPanel topic="Use the topic above. Say it your own way." keywords={passage.keywords} />,
        };
      case "free": {
        const angle = TECH_ANGLES.find((a) => a.id === angleId) ?? TECH_ANGLES[0];
        return {
          taskPrompt: angle.prompt(passage.subject),
          keyterms: passage.keyterms,
          panel: <AnglePicker angles={TECH_ANGLES} selected={angleId} onSelect={setAngleId} />,
        };
      }
    }
  };

  return (
    <Ladder
      track="tech"
      taskId={passage.id}
      title={passage.title}
      backHref="/tech"
      backLabel="Tech Talk"
      topic={passage.title}
      initialStage={initialStage}
      stageSpec={stageSpec}
      onStageChange={listen.stop}
      onRecordStart={listen.stop}
    />
  );
}
