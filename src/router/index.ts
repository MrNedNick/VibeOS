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
import { snippetsRoutes } from '@/modules/snippets'
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

const routes: RouteRecordRaw[] = [
  {
    path: '/welcome',
    component: WelcomeView,
    meta: { title: 'Welcome' },
  },
  {
    path: '/',
    component: AppLayout,
    children: [
      ...dashboardRoutes,
      ...taskManagerRoutes,
      ...docsRoutes,
      ...notesRoutes,
      ...gamesRoutes,
      ...snippetsRoutes,
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
      { path: '/:pathMatch(.*)*', component: NotFoundView },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

export default router
