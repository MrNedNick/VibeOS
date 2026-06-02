import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTrainingStore } from '@/modules/training/stores/training.store'

const PLAN = {
  title: 'Running',
  sportType: 'running' as const,
  sessionsPerWeek: 3,
  startDate: '2026-06-01',
  coverEmoji: '🏃',
}

const LOG = {
  date: '2026-06-01',
  sportType: 'running' as const,
  title: 'Morning run',
  feeling: 4 as const,
  actualDuration: 30,
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('useTrainingStore — plan CRUD', () => {
  it('starts with no plans', () => {
    expect(useTrainingStore().plans).toHaveLength(0)
  })

  it('createPlan adds an active plan', () => {
    const store = useTrainingStore()
    store.createPlan(PLAN)
    expect(store.plans).toHaveLength(1)
    expect(store.plans[0].active).toBe(true)
    expect(store.plans[0].title).toBe('Running')
    expect(store.plans[0].sportType).toBe('running')
  })

  it('createPlan returns the new plan with an id', () => {
    const store = useTrainingStore()
    const plan = store.createPlan(PLAN)
    expect(plan.id).toBeTruthy()
    expect(store.getPlanById(plan.id)).toBeDefined()
  })

  it('deletePlan soft-deletes — plan disappears from visible list', () => {
    const store = useTrainingStore()
    store.createPlan(PLAN)
    const id = store.plans[0].id
    store.deletePlan(id)
    expect(store.plans).toHaveLength(0)
  })

  it('activePlans excludes manually deactivated plans', () => {
    const store = useTrainingStore()
    store.createPlan(PLAN)
    store.plans[0].active = false
    expect(store.activePlans).toHaveLength(0)
  })

  it('getPlanById returns undefined for unknown id', () => {
    expect(useTrainingStore().getPlanById('nonexistent')).toBeUndefined()
  })
})

describe('useTrainingStore — workout logging', () => {
  it('logWorkout adds a log entry', () => {
    const store = useTrainingStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    store.logWorkout({ ...LOG, planId })
    expect(store.logs).toHaveLength(1)
    expect(store.logs[0].planId).toBe(planId)
  })

  it('isLoggedToday returns true after logging today', () => {
    const store = useTrainingStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    const today = new Date().toISOString().slice(0, 10)
    store.logWorkout({ ...LOG, planId, date: today })
    expect(store.isLoggedToday(planId)).toBe(true)
  })

  it('isLoggedToday returns false when logged on a different date', () => {
    const store = useTrainingStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    store.logWorkout({ ...LOG, planId, date: '2020-01-01' })
    expect(store.isLoggedToday(planId)).toBe(false)
  })

  it('getPlanLogs returns only logs for the given plan', () => {
    const store = useTrainingStore()
    const planA = store.createPlan({ ...PLAN, title: 'Run' })
    const planB = store.createPlan({ ...PLAN, title: 'Swim', sportType: 'swimming' })
    store.logWorkout({ ...LOG, planId: planA.id, date: '2026-06-01' })
    store.logWorkout({ ...LOG, planId: planB.id, date: '2026-06-02', sportType: 'swimming' })
    expect(store.getPlanLogs(planA.id)).toHaveLength(1)
    expect(store.getPlanLogs(planB.id)).toHaveLength(1)
  })

  it('recentLogs returns at most 10 entries sorted newest first', () => {
    const store = useTrainingStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    for (let i = 1; i <= 12; i++) {
      const day = String(i).padStart(2, '0')
      store.logWorkout({ ...LOG, planId, date: `2026-01-${day}` })
    }
    expect(store.recentLogs).toHaveLength(10)
    expect(store.recentLogs[0].date > store.recentLogs[1].date).toBe(true)
  })
})

describe('useTrainingStore — cascade delete', () => {
  it('deletePlan soft-deletes all associated logs', () => {
    const store = useTrainingStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    store.logWorkout({ ...LOG, planId, date: '2026-06-01' })
    store.logWorkout({ ...LOG, planId, date: '2026-06-02' })
    expect(store.logs).toHaveLength(2)
    store.deletePlan(planId)
    expect(store.logs).toHaveLength(0)
  })

  it('deletePlan does not affect logs of other plans', () => {
    const store = useTrainingStore()
    const planA = store.createPlan({ ...PLAN, title: 'Run' })
    const planB = store.createPlan({ ...PLAN, title: 'Swim', sportType: 'swimming' })
    store.logWorkout({ ...LOG, planId: planA.id, date: '2026-06-01' })
    store.logWorkout({ ...LOG, planId: planB.id, date: '2026-06-02', sportType: 'swimming' })
    store.deletePlan(planA.id)
    expect(store.logs).toHaveLength(1)
    expect(store.logs[0].planId).toBe(planB.id)
  })
})

describe('useTrainingStore — stats', () => {
  it('getTotalMinutes sums actualDuration for a plan', () => {
    const store = useTrainingStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    store.logWorkout({ ...LOG, planId, date: '2026-06-01', actualDuration: 30 })
    store.logWorkout({ ...LOG, planId, date: '2026-06-02', actualDuration: 45 })
    expect(store.getTotalMinutes(planId)).toBe(75)
  })

  it('getTotalMinutes returns 0 with no logs', () => {
    const store = useTrainingStore()
    store.createPlan(PLAN)
    expect(store.getTotalMinutes(store.plans[0].id)).toBe(0)
  })

  it('getTotalKm sums actualDistance for a plan', () => {
    const store = useTrainingStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    store.logWorkout({ ...LOG, planId, date: '2026-06-01', actualDistance: 5.2 })
    store.logWorkout({ ...LOG, planId, date: '2026-06-02', actualDistance: 3.3 })
    expect(store.getTotalKm(planId)).toBe(8.5)
  })

  it('updatePlanLink sets linkedHabitId on the plan', () => {
    const store = useTrainingStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    store.updatePlanLink(planId, 'habit-123')
    expect(store.getPlanById(planId)?.linkedHabitId).toBe('habit-123')
  })
})

describe('useTrainingStore — resources', () => {
  it('addResource appends to plan resources', () => {
    const store = useTrainingStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    store.addResource(planId, { url: 'https://example.com', title: 'Guide', type: 'article' })
    expect(store.getPlanResources(planId)).toHaveLength(1)
    expect(store.getPlanResources(planId)[0].done).toBe(false)
  })

  it('addResource uses url as title when title is empty', () => {
    const store = useTrainingStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    store.addResource(planId, { url: 'https://x.com/guide', title: '', type: 'video' })
    expect(store.getPlanResources(planId)[0].title).toBe('https://x.com/guide')
  })

  it('toggleResourceDone flips done state', () => {
    const store = useTrainingStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    store.addResource(planId, { url: 'https://x.com', title: 'Vid', type: 'video' })
    const resourceId = store.getPlanResources(planId)[0].id
    store.toggleResourceDone(planId, resourceId)
    expect(store.getPlanResources(planId)[0].done).toBe(true)
    store.toggleResourceDone(planId, resourceId)
    expect(store.getPlanResources(planId)[0].done).toBe(false)
  })

  it('deleteResource removes by id', () => {
    const store = useTrainingStore()
    store.createPlan(PLAN)
    const planId = store.plans[0].id
    store.addResource(planId, { url: 'https://x.com', title: 'A', type: 'article' })
    store.addResource(planId, { url: 'https://y.com', title: 'B', type: 'video' })
    const toDelete = store.getPlanResources(planId)[0].id
    store.deleteResource(planId, toDelete)
    expect(store.getPlanResources(planId)).toHaveLength(1)
    expect(store.getPlanResources(planId)[0].title).toBe('B')
  })

  it('getPlanResources returns empty array for plan with no resources', () => {
    const store = useTrainingStore()
    store.createPlan(PLAN)
    expect(store.getPlanResources(store.plans[0].id)).toHaveLength(0)
  })
})
