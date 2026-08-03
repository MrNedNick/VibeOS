import { defineStore } from 'pinia'
import { computed } from 'vue'
import { storageKey } from '@/core/utils/storage'
import { usePlanModule } from '@/core/composables/usePlanModule'
import { useEventBus } from '@/core/events'
import type { TrainingPlan, WorkoutLog, TrainingResource, ResourceType } from '../types'
import { todayStr, isTrainingDay, calcStreak, calcTotalMinutes, calcTotalKm } from '../types'

const PLANS_KEY = storageKey('training', 'plans')
const LOGS_KEY  = storageKey('training', 'logs')

export const useTrainingStore = defineStore('training:plans', () => {
  const mod = usePlanModule<TrainingPlan, WorkoutLog>({
    plansKey: PLANS_KEY,
    logsKey: LOGS_KEY,
    planCreatedEvent: 'training:plan:created',
  })
  const { plans, logs, activePlans, createPlan, updatePlanLink, deletePlan, getPlanById } = mod
  const events = useEventBus()

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

  function logWorkout(data: Omit<WorkoutLog, 'id' | 'createdAt'>): void {
    const plan = plans.value.find(p => p.id === data.planId)
    mod.allLogs.value.push({ ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: Date.now() })
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

  function addResource(planId: string, data: { url: string; title: string; type: ResourceType }): void {
    mod.addResource(planId, data)
  }

  function deleteResource(planId: string, resourceId: string): void {
    mod.deleteResource(planId, resourceId)
  }

  function toggleResourceDone(planId: string, resourceId: string): void {
    mod.toggleResourceDone(planId, resourceId)
  }

  function getPlanResources(planId: string): TrainingResource[] {
    return mod.getPlanResources<ResourceType>(planId)
  }

  function exportWorkoutsCsv(planId?: string): void {
    mod.exportCsv({
      filenamePrefix: 'workouts',
      headers: ['Date', 'Plan', 'Title', 'Sport', 'Duration min', 'Distance km', 'Feeling', 'Notes'],
      rowsFor: (id) => (id ? logs.value.filter(l => l.planId === id) : logs.value),
      toRow: (l) => {
        const plan = plans.value.find(p => p.id === l.planId)
        return [
          l.date,
          `"${(plan?.title ?? '').replace(/"/g, '""')}"`,
          `"${l.title.replace(/"/g, '""')}"`,
          l.sportType,
          l.actualDuration ?? '',
          l.actualDistance ?? '',
          l.feeling,
          `"${(l.notes ?? '').replace(/"/g, '""')}"`,
        ]
      },
    }, planId)
  }

  return {
    plans, logs,
    activePlans, todayItems, recentLogs,
    createPlan, logWorkout, updatePlanLink, deletePlan,
    getPlanById, getPlanLogs,
    getStreak, getTotalMinutes, getTotalKm, isLoggedToday,
    addResource, deleteResource, toggleResourceDone, getPlanResources,
    exportWorkoutsCsv,
  }
})
