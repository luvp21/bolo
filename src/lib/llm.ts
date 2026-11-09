// SERVER ONLY. Thin Gemini REST client that returns parsed JSON.
// The Gnani models do the speech work; this LLM does the language feedback.
// Name it honestly in the submission ("Gemini for text feedback").

// gemini-2.5-flash is closed to new API keys (404), so default to the current flash model.
const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";
// "low" thinking roughly halves latency (about 11 s to 6 s) with good feedback. "off" sends no thinking config,
// for models that do not support thinking levels.
const THINKING = process.env.GEMINI_THINKING ?? "low";

// A Gemini call normally takes 5 to 9 s. Without a timeout a stuck connection hangs the
// whole request, so give each try a deadline and retry once. Two tries fit in the
// analyze route's 45 s limit on Vercel.
const TRY_TIMEOUT_MS = 19_000;
const MAX_TRIES = 2;

function isRetryable(res: Response): boolean {
  return res.status === 429 || res.status >= 500;
}

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TRY_TIMEOUT_MS) });
      if (attempt < MAX_TRIES && isRetryable(res)) continue;
      return res;
    } catch (err) {
      // Timeout or network failure: try again once, then give up.
      lastError = err;
    }
  }
  const error = new Error(`LLM request failed: ${lastError instanceof Error ? lastError.message : "no response"}`);
  // Keep "TimeoutError" so the route can answer 504 and the UI can say "That took too long".
  if (lastError instanceof Error && lastError.name === "TimeoutError") error.name = "TimeoutError";
  throw error;
}

export async function llmJson<T>(opts: {
  system: string;
  user: string;
  temperature?: number;
}): Promise<T> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");

  const payload = JSON.stringify({
    systemInstruction: { parts: [{ text: opts.system }] },
    contents: [{ role: "user", parts: [{ text: opts.user }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.4,
      responseMimeType: "application/json",
      ...(THINKING === "off" ? {} : { thinkingConfig: { thinkingLevel: THINKING } }),
    },
  });
  const res = await fetchWithRetry(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: payload },
  );
  if (!res.ok) {
    throw new Error(`LLM error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const body = await res.json();
  // Thinking models can return thought parts; keep only the answer text.
  const parts: { text?: string; thought?: boolean }[] = body?.candidates?.[0]?.content?.parts ?? [];
  const text = parts
    .filter((p) => !p.thought && typeof p.text === "string")
    .map((p) => p.text)
    .join("")
    .trim();
  if (!text) throw new Error("LLM returned no text");
  try {
    return JSON.parse(text) as T;
  } catch {
    // Some models wrap JSON in code fences even when asked not to.
    const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    return JSON.parse(cleaned) as T;
  }
}
