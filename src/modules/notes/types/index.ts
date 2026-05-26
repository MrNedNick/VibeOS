export interface Note {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  pinned?: boolean
}

export function deriveTitle(content: string): string {
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (trimmed.startsWith('# ')) return trimmed.slice(2).trim()
    return trimmed.length > 80 ? trimmed.slice(0, 80) + '…' : trimmed
  }
  return 'Untitled'
}
