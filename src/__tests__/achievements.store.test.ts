import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAchievementsStore, ACHIEVEMENTS } from '@/core/stores/achievements.store'
import { useEventBus } from '@/core/events'
import type { PlatformEvent } from '@/core/events/types'

function makeEvent(type: PlatformEvent['type']): PlatformEvent {
  return { type, timestamp: Date.now() } as PlatformEvent
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('useAchievementsStore', () => {
  it('starts with no unlocked achievements', () => {
    const store = useAchievementsStore()
    expect(store.unlockedIds).toHaveLength(0)
    expect(store.unlockedCount).toBe(0)
  })

  it('total equals ACHIEVEMENTS length', () => {
    const store = useAchievementsStore()
    expect(store.total).toBe(ACHIEVEMENTS.length)
  })

  it('isUnlocked returns false for locked achievement', () => {
    const store = useAchievementsStore()
    expect(store.isUnlocked('first-goal')).toBe(false)
  })

  it('unlocks "Goal Setter" when goal:created event exists', () => {
    const bus   = useEventBus()
    const store = useAchievementsStore()

    bus.emit(makeEvent('goal:created'))
    store.checkAll()

    expect(store.isUnlocked('first-goal')).toBe(true)
  })

  it('unlocks "First Win" when task:completed event exists', () => {
    const bus   = useEventBus()
    const store = useAchievementsStore()

    bus.emit(makeEvent('task:completed'))
    store.checkAll()

    expect(store.isUnlocked('first-task-done')).toBe(true)
  })

  it('does not unlock "Centurion" with fewer than 100 task:completed events', () => {
    const bus   = useEventBus()
    const store = useAchievementsStore()

    for (let i = 0; i < 50; i++) bus.emit(makeEvent('task:completed'))
    store.checkAll()

    expect(store.isUnlocked('centurion')).toBe(false)
  })

  it('unlocks "Centurion" with 100+ task:completed events', () => {
    const bus   = useEventBus()
    const store = useAchievementsStore()

    for (let i = 0; i < 100; i++) bus.emit(makeEvent('task:completed'))
    // checkAll() unlocks one achievement per call; drain through earlier ones
    let attempts = 0
    while (!store.isUnlocked('centurion') && attempts++ < 20) {
      store.checkAll()
      store.dismissToast()
    }

    expect(store.isUnlocked('centurion')).toBe(true)
  })

  it('sets pendingToast when achievement unlocks', () => {
    const bus   = useEventBus()
    const store = useAchievementsStore()

    bus.emit(makeEvent('note:created'))
    store.checkAll()

    expect(store.pendingToast).not.toBeNull()
    expect(store.pendingToast?.id).toBe('first-note')
  })

  it('does not re-unlock already-unlocked achievement', () => {
    const bus   = useEventBus()
    const store = useAchievementsStore()

    bus.emit(makeEvent('goal:created'))
    store.checkAll()
    const countAfterFirst = store.unlockedCount

    store.checkAll()
    expect(store.unlockedCount).toBe(countAfterFirst)
  })

  it('dismissToast clears pendingToast', () => {
    const bus   = useEventBus()
    const store = useAchievementsStore()

    bus.emit(makeEvent('game:score'))
    store.checkAll()
    expect(store.pendingToast).not.toBeNull()

    store.dismissToast()
    // After dismiss, checkAll runs again — no more new achievements to unlock
    expect(store.pendingToast).toBeNull()
  })

  it('unlocks "Life OS" when all 6 required event types present', () => {
    const bus   = useEventBus()
    const store = useAchievementsStore()

    bus.emit(makeEvent('task:created'))
    bus.emit(makeEvent('note:created'))
    bus.emit(makeEvent('goal:created'))
    bus.emit(makeEvent('habit:checked'))
    bus.emit(makeEvent('learning:session:completed'))
    bus.emit(makeEvent('training:workout:logged'))

    // checkAll() unlocks one per call; drain until life-os is reached
    let attempts = 0
    while (!store.isUnlocked('life-os') && attempts++ < 20) {
      store.checkAll()
      store.dismissToast()
    }

    expect(store.isUnlocked('life-os')).toBe(true)
  })

  it('does not unlock "Life OS" with only partial event types', () => {
    const bus   = useEventBus()
    const store = useAchievementsStore()

    bus.emit(makeEvent('task:created'))
    bus.emit(makeEvent('note:created'))
    store.checkAll()

    expect(store.isUnlocked('life-os')).toBe(false)
  })
})
