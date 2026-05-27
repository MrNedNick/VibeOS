import type { RouteRecordRaw } from 'vue-router'

export const habitsRoutes: RouteRecordRaw[] = [
  {
    path: '/habits',
    name: 'habits',
    component: () => import('./views/HabitsView.vue'),
  },
]
