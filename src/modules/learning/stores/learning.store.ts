import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@/core/composables/useStorage'
import { storageKey } from '@/core/utils/storage'
import { useEventBus } from '@/core/events'
import type { LearningPlan, LearningSession, LearningResource, ResourceType } from '../types'
import { todayStr, calcProgress, calcStreak, calcHoursLogged, isScheduledToday } from '../types'

export const useLearningStore = defineStore('learning:plans', () => {
  // Raw persisted arrays — include soft-deleted tombstones (see S14 T3).
  const allPlans = useStorage<LearningPlan[]>(storageKey('learning', 'plans'), [])
  const allSessions = useStorage<LearningSession[]>(storageKey('learning', 'sessions'), [])
  const plans = computed<LearningPlan[]>(() => allPlans.value.filter(p => !p.deletedAt))
  const sessions = computed<LearningSession[]>(() => allSessions.value.filter(s => !s.deletedAt))
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
    allPlans.value.push(plan)
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
    allSessions.value.push({ ...data, id: crypto.randomUUID() })
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

  function updatePlanLink(planId: string, habitId: string | undefined): void {
    const plan = plans.value.find(p => p.id === planId)
    if (plan) plan.linkedHabitId = habitId
  }

  function deletePlan(id: string): void {
    // Soft-delete the plan and cascade tombstones to its sessions so the
    // removal survives a cross-device merge.
    const now = Date.now()
    const plan = allPlans.value.find(p => p.id === id)
    if (plan && !plan.deletedAt) plan.deletedAt = now
    for (const s of allSessions.value) {
      if (s.planId === id && !s.deletedAt) s.deletedAt = now
    }
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

  function getPlanResources(planId: string): LearningResource[] {
    return plans.value.find(p => p.id === planId)?.resources ?? []
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
  }
})
