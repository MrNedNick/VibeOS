import type { RouteRecordRaw } from 'vue-router'

export const notesRoutes: RouteRecordRaw[] = [
  {
    path: '/notes',
    name: 'notes',
    component: () => import('./views/NotesView.vue'),
    meta: { fullbleed: true },
  },
]
