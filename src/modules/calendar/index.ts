import type { RouteRecordRaw } from 'vue-router'

const MODULE_ID    = 'calendar'
const MODULE_PATH  = '/calendar'
const MODULE_LABEL = 'Calendar'

export const calendarRoutes: RouteRecordRaw[] = [
  {
    path: MODULE_PATH,
    component: () => import('./CalendarView.vue'),
    meta: { module: MODULE_ID, title: MODULE_LABEL },
  },
]
