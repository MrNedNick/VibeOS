import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useSoftDeletable } from '@/core/composables/useSoftDeletable'
import { storageKey, storagGet } from '@/core/utils/storage'
import { useEventBus } from '@/core/events'
import { useFeatureGate } from '@/core/composables/useFeatureGate'
import { useBackendSync } from '@/core/composables/useBackendSync'
import { useSyncBus } from '@/core/composables/useSyncBus'
import { isSupabaseConfigured } from '@/core/services/supabase'
import { todayStr, computeStreak, STREAK_MILESTONES } from '../types'
import type { Habit, HabitCategory } from '../types'

const HABITS_KEY = storageKey('habits', 'habits')

export const useHabitsStore = defineStore('habits:habits', () => {
  const { all: allHabits, items: habits, softDelete } = useSoftDeletable<Habit>(HABITS_KEY)
  const events = useEventBus()
  const gate = useFeatureGate()

  // initialized = true when we have the best available data
  // false only when localStorage is empty AND Supabase might have data (new login)
  const initialized = ref(!isSupabaseConfigured || allHabits.value.length > 0)

  // Re-read from localStorage after Supabase pull merges fresh data
  const syncBus = useSyncBus()
  watch(syncBus.pullSeq, () => {
    allHabits.value = storagGet<Habit[]>(HABITS_KEY, [])
    initialized.value = true
  })

  // Push to Supabase after any local mutation (debounced 800ms)
  const backendSync = useBackendSync(HABITS_KEY)
  watch(allHabits, v => backendSync.push(v), { deep: true })

  // Milestone celebration state — watched by HabitsView to show banner
  const milestoneHabit = ref<{ name: string; emoji: string; streak: number } | null>(null)

  function dismissMilestone() { milestoneHabit.value = null }

  function createHabit(name: string, emoji: string, purpose?: string, category?: HabitCategory): void {
    allHabits.value.push({
      id: crypto.randomUUID(),
      name: name.trim(),
      emoji: emoji.trim() || '⭐',
      purpose: purpose?.trim() || undefined,
      category,
      createdAt: new Date().toISOString(),
      completedDates: [],
    })
    gate.nudgeWrite()
  }

  function toggleToday(id: string): void {
    const habit = allHabits.value.find(h => h.id === id)
    if (!habit) return
    const today = todayStr()
    const idx = habit.completedDates.indexOf(today)
    if (idx === -1) {
      habit.completedDates.push(today)
      events.emit({ type: 'habit:checked', habitId: id, habitName: habit.name, timestamp: new Date().toISOString() })

      // Check for milestone
      const streak = computeStreak(habit.completedDates, habit.skippedDates)
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
    const habit = allHabits.value.find(h => h.id === id)
    if (!habit) return
    if ('linkedGoalId' in links) habit.linkedGoalId = links.linkedGoalId
    if ('linkedLearningPlanId' in links) habit.linkedLearningPlanId = links.linkedLearningPlanId
    if ('linkedTrainingPlanId' in links) habit.linkedTrainingPlanId = links.linkedTrainingPlanId
  }

  function updateHabit(id: string, name: string, emoji?: string, purpose?: string): void {
    const habit = allHabits.value.find(h => h.id === id)
    if (!habit) return
    if (name.trim()) habit.name = name.trim()
    if (emoji !== undefined) habit.emoji = emoji.trim() || '⭐'
    if (purpose !== undefined) habit.purpose = purpose.trim() || undefined
  }

  function updateCategory(id: string, category: HabitCategory | undefined): void {
    const habit = allHabits.value.find(h => h.id === id)
    if (habit) habit.category = category
  }

  /** Save an optional note for a specific date check-in */
  function setCheckNote(id: string, date: string, note: string): void {
    const habit = allHabits.value.find(h => h.id === id)
    if (!habit) return
    if (!habit.checkNotes) habit.checkNotes = {}
    if (note.trim()) {
      habit.checkNotes[date] = note.trim()
    } else {
      delete habit.checkNotes[date]
    }
  }

  /** Toggle skip (vacation) for any past/future date (max 30 days back, up to 7 days forward) */
  function toggleSkip(id: string, date: string): void {
    const habit = allHabits.value.find(h => h.id === id)
    if (!habit) return
    const limit = new Date(); limit.setDate(limit.getDate() - 30)
    if (date < limit.toISOString().split('T')[0]) return
    if (!habit.skippedDates) habit.skippedDates = []
    const idx = habit.skippedDates.indexOf(date)
    if (idx === -1) {
      habit.skippedDates.push(date)
      // Remove from completed if accidentally marked done
      const dIdx = habit.completedDates.indexOf(date)
      if (dIdx !== -1) habit.completedDates.splice(dIdx, 1)
    } else {
      habit.skippedDates.splice(idx, 1)
    }
  }

  function deleteHabit(id: string): void {
    softDelete(id)
  }

  function reorderHabits(fromId: string, toId: string): void {
    if (fromId === toId) return
    const arr   = [...allHabits.value]
    const fromI = arr.findIndex(h => h.id === fromId)
    const toI   = arr.findIndex(h => h.id === toId)
    if (fromI === -1 || toI === -1) return
    const [item] = arr.splice(fromI, 1)
    arr.splice(toI, 0, item)
    allHabits.value = arr
  }

  function isCompletedToday(id: string): boolean {
    const habit = allHabits.value.find(h => h.id === id)
    return habit ? habit.completedDates.includes(todayStr()) : false
  }

  /**
   * Toggle completion for any past date (up to 30 days back).
   * Does NOT fire events or goal-linking (retroactive edit only).
   */
  function toggleDate(id: string, date: string): void {
    const habit = allHabits.value.find(h => h.id === id)
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
    initialized,
    milestoneHabit,
    dismissMilestone,
    createHabit,
    updateHabit,
    updateCategory,
    updateHabitLink,
    toggleToday,
    toggleDate,
    setCheckNote,
    toggleSkip,
    reorderHabits,
    deleteHabit,
    isCompletedToday,
  }
})
