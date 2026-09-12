import type { RouteRecordRaw } from 'vue-router'

const MODULE_ID    = 'analytics'
const MODULE_PATH  = '/analytics'
const MODULE_LABEL = 'Analytics'

export const analyticsRoutes: RouteRecordRaw[] = [
  {
    path: MODULE_PATH,
    component: () => import('./AnalyticsView.vue'),
    meta: { module: MODULE_ID, title: MODULE_LABEL },
  },
]
