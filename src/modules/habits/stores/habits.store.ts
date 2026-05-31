import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useStorage } from '@/core/composables/useStorage'
import { storageKey } from '@/core/utils/storage'
import { useEventBus } from '@/core/events'
import { todayStr, computeStreak, STREAK_MILESTONES } from '../types'
import type { Habit, HabitCategory } from '../types'

export const useHabitsStore = defineStore('habits:habits', () => {
  const habits = useStorage<Habit[]>(storageKey('habits', 'habits'), [])
  const events = useEventBus()

  // Milestone celebration state — watched by HabitsView to show banner
  const milestoneHabit = ref<{ name: string; emoji: string; streak: number } | null>(null)

  function dismissMilestone() { milestoneHabit.value = null }

  function createHabit(name: string, emoji: string, purpose?: string, category?: HabitCategory): void {
    habits.value.push({
      id: crypto.randomUUID(),
      name: name.trim(),
      emoji: emoji.trim() || '⭐',
      purpose: purpose?.trim() || undefined,
      category,
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

      // Check for milestone
      const streak = computeStreak(habit.completedDates)
      const lastM  = habit.lastMilestone ?? 0
      const hit    = STREAK_MILESTONES.find(m => m <= streak && m > lastM)
      if (hit) {
        habit.lastMilestone = hit
        milestoneHabit.value = { name: habit.name, emoji: habit.emoji, streak: hit }
      }

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

  function updateCategory(id: string, category: HabitCategory | undefined): void {
    const habit = habits.value.find(h => h.id === id)
    if (habit) habit.category = category
  }

  /** Save an optional note for a specific date check-in */
  function setCheckNote(id: string, date: string, note: string): void {
    const habit = habits.value.find(h => h.id === id)
    if (!habit) return
    if (!habit.checkNotes) habit.checkNotes = {}
    if (note.trim()) {
      habit.checkNotes[date] = note.trim()
    } else {
      delete habit.checkNotes[date]
    }
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
    if (date > today) return
    const limit = new Date(); limit.setDate(limit.getDate() - 30)
    if (date < limit.toISOString().split('T')[0]) return
    const idx = habit.completedDates.indexOf(date)
    if (idx === -1) {
      habit.completedDates.push(date)
    } else {
      habit.completedDates.splice(idx, 1)
    }
  }

  return {
    habits,
    milestoneHabit,
    dismissMilestone,
    createHabit,
    updateHabit,
    updateCategory,
    updateHabitLink,
    toggleToday,
    toggleDate,
    setCheckNote,
    deleteHabit,
    isCompletedToday,
  }
})
