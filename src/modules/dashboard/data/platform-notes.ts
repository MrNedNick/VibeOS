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

export interface ShippedTask {
  label: string
  date: string   // 'YYYY-MM-DD'
}

export interface ModuleDetail {
  progress: number          // editorial: how feature-complete is this module (0–100)
  milestone: string         // one-line current state
  nextTasks: NextTask[]
  shippedTasks: ShippedTask[]
  improvements: string[]
  techDebt: ModuleDebt[]
  ideas: string[]
  notes?: string
}

export const MODULE_DETAILS: Record<string, ModuleDetail> = {
  dashboard: {
    progress: 78,
    milestone: 'Working command center with quick-launch — polish and widgets pending',
    shippedTasks: [
      { label: 'Module quick-launch → button in sidebar', date: '2026-05-26' },
      { label: 'Per-module detail panel with progress bars', date: '2026-05-26' },
      { label: 'All-tasks aggregated overview panel', date: '2026-05-26' },
    ],
    nextTasks: [
      { label: 'Responsive layout: stat cards 2×2 on md, 1-col on sm', priority: 'high' },
      { label: 'Currency widget: live exchange rates for favorite pairs', priority: 'medium' },
      { label: 'Add sprint/focus tracker widget', priority: 'medium' },
      { label: 'Interactive roadmap (check off items)', priority: 'low' },
      { label: 'Recent activity feed across all modules', priority: 'low' },
    ],
    improvements: [
      'Currency widget with live rates (Frankfurter API, no key needed)',
      'Weather widget for current location (OpenWeatherMap free)',
      'Build stats widget (bundle size, TS errors from CI)',
      'Drag-to-prioritize roadmap items',
      'Collapsible sections in the module detail panel',
    ],
    techDebt: [
      { label: 'MODULE_DETAILS.nextTasks not synced with actual shipped features', severity: 'low' },
    ],
    ideas: [
      'Collapsed "focus mode" — show only current sprint',
      'Shareable snapshot of platform state',
      'GitHub activity widget (commits, open PRs)',
      'Hacker News top 5 stories widget',
    ],
    notes: 'Platform home and control center. MODULE_DETAILS is the source of truth for per-module planning data.',
  },

  docs: {
    progress: 88,
    milestone: 'Working viewer with anchor links and copy buttons shipped',
    shippedTasks: [
      { label: 'Markdown viewer with syntax highlighting styles', date: '2026-05-26' },
      { label: 'Anchor links on headings with hash deep-link', date: '2026-05-26' },
      { label: 'Copy button on code blocks', date: '2026-05-26' },
      { label: 'Sidebar search (filter by label)', date: '2026-05-26' },
    ],
    nextTasks: [
      { label: 'Responsive: sidebar as top dropdown on sm', priority: 'high' },
      { label: 'Full-text search across all docs', priority: 'medium' },
      { label: 'Collapsible sidebar sections', priority: 'low' },
      { label: 'Last-updated timestamps per page (git-based)', priority: 'low' },
    ],
    improvements: [
      'In-page search (Ctrl+F replacement with highlighted results)',
      'Print / PDF export',
      'Doc page table of contents (auto from headings)',
    ],
    techDebt: [],
    ideas: [
      'Dark/light preview toggle per page',
      'Doc feedback / rating (future)',
      'Export entire docs as a PDF book',
    ],
    notes: 'All .md files bundled at build time via Vite glob import. Anchor links and copy buttons shipped 2026-05-26.',
  },

  'task-manager': {
    progress: 58,
    milestone: 'Core features + inline editing shipped — identity and polish next',
    shippedTasks: [
      { label: 'Create, toggle, delete tasks with localStorage persistence', date: '2026-05-26' },
      { label: 'Filter tabs: All / Active / Done', date: '2026-05-26' },
      { label: 'Progress bar with live stats', date: '2026-05-26' },
      { label: 'Inline task editing (double-click)', date: '2026-05-26' },
      { label: 'Priority levels: none / low / medium / high / urgent', date: '2026-05-26' },
      { label: 'Undo delete (4s toast with Undo button)', date: '2026-05-26' },
      { label: 'Keyboard nav: j/k move, space toggle, d delete, / focus', date: '2026-05-26' },
    ],
    nextTasks: [
      { label: 'Responsive: full-width layout on all screens', priority: 'high' },
      { label: 'Choose product name and define visual identity', priority: 'high' },
      { label: 'Due dates with visual urgency indicators', priority: 'medium' },
      { label: 'Add localization (vue-i18n) — EN + RU', priority: 'low' },
      { label: 'Task drag-to-reorder', priority: 'low' },
      { label: 'Export tasks to CSV / JSON', priority: 'low' },
    ],
    improvements: [
      'Priority levels with color-coded badges (no new dependencies needed)',
      'Undo delete — save last deleted task in ref, show 4s toast',
      'Unique product name and brand identity',
      'Monospace font treatment for task text',
      'Micro-animations: spring on completion, slide-out on delete',
      'Duplicate task detection on submit',
    ],
    techDebt: [
      { label: 'Tasks have no reorder — creation order only', severity: 'medium' },
      { label: 'localStorage schema has no version field', severity: 'medium' },
      { label: 'No duplicate task detection on submit', severity: 'low' },
    ],
    ideas: [
      'Recurring tasks (daily, weekly patterns)',
      'Subtasks / nested task hierarchy',
      'Task categories with color tags',
      'Integration with Kanban — move task to a board column',
      'Time tracking: log time spent on a task',
      'Statistics view: completion rate over time',
    ],
    notes: 'First migrated module. Sets the reference architecture. Inline editing shipped 2026-05-26. Treat as a real product, not a demo.',
  },

  kanban: {
    progress: 0,
    milestone: 'Not started — write specification before any implementation',
    shippedTasks: [],
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
    progress: 72,
    milestone: 'v1 + hotkeys shipped — polish and export features next',
    shippedTasks: [
      { label: 'Three-pane workspace: list / editor / preview', date: '2026-05-26' },
      { label: 'Live markdown preview with marked', date: '2026-05-26' },
      { label: 'Auto-save with 300ms debounce', date: '2026-05-26' },
      { label: 'Keyboard shortcuts: ⌘N new, ⌘F search, ⌘⇧P toggle preview', date: '2026-05-26' },
      { label: 'Pin notes to top of list', date: '2026-05-26' },
      { label: 'Word count + reading time in toolbar', date: '2026-05-26' },
      { label: 'Export note as .md file download', date: '2026-05-26' },
    ],
    nextTasks: [
      { label: 'Responsive: collapse note list on sm, single-pane mode', priority: 'high' },
      { label: 'Code block syntax highlighting in preview', priority: 'low' },
      { label: 'Tag system for note organization', priority: 'low' },
      { label: 'Note drag-to-reorder in the list', priority: 'low' },
    ],
    improvements: [
      'Word count + reading time (trivial computed, 0 new deps)',
      'Export as .md download (Blob + anchor click, ~5 lines)',
      'Pinned notes (1 field in type, sort change)',
      'Note templates: daily standup, meeting notes',
      'Code block syntax highlighting (highlight.js or prism)',
    ],
    techDebt: [
      { label: 'Title derived on every render — acceptable for v1 list sizes', severity: 'low' },
      { label: 'Debounce timer is module-level, not per-note', severity: 'low' },
    ],
    ideas: [
      'Wiki-style inter-note links [[note-title]]',
      'Export to PDF',
      'Full-text search with highlighted results',
      'Folder / notebook organization',
      'Note history / version restore',
    ],
    notes: 'Keyboard shortcuts (⌘N/F/⇧P) shipped 2026-05-26. No external editor lib — textarea + marked.',
  },

  'ai-playground': {
    progress: 0,
    milestone: 'Not started — requires API key infrastructure',
    shippedTasks: [],
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
    shippedTasks: [],
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

  currency: {
    progress: 0,
    milestone: 'Not started — spec written, API chosen (Frankfurter, no key)',
    shippedTasks: [],
    nextTasks: [
      { label: 'Write full module spec in docs/modules/currency.md', priority: 'high' },
      { label: 'Implement currency pair selector with search', priority: 'high' },
      { label: 'Fetch live rates from Frankfurter API', priority: 'high' },
      { label: 'Save favorite pairs to localStorage', priority: 'medium' },
      { label: 'Add dashboard widget for favorite pairs', priority: 'medium' },
      { label: 'Rate history sparkline (7d/30d)', priority: 'low' },
    ],
    improvements: [
      'Multi-pair view with up/down indicators vs previous close',
      'Auto-refresh every 60s with last-updated timestamp',
      'Compact dashboard widget (3–5 favorite pairs)',
    ],
    techDebt: [],
    ideas: [
      'Currency converter (enter amount, see result)',
      'Alert when pair crosses a threshold',
      'Historical chart with date range picker',
      'Crypto pairs via CoinGecko (no key needed)',
    ],
    notes: 'Uses Frankfurter API (frankfurter.app) — free, no key, ECB data, no rate limits. Follow useAsync composable pattern for fetching.',
  },

  analytics: {
    progress: 0,
    milestone: 'Not started — needs cross-module event system first',
    shippedTasks: [],
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

  games: {
    progress: 0,
    milestone: 'Not started — lobby page + 3 games planned',
    shippedTasks: [],
    nextTasks: [
      { label: 'Write module spec in docs/modules/games.md', priority: 'high' },
      { label: 'Build game lobby page at /games', priority: 'high' },
      { label: 'Implement 2048 — CSS grid + merge animations', priority: 'high' },
      { label: 'Implement Memory Cards — CSS 3D flip', priority: 'medium' },
      { label: 'Implement Snake — canvas + game loop', priority: 'medium' },
      { label: 'Add high score persistence per game (localStorage)', priority: 'medium' },
    ],
    improvements: [
      'Difficulty picker per game',
      'Global leaderboard view across games',
      'Keyboard shortcut hint overlay',
      'Sound effects toggle (Web Audio API)',
    ],
    techDebt: [],
    ideas: [
      'Wordle clone (keyboard + word dictionary)',
      'Minesweeper (flood-fill reveal, right-click flag)',
      'Tetris (canvas or CSS grid)',
      'Pong vs AI',
    ],
    notes: 'Start with 2048 and Memory Cards — no canvas needed, pure CSS. Snake adds canvas pattern for future games.',
  },
}
