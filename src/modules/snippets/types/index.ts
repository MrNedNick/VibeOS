export interface Snippet {
  id: string
  title: string
  code: string
  language: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export const LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'vue', label: 'Vue' },
  { value: 'python', label: 'Python' },
  { value: 'bash', label: 'Shell' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
  { value: 'json', label: 'JSON' },
  { value: 'sql', label: 'SQL' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'plaintext', label: 'Plain text' },
] as const

export type LanguageValue = typeof LANGUAGE_OPTIONS[number]['value']

export function getLanguageLabel(value: string): string {
  return LANGUAGE_OPTIONS.find(l => l.value === value)?.label ?? value
}
