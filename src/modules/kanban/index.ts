import type { RouteRecordRaw } from 'vue-router'
import BoardView from './views/BoardView.vue'

export const kanbanRoutes: RouteRecordRaw[] = [
  {
    path: '/kanban',
    component: BoardView,
  },
]
