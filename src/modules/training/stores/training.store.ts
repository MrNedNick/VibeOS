import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@/core/composables/useStorage'
import { storageKey } from '@/core/utils/storage'
import { useEventBus } from '@/core/events'
import type { TrainingPlan, WorkoutLog } from '../types'
import { todayStr, isTrainingDay, calcStreak, calcTotalMinutes, calcTotalKm } from '../types'

export const useTrainingStore = defineStore('training:plans', () => {
  const plans = useStorage<TrainingPlan[]>(storageKey('training', 'plans'), [])
  const logs = useStorage<WorkoutLog[]>(storageKey('training', 'logs'), [])
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
    plans.value.push(plan)
    events.emit({ type: 'training:plan:created', planId: id, title: data.title, timestamp: new Date().toISOString() })
    return plan
  }

  function logWorkout(data: Omit<WorkoutLog, 'id' | 'createdAt'>): void {
    const plan = plans.value.find(p => p.id === data.planId)
    logs.value.push({ ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() })
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

  function deletePlan(id: string): void {
    plans.value = plans.value.filter(p => p.id !== id)
    logs.value = logs.value.filter(l => l.planId !== id)
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

  return {
    plans, logs,
    activePlans, todayItems, recentLogs,
    createPlan, logWorkout, deletePlan,
    getPlanById, getPlanLogs,
    getStreak, getTotalMinutes, getTotalKm, isLoggedToday,
  }
})
