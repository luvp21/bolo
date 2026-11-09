# Gnani API facts (verified against docs.gnani.ai on 9 Nov 2026)

Docs index for agents: https://docs.gnani.ai/llms.txt  (append `.md` to any docs page URL to get markdown).
Base URL: `https://api.vachana.ai`. Auth header on every call: `X-API-Key-ID: <GNANI_API_KEY>`.
Get a key at https://app.gnani.ai/voice. Each registration has 5,000 programme credits.
Some older docs mention `api.gnani.ai/prisma/v3/...`. Ignore those, use the endpoints below.

## Speech to text (REST): `POST /stt/v3` (multipart/form-data)
| Field | Notes |
|---|---|
| `audio_file` | WAV, MP3, OGG, FLAC, AAC, M4A. **Max 30 seconds.** WebM (Chrome MediaRecorder) is NOT listed, so we convert to 16 kHz WAV in the browser (`src/lib/wav.ts`). |
| `model` | `prisma-v3.0`. If omitted you get Prisma v2.5. |
| `language_code` | Required. `en-IN`, `hi-IN`, `gu-IN`, `ta-IN`, ... or `indic-auto`, or a comma list of 1 to 4 like `en-IN,hi-IN`. Hints, not a lock. We default to `en-IN,hi-IN`. |
| `format` | `verbatim`, `transcribe` (digits and symbols), `codemix`, `transliterate`. With a single `en-IN` or `hi-IN` the default is `transcribe`. |
| `keyterms` | v3.0. JSON array or comma string, up to 200 terms. Use for jargon and names. |
| `topic` | v3.0. Up to 1600 chars of context. |
| `previous_text` | v3.0. Last 600 chars are used. |
| `enable_substitution`, `substitution_map` | Optional find/replace on the transcript, max 10 rules. |

Response: `success`, `request_id`, `transcript`, `model`, `detected_language_code`, `processing_time`, `end_to_end_latency`, and `truncated` only when true.
**No word level timestamps.** Compute pace as words / duration measured in the browser.
Audio under 0.1 s returns an empty transcript.

Errors: `{"success": false, "error": {"type", "message"}}`. Auth and limits use `{"detail": {"error_code", "message"}}`.
Handle at least: 401 bad key, 402 out of credits, 429 `RATE_LIMITED` (no Retry-After, back off), 400 `MAX_AUDIO_DURATION_EXCEEDED`, 400 `AUDIO_CONVERSION_ERROR`, 504 timeout.

## Text to speech (REST): `POST /api/v1/tts/inference` (JSON, returns audio/wav)
```json
{
  "text": "Good attempt. Say the word 'cache' with a hard k.",
  "voice": "Shlok",
  "model": "timbre-v2.5",
  "language": "en-IN",
  "speed": 1.0,
  "audio_config": { "sample_rate": 48000, "num_channels": 1, "sample_width": 2, "encoding": "linear_pcm", "container": "wav" }
}
```
- English (`en-IN`) v2.5 voices: Kaveri (F, firm), Trupti (F, upbeat), Devika (F, authoritative), Pranav (M, friendly), Shlok (M, warm, conversational), Girish (M, expressive, storytelling).
- Hindi (`hi-IN`): Nalini, Bhavna, Yashvi, Urmila, Jwala, Chitra, Ambuja, Deepak, Roopesh, Vikrant, Hemraj, Jalaj, Omkar. Hinglish (`hi-en`): Poorvi. Gujarati (`gu-IN`): Falak, Veera. Others exist for Tamil, Telugu, Kannada, Malayalam, Marathi, Bengali, Punjabi.
- Voices are model specific. A v2.5 voice sent with `timbre-v3.0` returns 400. Stay on `timbre-v2.5`.
- If the 48 kHz response is too large or slow, set `GNANI_TTS_SAMPLE_RATE=24000` (untested, check the response plays).
- Streaming exists (`/api/v1/tts/sse`, WebSocket) but we do not use it.
- Text normalisation guide: https://docs.gnani.ai/api/TTS/tts-input-formating.md (numbers, abbreviations).

## Smoke test with curl
```bash
curl -X POST https://api.vachana.ai/stt/v3 \
  -H "X-API-Key-ID: $GNANI_API_KEY" \
  -F audio_file=@sample.wav -F model=prisma-v3.0 -F language_code=en-IN,hi-IN

curl -X POST https://api.vachana.ai/api/v1/tts/inference \
  -H "Content-Type: application/json" -H "X-API-Key-ID: $GNANI_API_KEY" \
  -d '{"text":"Hello from Bolo","voice":"Shlok","model":"timbre-v2.5","language":"en-IN","speed":1.0,"audio_config":{"sample_rate":48000,"num_channels":1,"sample_width":2,"encoding":"linear_pcm","container":"wav"}}' \
  --output out.wav
```

## Things not verified yet (check in Phase 0 and note in `docs/DECISIONS.md`)
- Whether `en-IN,hi-IN` gives better transcripts than plain `en-IN` for Indian-accented English with Hindi words.
- Whether `format=codemix` is better than the default for the Hinglish cases.
- How natural the English voices sound on technical words (REST, Kubernetes, JSON). If a word is wrong, spell it phonetically in the TTS text.
- Rate limits are not documented. If you hit 429 during the demo, wait a few seconds and retry once.
