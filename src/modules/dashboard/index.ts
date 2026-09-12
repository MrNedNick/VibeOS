import type { RouteRecordRaw } from 'vue-router'

const MODULE_ID    = 'dashboard'
const MODULE_LABEL = 'Dashboard'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'dashboard',
    component: () => import('./views/DashboardView.vue'),
    meta: { module: MODULE_ID, title: MODULE_LABEL },
  },
]
