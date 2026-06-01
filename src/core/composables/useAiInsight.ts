import { ref } from 'vue'
import type { Ref } from 'vue'
import { aiComplete } from './useAI'

/**
 * Fire-and-forget AI insight card (S15 T2).
 *
 * Extracts the pattern that was copy-pasted across 3+ views:
 *   const aiAnalysis  = ref<string | null>(null)
 *   const aiAnalyzing = ref(false)
 *   aiAnalyzing.value = true
 *   aiComplete(prompt).then(r => aiAnalysis.value = r).catch(() => {}).finally(...)
 *
 * Usage:
 *   const { result, loading, run, dismiss } = useAiInsight()
 *   // trigger:
 *   run(buildPrompt())
 *   // in template:
 *   <div v-if="loading || result"> ... <p>{{ result }}</p> </div>
 *
 * Errors are silently swallowed — all AI features are optional/dismissable so a
 * network failure should not break the UI. (DigestWidget and Analytics handle
 * errors explicitly; they keep their own implementations.)
 */
export function useAiInsight(): {
  result:  Ref<string | null>
  loading: Ref<boolean>
  run:     (prompt: string) => void
  dismiss: () => void
} {
  const result  = ref<string | null>(null)
  const loading = ref(false)

  function run(prompt: string): void {
    loading.value = true
    result.value  = null
    aiComplete(prompt)
      .then(r  => { result.value  = r })
      .catch(() => { /* silent — AI features are optional */ })
      .finally(() => { loading.value = false })
  }

  function dismiss(): void {
    result.value = null
  }

  return { result, loading, run, dismiss }
}
