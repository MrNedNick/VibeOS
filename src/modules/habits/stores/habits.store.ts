import { defineStore } from 'pinia'
import { useStorage } from '@/core/composables/useStorage'
import { storageKey } from '@/core/utils/storage'
import { useEventBus } from '@/core/events'
import { todayStr } from '../types'
import type { Habit } from '../types'

export const useHabitsStore = defineStore('habits:habits', () => {
  const habits = useStorage<Habit[]>(storageKey('habits', 'habits'), [])
  const events = useEventBus()

  function createHabit(name: string, emoji: string, purpose?: string): void {
    habits.value.push({
      id: crypto.randomUUID(),
      name: name.trim(),
      emoji: emoji.trim() || '⭐',
      purpose: purpose?.trim() || undefined,
      createdAt: new Date().toISOString(),
      completedDates: [],
    })
  }

  function toggleToday(id: string): void {
    const habit = habits.value.find(h => h.id === id)
    if (!habit) return
    const today = todayStr()
    const idx = habit.completedDates.indexOf(today)
    if (idx === -1) {
      habit.completedDates.push(today)
      events.emit({ type: 'habit:checked', habitId: id, habitName: habit.name, timestamp: new Date().toISOString() })
      // Auto-complete next milestone of linked goal
      if (habit.linkedGoalId) {
        import('@/modules/goals/stores/goals.store').then(({ useGoalsStore }) => {
          const goalsStore = useGoalsStore()
          const goal = goalsStore.goals.find(g => g.id === habit.linkedGoalId)
          if (goal) {
            const next = goal.milestones.find(m => !m.completed)
            if (next) goalsStore.toggleMilestone(goal.id, next.id)
          }
        })
      }
    } else {
      habit.completedDates.splice(idx, 1)
      events.emit({ type: 'habit:unchecked', habitId: id, habitName: habit.name, timestamp: new Date().toISOString() })
    }
  }

  function updateHabitLink(id: string, links: {
    linkedGoalId?: string
    linkedLearningPlanId?: string
    linkedTrainingPlanId?: string
  }): void {
    const habit = habits.value.find(h => h.id === id)
    if (!habit) return
    if ('linkedGoalId' in links) habit.linkedGoalId = links.linkedGoalId
    if ('linkedLearningPlanId' in links) habit.linkedLearningPlanId = links.linkedLearningPlanId
    if ('linkedTrainingPlanId' in links) habit.linkedTrainingPlanId = links.linkedTrainingPlanId
  }

  function updateHabit(id: string, name: string, emoji?: string, purpose?: string): void {
    const habit = habits.value.find(h => h.id === id)
    if (!habit) return
    if (name.trim()) habit.name = name.trim()
    if (emoji !== undefined) habit.emoji = emoji.trim() || '⭐'
    if (purpose !== undefined) habit.purpose = purpose.trim() || undefined
  }

  function deleteHabit(id: string): void {
    const idx = habits.value.findIndex(h => h.id === id)
    if (idx !== -1) habits.value.splice(idx, 1)
  }

  function isCompletedToday(id: string): boolean {
    const habit = habits.value.find(h => h.id === id)
    return habit ? habit.completedDates.includes(todayStr()) : false
  }

  /**
   * Toggle completion for any past date (up to 30 days back).
   * Does NOT fire events or goal-linking (retroactive edit only).
   */
  function toggleDate(id: string, date: string): void {
    const habit = habits.value.find(h => h.id === id)
    if (!habit) return
    const today = todayStr()
    if (date > today) return                          // no future dates
    const limit = new Date(); limit.setDate(limit.getDate() - 30)
    if (date < limit.toISOString().split('T')[0]) return  // max 30 days back
    const idx = habit.completedDates.indexOf(date)
    if (idx === -1) {
      habit.completedDates.push(date)
    } else {
      habit.completedDates.splice(idx, 1)
    }
  }

  return { habits, createHabit, updateHabit, updateHabitLink, toggleToday, toggleDate, deleteHabit, isCompletedToday }
})
