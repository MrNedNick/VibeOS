/**
 * useCloudSync — Supabase-first sync via user_store JSONB table
 *
 * Strategy:
 *  - Primary source of truth: localStorage (optimistic, immediate UI)
 *  - Cloud: user_store table — one row per localStorage key per user
 *  - On login:   pullAll() fetches all user rows, merges (last-write-wins) into localStorage
 *  - On mutation: useBackendSync debounces pushKey() → upserts to user_store
 *  - Offline:    writes are queued; drainQueue() runs on reconnect
 *
 * When Supabase is not configured: all operations are no-ops.
 */

import { ref, readonly } from 'vue'
import { getSupabase, isSupabaseConfigured } from '@/core/services/supabase'
import { storagGet, storageSet } from '@/core/utils/storage'
import { useSyncBus } from './useSyncBus'

// ── Re-exported types (used by other modules) ──────────────────────────────
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline' | 'unconfigured'

export type SyncRecord = Record<string, unknown> & {
  id: string
  user_id: string
  updated_at?: string
  deletedAt?: number
}

export interface MergeableRecord {
  id: string
  updated_at?: string
  deletedAt?: number
}

export function effectiveTs(r: MergeableRecord): number {
  const updatedTs = r.updated_at ? new Date(r.updated_at).getTime() : 0
  const deletedTs = r.deletedAt ?? 0
  return Math.max(updatedTs, deletedTs)
}

export function mergeRecords<T extends MergeableRecord>(local: T[], remote: T[]): T[] {
  const map = new Map(local.map(i => [i.id, i]))
  for (const r of remote) {
    const l = map.get(r.id)
    if (!l || effectiveTs(r) > effectiveTs(l)) map.set(r.id, r)
  }
  return Array.from(map.values())
}

// ── Keys that are synced to user_store ────────────────────────────────────
export const SYNC_KEYS: string[] = [
  'platform:task-manager:tasks',
  'platform:habits:habits',
  'platform:goals:goals',
  'platform:notes:notes',
  'platform:learning:plans',
  'platform:learning:sessions',
  'platform:training:plans',
  'platform:training:logs',
  'platform:finance:expenses',
  'platform:finance:budgets',
  'platform:kanban:cards',
]

// Alias for backward compat (gcTombstones import in main.ts)
export const TOMBSTONE_KEYS = SYNC_KEYS

export function gcTombstones(maxAgeDays = 30): void {
  const cutoff = Date.now() - maxAgeDays * 86_400_000
  for (const key of SYNC_KEYS) {
    const raw = localStorage.getItem(key)
    if (!raw) continue
    try {
      const items = JSON.parse(raw) as MergeableRecord[]
      if (!Array.isArray(items)) continue
      const kept = items.filter(i => !i.deletedAt || i.deletedAt >= cutoff)
      if (kept.length !== items.length) localStorage.setItem(key, JSON.stringify(kept))
    } catch { /* malformed — leave it */ }
  }
}

// ── Offline queue ─────────────────────────────────────────────────────────
const QUEUE_KEY = 'platform:sync:queue'

function _enqueue(key: string): void {
  const q = storagGet<string[]>(QUEUE_KEY, [])
  if (!q.includes(key)) { q.push(key); storageSet(QUEUE_KEY, q) }
}

function _dequeue(key: string): void {
  storageSet(QUEUE_KEY, storagGet<string[]>(QUEUE_KEY, []).filter(k => k !== key))
}

// ── Shared reactive state ─────────────────────────────────────────────────
const syncStatus = ref<SyncStatus>(isSupabaseConfigured ? 'idle' : 'unconfigured')
const lastSyncAt = ref<string | null>(null)
const syncError  = ref<string | null>(null)

// ── Composable ────────────────────────────────────────────────────────────
export function useCloudSync() {

  async function pushKey(key: string, data: unknown): Promise<void> {
    if (!isSupabaseConfigured) return
    if (!navigator.onLine) { _enqueue(key); return }

    try {
      const sb = getSupabase()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { _enqueue(key); return }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (sb.from('user_store') as any).upsert(
        { user_id: user.id, key, value: data },
        { onConflict: 'user_id,key' },
      )
      if (error) { console.warn(`[sync] push failed ${key}:`, error.message); _enqueue(key) }
      else _dequeue(key)
    } catch { _enqueue(key) }
  }

  async function drainQueue(): Promise<void> {
    if (!isSupabaseConfigured || !navigator.onLine) return
    const queue = storagGet<string[]>(QUEUE_KEY, [])
    if (!queue.length) return

    const sb = getSupabase()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return

    for (const key of [...queue]) {
      const value = storagGet<unknown>(key, null)
      if (value === null) { _dequeue(key); continue }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (sb.from('user_store') as any).upsert(
        { user_id: user.id, key, value },
        { onConflict: 'user_id,key' },
      )
      if (!error) _dequeue(key)
    }
  }

  async function pullAll(): Promise<void> {
    if (!isSupabaseConfigured) return
    syncStatus.value = 'syncing'
    syncError.value  = null

    try {
      const sb = getSupabase()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { syncStatus.value = 'idle'; return }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (sb.from('user_store') as any)
        .select('key, value')
        .eq('user_id', user.id)

      if (error) throw error

      if (data?.length) {
        for (const row of data as { key: string; value: unknown }[]) {
          if (!SYNC_KEYS.includes(row.key)) continue
          const local  = storagGet<MergeableRecord[]>(row.key, [])
          const remote = Array.isArray(row.value) ? (row.value as MergeableRecord[]) : []
          if (remote.length) storageSet(row.key, mergeRecords(local, remote))
        }
      }

      lastSyncAt.value = new Date().toISOString()
      syncStatus.value = 'idle'
      useSyncBus().notifyPulled()
      await drainQueue()
    } catch (err) {
      syncError.value  = err instanceof Error ? err.message : String(err)
      syncStatus.value = 'error'
      console.error('[sync] pullAll error:', err)
    }
  }

  async function pushAll(userId: string): Promise<void> {
    if (!isSupabaseConfigured) return
    syncStatus.value = 'syncing'
    syncError.value  = null

    try {
      const sb = getSupabase()
      const rows = SYNC_KEYS
        .map(key => {
          const value = storagGet<unknown>(key, null)
          return value !== null ? { user_id: userId, key, value } : null
        })
        .filter(Boolean)

      if (rows.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (sb.from('user_store') as any)
          .upsert(rows, { onConflict: 'user_id,key' })
        if (error) throw error
      }

      lastSyncAt.value = new Date().toISOString()
      syncStatus.value = 'idle'
    } catch (err) {
      syncError.value  = err instanceof Error ? err.message : String(err)
      syncStatus.value = 'error'
      console.error('[sync] pushAll error:', err)
    }
  }

  // Backward-compat stubs — stores now go through useBackendSync + pushKey
  async function pushRecord(_table: string, _record: SyncRecord): Promise<void> {}
  async function deleteRecord(_table: string, _id: string): Promise<void> {}

  return {
    isConfigured: isSupabaseConfigured,
    syncStatus: readonly(syncStatus),
    lastSyncAt:  readonly(lastSyncAt),
    syncError:   readonly(syncError),
    pullAll,
    pushAll,
    pushKey,
    pushRecord,
    deleteRecord,
    drainQueue,
  }
}
