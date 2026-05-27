import type { RouteRecordRaw } from 'vue-router'

export const MODULE_ID    = 'learning'
export const MODULE_PATH  = '/learning'
export const MODULE_LABEL = 'Learning'

export const learningRoutes: RouteRecordRaw[] = [
  {
    path: MODULE_PATH,
    component: () => import('./LearningView.vue'),
    meta: { module: MODULE_ID, title: MODULE_LABEL },
  },
]
