import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSoftDeletable } from '@/core/composables/useSoftDeletable'

interface Thing { id: string; name: string; deletedAt?: number }

function makeThings() {
  return useSoftDeletable<Thing>('test:things')
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('useSoftDeletable — basic lifecycle', () => {
  it('starts empty', () => {
    const { items } = makeThings()
    expect(items.value).toHaveLength(0)
  })

  it('items reflects items added to all', () => {
    const { all, items } = makeThings()
    all.value.push({ id: '1', name: 'Alpha' })
    all.value.push({ id: '2', name: 'Beta' })
    expect(items.value).toHaveLength(2)
  })

  it('softDelete hides item from items', () => {
    const { all, items, softDelete } = makeThings()
    all.value.push({ id: '1', name: 'Alpha' })
    all.value.push({ id: '2', name: 'Beta' })
    softDelete('1')
    expect(items.value).toHaveLength(1)
    expect(items.value[0].id).toBe('2')
  })

  it('softDelete sets deletedAt timestamp on all', () => {
    const before = Date.now()
    const { all, softDelete } = makeThings()
    all.value.push({ id: '1', name: 'Alpha' })
    softDelete('1')
    const after = Date.now()
    const ts = all.value[0].deletedAt
    expect(ts).toBeGreaterThanOrEqual(before)
    expect(ts).toBeLessThanOrEqual(after)
  })

  it('softDelete is idempotent — second call does not update deletedAt', () => {
    const { all, softDelete } = makeThings()
    all.value.push({ id: '1', name: 'Alpha' })
    softDelete('1')
    const firstTs = all.value[0].deletedAt
    softDelete('1')
    expect(all.value[0].deletedAt).toBe(firstTs)
  })

  it('softDelete on unknown id is a no-op', () => {
    const { all, softDelete } = makeThings()
    all.value.push({ id: '1', name: 'Alpha' })
    expect(() => softDelete('nonexistent')).not.toThrow()
    expect(all.value[0].deletedAt).toBeUndefined()
  })

  it('restore makes item visible again', () => {
    const { all, items, softDelete, restore } = makeThings()
    all.value.push({ id: '1', name: 'Alpha' })
    softDelete('1')
    expect(items.value).toHaveLength(0)
    restore('1')
    expect(items.value).toHaveLength(1)
    expect(all.value[0].deletedAt).toBeUndefined()
  })

  it('restore on unknown id is a no-op', () => {
    const { all, restore } = makeThings()
    all.value.push({ id: '1', name: 'Alpha' })
    expect(() => restore('nonexistent')).not.toThrow()
    expect(all.value).toHaveLength(1)
  })
})

describe('useSoftDeletable — tombstones in all', () => {
  it('all still contains deleted items', () => {
    const { all, softDelete } = makeThings()
    all.value.push({ id: '1', name: 'Alpha' })
    softDelete('1')
    expect(all.value).toHaveLength(1)
    expect(all.value[0].deletedAt).toBeDefined()
  })

  it('delete one keeps the other visible', () => {
    const { all, items, softDelete } = makeThings()
    all.value.push({ id: '1', name: 'Alpha' })
    all.value.push({ id: '2', name: 'Beta' })
    all.value.push({ id: '3', name: 'Gamma' })
    softDelete('2')
    expect(items.value.map(i => i.id)).toEqual(['1', '3'])
    expect(all.value).toHaveLength(3)
  })

  it('delete wins over a later edit — edit does not resurrect', () => {
    const { all, items, softDelete } = makeThings()
    all.value.push({ id: '1', name: 'Alpha' })
    softDelete('1')
    // Simulate an edit arriving after the delete (e.g. sync conflict)
    const raw = all.value.find(e => e.id === '1')!
    raw.name = 'Alpha edited'
    // deletedAt still set — item must NOT appear in items
    expect(items.value).toHaveLength(0)
  })
})

describe('useSoftDeletable — two independent collections same test', () => {
  it('two separate keys are independent', () => {
    const plans = useSoftDeletable<Thing>('test:plans')
    const sessions = useSoftDeletable<Thing>('test:sessions')

    plans.all.value.push({ id: 'p1', name: 'Plan 1' })
    sessions.all.value.push({ id: 's1', name: 'Session 1' })

    plans.softDelete('p1')

    expect(plans.items.value).toHaveLength(0)
    expect(sessions.items.value).toHaveLength(1)
  })
})
