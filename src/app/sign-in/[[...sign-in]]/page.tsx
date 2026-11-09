import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign in · Bolo" };

export default function SignInPage() {
  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-12 px-4 py-16 sm:px-8 lg:grid-cols-2">
      <div className="flex flex-col gap-5">
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-balance">One free try, on us.</h1>
        <p className="text-lg leading-relaxed text-ink-2">
          Sign in with Google to practise. Each account gets one scored attempt, so the voice credits last for everyone.
        </p>
        <p className="text-sm text-ink-3">We only use your account to count tries. Your practice stays in your browser.</p>
      </div>
      <div className="flex justify-center lg:justify-end">
        <SignIn />
      </div>
    </main>
  );
}
