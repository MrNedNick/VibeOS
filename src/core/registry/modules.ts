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
    icon: '◈',
    path: '/',
    section: 'platform',
    status: 'available',
    description: 'Platform overview and progress tracker',
  },
  {
    id: 'docs',
    label: 'Docs',
    icon: '✎',
    path: '/docs',
    section: 'platform',
    status: 'available',
    description: 'Architecture decisions and module docs',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '◷',
    path: '/settings',
    section: 'platform',
    status: 'planned',
    description: 'Appearance, account, keys, data, shortcuts',
  },
  {
    id: 'about',
    label: 'About',
    icon: '◐',
    path: '/about',
    section: 'platform',
    status: 'planned',
    description: 'Who built this — links, bio, stack',
  },

  // ── Apps section ─────────────────────────────────────────────────
  {
    id: 'task-manager',
    label: 'Tasks',
    icon: '✓',
    path: '/tasks',
    section: 'modules',
    status: 'available',
    description: 'Today view, Focus mode, Streaks',
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: '◻',
    path: '/notes',
    section: 'modules',
    status: 'available',
    description: 'Markdown notes with [[backlinks]] and daily journal',
  },
  {
    id: 'kanban',
    label: 'Board',
    icon: '▦',
    path: '/kanban',
    section: 'modules',
    status: 'planned',
    description: 'Time-based swimlanes — unified with Tasks',
  },
  {
    id: 'ai-playground',
    label: 'Studio',
    icon: '⚡',
    path: '/ai',
    section: 'modules',
    status: 'planned',
    description: 'Prompt Lab — Opus / Sonnet / Haiku in parallel',
  },
  {
    id: 'snippets',
    label: 'Snippets',
    icon: '⌥',
    path: '/snippets',
    section: 'modules',
    status: 'planned',
    description: 'Code vault with syntax highlighting and tags',
  },
  {
    id: 'habits',
    label: 'Habits',
    icon: '✦',
    path: '/habits',
    section: 'modules',
    status: 'planned',
    description: 'Daily check-offs and streak heatmap',
  },
  {
    id: 'games',
    label: 'Games',
    icon: '⊡',
    path: '/games',
    section: 'modules',
    status: 'available',
    description: '2048 shipped — Memory and Snake next',
  },
]
