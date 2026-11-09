"use client";

import { Ladder, type StageSpec } from "@/components/ladder/Ladder";
import { HintPanel, ReadPanel, RecallPanel, RuleCard } from "@/components/ladder/StagePanels";
import { VoiceButton } from "@/components/practice/VoiceButton";
import type { GrammarItem } from "@/content";
import { useSpeech } from "@/hooks/useSpeech";
import { READ_VOICE } from "@/lib/config";
import type { Stage } from "@/lib/types";

const LISTEN_CLIP = "listen";
const FREE_PROMPT = "Describe your day in 5 sentences.";

interface GrammarLadderProps {
  item: GrammarItem;
  initialStage: Stage;
}

export function GrammarLadder({ item, initialStage }: GrammarLadderProps) {
  const listen = useSpeech();
  const rule = <RuleCard rule={item.rule} example={item.sentence} />;

  const stageSpec = (stage: Stage): StageSpec => {
    switch (stage) {
      case "read":
        return {
          taskPrompt: "Read this sentence aloud.",
          referenceText: item.sentence,
          resultsExtra: rule,
          panel: (
            <ReadPanel
              text={item.sentence}
              listenButton={
                <VoiceButton
                  label="Listen first"
                  clipKey={LISTEN_CLIP}
                  speech={listen.state}
                  onPlay={() => listen.play(LISTEN_CLIP, [item.sentence], READ_VOICE)}
                  onStop={listen.stop}
                />
              }
            />
          ),
        };
      case "recall":
        return {
          taskPrompt: "Read it once, then say it back from memory.",
          referenceText: item.sentence,
          resultsExtra: rule,
          panel: <RecallPanel text={item.sentence} />,
        };
      case "build":
        return {
          taskPrompt: item.buildPrompt,
          resultsExtra: rule,
          panel: <HintPanel label="Example" text={item.sentence} />,
        };
      case "free":
        return {
          taskPrompt: FREE_PROMPT,
          resultsExtra: rule,
          panel: <HintPanel label="Try to use this pattern once" text={item.sentence} />,
        };
    }
  };

  return (
    <Ladder
      track="grammar"
      taskId={item.id}
      title={item.title}
      backHref="/grammar"
      backLabel="Grammar"
      topic={`Everyday spoken English. Pattern: ${item.rule}`}
      initialStage={initialStage}
      stageSpec={stageSpec}
      onStageChange={listen.stop}
      onRecordStart={listen.stop}
    />
  );
}
