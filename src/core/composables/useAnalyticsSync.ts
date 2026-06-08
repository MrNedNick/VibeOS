/**
 * useAnalyticsSync — push interaction events and feedback entries to Supabase.
 *
 * Strategy:
 *  - Interaction events: batch-push all events newer than lastSyncTs to analytics_events.
 *    lastSyncTs is advanced after each successful batch so we never re-push the same events.
 *  - Feedback entries: pushed individually when the user submits feedback.
 *  - Both operations are no-ops when Supabase is not configured or user is not authenticated.
 *  - All failures are caught and logged — never throws.
 */

import { getSupabase, isSupabaseConfigured } from '@/core/services/supabase'
import { useInteractionBus } from '@/core/stores/interaction.store'
import { storagGet, storageSet } from '@/core/utils/storage'
import type { FeedbackEntry } from '@/core/stores/feedback.store'

const LAST_SYNC_KEY = 'platform:analytics:lastSyncTs'
const BATCH_SIZE    = 500

export function useAnalyticsSync() {
  async function syncEvents(): Promise<void> {
    if (!isSupabaseConfigured) return
    try {
      const sb = getSupabase()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return

      const bus        = useInteractionBus()
      const lastSyncTs = storagGet<string>(LAST_SYNC_KEY, '')
      const allEvents  = bus.history as unknown as import('@/core/events/interaction.types').InteractionEvent[]

      const toSync = (lastSyncTs
        ? allEvents.filter(e => e.timestamp > lastSyncTs)
        : [...allEvents]
      ).slice().sort((a, b) => a.timestamp.localeCompare(b.timestamp))

      if (!toSync.length) return

      for (let i = 0; i < toSync.length; i += BATCH_SIZE) {
        const batch = toSync.slice(i, i + BATCH_SIZE)
        const rows = batch.map(e => {
          const ev = e as unknown as Record<string, unknown>
          return {
            user_id:    user.id,
            type:       e.type,
            module:     'module'    in e ? ev.module    as string : null,
            feature:    'feature'   in e ? ev.feature   as string : null,
            session_id: 'sessionId' in e ? ev.sessionId as string : null,
            timestamp:  e.timestamp,
            payload:    ev,
          }
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (sb.from('analytics_events') as any).insert(rows)
        if (error) {
          console.warn('[analyticsSync] batch insert failed:', error.message)
          break
        }
        storageSet(LAST_SYNC_KEY, batch[batch.length - 1].timestamp)
      }
    } catch (err) {
      console.warn('[analyticsSync] syncEvents error:', err)
    }
  }

  async function pushFeedbackEntry(entry: FeedbackEntry): Promise<void> {
    if (!isSupabaseConfigured) return
    try {
      const sb = getSupabase()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (sb.from('feedback_entries') as any).insert({
        user_id:     user.id,
        score:       entry.score,
        comment:     entry.comment ?? null,
        timestamp:   entry.timestamp,
        session_id:  entry.sessionId,
        app_version: entry.appVersion,
      })
      if (error) console.warn('[analyticsSync] feedback push failed:', error.message)
    } catch (err) {
      console.warn('[analyticsSync] pushFeedbackEntry error:', err)
    }
  }

  return { syncEvents, pushFeedbackEntry }
}
