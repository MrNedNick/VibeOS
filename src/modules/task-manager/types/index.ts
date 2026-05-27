export type TaskFilter   = 'all' | 'active' | 'done'
export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  text: string
  done: boolean
  priority: TaskPriority
  dueDate?: string   // 'YYYY-MM-DD'
  createdAt: number
}

// ── Due date helpers ─────────────────────────────────────────────
export type DueDateStatus = 'overdue' | 'today' | 'upcoming' | 'none'

export function classifyTaskDueDate(dueDate: string | undefined): DueDateStatus {
  if (!dueDate) return 'none'
  const today = new Date().toISOString().slice(0, 10)
  if (dueDate < today) return 'overdue'
  if (dueDate === today) return 'today'
  return 'upcoming'
}
