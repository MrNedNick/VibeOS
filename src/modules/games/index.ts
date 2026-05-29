import type { RouteRecordRaw } from 'vue-router'

export const gamesRoutes: RouteRecordRaw[] = [
  {
    path: '/games',
    name: 'games',
    component: () => import('./views/GamesLobbyView.vue'),
  },
  {
    path: '/games/minesweeper',
    name: 'game-minesweeper',
    component: () => import('./views/GameMinesweeperView.vue'),
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
  {
    path: '/games/sudoku',
    name: 'game-sudoku',
    component: () => import('./views/GameSudokuView.vue'),
  },
  {
    path: '/games/tetris',
    name: 'game-tetris',
    component: () => import('./views/GameTetrisView.vue'),
  },
]
