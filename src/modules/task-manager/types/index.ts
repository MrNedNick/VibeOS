export type TaskFilter   = 'all' | 'active' | 'done' | 'today'
export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent'
export type TaskCategory = 'work' | 'learning' | 'training' | 'personal' | 'goal'

export interface Task {
  id: string
  text: string
  done: boolean
  priority: TaskPriority
  category?: TaskCategory
  dueDate?: string       // 'YYYY-MM-DD'
  linkedGoalId?: string
  createdAt: number
  completedAt?: string   // ISO timestamp, set when done=true
  deletedAt?: number     // soft-delete tombstone (epoch ms) — survives cloud merge
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
