import type { RouteRecordRaw } from 'vue-router'

export const MODULE_ID    = 'training'
export const MODULE_PATH  = '/training'
export const MODULE_LABEL = 'Training'

export const trainingRoutes: RouteRecordRaw[] = [
  {
    path: MODULE_PATH,
    component: () => import('./TrainingView.vue'),
    meta: { module: MODULE_ID, title: MODULE_LABEL },
  },
]
