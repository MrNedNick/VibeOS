import type { RouteRecordRaw } from 'vue-router'

export const gamesRoutes: RouteRecordRaw[] = [
  {
    path: '/games',
    name: 'games',
    component: () => import('./views/GamesLobbyView.vue'),
  },
  {
    path: '/games/2048',
    name: 'game-2048',
    component: () => import('./views/Game2048View.vue'),
  },
  {
    path: '/games/memory',
    name: 'game-memory',
    component: () => import('./views/GameMemoryView.vue'),
  },
  {
    path: '/games/snake',
    name: 'game-snake',
    component: () => import('./views/GameSnakeView.vue'),
  },
]
