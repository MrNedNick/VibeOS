import type { RouteRecordRaw } from 'vue-router'

export const MODULE_ID    = 'analytics'
export const MODULE_PATH  = '/analytics'
export const MODULE_LABEL = 'Analytics'

export const analyticsRoutes: RouteRecordRaw[] = [
  {
    path: MODULE_PATH,
    component: () => import('./AnalyticsView.vue'),
    meta: { module: MODULE_ID, title: MODULE_LABEL },
  },
]
