import type { RouteRecordRaw } from 'vue-router'

const MODULE_ID    = 'training'
const MODULE_PATH  = '/training'
const MODULE_LABEL = 'Training'

export const trainingRoutes: RouteRecordRaw[] = [
  {
    path: MODULE_PATH,
    component: () => import('./views/TrainingView.vue'),
    meta: { module: MODULE_ID, title: MODULE_LABEL },
  },
  {
    path: `${MODULE_PATH}/plans/:id`,
    component: () => import('./views/PlanDetailView.vue'),
    meta: { module: MODULE_ID, title: MODULE_LABEL },
  },
]
