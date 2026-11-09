"use client";

import { useEffect, useState } from "react";
import { CameraPreview } from "@/components/ladder/CameraPreview";
import { Ladder, type StageSpec } from "@/components/ladder/Ladder";
import { HintPanel, ReadPanel, RecallPanel } from "@/components/ladder/StagePanels";
import { VoiceButton } from "@/components/practice/VoiceButton";
import type { CreatorPrompt } from "@/content";
import { useCamera } from "@/hooks/useCamera";
import { useSpeech } from "@/hooks/useSpeech";
import { READ_VOICE, TTS_MAX_WORDS } from "@/lib/config";
import { splitForTts } from "@/lib/text";
import type { Stage } from "@/lib/types";

const LISTEN_CLIP = "listen";
const FREE_PROMPT = "Pick any tech topic you know well and record a 30 second video. Hook in the first sentence.";

interface CreatorLadderProps {
  prompt: CreatorPrompt;
  initialStage: Stage;
}

export function CreatorLadder({ prompt, initialStage }: CreatorLadderProps) {
  const listen = useSpeech();
  const camera = useCamera();
  const [isRecording, setIsRecording] = useState(false);
  const [cameraSeconds, setCameraSeconds] = useState(0);

  // Camera comfort: count the seconds spent recording with the camera on. No face analysis.
  useEffect(() => {
    if (!isRecording || camera.status !== "on") return;
    const timer = setInterval(() => setCameraSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isRecording, camera.status]);

  const cameraPanel = (
    <CameraPreview
      stream={camera.stream}
      status={camera.status}
      cameraSeconds={cameraSeconds}
      onStart={camera.start}
      onStop={camera.stop}
    />
  );

  const withCamera = (content: React.ReactNode) => (
    <div className="flex flex-col gap-6">
      {cameraPanel}
      {content}
    </div>
  );

  const stageSpec = (stage: Stage): StageSpec => {
    switch (stage) {
      case "read":
        return {
          taskPrompt: "Read this script to the camera.",
          referenceText: prompt.script,
          keyterms: prompt.keyterms,
          panel: withCamera(
            <ReadPanel
              text={prompt.script}
              listenButton={
                <VoiceButton
                  label="Listen first"
                  clipKey={LISTEN_CLIP}
                  speech={listen.state}
                  onPlay={() => listen.play(LISTEN_CLIP, splitForTts(prompt.script, TTS_MAX_WORDS), READ_VOICE)}
                  onStop={listen.stop}
                />
              }
            />,
          ),
        };
      case "recall":
        return {
          taskPrompt: "Read it once, then say it to the camera from memory.",
          referenceText: prompt.script,
          keyterms: prompt.keyterms,
          panel: withCamera(<RecallPanel text={prompt.script} />),
        };
      case "build":
        return {
          taskPrompt: prompt.buildPrompt,
          keyterms: prompt.keyterms,
          panel: withCamera(<HintPanel label="Shape" text="Hook, one clear point, a call to action." />),
        };
      case "free":
        return {
          taskPrompt: FREE_PROMPT,
          panel: withCamera(<HintPanel label="Shape" text="Hook, problem, what you did, result." />),
        };
    }
  };

  return (
    <Ladder
      track="creator"
      taskId={prompt.id}
      title={prompt.title}
      backHref="/creator"
      backLabel="Creator"
      topic={`Short tech video script: ${prompt.title}`}
      initialStage={initialStage}
      stageSpec={stageSpec}
      onStageChange={listen.stop}
      onRecordStart={listen.stop}
      onRecordingChange={setIsRecording}
    />
  );
}
