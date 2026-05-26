// ─── Global platform notes ────────────────────────────────────────

export interface RoadmapItem {
  id: string
  label: string
  tag: 'feature' | 'design' | 'infra' | 'dx'
  priority: 'now' | 'next' | 'later'
}

export interface TechDebtItem {
  id: string
  label: string
  severity: 'high' | 'medium' | 'low'
}

export const TECH_DEBT: TechDebtItem[] = [
  { id: 'd1', label: 'No unit or component tests yet', severity: 'high' },
  { id: 'd2', label: 'No error boundaries / global error handler', severity: 'high' },
  { id: 'd3', label: 'localStorage has no schema migration strategy', severity: 'medium' },
  { id: 'd4', label: 'No loading skeletons for async operations', severity: 'medium' },
  { id: 'd5', label: 'Google Fonts loaded via @import (blocks render)', severity: 'low' },
]

export const PLATFORM_STATUS = [
  { label: 'Architecture',  status: 'good',    note: 'Layered, module-based, consistent' },
  { label: 'TypeScript',    status: 'good',    note: 'Strict mode, 0 errors' },
  { label: 'Build',         status: 'good',    note: 'Clean production build' },
  { label: 'Tests',         status: 'missing', note: 'No test framework yet' },
  { label: 'Backend',       status: 'missing', note: 'localStorage only' },
  { label: 'Deployment',    status: 'missing', note: 'Not yet deployed' },
  { label: 'i18n',          status: 'planned', note: 'Planned — vue-i18n' },
] as const

// ─── Per-module detail data ───────────────────────────────────────

export interface NextTask {
  label: string
  priority: 'high' | 'medium' | 'low'
}

export interface ModuleDebt {
  label: string
  severity: 'high' | 'medium' | 'low'
}

export interface ModuleDetail {
  progress: number          // editorial: how feature-complete is this module (0–100)
  milestone: string         // one-line current state
  nextTasks: NextTask[]
  improvements: string[]
  techDebt: ModuleDebt[]
  ideas: string[]
  notes?: string
}

export const MODULE_DETAILS: Record<string, ModuleDetail> = {
  dashboard: {
    progress: 70,
    milestone: 'Working command center — interactive improvements planned',
    nextTasks: [
      { label: 'Make module cards navigate on click', priority: 'medium' },
      { label: 'Add sprint/focus tracker widget', priority: 'low' },
      { label: 'Interactive roadmap (check off items)', priority: 'low' },
    ],
    improvements: [
      'Recent activity feed across all modules',
      'Build stats widget (bundle size, TS errors from CI)',
      'Drag-to-prioritize roadmap items',
    ],
    techDebt: [],
    ideas: [
      'Collapsed "focus mode" — show only current sprint',
      'Shareable snapshot of platform state',
    ],
    notes: 'Platform home and control center. MODULE_DETAILS is the source of truth for per-module planning data.',
  },

  docs: {
    progress: 75,
    milestone: 'Working viewer — enhancements pending',
    nextTasks: [
      { label: 'Add anchor links to headings (slug IDs)', priority: 'medium' },
      { label: 'Add full-text search across docs', priority: 'low' },
      { label: 'Copy-code button on code blocks', priority: 'low' },
    ],
    improvements: [
      'Last-updated timestamps per page (git-based)',
      'Print / PDF export',
      'Collapsible sidebar sections when doc count grows',
    ],
    techDebt: [],
    ideas: [
      'Dark/light preview toggle per page',
      'Doc page rating / feedback (future)',
    ],
    notes: 'All .md files bundled at build time via Vite glob import.',
  },

  'task-manager': {
    progress: 45,
    milestone: 'Core features working — needs identity, polish, and localization',
    nextTasks: [
      { label: 'Choose product name and define visual identity', priority: 'high' },
      { label: 'Add localization (vue-i18n) — EN + RU', priority: 'high' },
      { label: 'Due dates with visual urgency indicators', priority: 'medium' },
      { label: 'Keyboard navigation (j/k move, space toggle, d delete)', priority: 'medium' },
      { label: 'Inline editing — double-click to edit task text', priority: 'low' },
      { label: 'Undo last delete (with timeout)', priority: 'low' },
    ],
    improvements: [
      'Unique product name and brand identity (not "Task Manager")',
      'Signature visual treatment — monospace font for task text',
      'Micro-animations: spring on task completion, satisfying delete',
      'Marketing-style landing page / product positioning',
      'Standalone deployment as an independent app',
    ],
    techDebt: [
      { label: 'No duplicate task detection', severity: 'low' },
      { label: 'Tasks have no reorder — creation order only', severity: 'medium' },
      { label: 'localStorage schema has no version field', severity: 'medium' },
    ],
    ideas: [
      'Recurring tasks (daily, weekly patterns)',
      'Subtasks / nested task hierarchy',
      'Task categories with color tags',
      'Priority levels (low / medium / high / urgent)',
      'Export: CSV, JSON, plain text',
      'Integration with Kanban — move task to a board column',
      'Time tracking: log time spent on a task',
    ],
    notes: 'First migrated module. Sets the reference architecture. Treat as a real product, not a demo.',
  },

  kanban: {
    progress: 0,
    milestone: 'Not started — write specification before any implementation',
    nextTasks: [
      { label: 'Write full module specification in docs/', priority: 'high' },
      { label: 'Define data model: Board, Column, Card types', priority: 'high' },
      { label: 'Decide on drag-and-drop library or approach', priority: 'high' },
      { label: 'Design component architecture (Board, Column, Card)', priority: 'high' },
      { label: 'Implement basic column + card CRUD', priority: 'medium' },
    ],
    improvements: [
      'Column customization: name, color, WIP limit',
      'Card detail modal: description, due date, checklist',
      'Board templates for common workflows',
      'Multi-board support',
    ],
    techDebt: [],
    ideas: [
      'Swimlanes (grouped rows)',
      'Labels and color tags on cards',
      'Assignees (even if mock data)',
      'Sprint planning view',
      'Import from Trello / Linear JSON',
      'Board activity log',
    ],
    notes: 'Most visually complex module. Drag-and-drop library choice is a key decision. Do NOT start without a written spec.',
  },

  notes: {
    progress: 60,
    milestone: 'v1 complete — three-pane workspace with live markdown preview',
    nextTasks: [
      { label: 'Add anchor links / heading IDs in preview', priority: 'medium' },
      { label: 'Keyboard shortcuts: ⌘N new note, ⌘F search focus', priority: 'medium' },
      { label: 'Note drag-to-reorder in the list', priority: 'low' },
      { label: 'Tag system with sidebar filter', priority: 'low' },
    ],
    improvements: [
      'Folder / notebook organization',
      'Code block syntax highlighting in preview',
      'Export as .md file download',
      'Full-text search results with highlights',
    ],
    techDebt: [
      { label: 'Title derived on every render — acceptable for v1 list sizes', severity: 'low' },
      { label: 'Debounce timer is module-level, not per-note', severity: 'low' },
    ],
    ideas: [
      'Wiki-style inter-note links [[note-title]]',
      'Pinned / starred notes at top of list',
      'Export to PDF',
      'Note templates (daily standup, meeting notes, etc.)',
      'Word count and reading time in toolbar',
    ],
    notes: 'No external editor lib — uses textarea + marked (already installed). Decision kept bundle lean.',
  },

  'ai-playground': {
    progress: 0,
    milestone: 'Not started — requires API key infrastructure',
    nextTasks: [
      { label: 'Write module specification in docs/', priority: 'high' },
      { label: 'Set up Anthropic SDK integration pattern', priority: 'high' },
      { label: 'Design API key management (Settings module dep)', priority: 'high' },
      { label: 'Build streaming response display', priority: 'medium' },
    ],
    improvements: [
      'Prompt builder with model parameters (temperature, max tokens)',
      'Response history with timestamps',
      'Compare two prompts side-by-side',
    ],
    techDebt: [],
    ideas: [
      'Prompt templates library (save and reuse)',
      'Token usage tracker with cost estimate',
      'Export conversations to markdown',
      'Tool use / function calling demo',
      'Image generation with DALL-E or similar',
    ],
    notes: 'Depends on Settings module for API key storage. Most portfolio-visible module.',
  },

  'form-builder': {
    progress: 0,
    milestone: 'Not started — most complex UX module',
    nextTasks: [
      { label: 'Write module specification in docs/', priority: 'high' },
      { label: 'Research drag-and-drop builder approach', priority: 'high' },
      { label: 'Define form schema / JSON output format', priority: 'high' },
    ],
    improvements: [
      'Visual drag-and-drop field placement',
      'Form preview panel (live)',
      'Export to JSON Schema',
    ],
    techDebt: [],
    ideas: [
      'Conditional logic: show/hide fields based on values',
      'Form validation rules builder',
      'Form response viewer',
      'Integration with external form services',
    ],
    notes: 'Technically most complex. May benefit from building Notes and Kanban first for DnD experience.',
  },

  analytics: {
    progress: 0,
    milestone: 'Not started — needs cross-module event system first',
    nextTasks: [
      { label: 'Write module specification in docs/', priority: 'high' },
      { label: 'Define cross-module event tracking strategy', priority: 'high' },
      { label: 'Decide: localStorage events vs. external analytics', priority: 'high' },
    ],
    improvements: [
      'Task completion rate over time (chart)',
      'Module usage frequency heatmap',
      'Development activity calendar',
    ],
    techDebt: [],
    ideas: [
      'Time spent in each module',
      'Daily/weekly productivity summary',
      'Custom metrics dashboard',
    ],
    notes: 'Blocked by cross-module event system. Build last, after other modules generate data.',
  },
}
