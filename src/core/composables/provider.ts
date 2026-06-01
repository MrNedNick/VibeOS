/**
 * Single AI provider seam (S14 T5).
 *
 * One place that talks to the AI HTTP endpoint. Endpoint + model come from
 * env vars so swapping providers (Pollinations → Groq / Gemini / …) is a
 * single config change, not a code edit across call sites.
 *
 *   VITE_AI_ENDPOINT  — POST endpoint (default: Pollinations.ai free, no key)
 *   VITE_AI_MODEL     — model name passed in the request body (default: openai-fast)
 *
 * Why `openai-fast`: as of 2026-06 Pollinations moved every other text model
 * (the real gpt-4o `openai`, `mistral`, `llama`, …) behind authentication at
 * enter.pollinations.ai — anonymous requests for those now return a "migrate"
 * notice instead of a completion. `openai-fast` (GPT-OSS 20B, OVH) is the only
 * remaining `tier: anonymous` model, so it's the one that always works key-free.
 *
 * No fallback chain on purpose: every AI feature is optional/dismissable, so
 * if the provider is down the app still fully works.
 */

export const AI_ENDPOINT =
  (import.meta.env.VITE_AI_ENDPOINT as string | undefined) ?? 'https://text.pollinations.ai/'

export const AI_MODEL =
  (import.meta.env.VITE_AI_MODEL as string | undefined) ?? 'openai-fast'

export interface AIOptions {
  model?: string
}

/**
 * The single fetch. Both `aiComplete()` and `useAI().complete()` route through
 * here — there is no other place that hits the AI endpoint.
 */
export async function aiRequest(prompt: string, opts?: AIOptions): Promise<string> {
  const res = await fetch(AI_ENDPOINT, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      model:    opts?.model ?? AI_MODEL,
      private:  true,
    }),
  })
  if (!res.ok) throw new Error(`AI request failed (${res.status})`)
  return (await res.text()).trim()
}
