import type { RouteRecordRaw } from 'vue-router'

export const MODULE_ID   = 'goals'
export const MODULE_PATH = '/goals'
export const MODULE_LABEL = 'Goals'

export const goalsRoutes: RouteRecordRaw[] = [
  {
    path: MODULE_PATH,
    component: () => import('./GoalsView.vue'),
    meta: { module: MODULE_ID, title: MODULE_LABEL },
  },
]
