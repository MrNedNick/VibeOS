import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import NotFoundView from '@/modules/not-found/NotFoundView.vue'
import { dashboardRoutes } from '@/modules/dashboard'
import { taskManagerRoutes } from '@/modules/task-manager'
import { docsRoutes } from '@/modules/docs'
import { notesRoutes } from '@/modules/notes'
import { gamesRoutes } from '@/modules/games'
import { snippetsRoutes } from '@/modules/snippets'

const routes: RouteRecordRaw[] = [
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
