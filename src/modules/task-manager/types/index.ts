export type TaskFilter = 'all' | 'active' | 'done'

export interface Task {
  id: string
  text: string
  done: boolean
  createdAt: number
}
