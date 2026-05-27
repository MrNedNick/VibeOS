import type { RouteRecordRaw } from 'vue-router'
import StudioView from './views/StudioView.vue'

export const studioRoutes: RouteRecordRaw[] = [
  {
    path: '/ai',
    component: StudioView,
  },
]
