import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useInteractionBus } from '@/core/stores/interaction.store'
import type { InteractionEvent } from '@/core/events/interaction.types'

function moduleVisited(module: string, timestamp = '2026-06-03T10:00:00.000Z'): InteractionEvent {
  return { type: 'module:visited', module, timestamp, sessionId: 'sess-1' }
}

function featureUsed(module: string, feature: string, timestamp = '2026-06-03T10:00:00.000Z'): InteractionEvent {
  return { type: 'feature:used', module, feature, timestamp }
}

function sessionStart(sessionId = 'sess-1', timestamp = '2026-06-03T10:00:00.000Z'): InteractionEvent {
  return { type: 'session:start', sessionId, timestamp }
}

function sessionEnd(sessionId = 'sess-1', duration = 120, timestamp = '2026-06-03T10:02:00.000Z'): InteractionEvent {
  return { type: 'session:end', sessionId, duration, modulesVisited: ['dashboard', 'tasks'], timestamp }
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('useInteractionBus — emit & history', () => {
  it('starts with empty history', () => {
    expect(useInteractionBus().totalCount).toBe(0)
  })

  it('emits an event into history', () => {
    const bus = useInteractionBus()
    bus.emit(moduleVisited('dashboard'))
    expect(bus.totalCount).toBe(1)
  })

  it('history accumulates multiple events', () => {
    const bus = useInteractionBus()
    bus.emit(moduleVisited('dashboard'))
    bus.emit(moduleVisited('tasks'))
    bus.emit(featureUsed('tasks', 'task:created'))
    expect(bus.totalCount).toBe(3)
  })
})

describe('useInteractionBus — recent', () => {
  it('returns last n events (newest first)', () => {
    const bus = useInteractionBus()
    bus.emit(moduleVisited('dashboard', '2026-06-03T09:00:00.000Z'))
    bus.emit(moduleVisited('tasks',     '2026-06-03T10:00:00.000Z'))
    bus.emit(moduleVisited('goals',     '2026-06-03T11:00:00.000Z'))
    const r = bus.recent(2)
    expect(r).toHaveLength(2)
    expect(r[0].type).toBe('module:visited')
  })

  it('filters by event type', () => {
    const bus = useInteractionBus()
    bus.emit(moduleVisited('dashboard'))
    bus.emit(featureUsed('tasks', 'task:created'))
    bus.emit(featureUsed('tasks', 'task:completed'))
    const r = bus.recent(10, 'feature:used')
    expect(r).toHaveLength(2)
    expect(r.every(e => e.type === 'feature:used')).toBe(true)
  })

  it('returns all events when n > history length', () => {
    const bus = useInteractionBus()
    bus.emit(moduleVisited('dashboard'))
    expect(bus.recent(100)).toHaveLength(1)
  })
})

describe('useInteractionBus — countByModule', () => {
  it('counts module:visited events per module in period', () => {
    const bus = useInteractionBus()
    const ts = new Date().toISOString()
    bus.emit({ type: 'module:visited', module: 'dashboard', timestamp: ts, sessionId: 's1' })
    bus.emit({ type: 'module:visited', module: 'dashboard', timestamp: ts, sessionId: 's1' })
    bus.emit({ type: 'module:visited', module: 'tasks',     timestamp: ts, sessionId: 's1' })
    const counts = bus.countByModule(30)
    expect(counts['dashboard']).toBe(2)
    expect(counts['tasks']).toBe(1)
  })

  it('counts feature:used events per module in period', () => {
    const bus = useInteractionBus()
    const ts = new Date().toISOString()
    bus.emit({ type: 'feature:used', module: 'habits', feature: 'habit:checked', timestamp: ts })
    const counts = bus.countByModule(30)
    expect(counts['habits']).toBe(1)
  })

  it('excludes events older than the specified days', () => {
    const bus = useInteractionBus()
    const oldTs = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
    bus.emit({ type: 'module:visited', module: 'dashboard', timestamp: oldTs, sessionId: 's1' })
    const counts = bus.countByModule(30)
    expect(counts['dashboard']).toBeUndefined()
  })
})

describe('useInteractionBus — countByFeature', () => {
  it('counts feature:used events as module:feature pairs', () => {
    const bus = useInteractionBus()
    const ts = new Date().toISOString()
    bus.emit({ type: 'feature:used', module: 'tasks', feature: 'task:created', timestamp: ts })
    bus.emit({ type: 'feature:used', module: 'tasks', feature: 'task:created', timestamp: ts })
    bus.emit({ type: 'feature:used', module: 'habits', feature: 'habit:checked', timestamp: ts })
    const counts = bus.countByFeature(30)
    expect(counts['tasks:task:created']).toBe(2)
    expect(counts['habits:habit:checked']).toBe(1)
  })

  it('ignores non-feature events', () => {
    const bus = useInteractionBus()
    const ts = new Date().toISOString()
    bus.emit({ type: 'module:visited', module: 'dashboard', timestamp: ts, sessionId: 's1' })
    const counts = bus.countByFeature(30)
    expect(Object.keys(counts)).toHaveLength(0)
  })
})

describe('useInteractionBus — sessionHistory', () => {
  it('returns sessions started in the period', () => {
    const bus = useInteractionBus()
    bus.emit(sessionStart('sess-1', new Date().toISOString()))
    const history = bus.sessionHistory(30)
    expect(history).toHaveLength(1)
    expect(history[0].sessionId).toBe('sess-1')
  })

  it('includes duration when session:end follows session:start', () => {
    const bus = useInteractionBus()
    const now = new Date().toISOString()
    bus.emit(sessionStart('sess-1', now))
    bus.emit(sessionEnd('sess-1', 240, new Date(Date.now() + 240000).toISOString()))
    const history = bus.sessionHistory(30)
    expect(history[0].duration).toBe(240)
    expect(history[0].modulesVisited).toContain('dashboard')
  })

  it('excludes sessions older than specified days', () => {
    const bus = useInteractionBus()
    const oldTs = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
    bus.emit(sessionStart('old-sess', oldTs))
    expect(bus.sessionHistory(30)).toHaveLength(0)
  })
})

describe('useInteractionBus — clear', () => {
  it('clears all history', () => {
    const bus = useInteractionBus()
    bus.emit(moduleVisited('dashboard'))
    bus.emit(featureUsed('tasks', 'task:created'))
    bus.clear()
    expect(bus.totalCount).toBe(0)
  })
})

describe('useInteractionBus — clear', () => {
  it('clears all history', () => {
    const bus = useInteractionBus()
    bus.emit(moduleVisited('dashboard'))
    bus.emit(featureUsed('tasks', 'task:created'))
    bus.clear()
    expect(bus.totalCount).toBe(0)
  })

  it('totalCount is 0 after clear even with prior events', () => {
    const bus = useInteractionBus()
    for (let i = 0; i < 50; i++) {
      bus.emit(featureUsed('tasks', `f${i}`))
    }
    bus.clear()
    expect(bus.totalCount).toBe(0)
    expect(bus.recent(10)).toHaveLength(0)
  })
})
