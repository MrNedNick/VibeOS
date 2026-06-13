import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@/core/composables/useStorage'
import { useEventBus } from '@/core/events'
import type {
  StudioModel, FreeModel, GroqModel, GeminiModel, StudioProvider,
  AnthropicResponse, AnthropicError, OpenAIResponse, GeminiResponse,
} from '../types'

const ANTHROPIC_API    = 'https://api.anthropic.com/v1/messages'
const FREE_API         = 'https://text.pollinations.ai/'
const GROQ_API         = 'https://api.groq.com/openai/v1/chat/completions'
const GEMINI_BASE      = 'https://generativelanguage.googleapis.com/v1beta/models'
const OPENROUTER_API   = 'https://openrouter.ai/api/v1/chat/completions'
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
  const apiKey             = useStorage<string>('platform:studio:apikey', '')
  const groqApiKey         = useStorage<string>('platform:studio:apikey:groq', '')
  const geminiApiKey       = useStorage<string>('platform:studio:apikey:gemini', '')
  const openrouterApiKey   = useStorage<string>('platform:studio:apikey:openrouter', '')

  const model              = useStorage<StudioModel>('platform:studio:model', 'claude-sonnet-4-6')
  const freeModel          = useStorage<FreeModel>('platform:studio:freeModel', 'openai-fast')
  const groqModel          = useStorage<GroqModel>('platform:studio:groqModel', 'llama-3.1-8b-instant')
  const geminiModel        = useStorage<GeminiModel>('platform:studio:geminiModel', 'gemini-2.0-flash')
  const openrouterModel    = useStorage<string>('platform:studio:openrouterModel', 'meta-llama/llama-3.1-8b-instruct:free')

  // Coerce a stale persisted value (mistral/llama) — those lost anonymous
  // access in 2026-06 and would now return a "migrate" notice, not a reply.
  if (freeModel.value !== 'openai-fast') freeModel.value = 'openai-fast'

  const provider       = useStorage<StudioProvider>('platform:studio:provider', 'free')
  const system         = useStorage<string>('platform:studio:system', '')
  const includeContext = useStorage<boolean>('platform:studio:includeContext', false)

  const savedConversations = useStorage<SavedConversation[]>('platform:studio:conversations', [])

  const messages = ref<ConvMessage[]>([])
  const loading  = ref(false)
  const error    = ref<string | null>(null)

  const events = useEventBus()

  function autoTitle(msgs: ConvMessage[]): string {
    const first = msgs.find(m => m.role === 'user' && !m.error)
    if (!first) return 'Conversation'
    const text = first.content.trim()
    return text.length > 45 ? text.slice(0, 45) + '…' : text
  }

  function saveCurrentConversation(): void {
    const validMsgs = messages.value.filter(m => !m.error)
    if (validMsgs.length < 2) return
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

  function buildHistory(): { role: 'user' | 'assistant'; content: string }[] {
    const result: { role: 'user' | 'assistant'; content: string }[] = []
    const msgs = messages.value
    for (let i = 0; i < msgs.length; i++) {
      const m = msgs[i]
      if (m.error) continue
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
      switch (provider.value) {
        case 'free':        await runFree(startedAt, projectContext); break
        case 'groq':        await runGroq(startedAt, projectContext); break
        case 'gemini':      await runGemini(startedAt, projectContext); break
        case 'openrouter':  await runOpenRouter(startedAt, projectContext); break
        default:            await runAnthropic(startedAt, projectContext)
      }
    } finally {
      loading.value = false
    }
  }

  // ── Anthropic ──────────────────────────────────────────────────────
  async function runAnthropic(startedAt: number, projectContext?: string): Promise<void> {
    if (!apiKey.value.trim()) { pushError('no_key'); return }

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

  // ── Pollinations free ─────────────────────────────────────────────
  async function runFree(startedAt: number, projectContext?: string): Promise<void> {
    const apiMessages: { role: string; content: string }[] = []

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

  // ── Groq (OpenAI-compatible) ──────────────────────────────────────
  async function runGroq(startedAt: number, projectContext?: string): Promise<void> {
    if (!groqApiKey.value.trim()) { pushError('no_key'); return }
    await runOpenAICompatible(GROQ_API, groqApiKey.value, groqModel.value, startedAt, projectContext)
  }

  // ── OpenRouter (OpenAI-compatible) ────────────────────────────────
  async function runOpenRouter(startedAt: number, projectContext?: string): Promise<void> {
    if (!openrouterApiKey.value.trim()) { pushError('no_key'); return }
    await runOpenAICompatible(
      OPENROUTER_API, openrouterApiKey.value, openrouterModel.value, startedAt, projectContext,
      { 'HTTP-Referer': 'https://mrnednick.github.io/VibeOS', 'X-Title': 'VibeOS Studio' },
    )
  }

  async function runOpenAICompatible(
    endpoint: string,
    key: string,
    modelId: string,
    startedAt: number,
    projectContext?: string,
    extraHeaders?: Record<string, string>,
  ): Promise<void> {
    const apiMessages: { role: string; content: string }[] = []

    const systemParts: string[] = []
    if (projectContext) systemParts.push(projectContext)
    if (system.value.trim()) systemParts.push(system.value.trim())
    if (systemParts.length) apiMessages.push({ role: 'system', content: systemParts.join('\n\n') })
    for (const m of buildHistory()) apiMessages.push(m)

    try {
      const res = await fetch(endpoint, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${key.trim()}`,
          ...extraHeaders,
        },
        body: JSON.stringify({ model: modelId, messages: apiMessages, max_tokens: 2048 }),
      })
      if (!res.ok) {
        const errBody = await res.text().catch(() => '')
        pushError(`HTTP ${res.status}${errBody ? ': ' + errBody.slice(0, 120) : ''}`)
        return
      }
      const data = await res.json() as OpenAIResponse
      const text = data.choices?.[0]?.message?.content ?? ''
      if (!text) { pushError('Empty response'); return }

      const ts = new Date().toISOString()
      messages.value.push({
        id:        crypto.randomUUID(),
        role:      'assistant',
        content:   text,
        timestamp: ts,
        model:     modelId,
        durationMs: Date.now() - startedAt,
      })
      events.emit({
        type: 'studio:run', model: modelId as StudioModel,
        inputTokens:  data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
        timestamp: ts,
      })
    } catch (e) {
      pushError(networkError(e))
    }
  }

  // ── Gemini ────────────────────────────────────────────────────────
  async function runGemini(startedAt: number, projectContext?: string): Promise<void> {
    if (!geminiApiKey.value.trim()) { pushError('no_key'); return }

    // Build Gemini contents array — system prompt goes first as user/model turn pair
    const contents: { role: string; parts: { text: string }[] }[] = []

    const systemParts: string[] = []
    if (projectContext) systemParts.push(projectContext)
    if (system.value.trim()) systemParts.push(system.value.trim())
    if (systemParts.length) {
      // Gemini uses systemInstruction field instead of a message
    }

    for (const m of buildHistory()) {
      contents.push({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })
    }

    const body: Record<string, unknown> = {
      contents,
      generationConfig: { maxOutputTokens: 2048 },
    }
    if (systemParts.length) {
      body.systemInstruction = { parts: [{ text: systemParts.join('\n\n') }] }
    }

    try {
      const endpoint = `${GEMINI_BASE}/${geminiModel.value}:generateContent?key=${geminiApiKey.value.trim()}`
      const res = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const errBody = await res.text().catch(() => '')
        pushError(`HTTP ${res.status}${errBody ? ': ' + errBody.slice(0, 120) : ''}`)
        return
      }
      const data = await res.json() as GeminiResponse
      const text = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('') ?? ''
      if (!text) { pushError('Empty response from Gemini'); return }

      const ts = new Date().toISOString()
      messages.value.push({
        id:        crypto.randomUUID(),
        role:      'assistant',
        content:   text,
        timestamp: ts,
        model:     geminiModel.value,
        durationMs: Date.now() - startedAt,
      })
      events.emit({
        type: 'studio:run', model: geminiModel.value as StudioModel,
        inputTokens:  data.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
        timestamp: ts,
      })
    } catch (e) {
      pushError(networkError(e))
    }
  }

  // Rough token estimate: ~4 chars per token (common heuristic for English)
  const estimatedTokens = computed(() => {
    const totalChars = messages.value
      .filter(m => !m.error)
      .reduce((sum, m) => sum + m.content.length, 0)
    return Math.round(totalChars / 4)
  })

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
    saveCurrentConversation()
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

  function exportConversation(): void {
    if (!messages.value.length) return
    const lines: string[] = [`# Studio Conversation\n_Exported ${new Date().toLocaleString()}_\n`]
    for (const m of messages.value) {
      if (m.error) continue
      const role = m.role === 'user' ? '**You**' : '**AI**'
      lines.push(`## ${role}\n\n${m.content}\n`)
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = `studio-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return {
    apiKey, groqApiKey, geminiApiKey, openrouterApiKey,
    model, freeModel, groqModel, geminiModel, openrouterModel,
    provider, system, includeContext,
    messages, loading, error, estimatedTokens,
    savedConversations,
    sendMessage, newConversation, loadConversation, deleteConversation, clearHistory,
    exportConversation,
  }
})
