import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@/core/composables/useStorage'
import { useEventBus } from '@/core/events'
import type { StudioModel, FreeModel, StudioProvider, AnthropicResponse, AnthropicError } from '../types'

const ANTHROPIC_API    = 'https://api.anthropic.com/v1/messages'
const FREE_API         = 'https://text.pollinations.ai/'
const MAX_CONVERSATIONS = 50

export interface ConvMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  error?: boolean
  model?: string
  durationMs?: number
}

export interface SavedConversation {
  id: string
  title: string
  messages: ConvMessage[]
  provider: StudioProvider
  createdAt: string
  updatedAt: string
}

export const useStudioStore = defineStore('ai-playground:studio', () => {
  const apiKey         = useStorage<string>('platform:studio:apikey', '')
  const model          = useStorage<StudioModel>('platform:studio:model', 'claude-sonnet-4-6')
  const freeModel      = useStorage<FreeModel>('platform:studio:freeModel', 'openai-fast')
  const provider       = useStorage<StudioProvider>('platform:studio:provider', 'free') // default: free
  const system         = useStorage<string>('platform:studio:system', '')
  const includeContext = useStorage<boolean>('platform:studio:includeContext', false)

  const savedConversations = useStorage<SavedConversation[]>('platform:studio:conversations', [])

  const messages = ref<ConvMessage[]>([])
  const loading  = ref(false)
  const error    = ref<string | null>(null)

  const events = useEventBus()

  // ── Auto-generate title from first user message ─────────────────
  function autoTitle(msgs: ConvMessage[]): string {
    const first = msgs.find(m => m.role === 'user' && !m.error)
    if (!first) return 'Conversation'
    const text = first.content.trim()
    return text.length > 45 ? text.slice(0, 45) + '…' : text
  }

  // ── Save current conversation to history ────────────────────────
  function saveCurrentConversation(): void {
    const validMsgs = messages.value.filter(m => !m.error)
    if (validMsgs.length < 2) return  // need at least user + assistant
    const ts = new Date().toISOString()
    const conv: SavedConversation = {
      id:        crypto.randomUUID(),
      title:     autoTitle(messages.value),
      messages:  [...messages.value],
      provider:  provider.value,
      createdAt: ts,
      updatedAt: ts,
    }
    savedConversations.value = [conv, ...savedConversations.value].slice(0, MAX_CONVERSATIONS)
  }

  /** Build clean API history — excludes error messages and user messages that preceded an error */
  function buildHistory(): { role: 'user' | 'assistant'; content: string }[] {
    const result: { role: 'user' | 'assistant'; content: string }[] = []
    const msgs = messages.value
    for (let i = 0; i < msgs.length; i++) {
      const m = msgs[i]
      if (m.error) continue
      // Skip user messages immediately followed by an error (failed exchanges)
      if (m.role === 'user' && i + 1 < msgs.length && msgs[i + 1].error) continue
      result.push({ role: m.role, content: m.content })
    }
    return result
  }

  async function sendMessage(content: string, projectContext?: string): Promise<void> {
    if (!content.trim() || loading.value) return

    error.value = null
    messages.value.push({
      id:        crypto.randomUUID(),
      role:      'user',
      content:   content.trim(),
      timestamp: new Date().toISOString(),
    })

    loading.value = true
    const startedAt = Date.now()
    try {
      if (provider.value === 'free') {
        await runFree(startedAt, projectContext)
      } else {
        await runAnthropic(startedAt, projectContext)
      }
    } finally {
      loading.value = false
    }
  }

  async function runAnthropic(startedAt: number, projectContext?: string): Promise<void> {
    if (!apiKey.value.trim()) { pushError('no_key'); return }

    // Build effective system prompt (project context + user's system prompt)
    const systemParts: string[] = []
    if (projectContext) systemParts.push(projectContext)
    if (system.value.trim()) systemParts.push(system.value.trim())

    const body: Record<string, unknown> = {
      model:      model.value,
      max_tokens: 2048,
      messages:   buildHistory(),
    }
    if (systemParts.length) body.system = systemParts.join('\n\n')

    try {
      const res  = await fetch(ANTHROPIC_API, {
        method:  'POST',
        headers: {
          'Content-Type':        'application/json',
          'X-API-Key':           apiKey.value.trim(),
          'anthropic-version':   '2023-06-01',
        },
        body: JSON.stringify(body),
      })
      const data = await res.json() as AnthropicResponse | AnthropicError
      if (!res.ok || data.type === 'error') {
        pushError((data as AnthropicError).error?.message ?? `HTTP ${res.status}`)
        return
      }

      const result = data as AnthropicResponse
      const text   = result.content.map(c => c.text).join('')
      const ts     = new Date().toISOString()

      messages.value.push({
        id:        crypto.randomUUID(),
        role:      'assistant',
        content:   text,
        timestamp: ts,
        model:     model.value,
        durationMs: Date.now() - startedAt,
      })
      events.emit({
        type: 'studio:run', model: model.value,
        inputTokens:  result.usage.input_tokens,
        outputTokens: result.usage.output_tokens,
        timestamp: ts,
      })
    } catch (e) {
      pushError(networkError(e))
    }
  }

  async function runFree(startedAt: number, projectContext?: string): Promise<void> {
    // Build OpenAI-style messages array for Pollinations
    const apiMessages: { role: string; content: string }[] = []

    // System message = project context + user's custom system prompt
    const systemParts: string[] = []
    if (projectContext) systemParts.push(projectContext)
    if (system.value.trim()) systemParts.push(system.value.trim())
    if (systemParts.length) {
      apiMessages.push({ role: 'system', content: systemParts.join('\n\n') })
    }

    for (const m of buildHistory()) {
      apiMessages.push(m)
    }

    try {
      const res = await fetch(FREE_API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:    freeModel.value,
          messages: apiMessages,
          nologo:   true,
          private:  true,
        }),
      })
      if (!res.ok) { pushError(`HTTP ${res.status}`); return }

      // ✅ Pollinations POST /  returns plain text — NOT JSON
      const text = await res.text()
      if (!text.trim()) { pushError('Empty response from free AI'); return }

      const ts = new Date().toISOString()
      messages.value.push({
        id:        crypto.randomUUID(),
        role:      'assistant',
        content:   text.trim(),
        timestamp: ts,
        model:     `free:${freeModel.value}`,
        durationMs: Date.now() - startedAt,
      })
      events.emit({
        type: 'studio:run',
        model: `free:${freeModel.value}` as StudioModel,
        inputTokens: 0, outputTokens: 0, timestamp: ts,
      })
    } catch (e) {
      pushError(networkError(e))
    }
  }

  function pushError(msg: string): void {
    error.value = msg
    messages.value.push({
      id:        crypto.randomUUID(),
      role:      'assistant',
      content:   msg,
      timestamp: new Date().toISOString(),
      error:     true,
    })
  }

  function networkError(e: unknown): string {
    const msg = e instanceof Error ? e.message : 'Network error'
    return msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')
      ? 'cors'
      : msg
  }

  function newConversation(): void {
    saveCurrentConversation()
    messages.value = []
    error.value    = null
  }

  function loadConversation(id: string): void {
    const conv = savedConversations.value.find(c => c.id === id)
    if (!conv) return
    saveCurrentConversation()  // save current before switching
    messages.value = [...conv.messages]
    provider.value = conv.provider
    error.value    = null
  }

  function deleteConversation(id: string): void {
    savedConversations.value = savedConversations.value.filter(c => c.id !== id)
  }

  function clearHistory(): void {
    savedConversations.value = []
  }

  return {
    apiKey, model, freeModel, provider, system, includeContext,
    messages, loading, error,
    savedConversations,
    sendMessage, newConversation, loadConversation, deleteConversation, clearHistory,
  }
})
