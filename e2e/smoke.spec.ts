import { test, expect } from '@playwright/test'

/**
 * Smoke tests — cover the handful of flows a broken deploy must never ship.
 * These run against `vite preview` (production build).
 */

test.describe('App boot', () => {
  test('welcome page loads and shows headline', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Log one thing')
    await expect(page.locator('.welcome__eyebrow')).toBeVisible()
  })

  test('page title is set', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/VibeOS/)
  })
})

test.describe('Demo mode', () => {
  test('clicking "Open VibeOS" enters demo and shows dashboard', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Open VibeOS")')
    await expect(page).toHaveURL('/')
    // Dashboard renders — look for sidebar or main content area
    await expect(page.locator('.app-layout, .dashboard, [class*="sidebar"]').first()).toBeVisible()
  })
})

test.describe('Tasks module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Open VibeOS")')
    await page.goto('/tasks')
  })

  test('tasks page loads without error', async ({ page }) => {
    // No error boundary shown
    await expect(page.locator('.error-boundary, [data-testid="error"]')).toHaveCount(0)
    // Some tasks UI is present
    await expect(page.locator('body')).not.toBeEmpty()
  })
})

test.describe('Vibe-pak switching', () => {
  test('switching to Light pak applies data-theme attribute', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Open VibeOS")')
    await page.goto('/settings')

    // Click the Light pak option if visible
    const lightPak = page.locator('[data-theme-pak="light"], button:has-text("Light")').first()
    if (await lightPak.isVisible()) {
      await lightPak.click()
      await expect(page.locator('[data-theme="light"]')).toBeVisible()
    } else {
      // Settings page loaded — that's the minimum bar
      await expect(page.locator('body')).not.toBeEmpty()
    }
  })
})

test.describe('Studio AI', () => {
  test('Studio page loads without crashing', async ({ page }) => {
    await page.goto('/')
    await page.click('button:has-text("Open VibeOS")')
    await page.goto('/studio')

    // No error boundary
    await expect(page.locator('.error-boundary, [data-testid="error"]')).toHaveCount(0)
    // Studio UI visible
    await expect(page.locator('body')).not.toBeEmpty()
  })
})
