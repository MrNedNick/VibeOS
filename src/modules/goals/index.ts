import type { RouteRecordRaw } from 'vue-router'

export const MODULE_ID   = 'goals'
export const MODULE_PATH = '/goals'
export const MODULE_LABEL = 'Goals'

export const goalsRoutes: RouteRecordRaw[] = [
  {
    path: MODULE_PATH,
    component: () => import('./views/GoalsView.vue'),
    meta: { module: MODULE_ID, title: MODULE_LABEL },
  },
  {
    path: `${MODULE_PATH}/:id`,
    component: () => import('./views/GoalDetailView.vue'),
    meta: { module: MODULE_ID, title: MODULE_LABEL },
  },
]
