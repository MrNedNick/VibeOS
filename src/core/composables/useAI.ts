import { ref } from 'vue'
import { aiRequest, AI_ENDPOINT, AI_MODEL } from './provider'
import type { AIOptions } from './provider'

// Re-exported for backwards compatibility — the single fetch now lives in
// provider.ts (endpoint/model from env). See S14 T5.
export { AI_ENDPOINT, AI_MODEL }
export type { AIOptions }

/**
 * Low-level helper — just the request, no reactive state.
 * Use in fire-and-forget patterns where each call site manages its own loading ref.
 */
export async function aiComplete(prompt: string, opts?: AIOptions): Promise<string> {
  return aiRequest(prompt, opts)
}

/**
 * Lightweight composable wrapping the AI provider.
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
      return await aiRequest(prompt, { model: callOpts?.model ?? opts?.model })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { loading, error, complete }
}
