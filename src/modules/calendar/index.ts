import type { RouteRecordRaw } from 'vue-router'

export const MODULE_ID    = 'calendar'
export const MODULE_PATH  = '/calendar'
export const MODULE_LABEL = 'Calendar'

export const calendarRoutes: RouteRecordRaw[] = [
  {
    path: MODULE_PATH,
    component: () => import('./CalendarView.vue'),
    meta: { module: MODULE_ID, title: MODULE_LABEL },
  },
]
