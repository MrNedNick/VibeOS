import type { RouteRecordRaw } from 'vue-router'

export const snippetsRoutes: RouteRecordRaw[] = [
  {
    path: '/snippets',
    name: 'snippets',
    component: () => import('./views/SnippetsView.vue'),
    meta: { fullbleed: true },
  },
]
