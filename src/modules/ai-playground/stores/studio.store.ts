import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@/core/composables/useStorage'
import { useEventBus } from '@/core/events'
import type { StudioModel, StudioRun, AnthropicResponse, AnthropicError } from '../types'

const MAX_HISTORY = 20
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'

export const useStudioStore = defineStore('ai-playground:studio', () => {
  const apiKey = useStorage<string>('platform:studio:apikey', '')
  const model  = useStorage<StudioModel>('platform:studio:model', 'claude-sonnet-4-6')
  const maxTokens = useStorage<number>('platform:studio:maxTokens', 1024)
  const history = useStorage<StudioRun[]>('platform:studio:runs', [])

  const loading = ref(false)
  const error   = ref<string | null>(null)
  const currentRun = ref<StudioRun | null>(null)

  const events = useEventBus()

  async function run(prompt: string, system = ''): Promise<void> {
    if (!apiKey.value.trim()) {
      error.value = 'no_key'
      return
    }
    if (!prompt.trim()) return

    loading.value = true
    error.value   = null
    currentRun.value = null

    const startedAt = Date.now()

    try {
      const body: Record<string, unknown> = {
        model:      model.value,
        max_tokens: maxTokens.value,
        messages: [{ role: 'user', content: prompt.trim() }],
      }
      if (system.trim()) body.system = system.trim()

      const res = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: {
          'Content-Type':     'application/json',
          'X-API-Key':        apiKey.value.trim(),
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      })

      const data = await res.json() as AnthropicResponse | AnthropicError

      if (!res.ok || data.type === 'error') {
        const msg = (data as AnthropicError).error?.message ?? `HTTP ${res.status}`
        error.value = msg
        return
      }

      const result = data as AnthropicResponse
      const studioRun: StudioRun = {
        id:           crypto.randomUUID(),
        prompt:       prompt.trim(),
        system:       system.trim(),
        model:        model.value,
        response:     result.content.map(c => c.text).join(''),
        inputTokens:  result.usage.input_tokens,
        outputTokens: result.usage.output_tokens,
        timestamp:    new Date().toISOString(),
        durationMs:   Date.now() - startedAt,
      }

      currentRun.value = studioRun
      history.value    = [studioRun, ...history.value].slice(0, MAX_HISTORY)

      events.emit({
        type:        'studio:run',
        model:       studioRun.model,
        inputTokens: studioRun.inputTokens,
        outputTokens: studioRun.outputTokens,
        timestamp:   studioRun.timestamp,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Network error'
      // CORS errors appear as generic TypeError — give a friendlier message
      error.value = msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')
        ? 'cors'
        : msg
    } finally {
      loading.value = false
    }
  }

  function clearHistory(): void {
    history.value = []
    currentRun.value = null
  }

  function loadRun(run: StudioRun): void {
    currentRun.value = run
  }

  return {
    apiKey, model, maxTokens,
    history, loading, error, currentRun,
    run, clearHistory, loadRun,
  }
})
