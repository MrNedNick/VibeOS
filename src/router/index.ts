import { createRouter, createWebHistory } from 'vue-router'
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

const routes: RouteRecordRaw[] = [
  {
    path: '/welcome',
    component: WelcomeView,
    meta: { title: 'Welcome' },
  },
  // Auth pages — full-page, outside AppLayout
  ...authRoutes,
  {
    path: '/',
    component: AppLayout,
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

// ── Navigation guard ─────────────────────────────────────────────────────
// Lazy import auth store to avoid circular dep during router init
router.beforeEach(async (to) => {
  // Routes with meta.auth = 'guest' redirect logged-in users to dashboard
  if (to.meta.auth === 'guest') {
    const { useAuthStore } = await import('@/core/stores/auth.store')
    const auth = useAuthStore()
    if (auth.isLoggedIn) return '/'
  }

  // Protected routes — currently not enforced (app is local-first open access).
  // When Supabase is live, add meta.auth = 'required' to protected routes here.
})

export default router
