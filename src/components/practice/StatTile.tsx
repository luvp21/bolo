interface StatTileProps {
  label: string;
  value: string;
  hint: string;
  /** Lights the value in the accent when it is in a good range. */
  isGood?: boolean;
}

export function StatTile({ label, value, hint, isGood }: StatTileProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-t border-line pt-3">
      <span className="text-xs text-ink-3">{label}</span>
      <span className={`tabular font-serif text-3xl leading-tight ${isGood ? "text-accent" : "text-ink"}`}>{value}</span>
      <span className="text-xs leading-snug text-ink-3">{hint}</span>
    </div>
  );
}
