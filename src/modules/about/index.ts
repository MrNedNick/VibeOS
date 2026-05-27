import type { RouteRecordRaw } from 'vue-router'
import AboutView from './views/AboutView.vue'

export const aboutRoutes: RouteRecordRaw[] = [
  {
    path: '/about',
    component: AboutView,
  },
]
