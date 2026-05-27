export type ModuleSection = 'platform' | 'modules'
export type ModuleStatus = 'available' | 'planned' | 'wip'

export interface ModuleMeta {
  id: string
  label: string
  icon: string
  path: string
  section: ModuleSection
  status: ModuleStatus
  description: string
}

export const PLATFORM_MODULES: ModuleMeta[] = [
  // ── System section ──────────────────────────────────────────────
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/',
    section: 'platform',
    status: 'available',
    description: 'Platform overview and progress tracker',
  },
  {
    id: 'docs',
    label: 'Docs',
    icon: 'BookOpen',
    path: '/docs',
    section: 'platform',
    status: 'available',
    description: 'Architecture decisions and module docs',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings2',
    path: '/settings',
    section: 'platform',
    status: 'planned',
    description: 'Appearance, account, keys, data, shortcuts',
  },
  {
    id: 'about',
    label: 'About',
    icon: 'User',
    path: '/about',
    section: 'platform',
    status: 'planned',
    description: 'Who built this — links, bio, stack',
  },

  // ── Apps section ─────────────────────────────────────────────────
  {
    id: 'task-manager',
    label: 'Tasks',
    icon: 'CheckSquare',
    path: '/tasks',
    section: 'modules',
    status: 'available',
    description: 'Today view, Focus mode, Streaks',
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: 'NotebookPen',
    path: '/notes',
    section: 'modules',
    status: 'available',
    description: 'Markdown notes with [[backlinks]] and daily journal',
  },
  {
    id: 'kanban',
    label: 'Board',
    icon: 'Kanban',
    path: '/kanban',
    section: 'modules',
    status: 'planned',
    description: 'Time-based swimlanes — unified with Tasks',
  },
  {
    id: 'ai-playground',
    label: 'Studio',
    icon: 'Zap',
    path: '/ai',
    section: 'modules',
    status: 'planned',
    description: 'Prompt Lab — Opus / Sonnet / Haiku in parallel',
  },
  {
    id: 'snippets',
    label: 'Snippets',
    icon: 'Braces',
    path: '/snippets',
    section: 'modules',
    status: 'available',
    description: 'Code vault with syntax highlighting and tags',
  },
  {
    id: 'habits',
    label: 'Habits',
    icon: 'Target',
    path: '/habits',
    section: 'modules',
    status: 'available',
    description: 'Daily check-offs and streak heatmap',
  },
  {
    id: 'games',
    label: 'Games',
    icon: 'Gamepad2',
    path: '/games',
    section: 'modules',
    status: 'available',
    description: '2048 shipped — Memory and Snake next',
  },
]
