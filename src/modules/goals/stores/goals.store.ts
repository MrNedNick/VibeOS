import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@/core/composables/useStorage'
import { storageKey } from '@/core/utils/storage'
import { useEventBus } from '@/core/events'
import type { Goal, GoalMilestone } from '../types'
import { calcProgress } from '../types'

export const useGoalsStore = defineStore('goals:goals', () => {
  const goals = useStorage<Goal[]>(storageKey('goals', 'goals'), [])
  const events = useEventBus()

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
    }
    goals.value.push(goal)
    events.emit({ type: 'goal:created', goalId: id, title: data.title, timestamp: new Date().toISOString() })
    return goal
  }

  function deleteGoal(id: string): void {
    goals.value = goals.value.filter(g => g.id !== id)
  }

  function completeGoal(id: string): void {
    const goal = goals.value.find(g => g.id === id)
    if (!goal) return
    goal.status = 'completed'
    goal.completedAt = new Date().toISOString()
    events.emit({ type: 'goal:completed', goalId: id, title: goal.title, timestamp: new Date().toISOString() })
  }

  function updateNotes(id: string, notes: string): void {
    const goal = goals.value.find(g => g.id === id)
    if (goal) goal.notes = notes
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
  }

  function toggleMilestone(goalId: string, milestoneId: string): void {
    const goal = goals.value.find(g => g.id === goalId)
    if (!goal) return
    const m = goal.milestones.find(m => m.id === milestoneId)
    if (!m) return
    m.completed = !m.completed
    m.completedAt = m.completed ? new Date().toISOString() : undefined
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
    goals, activeGoals, completedGoals,
    createGoal, deleteGoal, completeGoal, updateNotes,
    addMilestone, toggleMilestone, deleteMilestone,
    getGoalById, getProgress,
  }
})
