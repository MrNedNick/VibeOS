import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useLearningStore } from '@/modules/learning/stores/learning.store'

const PLAN = {
  title: 'TypeScript',
  topic: 'Advanced TypeScript patterns',
  category: 'programming' as const,
  minutesPerSession: 45,
  targetHours: 20,
  daysPerWeek: 3,
  startDate: '2026-06-01',
  coverEmoji: '📘',
}

const SESSION = {
  date: '2026-06-01',
  status: 'completed' as const,
  plannedMinutes: 45,
  actualMinutes: 50,
  rating: 4 as const,
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('useLearningStore — plan CRUD', () => {
  it('starts with no plans', () => {
    expect(useLearningStore().plans).toHaveLength(0)
  })

  it('createPlan adds an active plan', () => {
    const store = useLearningStore()
    store.createPlan(PLAN)
    expect(store.plans).toHaveLength(1)
    expect(store.plans[0].active).toBe(true)
    expect(store.plans[0].title).toBe('TypeScript')
  })

  it('createPlan returns the new plan with an id', () => {
    const store = useLearningStore()
    const plan = store.createPlan(PLAN)
    expect(plan.id).toBeTruthy()
    expect(store.getPlanById(plan.id)).toBeDefined()
  })

  it('deletePlan soft-deletes — plan disappears from visible list', () => {
    const store = useLearningStore()
    store.createPlan(PLAN)
    const id = store.plans[0].id
    store.deletePlan(id)
    expect(store.plans).toHaveLength(0)
  })

  it('archivePlan marks plan as inactive', () => {
    const store = useLearningStore()
    store.createPlan(PLAN)
    const id = store.plans[0].id
    store.archivePlan(id)
    expect(store.plans[0].active).toBe(false)
    expect(store.activePlans).toHaveLength(0)
    expect(store.completedPlans).toHaveLength(1)
  })

  it('activePlans and completedPlans partition plans correctly', () => {
    const store = useLearningStore()
    store.createPlan({ ...PLAN, title: 'Plan A' })
    store.createPlan({ ...PLAN, title: 'Plan B' })
    store.archivePlan(store.plans[0].id)
    expect(store.activePlans).toHaveLength(1)
    expect(store.completedPlans).toHaveLength(1)
  })

  it('getPlanById returns undefined for unknown id', () => {
    expect(useLearningStore().getPlanById('nonexistent')).toBeUndefined()
  })
})

describe('useLearningStore — session logging', () => {
  it('logSession adds a session', () => {
    const store = useLearningStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    store.logSession({ ...SESSION, planId })
    expect(store.sessions).toHaveLength(1)
    expect(store.sessions[0].planId).toBe(planId)
  })

  it('isLoggedToday returns true after logging a completed session today', () => {
    const store = useLearningStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    const today = new Date().toISOString().slice(0, 10)
    store.logSession({ ...SESSION, planId, date: today })
    expect(store.isLoggedToday(planId)).toBe(true)
  })

  it('isLoggedToday returns false for skipped session today', () => {
    const store = useLearningStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    const today = new Date().toISOString().slice(0, 10)
    store.logSession({ ...SESSION, planId, date: today, status: 'skipped' })
    expect(store.isLoggedToday(planId)).toBe(false)
  })

  it('getPlanSessions returns only sessions for the given plan sorted newest first', () => {
    const store = useLearningStore()
    const planA = store.createPlan({ ...PLAN, title: 'Plan A' })
    const planB = store.createPlan({ ...PLAN, title: 'Plan B' })
    store.logSession({ ...SESSION, planId: planA.id, date: '2026-06-01' })
    store.logSession({ ...SESSION, planId: planA.id, date: '2026-06-03' })
    store.logSession({ ...SESSION, planId: planB.id, date: '2026-06-02' })
    const sessionsA = store.getPlanSessions(planA.id)
    expect(sessionsA).toHaveLength(2)
    expect(sessionsA[0].date > sessionsA[1].date).toBe(true)
    expect(store.getPlanSessions(planB.id)).toHaveLength(1)
  })
})

describe('useLearningStore — cascade delete', () => {
  it('deletePlan soft-deletes all associated sessions', () => {
    const store = useLearningStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    store.logSession({ ...SESSION, planId, date: '2026-06-01' })
    store.logSession({ ...SESSION, planId, date: '2026-06-02' })
    expect(store.sessions).toHaveLength(2)
    store.deletePlan(planId)
    expect(store.sessions).toHaveLength(0)
  })

  it('deletePlan does not affect sessions of other plans', () => {
    const store = useLearningStore()
    const planA = store.createPlan({ ...PLAN, title: 'Plan A' })
    const planB = store.createPlan({ ...PLAN, title: 'Plan B' })
    store.logSession({ ...SESSION, planId: planA.id, date: '2026-06-01' })
    store.logSession({ ...SESSION, planId: planB.id, date: '2026-06-02' })
    store.deletePlan(planA.id)
    expect(store.sessions).toHaveLength(1)
    expect(store.sessions[0].planId).toBe(planB.id)
  })
})

describe('useLearningStore — stats', () => {
  it('getProgress returns 0 for a new plan', () => {
    const store = useLearningStore()
    store.createPlan(PLAN)
    expect(store.getProgress(store.plans[0].id)).toBe(0)
  })

  it('getProgress calculates percent of targetHours completed', () => {
    const store = useLearningStore()
    // 20 targetHours = 1200 minutes. Log 600 minutes → 50%
    store.createPlan({ ...PLAN, targetHours: 20 })
    const planId = store.plans[0].id
    store.logSession({ ...SESSION, planId, actualMinutes: 600, date: '2026-06-01' })
    expect(store.getProgress(planId)).toBe(50)
  })

  it('getProgress caps at 100', () => {
    const store = useLearningStore()
    store.createPlan({ ...PLAN, targetHours: 1 })
    const planId = store.plans[0].id
    // 120 minutes > 60 targetHours minutes
    store.logSession({ ...SESSION, planId, actualMinutes: 120, date: '2026-06-01' })
    expect(store.getProgress(planId)).toBe(100)
  })

  it('getHoursLogged sums completed sessions in hours (rounded to 1dp)', () => {
    const store = useLearningStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    store.logSession({ ...SESSION, planId, actualMinutes: 45, date: '2026-06-01' })
    store.logSession({ ...SESSION, planId, actualMinutes: 45, date: '2026-06-02' })
    expect(store.getHoursLogged(planId)).toBe(1.5)
  })

  it('getHoursLogged excludes skipped sessions', () => {
    const store = useLearningStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    store.logSession({ ...SESSION, planId, actualMinutes: 60, date: '2026-06-01' })
    store.logSession({ ...SESSION, planId, status: 'skipped', actualMinutes: 60, date: '2026-06-02' })
    expect(store.getHoursLogged(planId)).toBe(1)
  })

  it('updatePlanLink sets linkedHabitId', () => {
    const store = useLearningStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    store.updatePlanLink(planId, 'habit-abc')
    expect(store.getPlanById(planId)?.linkedHabitId).toBe('habit-abc')
  })
})

describe('useLearningStore — resources', () => {
  it('addResource appends to plan resources', () => {
    const store = useLearningStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    store.addResource(planId, { url: 'https://example.com', title: 'Article', type: 'article' })
    expect(store.getPlanResources(planId)).toHaveLength(1)
    expect(store.getPlanResources(planId)[0].done).toBe(false)
  })

  it('addResource uses url as title when title is empty', () => {
    const store = useLearningStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    store.addResource(planId, { url: 'https://x.com/guide', title: '', type: 'video' })
    expect(store.getPlanResources(planId)[0].title).toBe('https://x.com/guide')
  })

  it('toggleResourceDone flips done state', () => {
    const store = useLearningStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    store.addResource(planId, { url: 'https://x.com', title: 'Course', type: 'course' })
    const resourceId = store.getPlanResources(planId)[0].id
    store.toggleResourceDone(planId, resourceId)
    expect(store.getPlanResources(planId)[0].done).toBe(true)
    store.toggleResourceDone(planId, resourceId)
    expect(store.getPlanResources(planId)[0].done).toBe(false)
  })

  it('deleteResource removes by id', () => {
    const store = useLearningStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    store.addResource(planId, { url: 'https://a.com', title: 'A', type: 'article' })
    store.addResource(planId, { url: 'https://b.com', title: 'B', type: 'book' })
    const toDelete = store.getPlanResources(planId)[0].id
    store.deleteResource(planId, toDelete)
    expect(store.getPlanResources(planId)).toHaveLength(1)
    expect(store.getPlanResources(planId)[0].title).toBe('B')
  })
})
