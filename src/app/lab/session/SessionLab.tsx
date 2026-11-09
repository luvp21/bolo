"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PracticeSession } from "@/components/practice/PracticeSession";
import { COACH_CLIP, IMPROVED_CLIP, ResultsView } from "@/components/practice/ResultsView";
import { useSpeech } from "@/hooks/useSpeech";
import { COACH_VOICE, READ_VOICE, TTS_MAX_WORDS } from "@/lib/config";
import { splitForTts } from "@/lib/text";
import { TECH_PASSAGES } from "@/content";
import { DEMO_FIXTURES } from "./fixtures";

const passage = TECH_PASSAGES[0];

export function SessionLab({ demo }: { demo?: "read" | "free" }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
      {demo ? (
        <DemoResults demo={demo} />
      ) : (
        <div className="mx-auto max-w-2xl">
          <PracticeSession
            track="tech"
            stage="read"
            taskPrompt="Read this aloud, clearly and at an easy pace."
            referenceText={passage.text}
            keyterms={passage.keyterms}
            topic={passage.title}
          >
            <p className="font-serif text-2xl leading-[1.7] text-ink-2">{passage.text}</p>
          </PracticeSession>
        </div>
      )}
    </main>
  );
}

function DemoResults({ demo }: { demo: "read" | "free" }) {
  const fx = DEMO_FIXTURES[demo];
  const speech = useSpeech();
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  return (
    <ResultsView
      stage={fx.stage}
      referenceText={fx.stage === "read" ? passage.text : undefined}
      result={fx.result}
      transcript={fx.transcript}
      previousScore={fx.previousScore}
      speech={speech.state}
      isMuted={isMuted}
      onToggleMute={() => setIsMuted((m) => !m)}
      onPlayCoach={() => speech.play(COACH_CLIP, splitForTts(fx.result.feedback.spokenFeedback, TTS_MAX_WORDS), COACH_VOICE)}
      onPlayImproved={() => speech.play(IMPROVED_CLIP, splitForTts(fx.result.feedback.improvedVersion, TTS_MAX_WORDS), READ_VOICE)}
      onStopSpeech={speech.stop}
      onRetry={() => router.push("/lab/session")}
      onNextStage={() => undefined}
    />
  );
}
