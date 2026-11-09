import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 pt-6 sm:px-8">
      <Link href="/" className="group inline-flex items-baseline gap-1.5" aria-label="Bolo home">
        <span className="font-serif text-2xl italic tracking-tight text-ink">Bolo</span>
        <span className="size-1.5 rounded-full bg-accent transition-transform group-hover:scale-150" aria-hidden="true" />
      </Link>
      <p className="hidden text-sm text-ink-3 sm:block">Speak English, Hinglish is fine.</p>
    </header>
  );
}
