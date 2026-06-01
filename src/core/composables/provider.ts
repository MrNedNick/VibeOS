/**
 * Single AI provider seam (S14 T5).
 *
 * One place that talks to the AI HTTP endpoint. Endpoint + model come from
 * env vars so swapping providers (Pollinations → Groq / Gemini / …) is a
 * single config change, not a code edit across call sites.
 *
 *   VITE_AI_ENDPOINT  — POST endpoint (default: Pollinations.ai free, no key)
 *   VITE_AI_MODEL     — model name passed in the request body (default: openai)
 *
 * No fallback chain on purpose: every AI feature is optional/dismissable, so
 * if the provider is down the app still fully works.
 */

export const AI_ENDPOINT =
  (import.meta.env.VITE_AI_ENDPOINT as string | undefined) ?? 'https://text.pollinations.ai/'

export const AI_MODEL =
  (import.meta.env.VITE_AI_MODEL as string | undefined) ?? 'openai'

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
