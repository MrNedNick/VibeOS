import { defineStore } from 'pinia'
import { useStorage } from '@/core/composables/useStorage'
import { storageKey } from '@/core/utils/storage'
import { todayStr } from '../types'
import type { Habit } from '../types'

export const useHabitsStore = defineStore('habits:habits', () => {
  const habits = useStorage<Habit[]>(storageKey('habits', 'habits'), [])

  function createHabit(name: string, emoji: string): void {
    habits.value.push({
      id: crypto.randomUUID(),
      name: name.trim(),
      emoji: emoji.trim() || '⭐',
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
    } else {
      habit.completedDates.splice(idx, 1)
    }
  }

  function updateHabit(id: string, name: string, emoji?: string): void {
    const habit = habits.value.find(h => h.id === id)
    if (!habit) return
    if (name.trim()) habit.name = name.trim()
    if (emoji !== undefined) habit.emoji = emoji.trim() || '⭐'
  }

  function deleteHabit(id: string): void {
    const idx = habits.value.findIndex(h => h.id === id)
    if (idx !== -1) habits.value.splice(idx, 1)
  }

  function isCompletedToday(id: string): boolean {
    const habit = habits.value.find(h => h.id === id)
    return habit ? habit.completedDates.includes(todayStr()) : false
  }

  return { habits, createHabit, updateHabit, toggleToday, deleteHabit, isCompletedToday }
})
