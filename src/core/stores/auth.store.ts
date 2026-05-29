import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@/core/composables/useStorage'

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

// ── Demo seed ─────────────────────────────────────────────────────────────
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
  const _state = useStorage<AuthState>(STATE_KEY, { user: null, loggedInAt: null })

  // Derived
  const user       = computed(() => _state.value.user)
  const isLoggedIn = computed(() => _state.value.user !== null)
  const isDemoMode = computed(() => _state.value.user?.provider === 'demo')
  const tier       = computed(() => _state.value.user?.tier ?? 'free')

  // ── Demo login ───────────────────────────────────────────────────────
  function loginDemo(): void {
    _state.value = {
      user: { ...DEMO_USER },
      loggedInAt: new Date().toISOString(),
    }
  }

  // ── Email/password login stub (Supabase wired up in S3) ───────────────
  async function login(_email: string, _password: string): Promise<{ error: string | null }> {
    // TODO: replace with Supabase auth when project is configured
    // For now, accept demo credentials only
    if (_email === DEMO_USER.email) {
      loginDemo()
      return { error: null }
    }
    return { error: 'Supabase authentication is not yet configured. Use Demo mode.' }
  }

  // ── Registration stub ─────────────────────────────────────────────────
  async function register(_email: string, _password: string, _displayName?: string): Promise<{ error: string | null }> {
    // TODO: replace with Supabase auth when project is configured
    return { error: 'Sign-up requires Supabase to be configured. Use Demo mode for now.' }
  }

  // ── Logout ────────────────────────────────────────────────────────────
  function logout(): void {
    _state.value = { user: null, loggedInAt: null }
  }

  // ── Init (called from main.ts to restore session) ─────────────────────
  function init(): void {
    // Session already restored from localStorage via useStorage.
    // In the future: verify Supabase session here.
  }

  return {
    user,
    isLoggedIn,
    isDemoMode,
    tier,
    login,
    loginDemo,
    register,
    logout,
    init,
  }
})
