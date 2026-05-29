/**
 * useCloudSync — offline-first Supabase sync composable (scaffold)
 *
 * Architecture:
 * - Primary source of truth: localStorage (via useStorage)
 * - Cloud: Supabase (wired up when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set)
 * - Strategy: dual-write on mutation, full pull on login
 *
 * Status: SCAFFOLD — cloud operations are no-ops until Supabase is configured.
 * All modules continue to work in localStorage-only mode.
 *
 * Tables (per docs/strategy.md S3 plan):
 *   tasks, habits, habit_logs, goals, milestones,
 *   notes, kanban_boards, kanban_cards,
 *   learning_plans, learning_sessions,
 *   training_plans, training_logs
 *
 * Each row has: id (uuid), user_id (uuid FK auth.uid()), created_at, updated_at
 * RLS: SELECT/INSERT/UPDATE/DELETE WHERE user_id = auth.uid()
 */

import { ref, readonly } from 'vue'

// ── Config detection ──────────────────────────────────────────────────────
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  as string | undefined
const SUPABASE_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const isConfigured  = !!(SUPABASE_URL && SUPABASE_KEY)

// ── Sync state ────────────────────────────────────────────────────────────
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline' | 'unconfigured'

const syncStatus  = ref<SyncStatus>(isConfigured ? 'idle' : 'unconfigured')
const lastSyncAt  = ref<string | null>(null)
const syncError   = ref<string | null>(null)

// ── Public composable ─────────────────────────────────────────────────────
export function useCloudSync() {

  /**
   * Pull all user data from Supabase after login.
   * Merges with local data (last-write-wins on updatedAt).
   * No-op when Supabase is not configured.
   */
  async function pullAll(): Promise<void> {
    if (!isConfigured) return
    syncStatus.value = 'syncing'
    syncError.value  = null

    try {
      // TODO: import { createClient } from '@supabase/supabase-js'
      // TODO: fetch each table and merge with localStorage stores
      await Promise.resolve() // placeholder
      lastSyncAt.value = new Date().toISOString()
      syncStatus.value = 'idle'
    } catch (err) {
      syncError.value  = err instanceof Error ? err.message : String(err)
      syncStatus.value = 'error'
    }
  }

  /**
   * Push a single record to Supabase (upsert).
   * Called after every local mutation when configured.
   * No-op when Supabase is not configured.
   */
  async function pushRecord(
    _table: string,
    _record: Record<string, unknown>,
  ): Promise<void> {
    if (!isConfigured) return
    try {
      // TODO: supabase.from(table).upsert(record, { onConflict: 'id' })
      await Promise.resolve() // placeholder
    } catch (err) {
      console.warn('[sync] push failed:', err)
    }
  }

  /**
   * Delete a record from Supabase.
   * No-op when Supabase is not configured.
   */
  async function deleteRecord(
    _table: string,
    _id: string,
  ): Promise<void> {
    if (!isConfigured) return
    try {
      // TODO: supabase.from(table).delete().eq('id', id)
      await Promise.resolve() // placeholder
    } catch (err) {
      console.warn('[sync] delete failed:', err)
    }
  }

  return {
    isConfigured,
    syncStatus: readonly(syncStatus),
    lastSyncAt: readonly(lastSyncAt),
    syncError:  readonly(syncError),
    pullAll,
    pushRecord,
    deleteRecord,
  }
}
