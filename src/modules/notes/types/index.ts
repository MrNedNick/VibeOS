export type NoteType =
  | 'note'      // generic — default
  | 'plan'      // project / sprint plan
  | 'idea'      // quick idea capture
  | 'journal'   // daily / weekly journal
  | 'learning'  // study notes, book notes
  | 'training'  // workout log, run notes
  | 'reference' // cheat-sheet, reference doc

export const NOTE_TYPE_META: Record<NoteType, { label: string; icon: string; color: string }> = {
  note:      { label: 'Note',      icon: 'FileText',    color: 'var(--color-text-muted)' },
  plan:      { label: 'Plan',      icon: 'ListTodo',    color: '#4f8ef7' },
  idea:      { label: 'Idea',      icon: 'Lightbulb',   color: '#f59e0b' },
  journal:   { label: 'Journal',   icon: 'BookOpen',    color: '#8b5cf6' },
  learning:  { label: 'Learning',  icon: 'GraduationCap', color: '#6366f1' },
  training:  { label: 'Training',  icon: 'Dumbbell',    color: '#f97316' },
  reference: { label: 'Reference', icon: 'Hash',        color: '#10b981' },
}

export const NOTE_TYPES = Object.keys(NOTE_TYPE_META) as NoteType[]

export interface Note {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  pinned?: boolean
  type?: NoteType   // defaults to 'note' when absent
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
