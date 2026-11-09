export interface ConvoTurn {
  role: "user" | "coach";
  text: string;
  /** Coach turns only: one short fix for the user's previous line. */
  correction?: string | null;
}

export function ChatBubble({ turn, isSpeaking }: { turn: ConvoTurn; isSpeaking?: boolean }) {
  if (turn.role === "user") {
    return (
      <li className="settle flex justify-end" style={{ ["--i" as string]: 0 }}>
        <p className="max-w-[85%] rounded-3xl rounded-br-md bg-raised px-5 py-3.5 font-serif text-lg leading-relaxed text-ink">{turn.text}</p>
      </li>
    );
  }
  return (
    <li className="settle flex flex-col items-start gap-2" style={{ ["--i" as string]: 0 }}>
      <p
        className={`max-w-[85%] rounded-3xl rounded-bl-md border px-5 py-3.5 text-lg leading-relaxed text-ink transition-colors ${
          isSpeaking ? "border-accent" : "border-line"
        }`}
      >
        {turn.text}
      </p>
      {turn.correction && (
        <p className="max-w-[85%] rounded-full bg-mend-dim px-4 py-1.5 text-sm text-mend">
          <span className="sr-only">Correction: </span>
          {turn.correction}
        </p>
      )}
    </li>
  );
}
