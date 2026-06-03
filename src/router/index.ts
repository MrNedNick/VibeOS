import { createRouter, createWebHistory, isNavigationFailure } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import NotFoundView from '@/modules/not-found/NotFoundView.vue'
import WelcomeView from '@/modules/welcome/WelcomeView.vue'
import { dashboardRoutes } from '@/modules/dashboard'
import { taskManagerRoutes } from '@/modules/task-manager'
import { docsRoutes } from '@/modules/docs'
import { notesRoutes } from '@/modules/notes'
import { gamesRoutes } from '@/modules/games'
import { habitsRoutes } from '@/modules/habits'
import { kanbanRoutes } from '@/modules/kanban'
import { studioRoutes } from '@/modules/ai-playground'
import { settingsRoutes } from '@/modules/settings'
import { aboutRoutes } from '@/modules/about'
import { goalsRoutes } from '@/modules/goals'
import { learningRoutes } from '@/modules/learning'
import { trainingRoutes } from '@/modules/training'
import { analyticsRoutes } from '@/modules/analytics'
import { calendarRoutes } from '@/modules/calendar'
import { authRoutes } from '@/modules/auth'
import { financeRoutes } from '@/modules/finance'
import { useAuthStore } from '@/core/stores/auth.store'

const routes: RouteRecordRaw[] = [
  {
    path: '/welcome',
    component: WelcomeView,
    meta: { title: 'Welcome', auth: 'guest' },
  },
  // Auth pages — full-page, outside AppLayout
  ...authRoutes,
  {
    path: '/',
    component: AppLayout,
    meta: { auth: 'required' },
    children: [
      ...dashboardRoutes,
      ...taskManagerRoutes,
      ...docsRoutes,
      ...notesRoutes,
      ...gamesRoutes,
      ...habitsRoutes,
      ...kanbanRoutes,
      ...studioRoutes,
      ...settingsRoutes,
      ...aboutRoutes,
      ...goalsRoutes,
      ...learningRoutes,
      ...trainingRoutes,
      ...analyticsRoutes,
      ...calendarRoutes,
      ...financeRoutes,
      { path: '/:pathMatch(.*)*', component: NotFoundView },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// ── Global navigation error handler ──────────────────────────────────────
// Swallows expected failures (duplicated nav, cancelled guards, redirects)
// so they never reach Vue's error boundary and freeze the UI.
router.onError((err) => {
  if (isNavigationFailure(err)) return
  console.error('[router]', err)
})

// ── Navigation guard ─────────────────────────────────────────────────────
router.beforeEach(async (to) => {
  const needsAuth  = to.matched.some(r => r.meta.auth === 'required')
  const isGuestOnly = to.matched.some(r => r.meta.auth === 'guest')
  if (!needsAuth && !isGuestOnly) return

  // useAuthStore() is safe here: Pinia is installed before any navigation fires.
  // Static import avoids a dynamic-import microtask on every navigation.
  const auth = useAuthStore()

  // Wait for Supabase session check to finish before deciding
  await auth.ready

  if (needsAuth && !auth.isLoggedIn) return '/welcome'
  // Demo users can access /login and /register to create a real account
  if (isGuestOnly && auth.isLoggedIn && !auth.isDemoMode) return '/'
})

export default router
