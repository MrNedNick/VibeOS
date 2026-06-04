import type { RouteRecordRaw } from 'vue-router'

export const studioRoutes: RouteRecordRaw[] = [
  {
    path: '/ai',
    component: () => import('./views/StudioView.vue'),
    meta: { fullbleed: true },
  },
]
