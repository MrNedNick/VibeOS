import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useSoftDeletable } from '@/core/composables/useSoftDeletable'
import { storageKey, storagGet } from '@/core/utils/storage'
import { useEventBus } from '@/core/events'
import { useFeatureGate } from '@/core/composables/useFeatureGate'
import { useBackendSync } from '@/core/composables/useBackendSync'
import { useSyncBus } from '@/core/composables/useSyncBus'
import { isSupabaseConfigured } from '@/core/services/supabase'
import type { Goal, GoalMilestone } from '../types'
import { calcProgress } from '../types'

const GOALS_KEY = storageKey('goals', 'goals')

export const useGoalsStore = defineStore('goals:goals', () => {
  const { all: allGoals, items: goals, softDelete } = useSoftDeletable<Goal>(GOALS_KEY)
  const events = useEventBus()
  const gate = useFeatureGate()

  const initialized = ref(!isSupabaseConfigured || allGoals.value.length > 0)
  const syncBus = useSyncBus()
  watch(syncBus.pullSeq, () => {
    allGoals.value = storagGet<Goal[]>(GOALS_KEY, [])
    initialized.value = true
  })
  const backendSync = useBackendSync(GOALS_KEY)
  watch(allGoals, v => backendSync.push(v), { deep: true })

  const activeGoals = computed(() =>
    goals.value
      .filter(g => g.status === 'active')
      .sort((a, b) => {
        if (!a.targetDate && !b.targetDate) return 0
        if (!a.targetDate) return 1
        if (!b.targetDate) return -1
        return a.targetDate.localeCompare(b.targetDate)
      })
  )
  const completedGoals = computed(() => goals.value.filter(g => g.status === 'completed'))

  function createGoal(data: Omit<Goal, 'id' | 'createdAt' | 'status' | 'milestones'>): Goal {
    const id = crypto.randomUUID()
    const goal: Goal = {
      ...data,
      id,
      status: 'active',
      milestones: [],
      createdAt: new Date().toISOString(),
      updatedAt: Date.now(),
    }
    allGoals.value.push(goal)
    events.emit({ type: 'goal:created', goalId: id, title: data.title, timestamp: new Date().toISOString() })
    gate.nudgeWrite()
    return goal
  }

  function deleteGoal(id: string): void {
    softDelete(id)
  }

  function completeGoal(id: string): void {
    const goal = goals.value.find(g => g.id === id)
    if (!goal) return
    goal.status = 'completed'
    goal.completedAt = new Date().toISOString()
    goal.updatedAt = Date.now()
    events.emit({ type: 'goal:completed', goalId: id, title: goal.title, timestamp: new Date().toISOString() })
  }

  function updateNotes(id: string, notes: string): void {
    const goal = goals.value.find(g => g.id === id)
    if (goal) { goal.notes = notes; goal.updatedAt = Date.now() }
  }

  function addMilestone(goalId: string, title: string): void {
    const goal = goals.value.find(g => g.id === goalId)
    if (!goal) return
    const milestone: GoalMilestone = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      order: goal.milestones.length,
    }
    goal.milestones.push(milestone)
    goal.updatedAt = Date.now()
  }

  function toggleMilestone(goalId: string, milestoneId: string): void {
    const goal = goals.value.find(g => g.id === goalId)
    if (!goal) return
    const m = goal.milestones.find(m => m.id === milestoneId)
    if (!m) return
    m.completed = !m.completed
    m.completedAt = m.completed ? new Date().toISOString() : undefined
    goal.updatedAt = Date.now()
    if (m.completed) {
      events.emit({
        type: 'goal:milestone:completed',
        goalId,
        milestoneTitle: m.title,
        timestamp: new Date().toISOString(),
      })
    }
  }

  function deleteMilestone(goalId: string, milestoneId: string): void {
    const goal = goals.value.find(g => g.id === goalId)
    if (!goal) return
    goal.milestones = goal.milestones.filter(m => m.id !== milestoneId)
    goal.updatedAt = Date.now()
  }

  function getGoalById(id: string): Goal | undefined {
    return goals.value.find(g => g.id === id)
  }

  function getProgress(id: string): number {
    const goal = goals.value.find(g => g.id === id)
    if (!goal) return 0
    return calcProgress(goal)
  }

  return {
    goals, initialized, activeGoals, completedGoals,
    createGoal, deleteGoal, completeGoal, updateNotes,
    addMilestone, toggleMilestone, deleteMilestone,
    getGoalById, getProgress,
  }
})
