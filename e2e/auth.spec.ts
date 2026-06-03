import { test, expect, type Page } from '@playwright/test'

/**
 * S20 T4 — Auth Excellence: end-to-end auth test suite
 *
 * 8 core scenarios:
 * 1. Valid login → redirect to /                    (requires Supabase env vars)
 * 2. Invalid credentials → error shown             (requires Supabase env vars)
 * 3. Rate limit → cooldown displayed                (requires Supabase env vars)
 * 4. Register → confirmation pending state          (requires Supabase env vars)
 * 5. Register existing email → error                (requires Supabase env vars)
 * 6. Password reset email sent                      (requires Supabase env vars)
 * 7. Demo mode login → dashboard                    (always runs)
 * 8. Logout → redirect to /welcome                  (always runs)
 *
 * Additional (always run):
 *  - Per-field validation errors (blur + submit)
 *  - Router guards: guest → /welcome, auth user → redirect from /login
 *  - Auth callback page renders correctly
 *  - Forgot password form UI
 */

const SUPABASE_CONFIGURED =
  !!process.env.VITE_SUPABASE_URL && !!process.env.VITE_SUPABASE_ANON_KEY

/** Clear persisted auth state — must navigate to app page first */
async function clearAuth(page: Page) {
  // Make sure we're on the app origin before touching localStorage
  if (!page.url().includes('localhost')) {
    await page.goto('/welcome')
  }
  await page.evaluate(() => {
    try {
      const keys = Object.keys(localStorage)
      for (const key of keys) {
        if (key.includes('auth') || key.includes('supabase')) {
          localStorage.removeItem(key)
        }
      }
    } catch { /* ignore cross-origin errors */ }
  })
}

/** Enter demo mode and confirm landing on dashboard */
async function enterDemoMode(page: Page) {
  await page.goto('/welcome')
  await clearAuth(page)
  await page.goto('/login')
  await page.click('button:has-text("Try demo")')
  await expect(page).toHaveURL('/')
}

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 7 — Demo mode login
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Scenario 7 — Demo mode login', () => {
  test('clicking "Try demo" enters demo mode and shows dashboard', async ({ page }) => {
    await page.goto('/welcome')
    await clearAuth(page)
    await page.goto('/login')

    await page.click('button:has-text("Try demo")')

    // Should redirect to /
    await expect(page).toHaveURL('/')
    // App shell renders
    await expect(page.locator('.app-layout, .app-header').first()).toBeVisible()
  })

  test('demo mode shows demo chip in header', async ({ page }) => {
    await enterDemoMode(page)

    // Demo chip is visible in header (CSS transforms text to uppercase but DOM has "Sign Up Free")
    await expect(page.locator('.header-demo-chip')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 8 — Logout → /welcome
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Scenario 8 — Logout → /welcome', () => {
  test('demo user exits demo mode and lands on /welcome', async ({ page }) => {
    await enterDemoMode(page)

    // Navigate to settings where Exit demo lives
    await page.goto('/settings')

    // Find and click Exit demo button
    await expect(page.locator('button:has-text("Exit demo")')).toBeVisible({ timeout: 5000 })
    await page.click('button:has-text("Exit demo")')

    await expect(page).toHaveURL('/welcome')
    await expect(page.locator('h1')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Field validation — Login form
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Login form — field validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/welcome')
    await clearAuth(page)
    await page.goto('/login')
  })

  test('email shows required error after blur when empty', async ({ page }) => {
    await page.locator('input[type="email"]').focus()
    await page.locator('input[type="email"]').blur()

    const error = page.locator('.auth-field-hint--error').first()
    await expect(error).toBeVisible({ timeout: 3000 })
    await expect(error).toContainText(/required/i)
  })

  test('email shows invalid format error on blur', async ({ page }) => {
    await page.fill('input[type="email"]', 'notanemail')
    await page.locator('input[type="email"]').blur()

    const error = page.locator('.auth-field-hint--error').first()
    await expect(error).toBeVisible({ timeout: 3000 })
    await expect(error).toContainText(/invalid|email/i)
  })

  test('password shows min-8-chars error on blur with short value', async ({ page }) => {
    // Fill valid email first so only password error shows
    await page.fill('input[type="email"]', 'test@example.com')
    await page.locator('input[type="email"]').blur()

    const pwdInput = page.locator('input[type="password"]').first()
    await pwdInput.fill('short')
    await pwdInput.blur()

    const error = page.locator('.auth-field-hint--error').last()
    await expect(error).toBeVisible({ timeout: 3000 })
    await expect(error).toContainText(/8|characters|min/i)
  })

  test('Enter key triggers validation on empty form', async ({ page }) => {
    // Focus email and press Enter to submit empty form
    await page.locator('input[type="email"]').focus()
    await page.keyboard.press('Enter')

    // At least one validation error should appear
    await expect(page.locator('.auth-field-hint--error').first()).toBeVisible({ timeout: 3000 })
  })

  test('Sign in button is disabled with empty fields', async ({ page }) => {
    // The submit button should be disabled on empty form (canSubmit = false)
    const signInBtn = page.locator('button').filter({ hasText: /^Sign in$/ }).first()
    await expect(signInBtn).toBeDisabled()
  })

  test('Sign in button enables with valid email + password', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')

    const signInBtn = page.locator('button').filter({ hasText: /^Sign in$/ }).first()
    await expect(signInBtn).toBeEnabled()
  })

  test('submitting bad credentials shows an inline server error', async ({ page }) => {
    await page.fill('input[type="email"]', 'bad@example.com')
    await page.fill('input[type="password"]', 'wrongpassword1')
    await page.locator('button').filter({ hasText: /^Sign in$/ }).first().click()

    // Any error — "Invalid credentials", "not configured", or Supabase message
    await expect(page.locator('.auth-error')).toBeVisible({ timeout: 8000 })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Field validation — Register form
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Register form — field validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/welcome')
    await clearAuth(page)
    await page.goto('/register')
  })

  test('password shows min-length error on blur', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    await page.locator('input[type="email"]').blur()

    const pwdFields = page.locator('input[type="password"]')
    await pwdFields.first().fill('short')
    await pwdFields.first().blur()

    const error = page.locator('.auth-field-hint--error').first()
    await expect(error).toBeVisible({ timeout: 3000 })
    await expect(error).toContainText(/8|characters|min/i)
  })

  test("confirm password shows mismatch error when passwords don't match", async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com')
    const pwdFields = page.locator('input[type="password"]')
    await pwdFields.nth(0).fill('ValidPass123!')
    await pwdFields.nth(1).fill('DifferentPass456!')
    await pwdFields.nth(1).blur()

    const lastError = page.locator('.auth-field-hint--error').last()
    await expect(lastError).toBeVisible({ timeout: 3000 })
    await expect(lastError).toContainText(/match/i)
  })

  test('submitting register form with bad email shows server error', async ({ page }) => {
    // Use an obviously invalid Supabase domain that won't succeed
    await page.fill('input[type="email"]', 'notreal@fake.invalid')
    const pwdFields = page.locator('input[type="password"]')
    await pwdFields.nth(0).fill('ValidPass123!')
    await pwdFields.nth(1).fill('ValidPass123!')

    // Submit via Enter
    await pwdFields.nth(1).press('Enter')

    // Either Supabase error or "not configured" — some .auth-error should appear
    await expect(page.locator('.auth-error')).toBeVisible({ timeout: 8000 })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 6a — Router guards: guest access
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Scenario 6a — Router guards: guest access to protected routes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/welcome')
    await clearAuth(page)
  })

  test('guest visiting /tasks is redirected to /welcome', async ({ page }) => {
    await page.goto('/tasks')
    await expect(page).toHaveURL('/welcome')
  })

  test('guest visiting /habits is redirected to /welcome', async ({ page }) => {
    await page.goto('/habits')
    await expect(page).toHaveURL('/welcome')
  })

  test('guest visiting /settings is redirected to /welcome', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL('/welcome')
  })

  test('guest visiting / (dashboard) is redirected to /welcome', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/welcome')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 6b — Router guards: authenticated user redirected from auth pages
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Scenario 6b — Router guards: auth user redirect', () => {
  test('demo user visiting /login is redirected to /', async ({ page }) => {
    await enterDemoMode(page)
    await page.goto('/login')
    await expect(page).toHaveURL('/')
  })

  test('demo user visiting /register is redirected to /', async ({ page }) => {
    await enterDemoMode(page)
    await page.goto('/register')
    await expect(page).toHaveURL('/')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 8b — Auth callback page
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Scenario 8b — Auth callback page renders', () => {
  test('/auth/callback shows loading or error state — not 404', async ({ page }) => {
    await page.goto('/welcome')
    await clearAuth(page)
    await page.goto('/auth/callback')

    // Should render the callback component (not a 404 blank)
    await expect(page.locator('.callback-page')).toBeVisible({ timeout: 5000 })

    // Without a valid Supabase token: shows error state after timeout
    // With a valid token: it redirects to / (tested in Supabase scenarios)
    const anyState = page.locator('.callback-card--error, .callback-card')
    await expect(anyState.first()).toBeVisible({ timeout: 8000 })
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Forgot password form UI
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Forgot password form UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/welcome')
    await clearAuth(page)
    await page.goto('/login')
  })

  test('forgot password link shows reset form (when Supabase configured)', async ({ page }) => {
    // Forgot password button only renders when isSupabaseConfigured
    const forgotBtn = page.locator('button:has-text("Forgot password?")')
    const isVisible = await forgotBtn.isVisible().catch(() => false)

    if (!isVisible) {
      // Expected: Supabase not configured — forgot password is hidden
      test.skip()
      return
    }

    await forgotBtn.click()
    await expect(page.locator('text=Reset password')).toBeVisible()
    await expect(page.locator('button:has-text("Send reset link")')).toBeVisible()
  })

  test('"Back to sign in" returns to login form', async ({ page }) => {
    const forgotBtn = page.locator('button:has-text("Forgot password?")')
    const isVisible = await forgotBtn.isVisible().catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }

    await forgotBtn.click()
    await expect(page.locator('text=Reset password')).toBeVisible()

    await page.click('button:has-text("Back to sign in")')
    await expect(page.locator('h1:has-text("Sign in")')).toBeVisible()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// Supabase-required scenarios (skipped without env vars)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Scenario 1 — Valid login (requires Supabase)', () => {
  test.skip(!SUPABASE_CONFIGURED, 'Set VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY + TEST_USER_EMAIL + TEST_USER_PASSWORD')

  test('valid credentials → redirect to dashboard', async ({ page }) => {
    await page.goto('/welcome')
    await clearAuth(page)
    await page.goto('/login')

    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL!)
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD!)
    await page.locator('button').filter({ hasText: /^Sign in$/ }).click()

    await expect(page).toHaveURL('/', { timeout: 10_000 })
    await expect(page.locator('.app-layout')).toBeVisible()
  })
})

test.describe('Scenario 2 — Invalid credentials (requires Supabase)', () => {
  test.skip(!SUPABASE_CONFIGURED, 'Requires Supabase configuration')

  test('wrong password shows server error inline, button stays active', async ({ page }) => {
    await page.goto('/welcome')
    await clearAuth(page)
    await page.goto('/login')

    await page.fill('input[type="email"]', 'existing@example.com')
    await page.fill('input[type="password"]', 'definitelywrong999')
    await page.locator('button').filter({ hasText: /^Sign in$/ }).click()

    await expect(page.locator('.auth-error')).toBeVisible({ timeout: 8_000 })
    // Button should remain enabled (not permanently disabled after error)
    await expect(page.locator('button').filter({ hasText: /^Sign in$/ })).toBeEnabled()
  })
})

test.describe('Scenario 3 — Rate limit cooldown (requires Supabase)', () => {
  test.skip(!SUPABASE_CONFIGURED, 'Requires Supabase configuration')

  test('too many attempts shows "Try again in Xs" cooldown', async ({ page }) => {
    await page.goto('/welcome')
    await clearAuth(page)
    await page.goto('/login')

    for (let i = 0; i < 8; i++) {
      await page.fill('input[type="email"]', `attempt${i}@example.com`)
      await page.fill('input[type="password"]', 'wrongpassword')
      const btn = page.locator('button').filter({ hasText: /Sign in|Try again/ }).first()
      if (await btn.isEnabled()) {
        await btn.click()
        await page.waitForTimeout(300)
      }
    }

    // Should show cooldown message
    await expect(
      page.locator('.auth-error:has-text("Too many"), button:has-text("Try again in")').first()
    ).toBeVisible({ timeout: 12_000 })
  })
})

test.describe('Scenario 4 — Register confirmation pending (requires Supabase)', () => {
  test.skip(!SUPABASE_CONFIGURED, 'Requires Supabase configuration')

  test('new account shows "check your email" state', async ({ page }) => {
    await page.goto('/welcome')
    await clearAuth(page)
    await page.goto('/register')

    const uniqueEmail = `test+${Date.now()}@playwright.test`
    await page.fill('input[type="email"]', uniqueEmail)
    const pwdFields = page.locator('input[type="password"]')
    await pwdFields.nth(0).fill('SecureTest123!')
    await pwdFields.nth(1).fill('SecureTest123!')

    // Click Create account button
    const submitBtn = page.locator('button').filter({ hasText: /Create account|Sign up|Register/ }).first()
    await submitBtn.click()

    await expect(
      page.locator('text=Check your email, text=confirmation, text=verify').first()
    ).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('Scenario 5 — Register existing email (requires Supabase)', () => {
  test.skip(!SUPABASE_CONFIGURED, 'Requires Supabase configuration')

  test('registering with an existing email shows error', async ({ page }) => {
    await page.goto('/welcome')
    await clearAuth(page)
    await page.goto('/register')

    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL!)
    const pwdFields = page.locator('input[type="password"]')
    await pwdFields.nth(0).fill('SecureTest123!')
    await pwdFields.nth(1).fill('SecureTest123!')

    const submitBtn = page.locator('button').filter({ hasText: /Create account|Sign up|Register/ }).first()
    await submitBtn.click()

    await expect(page.locator('.auth-error')).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('Scenario 6 — Password reset email sent (requires Supabase)', () => {
  test.skip(!SUPABASE_CONFIGURED, 'Requires Supabase configuration')

  test('submitting forgot password shows email-sent confirmation', async ({ page }) => {
    await page.goto('/welcome')
    await clearAuth(page)
    await page.goto('/login')

    await page.click('button:has-text("Forgot password?")')
    await expect(page.locator('text=Reset password')).toBeVisible()

    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL!)
    await page.click('button:has-text("Send reset link")')

    await expect(
      page.locator('.auth-success, text=Check your email').first()
    ).toBeVisible({ timeout: 8_000 })
  })
})
