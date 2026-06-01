import type { RouteRecordRaw } from 'vue-router'

export const kanbanRoutes: RouteRecordRaw[] = [
  {
    path: '/kanban',
    component: () => import('./views/BoardView.vue'),
  },
]
