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

  // ── Apps section ─────────────────────────────────────────────────
  {
    id: 'task-manager',
    label: 'Tasks',
    icon: '✓',
    path: '/tasks',
    section: 'modules',
    status: 'available',
    description: 'Create and track your tasks',
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: '◻',
    path: '/notes',
    section: 'modules',
    status: 'available',
    description: 'Markdown notes with live preview',
  },
  {
    id: 'kanban',
    label: 'Board',
    icon: '▦',
    path: '/kanban',
    section: 'modules',
    status: 'planned',
    description: 'Visual project workflow board',
  },
  {
    id: 'currency',
    label: 'Currency',
    icon: '◎',
    path: '/currency',
    section: 'modules',
    status: 'planned',
    description: 'Live exchange rates via free API',
  },
  {
    id: 'ai-playground',
    label: 'Studio',
    icon: '⚡',
    path: '/ai',
    section: 'modules',
    status: 'planned',
    description: 'Experiment with Claude API',
  },
  {
    id: 'form-builder',
    label: 'Forms',
    icon: '⊞',
    path: '/forms',
    section: 'modules',
    status: 'planned',
    description: 'Drag-and-drop form designer',
  },
  {
    id: 'analytics',
    label: 'Insights',
    icon: '∿',
    path: '/analytics',
    section: 'modules',
    status: 'planned',
    description: 'Usage analytics and reports',
  },
  {
    id: 'games',
    label: 'Games',
    icon: '⊡',
    path: '/games',
    section: 'modules',
    status: 'available',
    description: '2048, Memory, Snake — pure CSS & Canvas',
  },
]
