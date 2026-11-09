"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowIcon } from "@/components/practice/icons";
import { useCustomTopics } from "@/hooks/useCustomTopics";
import { generatePassage } from "@/lib/api";
import { checkTopicInput, TOPIC_MAX } from "@/lib/customTopic";
import { ApiError, toFriendlyError } from "@/lib/errors";

const SUGGESTIONS = ["Load balancers", "OAuth login", "Kubernetes pods", "How UPI payments work", "Black holes", "Compound interest"];

export function AnyTopicForm() {
  const router = useRouter();
  const { add } = useCustomTopics();
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState<"idle" | "writing">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (value: string) => {
    const check = checkTopicInput(value);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setError(null);
    setStatus("writing");
    try {
      const passage = await generatePassage(check.value);
      add(passage);
      router.push(`/tech/${passage.id}?stage=read`);
    } catch (err) {
      setStatus("idle");
      if (err instanceof ApiError && (err.type === "BAD_TOPIC" || err.type === "NO_PASSAGE")) setError(err.message);
      else setError(toFriendlyError(err).title);
    }
  };

  const isWriting = status === "writing";

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit(topic);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <label htmlFor="topic" className="sr-only">
          Topic
        </label>
        <input
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          maxLength={TOPIC_MAX}
          disabled={isWriting}
          placeholder="Type any topic, like load balancers"
          className="min-w-0 flex-1 rounded-full border border-line bg-raised px-6 py-3.5 text-lg text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isWriting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 font-medium text-accent-ink shadow-[0_14px_36px_-16px_var(--accent)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70"
        >
          {isWriting ? "Writing your passage..." : "Make my passage"}
          {!isWriting && <ArrowIcon className="size-5" />}
        </button>
      </form>
      {error && (
        <p role="alert" className="text-slip">
          {error}
        </p>
      )}
      <div>
        <p className="mb-2 text-sm text-ink-3">Or try one of these</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={isWriting}
              onClick={() => {
                setTopic(s);
                void submit(s);
              }}
              className="rounded-full border border-line px-3.5 py-1.5 text-sm text-ink-2 transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
