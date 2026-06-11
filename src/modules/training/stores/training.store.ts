import { defineStore } from 'pinia'
import { computed, watch } from 'vue'
import { useSoftDeletable } from '@/core/composables/useSoftDeletable'
import { storageKey, storagGet } from '@/core/utils/storage'
import { useEventBus } from '@/core/events'
import { useBackendSync } from '@/core/composables/useBackendSync'
import { useSyncBus } from '@/core/composables/useSyncBus'
import type { TrainingPlan, WorkoutLog, TrainingResource, ResourceType } from '../types'
import { todayStr, isTrainingDay, calcStreak, calcTotalMinutes, calcTotalKm } from '../types'

const PLANS_KEY = storageKey('training', 'plans')
const LOGS_KEY  = storageKey('training', 'logs')

export const useTrainingStore = defineStore('training:plans', () => {
  const { all: allPlans, items: plans, softDelete: softDeletePlan } = useSoftDeletable<TrainingPlan>(PLANS_KEY)
  const { all: allLogs, items: logs, softDelete: softDeleteLog } = useSoftDeletable<WorkoutLog>(LOGS_KEY)
  const events = useEventBus()

  // Backend sync (S28 T3): these keys were in SYNC_KEYS but the store was
  // never wired — local changes never pushed, pulls never became visible.
  const syncBus = useSyncBus()
  watch(syncBus.pullSeq, () => {
    allPlans.value = storagGet<TrainingPlan[]>(PLANS_KEY, [])
    allLogs.value  = storagGet<WorkoutLog[]>(LOGS_KEY, [])
  })
  const syncPlans = useBackendSync(PLANS_KEY)
  const syncLogs  = useBackendSync(LOGS_KEY)
  watch(allPlans, v => syncPlans.push(v), { deep: true })
  watch(allLogs,  v => syncLogs.push(v),  { deep: true })

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
    const plan: TrainingPlan = { ...data, id, active: true, createdAt: new Date().toISOString(), updatedAt: Date.now() }
    allPlans.value.push(plan)
    events.emit({ type: 'training:plan:created', planId: id, title: data.title, timestamp: new Date().toISOString() })
    return plan
  }

  function logWorkout(data: Omit<WorkoutLog, 'id' | 'createdAt'>): void {
    const plan = plans.value.find(p => p.id === data.planId)
    allLogs.value.push({ ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: Date.now() })
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
    if (plan) { plan.linkedHabitId = habitId; plan.updatedAt = Date.now() }
  }

  function deletePlan(id: string): void {
    // Soft-delete the plan and cascade tombstones to its logs so the removal
    // survives a cross-device merge.
    softDeletePlan(id)
    for (const l of allLogs.value) {
      if (l.planId === id && !l.deletedAt) softDeleteLog(l.id)
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
    plan.updatedAt = Date.now()
  }

  function deleteResource(planId: string, resourceId: string): void {
    const plan = plans.value.find(p => p.id === planId)
    if (!plan?.resources) return
    plan.resources = plan.resources.filter(r => r.id !== resourceId)
    plan.updatedAt = Date.now()
  }

  function toggleResourceDone(planId: string, resourceId: string): void {
    const plan = plans.value.find(p => p.id === planId)
    const res  = plan?.resources?.find(r => r.id === resourceId)
    if (res) { res.done = !res.done; plan!.updatedAt = Date.now() }
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
