import type { RouteRecordRaw } from 'vue-router'

const MODULE_ID    = 'task-manager'
const MODULE_LABEL = 'Task Manager'

export const taskManagerRoutes: RouteRecordRaw[] = [
  {
    path: '/tasks',
    name: 'task-manager.list',
    component: () => import('./views/TaskManagerView.vue'),
    meta: {
      module: MODULE_ID,
      title: MODULE_LABEL,
    },
  },
]
