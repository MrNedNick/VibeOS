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
import { useRealtimeSync } from '@/core/composables/useRealtimeSync'
import { useUiStore } from '@/core/stores/ui.store'
import { seedDemoData } from '@/core/utils/demoSeed'

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

  const _adminEmails = (import.meta.env.VITE_ADMIN_EMAILS ?? '')
    .split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean)
  const isAdmin = computed(() => {
    const email = _state.value.user?.email?.toLowerCase()
    return !!email && _adminEmails.includes(email)
  })

  const initials = computed(() => {
    const name = _state.value.user?.displayName
    if (!name) {
      const e = _state.value.user?.email ?? ''
      return e[0]?.toUpperCase() ?? '?'
    }
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    return (parts[0]?.[0] ?? '?').toUpperCase()
  })

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
    seedDemoData()
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
          // Pull cloud data → merge into localStorage, notify stores via syncBus
          await useCloudSync().pullAll()
          useRealtimeSync().subscribe(data.user.id)
          useUiStore().syncSettingsFromCloud()
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
    useRealtimeSync().unsubscribe()
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

  // ── Update display name ───────────────────────────────────────────────────
  async function updateDisplayName(name: string): Promise<{ error: string | null }> {
    if (isDemoMode.value) return { error: 'Not available in demo mode.' }
    if (!isSupabaseConfigured) return { error: 'Not configured.' }

    loading.value = true
    try {
      const sb = getSupabase()
      const { data, error } = await sb.auth.updateUser({ data: { display_name: name } })
      if (error) return { error: error.message }
      if (data.user && _state.value.user) {
        _state.value = { ..._state.value, user: { ..._state.value.user, displayName: name } }
      }
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Update failed' }
    } finally {
      loading.value = false
    }
  }

  // ── Update password ────────────────────────────────────────────────────────
  async function updatePassword(newPassword: string): Promise<{ error: string | null }> {
    if (isDemoMode.value) return { error: 'Not available in demo mode.' }
    if (!isSupabaseConfigured) return { error: 'Not configured.' }

    loading.value = true
    try {
      const sb = getSupabase()
      const { error } = await sb.auth.updateUser({ password: newPassword })
      if (error) return { error: error.message }
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Update failed' }
    } finally {
      loading.value = false
    }
  }

  // ── Avatar upload ─────────────────────────────────────────────────────────
  async function resizeImage(file: File, maxPx: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const blobUrl = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(blobUrl)
        const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1)
        const w = Math.round(img.width * ratio)
        const h = Math.round(img.height * ratio)
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        canvas.toBlob(
          blob => (blob ? resolve(blob) : reject(new Error('Resize failed'))),
          'image/jpeg', 0.88,
        )
      }
      img.onerror = () => { URL.revokeObjectURL(blobUrl); reject(new Error('Image load failed')) }
      img.src = blobUrl
    })
  }

  async function updateAvatar(file: File): Promise<{ error: string | null; url?: string }> {
    if (isDemoMode.value) return { error: 'Not available in demo mode.' }
    if (!isSupabaseConfigured) return { error: 'Not configured.' }
    const u = _state.value.user
    if (!u) return { error: 'Not logged in.' }

    loading.value = true
    try {
      const sb = getSupabase()

      // Resize to max 256×256 before upload
      const blob = await resizeImage(file, 256)
      const path = `${u.id}/avatar.jpg`

      // Ensure bucket exists (silently ignore if already there)
      await sb.storage.createBucket('avatars', { public: true }).catch(() => {})

      const { error: upErr } = await sb.storage.from('avatars').upload(path, blob, {
        upsert: true,
        contentType: 'image/jpeg',
      })
      if (upErr) return { error: upErr.message }

      // Cache-bust by appending timestamp
      const { data } = sb.storage.from('avatars').getPublicUrl(path)
      const avatarUrl = `${data.publicUrl}?v=${Date.now()}`

      const { error: metaErr } = await sb.auth.updateUser({ data: { avatar_url: avatarUrl } })
      if (metaErr) return { error: metaErr.message }

      if (_state.value.user) {
        _state.value = { ..._state.value, user: { ..._state.value.user, avatarUrl } }
      }
      return { error: null, url: avatarUrl }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Upload failed' }
    } finally {
      loading.value = false
    }
  }

  // ── Email change (sends confirmation to both addresses) ────────────────────
  async function requestEmailChange(newEmail: string): Promise<{ error: string | null }> {
    if (isDemoMode.value) return { error: 'Not available in demo mode.' }
    if (!isSupabaseConfigured) return { error: 'Not configured.' }
    loading.value = true
    try {
      const sb = getSupabase()
      const { error } = await sb.auth.updateUser(
        { email: newEmail },
        { emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}auth/callback` },
      )
      if (error) return { error: error.message }
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Update failed' }
    } finally {
      loading.value = false
    }
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
      // Demo mode: already restored from localStorage via useStorage — seed data if needed
      if (_state.value.user?.provider === 'demo') {
        seedDemoData()
        return
      }

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
          // Background pull to catch any changes from other devices; subscribe real-time
          useCloudSync().pullAll().catch(console.warn)
          useRealtimeSync().subscribe(session.user.id)
        } else {
          // No valid Supabase session — clear stale local state if it was supabase
          if (_state.value.user?.provider === 'supabase') {
            _setUser(null)
          }
        }

        // Keep local state in sync with Supabase auth changes (token refresh, etc.)
        sb.auth.onAuthStateChange((_event, newSession) => {
          // A local demo session is independent of Supabase — never let a
          // Supabase auth event (SIGNED_OUT/TOKEN_REFRESHED with no session,
          // fired from another tab or a stale token) wipe the demo user.
          if (_state.value.user?.provider === 'demo') return
          if (newSession?.user) {
            _setUser({
              id: newSession.user.id,
              email: newSession.user.email ?? '',
              displayName: newSession.user.user_metadata?.display_name as string | undefined,
              avatarUrl: newSession.user.user_metadata?.avatar_url as string | undefined,
              provider: 'supabase',
              tier: (newSession.user.user_metadata?.tier as AuthUser['tier']) ?? 'free',
            })
          } else if (_event === 'SIGNED_OUT' || _event === 'TOKEN_REFRESHED') {
            // TOKEN_REFRESHED with no session = refresh failed → force logout
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
    isAdmin,
    initials,
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
    requestEmailChange,
    updateAvatar,
    updateDisplayName,
    updatePassword,
    init,
  }
})
