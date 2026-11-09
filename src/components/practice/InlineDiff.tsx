import { casedWords, markGrammar } from "@/lib/text";
import type { DiffOp, GrammarFix } from "@/lib/types";

const PROOF_TEXT = "font-serif text-[1.45rem] leading-[1.75] text-ink sm:text-[1.65rem]";

interface ReadDiffProps {
  ops: DiffOp[];
  /** Used only to show reference words with their original casing. */
  referenceText?: string;
}

/** Swaps each lowercased reference word in the ops for its cased original, in order. */
function withCasing(ops: DiffOp[], referenceText?: string): DiffOp[] {
  if (!referenceText) return ops;
  const cased = casedWords(referenceText);
  let i = 0;
  return ops.map((op) => {
    if (op.type === "extra") return op;
    const original = cased[i++];
    if (!original || original.toLowerCase() !== op.ref) return op;
    return op.type === "match" ? { ...op, ref: original, said: original } : { ...op, ref: original };
  });
}

/** Read-aloud stages: your words against the text, marked like an editor's proof. */
export function ReadDiff({ ops, referenceText }: ReadDiffProps) {
  return (
    <div>
      <p className={PROOF_TEXT}>
        {withCasing(ops, referenceText).map((op, i) => (
          <DiffWord key={i} op={op} />
        ))}
      </p>
      <Legend />
    </div>
  );
}

function DiffWord({ op }: { op: DiffOp }) {
  switch (op.type) {
    case "match":
      return <span>{op.said} </span>;
    case "wrong":
      return (
        <span className="whitespace-nowrap">
          <del className="text-slip decoration-slip decoration-2" aria-label={`you said ${op.said}`}>
            {op.said}
          </del>{" "}
          <ins className="rounded bg-mend-dim px-1 text-mend no-underline" aria-label={`expected ${op.ref}`}>
            {op.ref}
          </ins>{" "}
        </span>
      );
    case "missing":
      return (
        <span>
          <ins
            className="text-ink-2 underline decoration-mend decoration-dashed decoration-2 underline-offset-[6px]"
            aria-label={`missed ${op.ref}`}
          >
            {op.ref}
          </ins>{" "}
        </span>
      );
    case "extra":
      return <span className="text-ink-3/70" aria-label={`extra word ${op.said}`}>{op.said} </span>;
  }
}

function Legend() {
  return (
    <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-3">
      <li className="flex items-center gap-2">
        <span className="text-slip line-through decoration-2">said</span>
        <span className="rounded bg-mend-dim px-1 text-mend">fix</span>
      </li>
      <li className="flex items-center gap-2">
        <span className="text-ink-2 underline decoration-mend decoration-dashed underline-offset-4">word</span> missed
      </li>
      <li className="flex items-center gap-2">
        <span className="text-ink-3/70">word</span> extra
      </li>
    </ul>
  );
}

interface GrammarMarksProps {
  transcript: string;
  fixes: GrammarFix[];
}

/** Your own words with each grammar slip struck and the fix written in. */
export function GrammarMarks({ transcript, fixes }: GrammarMarksProps) {
  const segments = markGrammar(transcript, fixes);
  return (
    <p className={PROOF_TEXT}>
      {segments.map((seg, i) =>
        seg.kind === "text" ? (
          <span key={i}>{seg.text}</span>
        ) : (
          <span key={i}>
            <del className="text-slip decoration-slip decoration-2">{seg.text}</del>{" "}
            <ins className="rounded bg-mend-dim px-1 text-mend no-underline">{seg.fix.fixed}</ins>
          </span>
        ),
      )}
    </p>
  );
}
