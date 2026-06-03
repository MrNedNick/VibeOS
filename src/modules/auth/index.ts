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
  {
    path: '/auth/callback',
    component: () => import('./views/AuthCallbackView.vue'),
    meta: { title: 'Signing in…', auth: 'public' },
  },
  {
    path: '/auth/update-password',
    component: () => import('./views/UpdatePasswordView.vue'),
    meta: { title: 'Set new password', auth: 'public' },
  },
]
