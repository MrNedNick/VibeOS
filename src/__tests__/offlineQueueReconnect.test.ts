/**
 * S · продуктовая очередь · VibeOS T4 — offline queue reconnect.
 *
 * Two tabs edit the same record while offline. Tab B reconnects first and
 * pushes its (newer) edit to Supabase. Tab A reconnects later with its own
 * (older) edit still queued from `pushKey`. Reconnect must not let Tab A's
 * stale queued push clobber Tab B's newer remote write — the `online`
 * handler in main.ts calls `pullAll()` (merge remote-by-`updatedAt` into
 * local, notify stores) *before* `drainQueue()` pushes, so the queued push
 * carries the merged/superseding value instead of the pre-merge local one.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

const h = vi.hoisted(() => {
  const state = {
    selectResult: { data: [] as unknown[], error: null as unknown },
    upsertCalls: [] as unknown[],
  }
  const client = {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u-1' } } }) },
    from: vi.fn(() => ({
      upsert: vi.fn((row: unknown) => {
        state.upsertCalls.push(row)
        return Promise.resolve({ error: null })
      }),
      select: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue(state.selectResult),
      })),
    })),
  }
  return { state, client }
})

vi.mock('@/core/services/supabase', () => ({
  isSupabaseConfigured: true,
  getSupabase: () => h.client,
}))
vi.mock('@/core/composables/useSyncBus', () => ({
  useSyncBus: () => ({ notifyPulled: vi.fn() }),
}))

import { useCloudSync } from '@/core/composables/useCloudSync'

const KEY = 'platform:task-manager:tasks'

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  h.state.upsertCalls = []
  h.state.selectResult = { data: [], error: null }
})

describe('reconnect: pullAll merges before the queued push drains', () => {
  it('does not let a stale queued push overwrite a newer remote edit', async () => {
    const { pushKey, pullAll } = useCloudSync()

    // Tab A, offline: edits task "t1" (its own stamp is older than what
    // Tab B will have pushed by the time Tab A reconnects).
    const staleLocal = [{ id: 't1', text: 'tab A edit', updatedAt: 1000 }]
    localStorage.setItem(KEY, JSON.stringify(staleLocal))
    // navigator.onLine is true under happy-dom by default — force offline
    // for this write so it queues instead of pushing immediately.
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    await pushKey(KEY, staleLocal)
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })

    // Tab B already reconnected and pushed a newer edit of the same record.
    h.state.selectResult = {
      data: [{ key: KEY, value: [{ id: 't1', text: 'tab B edit', updatedAt: 2000 }] }],
      error: null,
    }

    // Tab A reconnects: the `online` handler calls pullAll(), which merges
    // remote into local by updatedAt and then drains the queue.
    await pullAll()

    // Local storage must reflect the newer remote edit, not Tab A's stale one.
    const merged = JSON.parse(localStorage.getItem(KEY)!)
    expect(merged).toEqual([{ id: 't1', text: 'tab B edit', updatedAt: 2000 }])

    // The drained push must carry the merged (superseding) value — never
    // the raw pre-merge local edit that was sitting in the queue.
    expect(h.state.upsertCalls).toHaveLength(1)
    expect(h.state.upsertCalls[0]).toMatchObject({
      value: [{ id: 't1', text: 'tab B edit', updatedAt: 2000 }],
    })
  })
})
