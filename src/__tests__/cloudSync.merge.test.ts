import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mergeRecords, effectiveTs, gcTombstones, type MergeableRecord } from '@/core/composables/useCloudSync'

// Helpers — build records with explicit timestamps.
const iso = (ms: number) => new Date(ms).toISOString()

describe('mergeRecords — tombstone-aware merge', () => {
  it('adds remote-only records', () => {
    const local: MergeableRecord[] = []
    const remote: MergeableRecord[] = [{ id: 'a', updated_at: iso(1000) }]
    const merged = mergeRecords(local, remote)
    expect(merged).toHaveLength(1)
    expect(merged[0].id).toBe('a')
  })

  it('keeps local-only records', () => {
    const local: MergeableRecord[] = [{ id: 'a', updated_at: iso(1000) }]
    const remote: MergeableRecord[] = []
    const merged = mergeRecords(local, remote)
    expect(merged).toHaveLength(1)
    expect(merged[0].id).toBe('a')
  })

  it('newer updated_at wins (plain edit conflict)', () => {
    const local: MergeableRecord[] = [{ id: 'a', updated_at: iso(1000) }]
    const remote: MergeableRecord[] = [{ id: 'a', updated_at: iso(2000) }]
    const merged = mergeRecords(local, remote)
    expect(merged[0].updated_at).toBe(iso(2000))
  })

  // ── The two cases the prompt requires ──────────────────────────────────

  it('delete > edit — a tombstone newer than the other side\'s edit stays deleted', () => {
    // Device A deleted at t=3000. Device B edited earlier at t=1000.
    const deviceA: MergeableRecord[] = [{ id: 'task1', updated_at: iso(1000), deletedAt: 3000 }]
    const deviceB: MergeableRecord[] = [{ id: 'task1', updated_at: iso(1000) }]
    const merged = mergeRecords(deviceB, deviceA)
    expect(merged).toHaveLength(1)
    expect(merged[0].deletedAt).toBe(3000) // tombstone wins → record remains deleted
  })

  it('edit > delete — an edit newer than the tombstone resurrects the record', () => {
    // Device A deleted at t=1000. Device B edited later at t=3000.
    const deviceA: MergeableRecord[] = [{ id: 'task1', updated_at: iso(500), deletedAt: 1000 }]
    const deviceB: MergeableRecord[] = [{ id: 'task1', updated_at: iso(3000) }]
    const merged = mergeRecords(deviceA, deviceB)
    expect(merged).toHaveLength(1)
    expect(merged[0].deletedAt).toBeUndefined() // edit wins → record is back
    expect(merged[0].updated_at).toBe(iso(3000))
  })

  it('delete on A stays deleted after merging with un-deleted B (symmetry)', () => {
    // Whichever order we merge, the newer tombstone must win.
    const aDeleted: MergeableRecord[] = [{ id: 'x', updated_at: iso(1000), deletedAt: 5000 }]
    const bAlive:   MergeableRecord[] = [{ id: 'x', updated_at: iso(2000) }]
    expect(mergeRecords(aDeleted, bAlive)[0].deletedAt).toBe(5000)
    expect(mergeRecords(bAlive, aDeleted)[0].deletedAt).toBe(5000)
  })
})

describe('effectiveTs', () => {
  it('uses the later of updated_at and deletedAt', () => {
    expect(effectiveTs({ id: 'a', updated_at: iso(1000), deletedAt: 2000 })).toBe(2000)
    expect(effectiveTs({ id: 'a', updated_at: iso(3000), deletedAt: 2000 })).toBe(3000)
    expect(effectiveTs({ id: 'a' })).toBe(0)
  })
})

describe('gcTombstones', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01T00:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('drops tombstones older than the window but keeps recent ones and live records', () => {
    const now = Date.now()
    const oldTomb   = { id: 'old',   deletedAt: now - 40 * 86_400_000 } // 40 days ago
    const freshTomb = { id: 'fresh', deletedAt: now - 5 * 86_400_000 }  // 5 days ago
    const alive     = { id: 'alive', updated_at: iso(now) }
    localStorage.setItem('platform:task-manager:tasks', JSON.stringify([oldTomb, freshTomb, alive]))

    gcTombstones(30)

    const kept = JSON.parse(localStorage.getItem('platform:task-manager:tasks')!)
    expect(kept.map((r: MergeableRecord) => r.id).sort()).toEqual(['alive', 'fresh'])
  })

  it('leaves keys without tombstones untouched', () => {
    const items = [{ id: 'a', updated_at: iso(Date.now()) }]
    localStorage.setItem('platform:goals:goals', JSON.stringify(items))
    gcTombstones(30)
    expect(JSON.parse(localStorage.getItem('platform:goals:goals')!)).toHaveLength(1)
  })
})
