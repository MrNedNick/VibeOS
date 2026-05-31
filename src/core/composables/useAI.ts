import { ref } from 'vue'

export const AI_ENDPOINT = 'https://text.pollinations.ai/'
export const AI_MODEL    = 'openai'

export interface AIOptions {
  model?: string
}

/**
 * Low-level helper — just the fetch, no reactive state.
 * Use in fire-and-forget patterns where each call site manages its own loading ref.
 */
export async function aiComplete(prompt: string, opts?: AIOptions): Promise<string> {
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

/**
 * Lightweight composable wrapping the free Pollinations.ai API.
 * Each call site gets its own `loading` / `error` state.
 *
 * Usage:
 *   const { complete, loading } = useAI()
 *   const result = await complete(prompt)   // throws on failure
 *
 * Silent-fire pattern (post-action analysis):
 *   complete(prompt).then(r => aiResult.value = r).catch(() => {})
 */
export function useAI(opts?: AIOptions) {
  const loading = ref(false)
  const error   = ref<string | null>(null)

  async function complete(prompt: string, callOpts?: AIOptions): Promise<string> {
    loading.value = true
    error.value   = null
    try {
      const res = await fetch(AI_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model:    callOpts?.model ?? opts?.model ?? AI_MODEL,
          private:  true,
        }),
      })
      if (!res.ok) throw new Error(`AI request failed (${res.status})`)
      return (await res.text()).trim()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, complete }
}
