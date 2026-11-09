import type { Feedback } from "@/lib/types";

const PARTS = [
  { key: "hook", label: "Hook" },
  { key: "problem", label: "Problem" },
  { key: "action", label: "Action" },
  { key: "result", label: "Result" },
] as const;

interface StructureStripProps {
  structure: Feedback["structure"];
}

/** The four beats of a good spoken answer, lit when the coach heard them. */
export function StructureStrip({ structure }: StructureStripProps) {
  const hits = PARTS.filter((p) => structure[p.key]).length;
  return (
    <div>
      <ol className="grid grid-cols-4 gap-1.5" aria-label={`Structure: ${hits} of 4 parts heard`}>
        {PARTS.map((p) => {
          const on = structure[p.key];
          return (
            <li key={p.key} className="flex flex-col gap-2">
              <span
                className={`h-1.5 rounded-full transition-colors ${on ? "bg-accent shadow-[0_2px_12px_-2px_var(--accent)]" : "bg-line-soft"}`}
              />
              <span className={`text-sm ${on ? "text-ink" : "text-ink-3"}`}>
                {p.label}
                <span className="sr-only">{on ? " heard" : " missing"}</span>
              </span>
            </li>
          );
        })}
      </ol>
      {structure.note && <p className="mt-3 text-sm leading-relaxed text-ink-2">{structure.note}</p>}
    </div>
  );
}
