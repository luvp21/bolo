import Link from "next/link";

// Placeholder home. Claude Code replaces this in Phase 2 (see docs/BUILD_PLAN.md).
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 p-6">
      <h1 className="text-4xl font-semibold tracking-tight">Bolo</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        A speaking coach for engineers. Read, say it back, build your own, then speak freely.
      </p>
      <Link href="/lab" className="w-fit rounded bg-black px-4 py-2 text-white">
        Open the pipeline smoke test
      </Link>
    </main>
  );
}
