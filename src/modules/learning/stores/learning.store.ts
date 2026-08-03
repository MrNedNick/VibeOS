import { defineStore } from 'pinia'
import { computed } from 'vue'
import { storageKey } from '@/core/utils/storage'
import { usePlanModule } from '@/core/composables/usePlanModule'
import { useEventBus } from '@/core/events'
import type { LearningPlan, LearningSession, LearningResource, ResourceType } from '../types'
import { todayStr, calcProgress, calcStreak, calcHoursLogged, isScheduledToday } from '../types'

const PLANS_KEY    = storageKey('learning', 'plans')
const SESSIONS_KEY = storageKey('learning', 'sessions')

export const useLearningStore = defineStore('learning:plans', () => {
  const mod = usePlanModule<LearningPlan, LearningSession>({
    plansKey: PLANS_KEY,
    logsKey: SESSIONS_KEY,
    planCreatedEvent: 'learning:plan:created',
  })
  const { plans, logs: sessions, activePlans, createPlan, updatePlanLink, deletePlan, getPlanById } = mod
  const events = useEventBus()

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

  function logSession(data: Omit<LearningSession, 'id'>): void {
    const plan = plans.value.find(p => p.id === data.planId)
    mod.allLogs.value.push({ ...data, id: crypto.randomUUID(), updatedAt: Date.now() })
    events.emit({
      type: 'learning:session:completed',
      planId: data.planId,
      planTitle: plan?.title ?? '',
      minutes: data.actualMinutes,
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

  function archivePlan(id: string): void {
    const plan = plans.value.find(p => p.id === id)
    if (!plan) return
    plan.active = false
    plan.completedAt = new Date().toISOString()
    plan.updatedAt = Date.now()
    events.emit({
      type: 'learning:plan:completed',
      planId: id,
      title: plan.title,
      timestamp: new Date().toISOString(),
    })
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

  function addResource(planId: string, data: { url: string; title: string; type: ResourceType }): void {
    mod.addResource(planId, data)
  }

  function deleteResource(planId: string, resourceId: string): void {
    mod.deleteResource(planId, resourceId)
  }

  function toggleResourceDone(planId: string, resourceId: string): void {
    mod.toggleResourceDone(planId, resourceId)
  }

  function getPlanResources(planId: string): LearningResource[] {
    return mod.getPlanResources<ResourceType>(planId)
  }

  function exportSessionsCsv(planId?: string): void {
    mod.exportCsv({
      filenamePrefix: 'learning-sessions',
      headers: ['Date', 'Plan', 'Status', 'Planned min', 'Actual min', 'Rating', 'Topic', 'Notes'],
      rowsFor: (id) => (id ? sessions.value.filter(s => s.planId === id) : sessions.value),
      toRow: (s) => {
        const plan = plans.value.find(p => p.id === s.planId)
        return [
          s.date,
          `"${(plan?.title ?? s.planId).replace(/"/g, '""')}"`,
          s.status,
          s.plannedMinutes,
          s.actualMinutes,
          s.rating,
          `"${(s.topic ?? '').replace(/"/g, '""')}"`,
          `"${(s.notes ?? '').replace(/"/g, '""')}"`,
        ]
      },
    }, planId)
  }

  return {
    plans,
    sessions,
    activePlans,
    completedPlans,
    todayItems,
    createPlan,
    logSession,
    updatePlanLink,
    deletePlan,
    archivePlan,
    getPlanById,
    getPlanSessions,
    getProgress,
    getStreak,
    getHoursLogged,
    isLoggedToday,
    addResource,
    deleteResource,
    toggleResourceDone,
    getPlanResources,
    exportSessionsCsv,
  }
})
