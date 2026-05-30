/**
 * useCloudSync — offline-first Supabase sync composable
 *
 * Strategy:
 *  - Primary source of truth: localStorage (via useStorage in each module store)
 *  - Cloud: Supabase (activated when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set)
 *  - On login: pullAll() fetches all user rows and merges with local (latest updatedAt wins)
 *  - On mutation: pushRecord() upserts the changed row immediately
 *  - On delete: deleteRecord() removes the row from Supabase
 *
 * When Supabase is not configured: all operations are no-ops — app works fully offline.
 *
 * Table ↔ localStorage key mapping:
 *   tasks            → platform:tasks
 *   habits           → platform:habits
 *   habit_logs       → platform:habits:logs
 *   goals            → platform:goals
 *   milestones       → platform:goals:milestones
 *   notes            → platform:notes
 *   learning_plans   → platform:learning:plans
 *   learning_sessions→ platform:learning:sessions
 *   training_plans   → platform:training:plans
 *   training_logs    → platform:training:logs
 */

import { ref, readonly } from 'vue'
import { getSupabase, isSupabaseConfigured } from '@/core/services/supabase'

// ── Types ─────────────────────────────────────────────────────────────────
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline' | 'unconfigured'

// Row expected by Supabase — must have at minimum: id, user_id, updated_at
export type SyncRecord = Record<string, unknown> & {
  id: string
  user_id: string
  updated_at?: string
}

// ── Shared state (module-level, one instance across composable calls) ─────
const syncStatus = ref<SyncStatus>(isSupabaseConfigured ? 'idle' : 'unconfigured')
const lastSyncAt = ref<string | null>(null)
const syncError  = ref<string | null>(null)

// ── Tables to pull on login ───────────────────────────────────────────────
const PULL_TABLES: Array<{ table: string; storageKey: string }> = [
  { table: 'tasks',             storageKey: 'platform:tasks' },
  { table: 'habits',            storageKey: 'platform:habits' },
  { table: 'habit_logs',        storageKey: 'platform:habits:logs' },
  { table: 'goals',             storageKey: 'platform:goals' },
  { table: 'milestones',        storageKey: 'platform:goals:milestones' },
  { table: 'notes',             storageKey: 'platform:notes' },
  { table: 'learning_plans',    storageKey: 'platform:learning:plans' },
  { table: 'learning_sessions', storageKey: 'platform:learning:sessions' },
  { table: 'training_plans',    storageKey: 'platform:training:plans' },
  { table: 'training_logs',     storageKey: 'platform:training:logs' },
]

// ── Public composable ─────────────────────────────────────────────────────
export function useCloudSync() {

  /**
   * Merge strategy: for each table row fetched from Supabase,
   * compare updated_at with the local counterpart.
   * Latest wins. Local-only rows (not yet pushed) are kept as-is.
   */
  function _merge<T extends { id: string; updated_at?: string }>(
    localItems: T[],
    remoteItems: T[],
  ): T[] {
    const localMap = new Map(localItems.map(i => [i.id, i]))

    for (const remote of remoteItems) {
      const local = localMap.get(remote.id)
      if (!local) {
        // New from server — add locally
        localMap.set(remote.id, remote)
      } else {
        // Compare timestamps — latest wins
        const localTs  = local.updated_at  ? new Date(local.updated_at).getTime()  : 0
        const remoteTs = remote.updated_at ? new Date(remote.updated_at).getTime() : 0
        if (remoteTs > localTs) {
          localMap.set(remote.id, remote)
        }
      }
    }
    return Array.from(localMap.values())
  }

  /**
   * Pull all user data from Supabase and merge with localStorage.
   * Called after login. No-op when not configured.
   */
  async function pullAll(): Promise<void> {
    if (!isSupabaseConfigured) return

    syncStatus.value = 'syncing'
    syncError.value  = null

    try {
      const sb = getSupabase()

      for (const { table, storageKey } of PULL_TABLES) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (sb.from(table) as any)
          .select('*')
          .order('updated_at', { ascending: false })

        if (error) {
          console.warn(`[sync] pull failed for ${table}:`, (error as { message: string }).message)
          continue
        }

        if (!data?.length) continue

        // Merge with existing local data
        const rawLocal = localStorage.getItem(storageKey)
        const localItems: SyncRecord[] = rawLocal ? JSON.parse(rawLocal) : []
        const merged = _merge(localItems, data as SyncRecord[])
        localStorage.setItem(storageKey, JSON.stringify(merged))
      }

      lastSyncAt.value = new Date().toISOString()
      syncStatus.value = 'idle'
    } catch (err) {
      syncError.value  = err instanceof Error ? err.message : String(err)
      syncStatus.value = 'error'
      console.error('[sync] pullAll error:', err)
    }
  }

  /**
   * Upsert a single record to Supabase.
   * Called after every local mutation. No-op when not configured.
   */
  async function pushRecord(
    table: string,
    record: SyncRecord,
  ): Promise<void> {
    if (!isSupabaseConfigured) return

    try {
      const sb = getSupabase()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (sb.from(table) as any).upsert(record, { onConflict: 'id' })

      if (error) {
        console.warn(`[sync] push failed for ${table}/${record.id}:`, (error as { message: string }).message)
      }
    } catch (err) {
      console.warn('[sync] pushRecord error:', err)
    }
  }

  /**
   * Delete a record from Supabase.
   * No-op when not configured.
   */
  async function deleteRecord(
    table: string,
    id: string,
  ): Promise<void> {
    if (!isSupabaseConfigured) return

    try {
      const sb = getSupabase()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (sb.from(table) as any).delete().eq('id', id)

      if (error) {
        console.warn(`[sync] delete failed for ${table}/${id}:`, (error as { message: string }).message)
      }
    } catch (err) {
      console.warn('[sync] deleteRecord error:', err)
    }
  }

  /**
   * Push all local data to Supabase (first-time sync after connecting).
   * Iterates every table's localStorage and upserts all rows.
   */
  async function pushAll(userId: string): Promise<void> {
    if (!isSupabaseConfigured) return

    syncStatus.value = 'syncing'
    syncError.value  = null

    try {
      const sb = getSupabase()

      for (const { table, storageKey } of PULL_TABLES) {
        const rawLocal = localStorage.getItem(storageKey)
        if (!rawLocal) continue

        const items: SyncRecord[] = JSON.parse(rawLocal)
        if (!items.length) continue

        // Stamp user_id on every row (in case it wasn't set locally)
        const stamped = items.map(i => ({ ...i, user_id: userId }))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (sb.from(table) as any).upsert(stamped, { onConflict: 'id' })

        if (error) {
          console.warn(`[sync] pushAll failed for ${table}:`, (error as { message: string }).message)
        }
      }

      lastSyncAt.value = new Date().toISOString()
      syncStatus.value = 'idle'
    } catch (err) {
      syncError.value  = err instanceof Error ? err.message : String(err)
      syncStatus.value = 'error'
      console.error('[sync] pushAll error:', err)
    }
  }

  return {
    isConfigured: isSupabaseConfigured,
    syncStatus: readonly(syncStatus),
    lastSyncAt:  readonly(lastSyncAt),
    syncError:   readonly(syncError),
    pullAll,
    pushAll,
    pushRecord,
    deleteRecord,
  }
}
