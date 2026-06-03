import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useFeedbackStore } from '@/core/stores/feedback.store'
import type { FeedbackEntry } from '@/core/stores/feedback.store'

function makeEntry(overrides: Partial<FeedbackEntry> = {}): FeedbackEntry {
  return {
    id: 'entry-1',
    score: 8,
    timestamp: '2026-06-03T10:00:00.000Z',
    sessionId: 'session-abc',
    appVersion: '1.4.7',
    ...overrides,
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('useFeedbackStore — initial state', () => {
  it('starts with no entries', () => {
    expect(useFeedbackStore().entries).toHaveLength(0)
  })

  it('starts with dismissCount 0', () => {
    expect(useFeedbackStore().dismissCount).toBe(0)
  })

  it('starts with empty activeDays', () => {
    expect(useFeedbackStore().activeDays).toHaveLength(0)
  })

  it('starts with empty lastSubmitted', () => {
    expect(useFeedbackStore().lastSubmitted).toBe('')
  })
})

describe('useFeedbackStore — addEntry', () => {
  it('adds a feedback entry', () => {
    const store = useFeedbackStore()
    store.addEntry(makeEntry())
    expect(store.entries).toHaveLength(1)
  })

  it('stores the correct score', () => {
    const store = useFeedbackStore()
    store.addEntry(makeEntry({ score: 9 }))
    expect(store.entries[0].score).toBe(9)
  })

  it('stores an optional comment', () => {
    const store = useFeedbackStore()
    store.addEntry(makeEntry({ comment: 'Great tool!' }))
    expect(store.entries[0].comment).toBe('Great tool!')
  })

  it('multiple entries accumulate', () => {
    const store = useFeedbackStore()
    store.addEntry(makeEntry({ id: 'e1', score: 7 }))
    store.addEntry(makeEntry({ id: 'e2', score: 9, timestamp: '2026-06-04T10:00:00.000Z' }))
    expect(store.entries).toHaveLength(2)
  })

  it('updates lastSubmitted to the entry timestamp', () => {
    const store = useFeedbackStore()
    const ts = '2026-06-03T12:00:00.000Z'
    store.addEntry(makeEntry({ timestamp: ts }))
    expect(store.lastSubmitted).toBe(ts)
  })

  it('lastSubmitted reflects the most recently added entry', () => {
    const store = useFeedbackStore()
    store.addEntry(makeEntry({ id: 'e1', timestamp: '2026-06-01T00:00:00.000Z' }))
    store.addEntry(makeEntry({ id: 'e2', timestamp: '2026-06-03T00:00:00.000Z' }))
    expect(store.lastSubmitted).toBe('2026-06-03T00:00:00.000Z')
  })
})

describe('useFeedbackStore — incrementDismiss', () => {
  it('increments dismissCount by 1', () => {
    const store = useFeedbackStore()
    store.incrementDismiss()
    expect(store.dismissCount).toBe(1)
  })

  it('increments dismissCount multiple times', () => {
    const store = useFeedbackStore()
    store.incrementDismiss()
    store.incrementDismiss()
    expect(store.dismissCount).toBe(2)
  })
})

describe('useFeedbackStore — recordActiveDay', () => {
  it('records a new active day', () => {
    const store = useFeedbackStore()
    store.recordActiveDay('2026-06-03')
    expect(store.activeDays).toContain('2026-06-03')
  })

  it('does not duplicate the same day', () => {
    const store = useFeedbackStore()
    store.recordActiveDay('2026-06-03')
    store.recordActiveDay('2026-06-03')
    expect(store.activeDays).toHaveLength(1)
  })

  it('records multiple distinct days', () => {
    const store = useFeedbackStore()
    store.recordActiveDay('2026-06-01')
    store.recordActiveDay('2026-06-02')
    store.recordActiveDay('2026-06-03')
    expect(store.activeDays).toHaveLength(3)
  })
})

describe('useFeedbackStore — reactive state after reload', () => {
  it('new store instance has no entries by default', () => {
    // useStorage is tested separately; here we just verify initial reactive state
    const store = useFeedbackStore()
    expect(store.entries).toHaveLength(0)
    expect(store.dismissCount).toBe(0)
    expect(store.activeDays).toHaveLength(0)
  })
})
