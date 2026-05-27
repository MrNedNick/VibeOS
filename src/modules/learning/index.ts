import type { RouteRecordRaw } from 'vue-router'

export const MODULE_ID    = 'learning'
export const MODULE_PATH  = '/learning'
export const MODULE_LABEL = 'Learning'

export const learningRoutes: RouteRecordRaw[] = [
  {
    path: MODULE_PATH,
    component: () => import('./views/LearningView.vue'),
    meta: { module: MODULE_ID, title: MODULE_LABEL },
  },
  {
    path: `${MODULE_PATH}/plans/:id`,
    component: () => import('./views/PlanDetailView.vue'),
    meta: { module: MODULE_ID, title: MODULE_LABEL },
  },
]
