import type { RouteRecordRaw } from 'vue-router'

export const financeRoutes: RouteRecordRaw[] = [
  {
    path: '/finance',
    name: 'finance',
    component: () => import('./views/FinanceView.vue'),
  },
]
