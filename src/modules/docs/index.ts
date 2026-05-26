import type { RouteRecordRaw } from 'vue-router'

export const MODULE_ID    = 'docs'
export const MODULE_PATH  = '/docs'
export const MODULE_LABEL = 'Documentation'

export const docsRoutes: RouteRecordRaw[] = [
  {
    path: '/docs',
    name: 'docs.home',
    component: () => import('./views/DocsView.vue'),
    meta: { module: MODULE_ID, title: MODULE_LABEL },
  },
  {
    path: '/docs/:slug(.*)+',
    name: 'docs.page',
    component: () => import('./views/DocsView.vue'),
    meta: { module: MODULE_ID, title: MODULE_LABEL },
  },
]
