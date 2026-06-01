import type { RouteRecordRaw } from 'vue-router'

export const aboutRoutes: RouteRecordRaw[] = [
  {
    path: '/about',
    component: () => import('./views/AboutView.vue'),
  },
]
