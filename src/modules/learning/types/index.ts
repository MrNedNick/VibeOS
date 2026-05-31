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

export interface LearningResource {
  id: string
  url: string
  title: string
  type: ResourceType
  addedAt: string
  done?: boolean   // mark as read/watched/finished
}

export type LearningCategory =
  | 'programming'
  | 'language'
  | 'science'
  | 'business'
  | 'design'
  | 'health'
  | 'other'

export type SessionStatus = 'completed' | 'skipped'

export interface LearningPlan {
  id: string
  title: string
  topic: string
  category: LearningCategory
  minutesPerSession: number
  targetHours: number
  daysPerWeek: number
  startDate: string
  active: boolean
  completedAt?: string
  notes?: string
  coverEmoji: string
  createdAt: string
  linkedHabitId?: string  // auto-check this habit when a session is logged
  resources?: LearningResource[]
}

export interface LearningSession {
  id: string
  planId: string
  date: string
  status: SessionStatus
  plannedMinutes: number
  actualMinutes: number
  topic?: string
  notes?: string
  rating: 1 | 2 | 3 | 4 | 5
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function calcProgress(plan: LearningPlan, sessions: LearningSession[]): number {
  const minutesDone = sessions
    .filter(s => s.planId === plan.id && s.status === 'completed')
    .reduce((sum, s) => sum + s.actualMinutes, 0)
  const totalMinutes = plan.targetHours * 60
  if (totalMinutes === 0) return 0
  return Math.min(100, Math.round((minutesDone / totalMinutes) * 100))
}

export function calcStreak(planId: string, sessions: LearningSession[]): number {
  const doneDateSet = new Set(
    sessions
      .filter(s => s.planId === planId && s.status === 'completed')
      .map(s => s.date),
  )

  const today = todayStr()
  const startOffset = doneDateSet.has(today) ? 0 : 1
  let streak = 0

  for (let i = startOffset; i < 365; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    if (!doneDateSet.has(dateStr)) break
    streak++
  }

  return streak
}

export function calcHoursLogged(planId: string, sessions: LearningSession[]): number {
  const minutes = sessions
    .filter(s => s.planId === planId && s.status === 'completed')
    .reduce((sum, s) => sum + s.actualMinutes, 0)
  return Math.round((minutes / 60) * 10) / 10
}

export function estimateTargetDate(plan: LearningPlan): string {
  const totalSessions = Math.ceil((plan.targetHours * 60) / plan.minutesPerSession)
  const weeksNeeded = Math.ceil(totalSessions / plan.daysPerWeek)
  const start = new Date(plan.startDate + 'T00:00:00')
  start.setDate(start.getDate() + weeksNeeded * 7)
  return start.toISOString().split('T')[0]
}

export function isScheduledToday(plan: LearningPlan): boolean {
  if (plan.daysPerWeek === 7) return true
  const day = new Date().getDay()
  if (plan.daysPerWeek >= 5) return day >= 1 && day <= 5
  // 3×/week → Mon, Wed, Fri
  return day === 1 || day === 3 || day === 5
}

export const CATEGORY_EMOJI: Record<LearningCategory, string> = {
  programming: '💻',
  language: '🗣️',
  science: '🔬',
  business: '📊',
  design: '🎨',
  health: '🧘',
  other: '📚',
}
