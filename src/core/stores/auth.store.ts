/**
 * Auth store
 *
 * Two modes:
 *  - Demo mode  — local-only, no network, DEMO_USER preset, always works
 *  - Supabase   — real email/password auth; activated when VITE_SUPABASE_URL is set
 *
 * Session is persisted automatically:
 *  - Demo:     via useStorage → localStorage key `platform:auth:state`
 *  - Supabase: via @supabase/supabase-js internal storage key `platform:auth:supabase`
 *              On init() we call getSession() to restore; onAuthStateChange keeps it live.
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useStorage } from '@/core/composables/useStorage'
import { getSupabase, isSupabaseConfigured } from '@/core/services/supabase'
import { useCloudSync } from '@/core/composables/useCloudSync'

// Resolves when init() finishes — router guard awaits this before checking isLoggedIn
let _readyResolve!: () => void
const _readyPromise = new Promise<void>(resolve => { _readyResolve = resolve })

// ── Types ─────────────────────────────────────────────────────────────────
export type AuthProvider = 'supabase' | 'demo' | null

export interface AuthUser {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  provider: AuthProvider
  tier: 'free' | 'demo' | 'pro'
}

export interface AuthState {
  user: AuthUser | null
  loggedInAt: string | null
}

// ── Demo preset ───────────────────────────────────────────────────────────
const DEMO_USER: AuthUser = {
  id: 'demo-user-00000000',
  email: 'demo@vibeos.app',
  displayName: 'Demo User',
  provider: 'demo',
  tier: 'demo',
}

const STATE_KEY = 'platform:auth:state'

// ── Store ─────────────────────────────────────────────────────────────────
export const useAuthStore = defineStore('core:auth', () => {
  // Persisted state (used only in demo mode; Supabase manages its own session)
  const _state = useStorage<AuthState>(STATE_KEY, { user: null, loggedInAt: null })

  // Loading state for async operations
  const loading = ref(false)

  // ── Derived ─────────────────────────────────────────────────────────────
  const user       = computed(() => _state.value.user)
  const isLoggedIn = computed(() => _state.value.user !== null)
  const isDemoMode = computed(() => _state.value.user?.provider === 'demo')
  const tier       = computed(() => _state.value.user?.tier ?? 'free')

  // ── Helpers ──────────────────────────────────────────────────────────────
  function _setUser(u: AuthUser | null): void {
    _state.value = {
      user: u,
      loggedInAt: u ? new Date().toISOString() : null,
    }
  }

  // ── Demo login ────────────────────────────────────────────────────────────
  function loginDemo(): void {
    _setUser({ ...DEMO_USER })
  }

  // ── Email / password login ────────────────────────────────────────────────
  async function login(email: string, password: string): Promise<{ error: string | null }> {
    // 1. Demo shortcut — accept demo credentials without Supabase
    if (email === DEMO_USER.email && !isSupabaseConfigured) {
      loginDemo()
      return { error: null }
    }

    // 2. Supabase auth
    if (isSupabaseConfigured) {
      loading.value = true
      try {
        const sb = getSupabase()
        const { data, error } = await sb.auth.signInWithPassword({ email, password })
        if (error) return { error: error.message }
        if (data.user) {
          _setUser({
            id: data.user.id,
            email: data.user.email ?? email,
            displayName: data.user.user_metadata?.display_name as string | undefined,
            avatarUrl: data.user.user_metadata?.avatar_url as string | undefined,
            provider: 'supabase',
            tier: (data.user.user_metadata?.tier as AuthUser['tier']) ?? 'free',
          })
          // Pull cloud data → merge into localStorage so stores get fresh data on next init
          await useCloudSync().pullAll()
        }
        return { error: null }
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Login failed' }
      } finally {
        loading.value = false
      }
    }

    return { error: 'Authentication is not configured. Use Demo mode.' }
  }

  // ── Registration ──────────────────────────────────────────────────────────
  async function register(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) {
      return { error: 'Sign-up requires Supabase to be configured. Use Demo mode for now.' }
    }

    loading.value = true
    try {
      const sb = getSupabase()
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName ?? email.split('@')[0],
          },
        },
      })
      if (error) return { error: error.message }

      // If email confirmation is disabled in Supabase settings, user is already logged in
      if (data.session && data.user) {
        _setUser({
          id: data.user.id,
          email: data.user.email ?? email,
          displayName: displayName ?? email.split('@')[0],
          provider: 'supabase',
          tier: 'free',
        })
        // Push any local data to the new account, then pull to confirm
        const sync = useCloudSync()
        await sync.pushAll(data.user.id)
        await sync.pullAll()
        return { error: null }
      }

      // If email confirmation is enabled, session is null — user must confirm email
      return { error: null } // success — UI will show "check your email"
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Registration failed' }
    } finally {
      loading.value = false
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  async function logout(): Promise<void> {
    if (isSupabaseConfigured && _state.value.user?.provider === 'supabase') {
      try {
        const sb = getSupabase()
        await sb.auth.signOut()
      } catch (err) {
        console.warn('[auth] signOut error:', err)
      }
    }
    _setUser(null)
  }

  // ── Password reset ────────────────────────────────────────────────────────
  async function sendPasswordReset(email: string): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) {
      return { error: 'Not configured.' }
    }
    try {
      const sb = getSupabase()
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}auth/callback`,
      })
      return { error: error?.message ?? null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Failed to send reset email' }
    }
  }

  // ── Init — restore session on app boot ────────────────────────────────────
  async function init(): Promise<void> {
    try {
      // Demo mode: already restored from localStorage via useStorage — nothing to do
      if (_state.value.user?.provider === 'demo') return

      // Supabase: check for existing session (from previous page load / refresh)
      if (isSupabaseConfigured) {
        const sb = getSupabase()
        const { data: { session } } = await sb.auth.getSession()

        if (session?.user) {
          _setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            displayName: session.user.user_metadata?.display_name as string | undefined,
            avatarUrl: session.user.user_metadata?.avatar_url as string | undefined,
            provider: 'supabase',
            tier: (session.user.user_metadata?.tier as AuthUser['tier']) ?? 'free',
          })
        } else {
          // No valid Supabase session — clear stale local state if it was supabase
          if (_state.value.user?.provider === 'supabase') {
            _setUser(null)
          }
        }

        // Keep local state in sync with Supabase auth changes (token refresh, etc.)
        sb.auth.onAuthStateChange((_event, newSession) => {
          if (newSession?.user) {
            _setUser({
              id: newSession.user.id,
              email: newSession.user.email ?? '',
              displayName: newSession.user.user_metadata?.display_name as string | undefined,
              avatarUrl: newSession.user.user_metadata?.avatar_url as string | undefined,
              provider: 'supabase',
              tier: (newSession.user.user_metadata?.tier as AuthUser['tier']) ?? 'free',
            })
          } else if (_event === 'SIGNED_OUT') {
            _setUser(null)
          }
        })
      }
    } catch (err) {
      console.warn('[auth] init error:', err)
    } finally {
      // Always resolve — router guard awaits this regardless of success/failure
      _readyResolve()
    }
  }

  return {
    // State
    user,
    isLoggedIn,
    isDemoMode,
    tier,
    loading,
    isSupabaseConfigured,
    // Resolves when init() finishes — await before checking isLoggedIn in guards
    ready: _readyPromise,
    // Actions
    login,
    loginDemo,
    register,
    logout,
    sendPasswordReset,
    init,
  }
})
