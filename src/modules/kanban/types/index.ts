export type BoardColumnId = 'backlog' | 'in-progress' | 'done'
export type CardPriority  = 'none' | 'low' | 'medium' | 'high' | 'urgent'
export type SwimlaneRowId = 'overdue' | 'today' | 'tomorrow' | 'this-week' | 'later' | 'no-date'

export interface BoardColumn {
  id: BoardColumnId
  color: string
}

export const BOARD_COLUMNS: BoardColumn[] = [
  { id: 'backlog',      color: '#6b7280' },
  { id: 'in-progress',  color: '#f59e0b' },
  { id: 'done',         color: '#10b981' },
]

export interface SwimlaneRow {
  id: SwimlaneRowId
  icon: string
}

export const SWIMLANE_ROWS: SwimlaneRow[] = [
  { id: 'overdue',   icon: '⚠' },
  { id: 'today',     icon: '◉' },
  { id: 'tomorrow',  icon: '→' },
  { id: 'this-week', icon: '~' },
  { id: 'later',     icon: '·' },
  { id: 'no-date',   icon: '—' },
]

export const PRIORITY_COLOR: Record<CardPriority, string> = {
  none:   'var(--color-border)',
  low:    '#3b82f6',
  medium: '#f59e0b',
  high:   '#f97316',
  urgent: '#ef4444',
}

export interface BoardCard {
  id: string
  title: string
  description: string
  priority: CardPriority
  columnId: BoardColumnId
  dueDate?: string       // 'YYYY-MM-DD'
  sourceTaskId?: string  // set when imported from Tasks module
  createdAt: string
  updatedAt: string
}

// ── Date helpers ──────────────────────────────────────────────────

function isoDay(offsetMs = 0): string {
  return new Date(Date.now() + offsetMs).toISOString().slice(0, 10)
}

export function classifyDueDate(dueDate: string | undefined): SwimlaneRowId {
  if (!dueDate) return 'no-date'
  const today    = isoDay()
  const tomorrow = isoDay(86_400_000)
  const week     = isoDay(7 * 86_400_000)
  if (dueDate < today)    return 'overdue'
  if (dueDate === today)  return 'today'
  if (dueDate === tomorrow) return 'tomorrow'
  if (dueDate <= week)    return 'this-week'
  return 'later'
}

/** Returns the ISO date to assign when a card is dropped onto a given row. */
export function dueDateForRow(rowId: SwimlaneRowId): string | undefined {
  switch (rowId) {
    case 'today':     return isoDay()
    case 'tomorrow':  return isoDay(86_400_000)
    case 'this-week': return isoDay(5 * 86_400_000)
    case 'later':     return isoDay(14 * 86_400_000)
    case 'no-date':   return undefined
    default:          return undefined   // 'overdue': keep existing date as-is
  }
}
