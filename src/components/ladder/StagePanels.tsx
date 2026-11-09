"use client";

import { useEffect, useState } from "react";
import type { Angle } from "@/content";

const PASSAGE_TEXT = "font-serif text-[1.4rem] leading-[1.7] text-ink-2 sm:text-2xl";
const RECALL_SECONDS = 10;

interface ReadPanelProps {
  text: string;
  listenButton: React.ReactNode;
}

export function ReadPanel({ text, listenButton }: ReadPanelProps) {
  return (
    <div className="flex flex-col gap-5">
      <p className={PASSAGE_TEXT}>{text}</p>
      <div>{listenButton}</div>
    </div>
  );
}

/** Shows the text for a few seconds, then hides it. Peeking is allowed, no penalty. */
export function RecallPanel({ text }: { text: string }) {
  const [secondsLeft, setSecondsLeft] = useState(RECALL_SECONDS);
  const [isPeeking, setIsPeeking] = useState(false);
  const isHidden = secondsLeft <= 0 && !isPeeking;

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) clearInterval(timer);
        return Math.max(0, s - 1);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <p
          className={`${PASSAGE_TEXT} transition-[filter,opacity] duration-700 ease-out-expo ${
            isHidden ? "pointer-events-none opacity-30 blur-md select-none" : ""
          }`}
          aria-hidden={isHidden}
        >
          {text}
        </p>
        {isHidden && (
          <div className="absolute inset-0 grid place-items-center">
            <p className="rounded-full bg-bg/80 px-4 py-2 text-sm text-ink-2">Now say it from memory</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 text-sm">
        {secondsLeft > 0 ? (
          <span className="tabular text-ink-3" aria-live="polite">
            Hides in {secondsLeft}s
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setIsPeeking((p) => !p)}
            aria-pressed={isPeeking}
            className="rounded-full border border-line px-4 py-2 text-ink-2 transition-colors hover:text-ink"
          >
            {isPeeking ? "Hide" : "Peek"}
          </button>
        )}
      </div>
    </div>
  );
}

interface BuildPanelProps {
  topic: string;
  keywords: string[];
}

export function BuildPanel({ topic, keywords }: BuildPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-ink-2">{topic}</p>
      <div>
        <p className="mb-2 text-sm text-ink-3">Try to use these words</p>
        <ul className="flex flex-wrap gap-2">
          {keywords.map((k) => (
            <li key={k} className="rounded-full border border-line px-3.5 py-1.5 text-sm text-ink">
              {k}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface AnglePickerProps {
  angles: Angle[];
  selected: string;
  onSelect: (id: string) => void;
}

export function AnglePicker({ angles, selected, onSelect }: AnglePickerProps) {
  return (
    <div>
      <p className="mb-2 text-sm text-ink-3">Pick your angle</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Pick your angle">
        {angles.map((a) => {
          const on = a.id === selected;
          return (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onSelect(a.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                on ? "bg-accent text-accent-ink" : "border border-line text-ink-2 hover:text-ink"
              }`}
            >
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** The grammar rule in plain words, shown on the results screen after each attempt. */
export function RuleCard({ rule, example }: { rule: string; example: string }) {
  return (
    <aside className="rounded-3xl border border-line p-6" aria-label="The rule">
      <p className="text-sm font-semibold text-ink">The rule</p>
      <p className="mt-2 text-lg leading-relaxed text-ink">{rule}</p>
      <p className="mt-3 font-serif text-lg text-ink-2 italic">&ldquo;{example}&rdquo;</p>
    </aside>
  );
}

/** A short hint block for build and free stages that have no keywords. */
export function HintPanel({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm text-ink-3">{label}</p>
      <p className="font-serif text-xl text-ink-2 italic">{text}</p>
    </div>
  );
}
