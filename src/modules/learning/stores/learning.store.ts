import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@/core/composables/useStorage'
import { storageKey } from '@/core/utils/storage'
import { useEventBus } from '@/core/events'
import type { LearningPlan, LearningSession } from '../types'
import { todayStr, calcProgress, calcStreak, calcHoursLogged, isScheduledToday } from '../types'

export const useLearningStore = defineStore('learning:plans', () => {
  const plans = useStorage<LearningPlan[]>(storageKey('learning', 'plans'), [])
  const sessions = useStorage<LearningSession[]>(storageKey('learning', 'sessions'), [])
  const events = useEventBus()

  const activePlans = computed(() => plans.value.filter(p => p.active))
  const completedPlans = computed(() => plans.value.filter(p => !p.active))

  const todayItems = computed(() => {
    const today = todayStr()
    return activePlans.value
      .filter(plan => isScheduledToday(plan))
      .map(plan => ({
        plan,
        logged: sessions.value.some(
          s => s.planId === plan.id && s.date === today && s.status === 'completed',
        ),
      }))
  })

  function createPlan(data: Omit<LearningPlan, 'id' | 'createdAt' | 'active'>): LearningPlan {
    const id = crypto.randomUUID()
    const plan: LearningPlan = { ...data, id, active: true, createdAt: new Date().toISOString() }
    plans.value.push(plan)
    events.emit({
      type: 'learning:plan:created',
      planId: id,
      title: data.title,
      timestamp: new Date().toISOString(),
    })
    return plan
  }

  function logSession(data: Omit<LearningSession, 'id'>): void {
    const plan = plans.value.find(p => p.id === data.planId)
    sessions.value.push({ ...data, id: crypto.randomUUID() })
    events.emit({
      type: 'learning:session:completed',
      planId: data.planId,
      planTitle: plan?.title ?? '',
      minutes: data.actualMinutes,
      timestamp: new Date().toISOString(),
    })
  }

  function deletePlan(id: string): void {
    plans.value = plans.value.filter(p => p.id !== id)
    sessions.value = sessions.value.filter(s => s.planId !== id)
  }

  function archivePlan(id: string): void {
    const plan = plans.value.find(p => p.id === id)
    if (!plan) return
    plan.active = false
    plan.completedAt = new Date().toISOString()
    events.emit({
      type: 'learning:plan:completed',
      planId: id,
      title: plan.title,
      timestamp: new Date().toISOString(),
    })
  }

  function getPlanById(id: string): LearningPlan | undefined {
    return plans.value.find(p => p.id === id)
  }

  function getPlanSessions(planId: string): LearningSession[] {
    return sessions.value
      .filter(s => s.planId === planId)
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  function getProgress(planId: string): number {
    const plan = plans.value.find(p => p.id === planId)
    if (!plan) return 0
    return calcProgress(plan, sessions.value)
  }

  function getStreak(planId: string): number {
    return calcStreak(planId, sessions.value)
  }

  function getHoursLogged(planId: string): number {
    return calcHoursLogged(planId, sessions.value)
  }

  function isLoggedToday(planId: string): boolean {
    const today = todayStr()
    return sessions.value.some(
      s => s.planId === planId && s.date === today && s.status === 'completed',
    )
  }

  return {
    plans,
    sessions,
    activePlans,
    completedPlans,
    todayItems,
    createPlan,
    logSession,
    deletePlan,
    archivePlan,
    getPlanById,
    getPlanSessions,
    getProgress,
    getStreak,
    getHoursLogged,
    isLoggedToday,
  }
})
