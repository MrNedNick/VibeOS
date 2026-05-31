export type ResourceType = 'article' | 'video' | 'book' | 'course' | 'podcast' | 'other'

export const RESOURCE_META: Record<ResourceType, { label: string; icon: string }> = {
  article: { label: 'Article', icon: '📄' },
  video:   { label: 'Video',   icon: '▶️' },
  book:    { label: 'Book',    icon: '📖' },
  course:  { label: 'Course',  icon: '🎓' },
  podcast: { label: 'Podcast', icon: '🎙️' },
  other:   { label: 'Other',   icon: '🔗' },
}

export const RESOURCE_TYPES = Object.keys(RESOURCE_META) as ResourceType[]

export interface TrainingResource {
  id: string
  url: string
  title: string
  type: ResourceType
  addedAt: string
  done?: boolean
}

export type SportType =
  | 'running'
  | 'strength'
  | 'cycling'
  | 'swimming'
  | 'yoga'
  | 'hiit'
  | 'walking'
  | 'other'

export interface TrainingPlan {
  id: string
  title: string
  sportType: SportType
  sessionsPerWeek: number
  startDate: string
  active: boolean
  notes?: string
  coverEmoji: string
  createdAt: string
  linkedHabitId?: string  // auto-check this habit when a workout is logged
  resources?: TrainingResource[]
}

export interface WorkoutLog {
  id: string
  planId?: string
  date: string
  sportType: SportType
  title: string
  actualDuration?: number   // minutes
  actualDistance?: number   // km
  feeling: 1 | 2 | 3 | 4 | 5
  notes?: string
  createdAt: string
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function isTrainingDay(plan: TrainingPlan): boolean {
  if (plan.sessionsPerWeek >= 7) return true
  const day = new Date().getDay()
  if (plan.sessionsPerWeek >= 5) return day >= 1 && day <= 5
  if (plan.sessionsPerWeek >= 3) return day === 1 || day === 3 || day === 5
  return day === 2 || day === 4  // 2×/week: Tue, Thu
}

export function calcStreak(planId: string, logs: WorkoutLog[]): number {
  const doneDateSet = new Set(logs.filter(l => l.planId === planId).map(l => l.date))
  const today = todayStr()
  const offset = doneDateSet.has(today) ? 0 : 1
  let streak = 0
  for (let i = offset; i < 365; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    if (!doneDateSet.has(d.toISOString().split('T')[0])) break
    streak++
  }
  return streak
}

export function calcTotalMinutes(planId: string, logs: WorkoutLog[]): number {
  return logs.filter(l => l.planId === planId).reduce((s, l) => s + (l.actualDuration ?? 0), 0)
}

export function calcTotalKm(planId: string, logs: WorkoutLog[]): number {
  const km = logs.filter(l => l.planId === planId).reduce((s, l) => s + (l.actualDistance ?? 0), 0)
  return Math.round(km * 10) / 10
}

export const SPORT_EMOJI: Record<SportType, string> = {
  running: '🏃',
  strength: '💪',
  cycling: '🚴',
  swimming: '🏊',
  yoga: '🧘',
  hiit: '⚡',
  walking: '🚶',
  other: '🏋️',
}

export const FEELING_EMOJI: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: '😣',
  2: '😕',
  3: '😐',
  4: '😊',
  5: '💪',
}
