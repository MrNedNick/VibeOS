export type StudioProvider = 'anthropic' | 'free' | 'groq' | 'gemini' | 'openrouter'

export type StudioModel =
  | 'claude-opus-4-6'
  | 'claude-sonnet-4-6'
  | 'claude-haiku-4-5-20251001'

// Pollinations dropped anonymous access to mistral/llama in 2026-06 — only
// openai-fast (GPT-OSS 20B) still works without an account, so it's the sole
// free option. Other providers come back via user keys in a later sprint.
export type FreeModel = 'openai-fast'

export type GroqModel =
  | 'llama-3.1-8b-instant'
  | 'llama-3.3-70b-versatile'
  | 'mixtral-8x7b-32768'

export type GeminiModel = 'gemini-2.0-flash' | 'gemini-1.5-flash'

export interface StudioModelMeta {
  id: StudioModel
  label: string
  desc: string
  color: string
}

export interface FreeModelMeta {
  id: FreeModel
  label: string
  desc: string
  color: string
}

export interface GroqModelMeta {
  id: GroqModel
  label: string
  desc: string
  color: string
}

export interface GeminiModelMeta {
  id: GeminiModel
  label: string
  desc: string
  color: string
}

export const STUDIO_MODELS: StudioModelMeta[] = [
  { id: 'claude-opus-4-6',            label: 'Opus',   desc: 'Most capable',  color: '#8b5cf6' },
  { id: 'claude-sonnet-4-6',          label: 'Sonnet', desc: 'Balanced',      color: '#f59e0b' },
  { id: 'claude-haiku-4-5-20251001',  label: 'Haiku',  desc: 'Fastest',       color: '#10b981' },
]

export const FREE_MODELS: FreeModelMeta[] = [
  { id: 'openai-fast', label: 'GPT-OSS 20B', desc: 'Free · No key',  color: '#10b981' },
]

export const GROQ_MODELS: GroqModelMeta[] = [
  { id: 'llama-3.1-8b-instant',    label: 'Llama 3.1 8B',  desc: 'Fastest',        color: '#f97316' },
  { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', desc: 'Most capable',   color: '#ef4444' },
  { id: 'mixtral-8x7b-32768',      label: 'Mixtral 8x7B',  desc: 'Large context',  color: '#a855f7' },
]

export const GEMINI_MODELS: GeminiModelMeta[] = [
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', desc: 'Fast & capable',  color: '#3b82f6' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', desc: 'Proven stable',   color: '#6366f1' },
]

export interface StudioRun {
  id: string
  prompt: string
  system: string
  model: StudioModel
  response: string
  inputTokens: number
  outputTokens: number
  timestamp: string
  durationMs: number
}

// Raw Anthropic API response shape
export interface AnthropicResponse {
  id: string
  type: 'message'
  role: 'assistant'
  content: Array<{ type: 'text'; text: string }>
  model: string
  stop_reason: string
  usage: { input_tokens: number; output_tokens: number }
}

export interface AnthropicError {
  type: 'error'
  error: { type: string; message: string }
}

// OpenAI-compatible response (Groq, OpenRouter)
export interface OpenAIResponse {
  choices: Array<{
    message: { role: string; content: string }
    finish_reason: string
  }>
  usage?: { prompt_tokens: number; completion_tokens: number }
}

// Gemini API response
export interface GeminiResponse {
  candidates: Array<{
    content: { parts: Array<{ text: string }>; role: string }
    finishReason: string
  }>
  usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number }
}
