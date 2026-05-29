import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('./views/LoginView.vue'),
    meta: { title: 'Sign in', auth: 'guest' },
  },
  {
    path: '/register',
    component: () => import('./views/RegisterView.vue'),
    meta: { title: 'Create account', auth: 'guest' },
  },
]
