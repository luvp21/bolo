import type { SpeechState } from "@/hooks/useSpeech";
import { PlayIcon, SpeakerIcon, StopIcon } from "./icons";

interface VoiceButtonProps {
  label: string;
  clipKey: string;
  speech: SpeechState;
  onPlay: () => void;
  onStop: () => void;
}

/** Play/stop button bound to one clip of the shared speech player. */
export function VoiceButton({ label, clipKey, speech, onPlay, onStop }: VoiceButtonProps) {
  const isMine = speech.key === clipKey;
  const isLoading = isMine && speech.status === "loading";
  const isPlaying = isMine && speech.status === "playing";
  const failed = isMine && speech.status === "error";

  return (
    <button
      type="button"
      onClick={isPlaying || isLoading ? onStop : onPlay}
      className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-accent hover:text-accent"
      aria-pressed={isPlaying}
    >
      {isPlaying ? (
        <StopIcon className="size-4" />
      ) : isLoading ? (
        <SpeakerIcon className="breathe size-4" />
      ) : (
        <PlayIcon className="size-4" />
      )}
      {isPlaying ? "Stop" : isLoading ? "Loading voice..." : failed ? "Voice failed, try again" : label}
    </button>
  );
}
