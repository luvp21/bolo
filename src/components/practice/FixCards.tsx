"use client";

import { useState } from "react";
import type { FactIssue, GrammarFix } from "@/lib/types";

const VISIBLE = 3;

interface FixCardsProps {
  fixes: GrammarFix[];
}

export function FixCards({ fixes }: FixCardsProps) {
  const [showAll, setShowAll] = useState(false);
  const shown = showAll ? fixes : fixes.slice(0, VISIBLE);
  const hidden = fixes.length - VISIBLE;

  return (
    <div className="flex flex-col gap-2.5">
      <ul className="flex flex-col gap-2.5">
        {shown.map((fix, i) => (
          <li key={i} className="rounded-2xl bg-raised px-5 py-4">
            <p className="font-serif text-lg leading-snug">
              <del className="text-slip decoration-slip decoration-2">{fix.original}</del>
            </p>
            <p className="mt-1 font-serif text-lg leading-snug text-mend">{fix.fixed}</p>
            {fix.why && <p className="mt-2 text-sm leading-relaxed text-ink-3">{fix.why}</p>}
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="self-start text-sm text-ink-2 underline decoration-line underline-offset-4 hover:text-ink"
        >
          {showAll ? "Show fewer" : `Show ${hidden} more`}
        </button>
      )}
    </div>
  );
}

interface FactsCheckProps {
  facts: FactIssue[];
}

export function FactsCheck({ facts }: FactsCheckProps) {
  return (
    <ul className="flex flex-col gap-2.5">
      {facts.map((f, i) => (
        <li key={i} className="rounded-2xl border border-line px-5 py-4">
          <p className="font-serif text-lg leading-snug text-ink-2">&ldquo;{f.claim}&rdquo;</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-3">{f.issue}</p>
          <p className="mt-2 text-sm leading-relaxed text-mend">{f.correction}</p>
        </li>
      ))}
    </ul>
  );
}
