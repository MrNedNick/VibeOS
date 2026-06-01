import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@/core/composables/useStorage'
import { storageKey } from '@/core/utils/storage'
import { useEventBus } from '@/core/events'
import type { TrainingPlan, WorkoutLog, TrainingResource, ResourceType } from '../types'
import { todayStr, isTrainingDay, calcStreak, calcTotalMinutes, calcTotalKm } from '../types'

export const useTrainingStore = defineStore('training:plans', () => {
  // Raw persisted arrays — include soft-deleted tombstones (see S14 T3).
  const allPlans = useStorage<TrainingPlan[]>(storageKey('training', 'plans'), [])
  const allLogs = useStorage<WorkoutLog[]>(storageKey('training', 'logs'), [])
  const plans = computed<TrainingPlan[]>(() => allPlans.value.filter(p => !p.deletedAt))
  const logs = computed<WorkoutLog[]>(() => allLogs.value.filter(l => !l.deletedAt))
  const events = useEventBus()

  const activePlans = computed(() => plans.value.filter(p => p.active))

  const todayItems = computed(() => {
    const today = todayStr()
    return activePlans.value
      .filter(plan => isTrainingDay(plan))
      .map(plan => ({
        plan,
        logged: logs.value.some(l => l.planId === plan.id && l.date === today),
      }))
  })

  const recentLogs = computed(() =>
    [...logs.value].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10),
  )

  function createPlan(data: Omit<TrainingPlan, 'id' | 'createdAt' | 'active'>): TrainingPlan {
    const id = crypto.randomUUID()
    const plan: TrainingPlan = { ...data, id, active: true, createdAt: new Date().toISOString() }
    allPlans.value.push(plan)
    events.emit({ type: 'training:plan:created', planId: id, title: data.title, timestamp: new Date().toISOString() })
    return plan
  }

  function logWorkout(data: Omit<WorkoutLog, 'id' | 'createdAt'>): void {
    const plan = plans.value.find(p => p.id === data.planId)
    allLogs.value.push({ ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() })
    events.emit({
      type: 'training:workout:logged',
      planId: data.planId ?? null,
      planTitle: plan?.title ?? data.title,
      duration: data.actualDuration ?? 0,
      timestamp: new Date().toISOString(),
    })
    // Auto-check linked habit
    if (plan?.linkedHabitId) {
      import('@/modules/habits/stores/habits.store').then(({ useHabitsStore }) => {
        const habitsStore = useHabitsStore()
        if (!habitsStore.isCompletedToday(plan.linkedHabitId!)) {
          habitsStore.toggleToday(plan.linkedHabitId!)
        }
      })
    }
  }

  function updatePlanLink(planId: string, habitId: string | undefined): void {
    const plan = plans.value.find(p => p.id === planId)
    if (plan) plan.linkedHabitId = habitId
  }

  function deletePlan(id: string): void {
    // Soft-delete the plan and cascade tombstones to its logs so the removal
    // survives a cross-device merge.
    const now = Date.now()
    const plan = allPlans.value.find(p => p.id === id)
    if (plan && !plan.deletedAt) plan.deletedAt = now
    for (const l of allLogs.value) {
      if (l.planId === id && !l.deletedAt) l.deletedAt = now
    }
  }

  function getPlanById(id: string): TrainingPlan | undefined {
    return plans.value.find(p => p.id === id)
  }

  function getPlanLogs(planId: string): WorkoutLog[] {
    return logs.value.filter(l => l.planId === planId).sort((a, b) => b.date.localeCompare(a.date))
  }

  function getStreak(planId: string): number {
    return calcStreak(planId, logs.value)
  }

  function getTotalMinutes(planId: string): number {
    return calcTotalMinutes(planId, logs.value)
  }

  function getTotalKm(planId: string): number {
    return calcTotalKm(planId, logs.value)
  }

  function isLoggedToday(planId: string): boolean {
    return logs.value.some(l => l.planId === planId && l.date === todayStr())
  }

  // ── Resources ───────────────────────────────────────────────────────
  function addResource(planId: string, data: { url: string; title: string; type: ResourceType }): void {
    const plan = plans.value.find(p => p.id === planId)
    if (!plan) return
    if (!plan.resources) plan.resources = []
    plan.resources.push({
      id:      crypto.randomUUID(),
      url:     data.url.trim(),
      title:   data.title.trim() || data.url.trim(),
      type:    data.type,
      addedAt: new Date().toISOString(),
      done:    false,
    })
  }

  function deleteResource(planId: string, resourceId: string): void {
    const plan = plans.value.find(p => p.id === planId)
    if (!plan?.resources) return
    plan.resources = plan.resources.filter(r => r.id !== resourceId)
  }

  function toggleResourceDone(planId: string, resourceId: string): void {
    const plan = plans.value.find(p => p.id === planId)
    const res  = plan?.resources?.find(r => r.id === resourceId)
    if (res) res.done = !res.done
  }

  function getPlanResources(planId: string): TrainingResource[] {
    return plans.value.find(p => p.id === planId)?.resources ?? []
  }

  return {
    plans, logs,
    activePlans, todayItems, recentLogs,
    createPlan, logWorkout, updatePlanLink, deletePlan,
    getPlanById, getPlanLogs,
    getStreak, getTotalMinutes, getTotalKm, isLoggedToday,
    addResource, deleteResource, toggleResourceDone, getPlanResources,
  }
})
