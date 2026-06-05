/**
 * auth.store — Supabase-configured paths + demo-mode behavior.
 *
 * The Supabase client + sync composables are mocked so we can drive
 * login/register/logout/session deterministically. The most important guard
 * here is demo-mode immunity: a local demo session must survive Supabase auth
 * events (the welcome funnel sends every visitor into demo mode).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

type AuthCb = (event: string, session: unknown) => void

const h = vi.hoisted(() => {
  let authCb: AuthCb | null = null
  const auth = {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    updateUser: vi.fn(),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn((cb: AuthCb) => {
      authCb = cb
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    }),
  }
  return {
    client: { auth },
    fireAuth: (event: string, session: unknown) => authCb?.(event, session),
    pullAll: vi.fn().mockResolvedValue(undefined),
    pushAll: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  }
})

vi.mock('@/core/services/supabase', () => ({
  isSupabaseConfigured: true,
  getSupabase: () => h.client,
}))
vi.mock('@/core/composables/useCloudSync', () => ({
  useCloudSync: () => ({ pullAll: h.pullAll, pushAll: h.pushAll }),
}))
vi.mock('@/core/composables/useRealtimeSync', () => ({
  useRealtimeSync: () => ({ subscribe: h.subscribe, unsubscribe: h.unsubscribe }),
}))
vi.mock('@/core/stores/ui.store', () => ({
  useUiStore: () => ({ syncSettingsFromCloud: vi.fn() }),
}))
vi.mock('@/core/utils/demoSeed', () => ({ seedDemoData: vi.fn() }))

import { useAuthStore } from '@/core/stores/auth.store'

const SB_USER = {
  id: 'u-1',
  email: 'real@example.com',
  user_metadata: { display_name: 'Real Person', tier: 'free' },
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.clearAllMocks()
  h.client.auth.getSession.mockResolvedValue({ data: { session: null } })
  h.client.auth.signOut.mockResolvedValue({ error: null })
})

describe('auth.store — demo mode', () => {
  it('loginDemo sets a logged-in demo user', () => {
    const auth = useAuthStore()
    expect(auth.isLoggedIn).toBe(false)
    auth.loginDemo()
    expect(auth.isLoggedIn).toBe(true)
    expect(auth.isDemoMode).toBe(true)
    expect(auth.tier).toBe('demo')
    expect(auth.user?.email).toBe('demo@vibeos.app')
  })

  it('initials derive from the display name', () => {
    const auth = useAuthStore()
    auth.loginDemo()
    expect(auth.initials).toBe('DU') // "Demo User"
  })

  it('isAdmin is false for the demo user', () => {
    const auth = useAuthStore()
    auth.loginDemo()
    expect(auth.isAdmin).toBe(false)
  })

  it('profile mutations are blocked in demo mode', async () => {
    const auth = useAuthStore()
    auth.loginDemo()
    expect((await auth.updateDisplayName('X')).error).toMatch(/demo/i)
    expect((await auth.updatePassword('secret123')).error).toMatch(/demo/i)
    expect((await auth.requestEmailChange('x@y.com')).error).toMatch(/demo/i)
  })

  it('logout from demo mode clears the user without calling Supabase signOut', async () => {
    const auth = useAuthStore()
    auth.loginDemo()
    await auth.logout()
    expect(auth.isLoggedIn).toBe(false)
    expect(h.client.auth.signOut).not.toHaveBeenCalled()
  })
})

describe('auth.store — Supabase login/register/logout', () => {
  it('login success sets a supabase user and pulls cloud data', async () => {
    h.client.auth.signInWithPassword.mockResolvedValue({ data: { user: SB_USER }, error: null })
    const auth = useAuthStore()
    const res = await auth.login('real@example.com', 'password1')
    expect(res.error).toBeNull()
    expect(auth.isLoggedIn).toBe(true)
    expect(auth.isDemoMode).toBe(false)
    expect(auth.user?.displayName).toBe('Real Person')
    expect(h.pullAll).toHaveBeenCalled()
    expect(h.subscribe).toHaveBeenCalledWith('u-1')
  })

  it('login failure returns the error message and stays logged out', async () => {
    h.client.auth.signInWithPassword.mockResolvedValue({ data: {}, error: { message: 'Invalid login credentials' } })
    const auth = useAuthStore()
    const res = await auth.login('real@example.com', 'wrong')
    expect(res.error).toBe('Invalid login credentials')
    expect(auth.isLoggedIn).toBe(false)
  })

  it('register with an immediate session logs in and pushes local data', async () => {
    h.client.auth.signUp.mockResolvedValue({
      data: { user: { id: 'u-2', email: 'new@example.com' }, session: { access_token: 't' } },
      error: null,
    })
    const auth = useAuthStore()
    const res = await auth.register('new@example.com', 'password1', 'New User')
    expect(res.error).toBeNull()
    expect(auth.isLoggedIn).toBe(true)
    expect(h.pushAll).toHaveBeenCalledWith('u-2')
    expect(h.pullAll).toHaveBeenCalled()
  })

  it('register requiring email confirmation does not log in', async () => {
    h.client.auth.signUp.mockResolvedValue({ data: { user: { id: 'u-3' }, session: null }, error: null })
    const auth = useAuthStore()
    const res = await auth.register('confirm@example.com', 'password1')
    expect(res.error).toBeNull()
    expect(auth.isLoggedIn).toBe(false)
  })

  it('logout for a supabase user calls signOut and clears state', async () => {
    h.client.auth.signInWithPassword.mockResolvedValue({ data: { user: SB_USER }, error: null })
    const auth = useAuthStore()
    await auth.login('real@example.com', 'password1')
    await auth.logout()
    expect(h.client.auth.signOut).toHaveBeenCalled()
    expect(h.unsubscribe).toHaveBeenCalled()
    expect(auth.isLoggedIn).toBe(false)
  })

  it('updateDisplayName updates local state on success', async () => {
    h.client.auth.signInWithPassword.mockResolvedValue({ data: { user: SB_USER }, error: null })
    h.client.auth.updateUser.mockResolvedValue({ data: { user: SB_USER }, error: null })
    const auth = useAuthStore()
    await auth.login('real@example.com', 'password1')
    const res = await auth.updateDisplayName('Renamed')
    expect(res.error).toBeNull()
    expect(auth.user?.displayName).toBe('Renamed')
  })
})

describe('auth.store — init + session restore', () => {
  it('restores a supabase user from an existing session', async () => {
    h.client.auth.getSession.mockResolvedValue({ data: { session: { user: SB_USER } } })
    const auth = useAuthStore()
    await auth.init()
    expect(auth.isLoggedIn).toBe(true)
    expect(auth.user?.id).toBe('u-1')
    expect(h.subscribe).toHaveBeenCalledWith('u-1')
  })

  it('keeps the user logged out when there is no session', async () => {
    const auth = useAuthStore()
    await auth.init()
    expect(auth.isLoggedIn).toBe(false)
  })
})

describe('auth.store — onAuthStateChange demo immunity', () => {
  it('a Supabase SIGNED_OUT event does NOT wipe an active demo session', async () => {
    const auth = useAuthStore()
    await auth.init()        // registers the listener while logged out
    auth.loginDemo()         // then the user enters demo mode
    expect(auth.isDemoMode).toBe(true)

    h.fireAuth('SIGNED_OUT', null)
    h.fireAuth('TOKEN_REFRESHED', null)

    expect(auth.isLoggedIn).toBe(true)
    expect(auth.isDemoMode).toBe(true)
  })

  it('a Supabase SIGNED_OUT event clears a real supabase session', async () => {
    h.client.auth.getSession.mockResolvedValue({ data: { session: { user: SB_USER } } })
    const auth = useAuthStore()
    await auth.init()
    expect(auth.isLoggedIn).toBe(true)

    h.fireAuth('SIGNED_OUT', null)
    expect(auth.isLoggedIn).toBe(false)
  })
})
