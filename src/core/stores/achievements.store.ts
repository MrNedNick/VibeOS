/**
 * Achievements system — tracks 10 milestones via the platform event history.
 * Each achievement has an `unlocked` flag stored in localStorage.
 * When newly unlocked, `pendingToast` is set for the UI to display.
 */
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useStorage } from '@/core/composables/useStorage'
import { useEventBus } from '@/core/events'
import type { PlatformEvent } from '@/core/events/types'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  /** Returns true when the achievement should unlock */
  condition: (events: PlatformEvent[]) => boolean
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id:          'first-goal',
    title:       'Goal Setter',
    description: 'Created your first goal',
    icon:        '🎯',
    condition:   (evs) => evs.some(e => e.type === 'goal:created'),
  },
  {
    id:          'first-task-done',
    title:       'First Win',
    description: 'Completed your first task',
    icon:        '✅',
    condition:   (evs) => evs.some(e => e.type === 'task:completed'),
  },
  {
    id:          'first-note',
    title:       'Note Taker',
    description: 'Created your first note',
    icon:        '🗒️',
    condition:   (evs) => evs.some(e => e.type === 'note:created'),
  },
  {
    id:          'first-session',
    title:       'Scholar',
    description: 'Logged your first learning session',
    icon:        '📚',
    condition:   (evs) => evs.some(e => e.type === 'learning:session:completed'),
  },
  {
    id:          'first-workout',
    title:       'Athlete',
    description: 'Logged your first workout',
    icon:        '💪',
    condition:   (evs) => evs.some(e => e.type === 'training:workout:logged'),
  },
  {
    id:          'goal-completed',
    title:       'Goal Crusher',
    description: 'Completed your first goal',
    icon:        '🏆',
    condition:   (evs) => evs.some(e => e.type === 'goal:completed'),
  },
  {
    id:          'first-game',
    title:       'Player',
    description: 'Played a game',
    icon:        '🎮',
    condition:   (evs) => evs.some(e => e.type === 'game:score'),
  },
  {
    id:          'centurion',
    title:       'Centurion',
    description: 'Completed 100 tasks',
    icon:        '⚡',
    condition:   (evs) => evs.filter(e => e.type === 'task:completed').length >= 100,
  },
  {
    id:          'habit-consistent',
    title:       'Consistent',
    description: 'Checked in on habits 50 times',
    icon:        '🔥',
    condition:   (evs) => evs.filter(e => e.type === 'habit:checked').length >= 50,
  },
  {
    id:          'life-os',
    title:       'Life OS',
    description: 'Used Tasks, Notes, Goals, Habits, Learning, and Training',
    icon:        '🌟',
    condition:   (evs) => {
      const types = new Set(evs.map(e => e.type))
      return (
        (types.has('task:created') || types.has('task:completed')) &&
        types.has('note:created') &&
        types.has('goal:created') &&
        types.has('habit:checked') &&
        types.has('learning:session:completed') &&
        types.has('training:workout:logged')
      )
    },
  },
]

export { ACHIEVEMENTS }

export const useAchievementsStore = defineStore('core:achievements', () => {
  const eventBus = useEventBus()

  // Persisted set of unlocked achievement IDs
  const unlockedIds = useStorage<string[]>('platform:achievements:unlocked', [])

  // Toast queue — shown one at a time
  const pendingToast = ref<{ id: string; title: string; description: string; icon: string } | null>(null)

  const unlockedCount = computed(() => unlockedIds.value.length)
  const total         = computed(() => ACHIEVEMENTS.length)

  function isUnlocked(id: string): boolean {
    return unlockedIds.value.includes(id)
  }

  function checkAll(): void {
    const events = eventBus.history
    for (const ach of ACHIEVEMENTS) {
      if (!isUnlocked(ach.id) && ach.condition(events)) {
        unlockedIds.value.push(ach.id)
        pendingToast.value = {
          id:          ach.id,
          title:       ach.title,
          description: ach.description,
          icon:        ach.icon,
        }
        // Only show first newly unlocked (next check will catch the rest)
        break
      }
    }
  }

  function dismissToast(): void {
    pendingToast.value = null
    // Check again — maybe more were unlocked in the same batch
    checkAll()
  }

  // Re-check whenever event history grows
  watch(() => eventBus.history.length, () => checkAll(), { immediate: true })

  return {
    unlockedIds,
    unlockedCount,
    total,
    pendingToast,
    isUnlocked,
    dismissToast,
    checkAll,
  }
})
