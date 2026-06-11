/**
 * useRealtimeSync — Supabase Realtime subscriptions for user_store
 *
 * Listens for changes to the authenticated user's rows in user_store.
 * When a row changes, merges the incoming data into localStorage and
 * notifies stores via useSyncBus so they re-read fresh state.
 *
 * Used for habits + tasks real-time sync across devices/tabs.
 */

import { getSupabase, isSupabaseConfigured } from '@/core/services/supabase'
import { storagGet, storageSet } from '@/core/utils/storage'
import { mergeRecords, SYNC_KEYS, type MergeableRecord } from './useCloudSync'
import { useSyncBus } from './useSyncBus'
import type { RealtimeChannel } from '@supabase/supabase-js'

let _channel: RealtimeChannel | null = null

export function useRealtimeSync() {
  function subscribe(userId: string): void {
    if (!isSupabaseConfigured || _channel) return

    const sb = getSupabase()
    _channel = sb
      .channel(`user_store:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_store',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = (payload.new ?? payload.old) as { key?: string; value?: unknown } | null
          if (!row?.key || !SYNC_KEYS.includes(row.key)) return

          const local  = storagGet<MergeableRecord[]>(row.key, [])
          const remote = Array.isArray(row.value) ? (row.value as MergeableRecord[]) : []
          if (remote.length) {
            const merged = mergeRecords(local, remote)
            // Realtime echoes our own pushes back — a no-op merge must not
            // notify stores, or their watchers push again forever (S28 T2)
            if (JSON.stringify(merged) === JSON.stringify(local)) return
            storageSet(row.key, merged)
            useSyncBus().notifyPulled()
          }
        },
      )
      .subscribe()
  }

  function unsubscribe(): void {
    if (_channel) {
      getSupabase().removeChannel(_channel)
      _channel = null
    }
  }

  return { subscribe, unsubscribe }
}
