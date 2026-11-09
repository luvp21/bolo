import { type TaskProgress } from "@/lib/progress";
import { STAGES } from "@/lib/types";

/** Four small dots, one per stage, lit once that stage has been tried. */
export function LadderDots({ progress }: { progress: TaskProgress }) {
  const tried = STAGES.filter((s) => progress[s.id]?.length).length;
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`${tried} of 4 stages tried`}>
      {STAGES.map((s) => (
        <span key={s.id} className={`size-1.5 rounded-full ${progress[s.id]?.length ? "bg-accent" : "bg-line"}`} />
      ))}
    </span>
  );
}
