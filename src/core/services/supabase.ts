/**
 * Supabase client singleton
 *
 * Usage:
 *   import { getSupabase, isSupabaseConfigured } from '@/core/services/supabase'
 *
 *   if (isSupabaseConfigured) {
 *     const sb = getSupabase()
 *     const { data, error } = await sb.auth.signInWithPassword({ email, password })
 *   }
 *
 * Environment variables (set in .env.local — never commit):
 *   VITE_SUPABASE_URL      = https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY = eyJ...
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './supabase.types'

// ── Config ────────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_KEY)

// ── Lazy singleton ────────────────────────────────────────────────────────
let _client: SupabaseClient<Database> | null = null

export function getSupabase(): SupabaseClient<Database> {
  if (!isSupabaseConfigured) {
    throw new Error('[supabase] Not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local')
  }
  if (!_client) {
    _client = createClient<Database>(SUPABASE_URL!, SUPABASE_KEY!, {
      auth: {
        // Persist session in localStorage so page refresh keeps user logged in
        persistSession: true,
        storageKey: 'platform:auth:supabase',
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return _client
}
