export type StudioModel =
  | 'claude-opus-4-5'
  | 'claude-sonnet-4-5'
  | 'claude-haiku-4-5'

export interface StudioModelMeta {
  id: StudioModel
  label: string
  desc: string
  color: string
}

export const STUDIO_MODELS: StudioModelMeta[] = [
  { id: 'claude-opus-4-5',   label: 'Opus',   desc: 'Most capable',  color: '#8b5cf6' },
  { id: 'claude-sonnet-4-5', label: 'Sonnet', desc: 'Balanced',      color: '#f59e0b' },
  { id: 'claude-haiku-4-5',  label: 'Haiku',  desc: 'Fastest',       color: '#10b981' },
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
