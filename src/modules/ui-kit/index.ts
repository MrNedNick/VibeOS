import type { RouteRecordRaw } from 'vue-router'

// /ui-kit is a developer tool — hidden entirely in production builds.
export const uiKitRoutes: RouteRecordRaw[] = import.meta.env.PROD
  ? []
  : [
      {
        path: '/ui-kit',
        component: () => import('./views/UiKitView.vue'),
        meta: { title: 'UI Kit' },
      },
    ]
