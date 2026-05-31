// ── Category ──────────────────────────────────────────────────────────
export type HabitCategory = 'health' | 'productivity' | 'learning' | 'social' | 'other'

export const HABIT_CATEGORY_META: Record<HabitCategory, { label: string; color: string; icon: string }> = {
  health:       { label: 'Health',        color: '#22c55e', icon: '❤️' },
  productivity: { label: 'Productivity',  color: '#3b82f6', icon: '⚡' },
  learning:     { label: 'Learning',      color: '#8b5cf6', icon: '📚' },
  social:       { label: 'Social',        color: '#f59e0b', icon: '👥' },
  other:        { label: 'Other',         color: '#6b7280', icon: '✦'  },
}

export const HABIT_CATEGORIES = Object.keys(HABIT_CATEGORY_META) as HabitCategory[]

// ── Streak milestones ─────────────────────────────────────────────────
export const STREAK_MILESTONES = [7, 14, 30, 60, 100, 180, 365]

// ── Habit ─────────────────────────────────────────────────────────────
export interface Habit {
  id: string
  name: string
  emoji: string
  purpose?: string               // optional "why" description shown below habit name
  category?: HabitCategory       // health / productivity / learning / social / other
  createdAt: string
  completedDates: string[]
  skippedDates?: string[]         // vacation / intentional skip — doesn't break streak
  checkNotes?: Record<string, string>  // date → optional check-in note
  lastMilestone?: number               // highest milestone streak celebrated so far
  linkedGoalId?: string          // auto-complete next milestone on check
  linkedLearningPlanId?: string  // auto-mark done when learning session logged
  linkedTrainingPlanId?: string  // auto-mark done when workout logged
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function computeStreak(completedDates: string[], skippedDates?: string[]): number {
  const doneSet    = new Set(completedDates)
  const skippedSet = new Set(skippedDates ?? [])
  const today = todayStr()
  const date  = new Date()
  let streak = 0
  let checkedToday = false

  while (true) {
    const ds = date.toISOString().split('T')[0]
    if (doneSet.has(ds)) {
      streak++
      date.setDate(date.getDate() - 1)
    } else if (skippedSet.has(ds)) {
      // Skip day — transparent, doesn't break streak, doesn't count
      date.setDate(date.getDate() - 1)
    } else if (!checkedToday && ds === today) {
      checkedToday = true
      date.setDate(date.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

/** Compute the all-time longest consecutive streak from all dates */
export function computeBestStreak(completedDates: string[]): number {
  if (!completedDates.length) return 0
  const sorted = [...completedDates].sort()
  let best = 1
  let current = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T00:00:00')
    const curr = new Date(sorted[i]     + 'T00:00:00')
    const diff = (curr.getTime() - prev.getTime()) / 86_400_000
    if (diff === 1) {
      current++
      if (current > best) best = current
    } else if (diff > 1) {
      current = 1
    }
  }
  return best
}

/** Days since the habit was created */
export function habitAge(createdAt: string): number {
  const created = new Date(createdAt)
  const now     = new Date()
  return Math.floor((now.getTime() - created.getTime()) / 86_400_000)
}

/** Next milestone the habit should reach */
export function nextMilestone(streak: number): number | null {
  return STREAK_MILESTONES.find(m => m > streak) ?? null
}

export function generateHeatmapDates(weeks: number): string[][] {
  const today = new Date()
  const totalDays = weeks * 7
  const days: string[] = []

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }

  const grid: string[][] = []
  for (let w = 0; w < weeks; w++) {
    grid.push(days.slice(w * 7, w * 7 + 7))
  }
  return grid
}
