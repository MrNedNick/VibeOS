/**
 * auth.store — behavior when Supabase is NOT configured.
 *
 * (Tests load `.env.local`, so the real flag is true; we mock the service to
 * force the unconfigured branch and assert the demo-only fallbacks + the
 * "configure Supabase" guidance messages.)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/core/services/supabase', () => ({
  isSupabaseConfigured: false,
  getSupabase: () => { throw new Error('not configured') },
}))
vi.mock('@/core/utils/demoSeed', () => ({ seedDemoData: vi.fn(), purgeDemoData: vi.fn() }))

import { useAuthStore } from '@/core/stores/auth.store'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('auth.store — unconfigured fallbacks', () => {
  it('login with the demo email falls back to demo mode', async () => {
    const auth = useAuthStore()
    const res = await auth.login('demo@vibeos.app', 'anything')
    expect(res.error).toBeNull()
    expect(auth.isDemoMode).toBe(true)
  })

  it('login with a real email reports that auth is not configured', async () => {
    const auth = useAuthStore()
    const res = await auth.login('real@example.com', 'password1')
    expect(res.error).toMatch(/not configured/i)
    expect(auth.isLoggedIn).toBe(false)
  })

  it('register reports that sign-up requires Supabase', async () => {
    const auth = useAuthStore()
    const res = await auth.register('new@example.com', 'password1')
    expect(res.error).toMatch(/supabase/i)
    expect(auth.isLoggedIn).toBe(false)
  })

  it('password reset reports not configured', async () => {
    const auth = useAuthStore()
    const res = await auth.sendPasswordReset('x@example.com')
    expect(res.error).toMatch(/not configured/i)
  })
})
