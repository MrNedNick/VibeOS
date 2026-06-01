export type GoalCategory =
  | 'career'
  | 'health'
  | 'skill'
  | 'personal'
  | 'financial'
  | 'project'
  | 'other'

export type GoalStatus = 'active' | 'paused' | 'completed'

export interface GoalMilestone {
  id: string
  title: string
  completed: boolean
  completedAt?: string
  order: number
}

export interface Goal {
  id: string
  title: string
  category: GoalCategory
  description?: string
  coverEmoji: string
  targetDate?: string       // ISO date YYYY-MM-DD
  status: GoalStatus
  milestones: GoalMilestone[]
  notes?: string
  createdAt: string
  completedAt?: string
  deletedAt?: number     // soft-delete tombstone (epoch ms) — survives cloud merge
}

export function calcProgress(goal: Goal): number {
  if (goal.milestones.length === 0) return 0
  const done = goal.milestones.filter(m => m.completed).length
  return Math.round((done / goal.milestones.length) * 100)
}

export function daysUntil(targetDate: string): number {
  const diff = new Date(targetDate + 'T00:00:00').getTime() - new Date().setHours(0, 0, 0, 0)
  return Math.ceil(diff / 86400000)
}

export const CATEGORY_EMOJI: Record<GoalCategory, string> = {
  career: '💼',
  health: '🏃',
  skill: '🎯',
  personal: '🌱',
  financial: '💰',
  project: '🚀',
  other: '⭐',
}

export const CATEGORY_LABEL: Record<GoalCategory, string> = {
  career: 'Career',
  health: 'Health',
  skill: 'Skill',
  personal: 'Personal',
  financial: 'Financial',
  project: 'Project',
  other: 'Other',
}
