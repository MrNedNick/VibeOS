import type { RouteRecordRaw } from 'vue-router'
import SettingsView from './views/SettingsView.vue'

export const settingsRoutes: RouteRecordRaw[] = [
  {
    path: '/settings',
    component: SettingsView,
  },
]
