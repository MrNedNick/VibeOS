export type ModuleSection = 'system' | 'life' | 'work'
export type ModuleStatus = 'available' | 'planned' | 'wip'

export interface ModuleMeta {
  id: string
  label: string
  icon: string
  path: string
  section: ModuleSection
  status: ModuleStatus
  description: string
  sprint?: string
}

export const PLATFORM_MODULES: ModuleMeta[] = [
  // ── System ───────────────────────────────────────────────────────
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/',
    section: 'system',
    status: 'available',
    description: 'Daily command center — tasks, goals, habits, and priorities',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings2',
    path: '/settings',
    section: 'system',
    status: 'available',
    description: 'Appearance, keyboard shortcuts, data export',
  },
  {
    id: 'about',
    label: 'About',
    icon: 'User',
    path: '/about',
    section: 'system',
    status: 'available',
    description: 'Tech stack, shipped modules, GitHub link',
  },
  {
    id: 'ai-playground',
    label: 'Studio',
    icon: 'Zap',
    path: '/ai',
    section: 'system',
    status: 'available',
    description: 'Prompt Lab — run prompts across Opus / Sonnet / Haiku',
  },
  {
    id: 'docs',
    label: 'Docs',
    icon: 'FileText',
    path: '/docs',
    section: 'system',
    status: 'available',
    description: 'Architecture decisions and module docs',
  },

  // ── Life ─────────────────────────────────────────────────────────
  {
    id: 'goals',
    label: 'Goals',
    icon: 'Target',
    path: '/goals',
    section: 'life',
    status: 'planned',
    sprint: 'S4',
    description: 'Life goals, milestones, and progress tracking',
  },
  {
    id: 'habits',
    label: 'Habits',
    icon: 'Flame',
    path: '/habits',
    section: 'life',
    status: 'available',
    description: 'Daily check-offs, streaks, and consistency heatmap',
  },
  {
    id: 'learning',
    label: 'Learning',
    icon: 'BookOpen',
    path: '/learning',
    section: 'life',
    status: 'available',
    description: 'Structured learning plans, daily sessions, streaks and progress tracking',
  },
  {
    id: 'training',
    label: 'Training',
    icon: 'Dumbbell',
    path: '/training',
    section: 'life',
    status: 'planned',
    sprint: 'S5',
    description: 'Workout plans, session logs, and fitness progress',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'BarChart2',
    path: '/analytics',
    section: 'life',
    status: 'planned',
    sprint: 'S5',
    description: 'Personal stats — habits, tasks, learning, and training trends',
  },

  // ── Work ─────────────────────────────────────────────────────────
  {
    id: 'task-manager',
    label: 'Tasks',
    icon: 'CheckSquare',
    path: '/tasks',
    section: 'work',
    status: 'available',
    description: 'Tasks with priorities, categories, deadlines, and goals',
  },
  {
    id: 'kanban',
    label: 'Board',
    icon: 'Kanban',
    path: '/kanban',
    section: 'work',
    status: 'available',
    description: 'Kanban board and timeline — same tasks, different view',
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: 'NotebookPen',
    path: '/notes',
    section: 'work',
    status: 'available',
    description: 'Markdown notes with [[backlinks]] and daily journal',
  },
  {
    id: 'snippets',
    label: 'Snippets',
    icon: 'Braces',
    path: '/snippets',
    section: 'work',
    status: 'available',
    description: 'Code vault with syntax highlighting and tags',
  },
  {
    id: 'games',
    label: 'Games',
    icon: 'Gamepad2',
    path: '/games',
    section: 'work',
    status: 'available',
    description: 'Take a break — 2048, Memory, Snake',
  },
]
