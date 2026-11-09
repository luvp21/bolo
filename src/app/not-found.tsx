import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start justify-center gap-6 px-4 py-24 sm:px-8">
      <p className="font-serif text-[clamp(3rem,8vw,5rem)] leading-none">
        <del className="text-slip decoration-[3px]">This page</del> <ins className="rounded bg-mend-dim px-2 text-mend no-underline">Nothing</ins>{" "}
        is here.
      </p>
      <p className="text-lg text-ink-2">The link may be old. Pick a track and keep practising.</p>
      <Link href="/" className="rounded-full bg-accent px-6 py-3 font-medium text-accent-ink transition-transform hover:scale-[1.02]">
        Back to Bolo
      </Link>
    </main>
  );
}
