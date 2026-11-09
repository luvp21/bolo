// SERVER ONLY. Thin Gemini REST client that returns parsed JSON.
// The Gnani models do the speech work; this LLM does the language feedback.
// Name it honestly in the submission ("Gemini for text feedback").

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export async function llmJson<T>(opts: {
  system: string;
  user: string;
  temperature?: number;
}): Promise<T> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: opts.system }] },
        contents: [{ role: "user", parts: [{ text: opts.user }] }],
        generationConfig: {
          temperature: opts.temperature ?? 0.4,
          responseMimeType: "application/json",
        },
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`LLM error ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const body = await res.json();
  const text: string | undefined = body?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("LLM returned no text");
  try {
    return JSON.parse(text) as T;
  } catch {
    // Some models wrap JSON in code fences even when asked not to.
    const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    return JSON.parse(cleaned) as T;
  }
}
