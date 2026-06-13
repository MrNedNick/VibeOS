import { defineStore } from 'pinia'
import { computed, watch } from 'vue'
import { useSoftDeletable } from '@/core/composables/useSoftDeletable'
import { storageKey, storagGet } from '@/core/utils/storage'
import { useEventBus } from '@/core/events'
import { useBackendSync } from '@/core/composables/useBackendSync'
import { useSyncBus } from '@/core/composables/useSyncBus'
import type { LearningPlan, LearningSession, LearningResource, ResourceType } from '../types'
import { todayStr, calcProgress, calcStreak, calcHoursLogged, isScheduledToday } from '../types'

const PLANS_KEY    = storageKey('learning', 'plans')
const SESSIONS_KEY = storageKey('learning', 'sessions')

export const useLearningStore = defineStore('learning:plans', () => {
  const { all: allPlans, items: plans, softDelete: softDeletePlan } = useSoftDeletable<LearningPlan>(PLANS_KEY)
  const { all: allSessions, items: sessions, softDelete: softDeleteSession } = useSoftDeletable<LearningSession>(SESSIONS_KEY)
  const events = useEventBus()

  // Backend sync (S28 T3): these keys were in SYNC_KEYS but the store was
  // never wired — local changes never pushed, pulls never became visible.
  const syncBus = useSyncBus()
  watch(syncBus.pullSeq, () => {
    allPlans.value    = storagGet<LearningPlan[]>(PLANS_KEY, [])
    allSessions.value = storagGet<LearningSession[]>(SESSIONS_KEY, [])
  })
  const syncPlans    = useBackendSync(PLANS_KEY)
  const syncSessions = useBackendSync(SESSIONS_KEY)
  watch(allPlans,    v => syncPlans.push(v),    { deep: true })
  watch(allSessions, v => syncSessions.push(v), { deep: true })

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
    const plan: LearningPlan = { ...data, id, active: true, createdAt: new Date().toISOString(), updatedAt: Date.now() }
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
    allSessions.value.push({ ...data, id: crypto.randomUUID(), updatedAt: Date.now() })
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
    if (plan) { plan.linkedHabitId = habitId; plan.updatedAt = Date.now() }
  }

  function deletePlan(id: string): void {
    // Soft-delete the plan and cascade tombstones to its sessions so the
    // removal survives a cross-device merge.
    softDeletePlan(id)
    for (const s of allSessions.value) {
      if (s.planId === id && !s.deletedAt) softDeleteSession(s.id)
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

  function getPlanResources(planId: string): LearningResource[] {
    return plans.value.find(p => p.id === planId)?.resources ?? []
  }

  function exportSessionsCsv(planId?: string): void {
    const target = planId
      ? sessions.value.filter(s => s.planId === planId)
      : sessions.value
    const rows = target.filter(s => !s.deletedAt).sort((a, b) => b.date.localeCompare(a.date))
    if (!rows.length) return

    const headers = ['Date', 'Plan', 'Status', 'Planned min', 'Actual min', 'Rating', 'Topic', 'Notes']
    const lines = [
      headers.join(','),
      ...rows.map(s => {
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
        ].join(',')
      }),
    ]

    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `learning-sessions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
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
