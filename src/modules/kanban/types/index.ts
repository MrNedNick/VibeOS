export type BoardColumnId = 'backlog' | 'in-progress' | 'done'
export type CardPriority  = 'none' | 'low' | 'medium' | 'high' | 'urgent'

export interface BoardColumn {
  id: BoardColumnId
  color: string
}

export const BOARD_COLUMNS: BoardColumn[] = [
  { id: 'backlog',      color: '#6b7280' },
  { id: 'in-progress',  color: '#f59e0b' },
  { id: 'done',         color: '#10b981' },
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
  createdAt: string
  updatedAt: string
}
