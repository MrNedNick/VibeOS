export type TaskFilter   = 'all' | 'active' | 'done'
export type TaskPriority = 'none' | 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  text: string
  done: boolean
  priority: TaskPriority
  createdAt: number
}
