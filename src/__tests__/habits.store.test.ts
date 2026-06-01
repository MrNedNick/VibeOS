import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('useHabitsStore — CRUD', () => {
  it('starts with no habits', () => {
    expect(useHabitsStore().habits).toHaveLength(0)
  })

  it('createHabit adds a habit with trimmed name', () => {
    const store = useHabitsStore()
    store.createHabit('  Morning run  ', '🏃')
    expect(store.habits).toHaveLength(1)
    expect(store.habits[0].name).toBe('Morning run')
    expect(store.habits[0].completedDates).toHaveLength(0)
  })

  it('createHabit defaults empty emoji to ⭐', () => {
    const store = useHabitsStore()
    store.createHabit('Read', '')
    expect(store.habits[0].emoji).toBe('⭐')
  })

  it('deleteHabit removes the habit from visible list', () => {
    const store = useHabitsStore()
    store.createHabit('Run', '🏃')
    store.createHabit('Read', '📚')
    const id = store.habits[0].id
    store.deleteHabit(id)
    expect(store.habits).toHaveLength(1)
    expect(store.habits[0].name).toBe('Read')
  })

  it('updateHabit changes name and emoji', () => {
    const store = useHabitsStore()
    store.createHabit('Run', '🏃')
    const id = store.habits[0].id
    store.updateHabit(id, 'Sprint', '⚡')
    expect(store.habits[0].name).toBe('Sprint')
    expect(store.habits[0].emoji).toBe('⚡')
  })

  it('updateHabit ignores blank name', () => {
    const store = useHabitsStore()
    store.createHabit('Run', '🏃')
    const id = store.habits[0].id
    store.updateHabit(id, '')
    expect(store.habits[0].name).toBe('Run')
  })
})

describe('useHabitsStore — toggleToday', () => {
  it('toggleToday marks habit as done today', () => {
    const store = useHabitsStore()
    store.createHabit('Read', '📚')
    const id = store.habits[0].id
    store.toggleToday(id)
    expect(store.isCompletedToday(id)).toBe(true)
  })

  it('toggleToday unchecks if already done', () => {
    const store = useHabitsStore()
    store.createHabit('Read', '📚')
    const id = store.habits[0].id
    store.toggleToday(id)
    store.toggleToday(id)
    expect(store.isCompletedToday(id)).toBe(false)
  })

  it('isCompletedToday returns false for new habit', () => {
    const store = useHabitsStore()
    store.createHabit('Run', '🏃')
    expect(store.isCompletedToday(store.habits[0].id)).toBe(false)
  })

  it('isCompletedToday returns false for unknown id', () => {
    expect(useHabitsStore().isCompletedToday('nonexistent')).toBe(false)
  })
})

describe('useHabitsStore — soft-delete tombstones', () => {
  it('deleted habit is gone from habits', () => {
    const store = useHabitsStore()
    store.createHabit('Run', '🏃')
    store.createHabit('Read', '📚')
    store.deleteHabit(store.habits[0].id)
    expect(store.habits).toHaveLength(1)
  })

  it('deleteHabit only removes the specified habit', () => {
    const store = useHabitsStore()
    store.createHabit('A', '⭐')
    store.createHabit('B', '⭐')
    store.createHabit('C', '⭐')
    store.deleteHabit(store.habits[1].id)
    expect(store.habits.map(h => h.name)).toEqual(['A', 'C'])
  })
})

describe('useHabitsStore — milestone banner', () => {
  it('starts with no milestone', () => {
    expect(useHabitsStore().milestoneHabit).toBeNull()
  })

  it('dismissMilestone clears the milestone', () => {
    const store = useHabitsStore()
    store.createHabit('Run', '🏃')
    // Manually set to simulate a milestone fire
    ;(store as any).milestoneHabit = { name: 'Run', emoji: '🏃', streak: 7 }
    store.dismissMilestone()
    expect(store.milestoneHabit).toBeNull()
  })
})
