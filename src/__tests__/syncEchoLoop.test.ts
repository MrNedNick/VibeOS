/**
 * S28 T2 — the realtime echo-loop guards.
 *
 * The loop: own push → realtime event → notifyPulled → store watchers fire
 * on re-read → push again → realtime event → … forever. Three guards break
 * it, each tested here:
 *   1. useBackendSync.push() skips payloads identical to the last sent one
 *   2. pullAll() only notifies the sync bus when a merge actually changed data
 *   3. the realtime handler skips no-op merges entirely
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

type RealtimeCb = (payload: { new: unknown; old: unknown }) => void

const h = vi.hoisted(() => {
  const state = {
    realtimeCb: null as RealtimeCb | null,
    selectResult: { data: [] as unknown[], error: null as unknown },
  }
  const channelBuilder = {
    on: vi.fn((_t: string, _f: unknown, cb: RealtimeCb) => {
      state.realtimeCb = cb
      return channelBuilder
    }),
    subscribe: vi.fn(() => channelBuilder),
  }
  const client = {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u-1' } } }) },
    channel: vi.fn(() => channelBuilder),
    removeChannel: vi.fn(),
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      select: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue(state.selectResult),
      })),
    })),
  }
  return { state, client, notifyPulled: vi.fn() }
})

vi.mock('@/core/services/supabase', () => ({
  isSupabaseConfigured: true,
  getSupabase: () => h.client,
}))
vi.mock('@/core/composables/useSyncBus', () => ({
  useSyncBus: () => ({ notifyPulled: h.notifyPulled }),
}))

import { useBackendSync } from '@/core/composables/useBackendSync'
import { useCloudSync } from '@/core/composables/useCloudSync'
import { useRealtimeSync } from '@/core/composables/useRealtimeSync'

const KEY = 'platform:task-manager:tasks'

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  h.state.selectResult = { data: [], error: null }
})

describe('useBackendSync — duplicate-payload guard', () => {
  it('pushes a changed payload but skips an identical re-push', async () => {
    vi.useFakeTimers()
    const sync = useBackendSync(KEY)

    sync.push([{ id: 'a', text: 'one' }])
    await vi.runAllTimersAsync()
    expect(h.client.from).toHaveBeenCalledTimes(1)

    // Same content again (what a post-pull store re-read produces) → no push
    sync.push([{ id: 'a', text: 'one' }])
    await vi.runAllTimersAsync()
    expect(h.client.from).toHaveBeenCalledTimes(1)

    // Genuinely new content → pushes again
    sync.push([{ id: 'a', text: 'two' }])
    await vi.runAllTimersAsync()
    expect(h.client.from).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })
})

describe('pullAll — no-op pulls do not notify the sync bus', () => {
  it('skips notifyPulled when remote merges to identical local data', async () => {
    const records = [{ id: 'a', updated_at: new Date(1000).toISOString() }]
    localStorage.setItem(KEY, JSON.stringify(records))
    h.state.selectResult = { data: [{ key: KEY, value: records }], error: null }

    await useCloudSync().pullAll()
    expect(h.notifyPulled).not.toHaveBeenCalled()
  })

  it('notifies when the merge brings new data', async () => {
    localStorage.setItem(KEY, JSON.stringify([]))
    h.state.selectResult = {
      data: [{ key: KEY, value: [{ id: 'remote-1', updated_at: new Date(1000).toISOString() }] }],
      error: null,
    }

    await useCloudSync().pullAll()
    expect(h.notifyPulled).toHaveBeenCalledTimes(1)
    expect(JSON.parse(localStorage.getItem(KEY)!)).toHaveLength(1)
  })
})

describe('useRealtimeSync — echoed events are ignored', () => {
  function fire(value: unknown) {
    h.state.realtimeCb!({ new: { key: KEY, value }, old: null })
  }

  it('a realtime echo of identical data does not notify stores', () => {
    const records = [{ id: 'a', updated_at: new Date(1000).toISOString() }]
    localStorage.setItem(KEY, JSON.stringify(records))

    useRealtimeSync().subscribe('u-1')
    fire(records)

    expect(h.notifyPulled).not.toHaveBeenCalled()
    useRealtimeSync().unsubscribe()
  })

  it('a realtime event with new data merges and notifies once', () => {
    localStorage.setItem(KEY, JSON.stringify([]))

    useRealtimeSync().subscribe('u-1')
    fire([{ id: 'remote-1', updated_at: new Date(1000).toISOString() }])

    expect(h.notifyPulled).toHaveBeenCalledTimes(1)
    expect(JSON.parse(localStorage.getItem(KEY)!)).toHaveLength(1)
    useRealtimeSync().unsubscribe()
  })
})
