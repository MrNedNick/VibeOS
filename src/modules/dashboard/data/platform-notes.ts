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
  { id: 'd1', label: 'No unit or component tests yet (planned S5)', severity: 'high' },
  { id: 'd2', label: 'No error boundaries / global error handler (planned S3)', severity: 'high' },
  { id: 'd3', label: 'localStorage has no schema migration strategy (planned S3)', severity: 'medium' },
  { id: 'd4', label: 'No loading skeletons for async operations', severity: 'medium' },
  { id: 'd5', label: 'Google Fonts loaded via @import (blocks render)', severity: 'low' },
]

export const PLATFORM_STATUS = [
  { label: 'Architecture',  status: 'good',    note: 'Layered, module-based, consistent' },
  { label: 'TypeScript',    status: 'good',    note: 'Strict mode, 0 errors' },
  { label: 'Build',         status: 'good',    note: 'Clean production build' },
  { label: 'Deployment',    status: 'good',    note: 'Live at mrnednick.github.io/VibeOS' },
  { label: 'Tests',         status: 'missing', note: 'Vitest planned in S5' },
  { label: 'Backend',       status: 'planned', note: 'Supabase sync planned in S3' },
  { label: 'Identity',      status: 'planned', note: 'Logo, vibe-paks, landing — active S1' },
  { label: 'i18n',          status: 'planned', note: 'vue-i18n planned post-S4' },
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
    progress: 60,
    milestone: 'S2 redesign pending — replace dev stats with live widgets',
    shippedTasks: [
      { label: 'Module quick-launch → button in sidebar', date: '2026-05-26' },
      { label: 'Per-module detail panel with progress bars', date: '2026-05-26' },
      { label: 'All-tasks aggregated overview panel', date: '2026-05-26' },
      { label: 'Stat cards redesigned as widgets with icons and progress bar', date: '2026-05-26' },
      { label: 'Responsive layout: stat cards 2×2 on md, 1-col on sm', date: '2026-05-26' },
    ],
    nextTasks: [
      { label: 'S2: replace stat cards with clock, weather, Today, Activity, heatmap', priority: 'high' },
      { label: 'S2: move dev metrics (build, doc pages, modules) into a Platform tab', priority: 'high' },
      { label: 'S2: Recent Activity widget reading from event bus', priority: 'high' },
      { label: 'Optional quote / dev joke widget', priority: 'low' },
    ],
    improvements: [
      'Live clock + date + weather block as the headline widget',
      'Today widget: top 3 tasks with deadlines from Tasks store',
      'Activity heatmap (GitHub-style) showing OS usage over time',
      'Recent activity feed (last 5–10 events from event bus)',
      'Drag-to-prioritize widget order',
    ],
    techDebt: [
      { label: 'MODULE_DETAILS.nextTasks not synced with actual shipped features', severity: 'low' },
    ],
    ideas: [
      'Per-user widget layout (saved to localStorage)',
      'Collapsed "focus mode" — show only Today widget',
      'GitHub activity widget (commits, open PRs)',
      'Hacker News top 5 stories widget',
      'Shareable snapshot of platform state',
    ],
    notes: 'Platform home and control center. S2 redesigns this into a live home screen.',
  },

  docs: {
    progress: 92,
    milestone: 'Full-text content search with snippets shipped',
    shippedTasks: [
      { label: 'Markdown viewer with syntax highlighting styles', date: '2026-05-26' },
      { label: 'Anchor links on headings with hash deep-link', date: '2026-05-26' },
      { label: 'Copy button on code blocks', date: '2026-05-26' },
      { label: 'Sidebar search (filter by label)', date: '2026-05-26' },
      { label: 'Collapsible sidebar sections with toggle', date: '2026-05-26' },
      { label: 'Full-text search across all docs with context snippet', date: '2026-05-26' },
    ],
    nextTasks: [
      { label: 'Responsive: sidebar as top dropdown on sm', priority: 'medium' },
      { label: 'Auto table of contents from headings', priority: 'low' },
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
    notes: 'All .md files bundled at build time via Vite glob import. Strategy now covered in docs/strategy.md.',
  },

  settings: {
    progress: 0,
    milestone: 'Not started — S2 priority',
    shippedTasks: [],
    nextTasks: [
      { label: 'Build tabbed view: Appearance / Account / Keys / Data / Shortcuts / About', priority: 'high' },
      { label: 'Migrate vibe-pak picker from temporary header location', priority: 'high' },
      { label: 'API keys panel (Anthropic, OpenWeather) for Studio + widgets', priority: 'high' },
      { label: 'Data export / import / clear panel', priority: 'medium' },
      { label: 'Global shortcuts map view', priority: 'medium' },
    ],
    improvements: [
      'Theme + vibe-pak + accent color + font picker',
      'Per-app accent override',
      'API key storage abstraction (encrypted in localStorage)',
      'Export entire OS state as a backup JSON',
    ],
    techDebt: [],
    ideas: [
      'Settings sync via Supabase when logged in',
      'Profile photo + display name',
      'Locale picker (when i18n ships)',
    ],
    notes: 'S2 priority. Unblocks Studio (API key storage) and migrates the vibe-pak picker to a proper home.',
  },

  about: {
    progress: 0,
    milestone: 'Not started — S2 portfolio anchor',
    shippedTasks: [],
    nextTasks: [
      { label: 'Personal card: name, role, short bio', priority: 'high' },
      { label: 'Links: GitHub, X/Twitter, LinkedIn, email', priority: 'high' },
      { label: 'Tech stack worked with', priority: 'medium' },
      { label: 'Optional resume PDF link', priority: 'low' },
    ],
    improvements: [
      'Footer link from landing page',
      '"Made with" credits listing the tools that built VibeOS',
    ],
    techDebt: [],
    ideas: [
      'Photo or avatar',
      'Short timeline of projects',
      'Now / currently working on section',
    ],
    notes: 'Portfolio anchor every visitor looks for and currently missing.',
  },

  'task-manager': {
    progress: 65,
    milestone: 'Foundation strong — S4 lifts to "real product" (Stride)',
    shippedTasks: [
      { label: 'Create, toggle, delete tasks with localStorage persistence', date: '2026-05-26' },
      { label: 'Filter tabs: All / Active / Done', date: '2026-05-26' },
      { label: 'Progress bar with live stats', date: '2026-05-26' },
      { label: 'Inline task editing (double-click)', date: '2026-05-26' },
      { label: 'Priority levels: none / low / medium / high / urgent', date: '2026-05-26' },
      { label: 'Undo delete (4s toast with Undo button)', date: '2026-05-26' },
      { label: 'Keyboard nav: j/k move, space toggle, d delete, / focus', date: '2026-05-26' },
      { label: 'Duplicate task detection with warning notification', date: '2026-05-26' },
      { label: 'Export tasks to CSV / JSON download', date: '2026-05-26' },
    ],
    nextTasks: [
      { label: 'S4: Today view (filter by due == today)', priority: 'high' },
      { label: 'S4: Focus mode with Pomodoro timer', priority: 'high' },
      { label: 'S4: Streak counter + heatmap (≥1 done/day)', priority: 'high' },
      { label: 'S4: Natural-language input via chrono-node', priority: 'medium' },
      { label: 'S4: Lock in product name (recommended: Stride)', priority: 'high' },
      { label: 'Task drag-to-reorder', priority: 'low' },
    ],
    improvements: [
      'Today / Upcoming / Inbox tabs as the primary navigation',
      'Pomodoro session log with stats',
      'Streak heatmap as a sidebar element',
      'Color-coded priority badges',
      'Bulk select for batch operations',
    ],
    techDebt: [
      { label: 'Tasks have no reorder — creation order only', severity: 'medium' },
      { label: 'localStorage schema has no version field (fixed by S3)', severity: 'medium' },
    ],
    ideas: [
      'Recurring tasks (daily, weekly patterns)',
      'Subtasks / nested task hierarchy',
      'Task categories with color tags',
      'Cards on Board (one entity, two views — S4)',
      'Time tracking: log time spent on a task',
      'Statistics view: completion rate over time',
    ],
    notes: 'Reference module — sets architectural patterns. S4 lifts it to "real product" with Today/Focus/Streaks. Target product name: Stride.',
  },

  notes: {
    progress: 75,
    milestone: 'Foundation strong — S4 adds [[backlinks]] and daily journal',
    shippedTasks: [
      { label: 'Three-pane workspace: list / editor / preview', date: '2026-05-26' },
      { label: 'Live markdown preview with marked', date: '2026-05-26' },
      { label: 'Auto-save with 300ms debounce', date: '2026-05-26' },
      { label: 'Keyboard shortcuts: ⌘N new, ⌘F search, ⌘⇧P toggle preview', date: '2026-05-26' },
      { label: 'Pin notes to top of list', date: '2026-05-26' },
      { label: 'Word count + reading time in toolbar', date: '2026-05-26' },
      { label: 'Export note as .md file download', date: '2026-05-26' },
      { label: 'Code block syntax highlighting in preview (highlight.js)', date: '2026-05-26' },
    ],
    nextTasks: [
      { label: 'S4: Parse [[wiki-style links]] + clickable navigation', priority: 'high' },
      { label: 'S4: Backlinks panel (incoming references)', priority: 'high' },
      { label: 'S4: "Today" button for daily journal entries', priority: 'high' },
      { label: 'S4: Lock in product name (Inkwell / Slate)', priority: 'medium' },
      { label: 'Responsive: collapse note list on sm, single-pane mode', priority: 'medium' },
      { label: 'Note drag-to-reorder in the list', priority: 'low' },
    ],
    improvements: [
      'Wiki-style backlinks (Obsidian flagship feature)',
      'Daily journal: one-click open today\'s date as a new note',
      'Note templates: daily standup, meeting notes, idea dump',
      'Tag system for organization',
    ],
    techDebt: [
      { label: 'Title derived on every render — acceptable for v1 list sizes', severity: 'low' },
      { label: 'Debounce timer is module-level, not per-note', severity: 'low' },
    ],
    ideas: [
      'Export to PDF',
      'Full-text search with highlighted results',
      'Folder / notebook organization',
      'Note history / version restore',
      'Markdown ➜ Snippets cross-link (S4)',
    ],
    notes: 'Foundation done. S4 differentiators: [[backlinks]] + daily journal turn it from reference into habit. Candidate names: Inkwell, Slate.',
  },

  kanban: {
    progress: 0,
    milestone: 'Not started — S4 build (time-based swimlanes, unified with Tasks)',
    shippedTasks: [],
    nextTasks: [
      { label: 'Write full module specification in docs/modules/board.md', priority: 'high' },
      { label: 'Decide: cards == tasks (shared store) or separate entity', priority: 'high' },
      { label: 'Design swimlane data model: rows = days/sprints, cols = statuses', priority: 'high' },
      { label: 'Pick drag-and-drop approach (native HTML5 vs library)', priority: 'high' },
      { label: 'Implement basic swimlane grid + card CRUD', priority: 'medium' },
    ],
    improvements: [
      'Time-based swimlanes (the differentiator — no other Kanban has this)',
      'Cards shared with Tasks store — one entity, two views',
      'Drag-and-drop with subtle inertia',
      'Column WIP limits',
    ],
    techDebt: [],
    ideas: [
      'Sprint planning view (group cards into a sprint)',
      'Labels and color tags',
      'Assignees (mock data for now)',
      'Import from Trello / Linear JSON',
      'Board activity log via event bus',
    ],
    notes: 'Most visually complex module. Differentiator = time-based swimlanes + Tasks unification. Do NOT start without a written spec.',
  },

  'ai-playground': {
    progress: 0,
    milestone: 'Not started — S4 (Prompt Lab, not ChatGPT clone)',
    shippedTasks: [],
    nextTasks: [
      { label: 'Write module specification in docs/modules/studio.md', priority: 'high' },
      { label: 'Set up Anthropic SDK + API key reading from Settings', priority: 'high' },
      { label: 'Parallel run UI: same prompt → Opus / Sonnet / Haiku side-by-side', priority: 'high' },
      { label: 'Temperature + max_tokens sliders', priority: 'medium' },
      { label: 'Prompt versioning with diff view', priority: 'medium' },
      { label: 'Saved prompts library with tags', priority: 'medium' },
      { label: 'Token + cost tracker per run', priority: 'low' },
    ],
    improvements: [
      'Streaming responses with cancel button',
      'Compare two prompts side-by-side on the same model',
      'Export run to markdown',
    ],
    techDebt: [],
    ideas: [
      'Tool use / function calling demo',
      'Prompt templates library',
      'Token usage tracker with cost estimate',
      'Prompt eval / scoring',
    ],
    notes: 'Differentiator = parallel model comparison + versioning, NOT another ChatGPT clone. Depends on Settings module for API key storage.',
  },

  snippets: {
    progress: 0,
    milestone: 'Not started — S4 new module',
    shippedTasks: [],
    nextTasks: [
      { label: 'Write module spec in docs/modules/snippets.md', priority: 'high' },
      { label: 'Data model: Snippet { id, title, language, code, tags, createdAt }', priority: 'high' },
      { label: 'List view with language tag, search, copy button', priority: 'high' },
      { label: 'Detail view with highlight.js rendering', priority: 'high' },
      { label: 'Language filter + tag filter', priority: 'medium' },
    ],
    improvements: [
      'Code editor with syntax highlighting (CodeMirror or Monaco — pick lightest)',
      'Snippet → Note cross-link',
      'Import from GitHub gists',
    ],
    techDebt: [],
    ideas: [
      'Snippet templates (component scaffolds, useEffect patterns, regex)',
      'Public sharing via short URL',
      'Variables in snippets ({{name}} placeholders)',
    ],
    notes: 'highlight.js already in dependencies. More useful daily than Currency was. Fits "personal OS for developers" angle.',
  },

  habits: {
    progress: 0,
    milestone: 'Not started — S4 new module (ships last in module wave)',
    shippedTasks: [],
    nextTasks: [
      { label: 'Write module spec in docs/modules/habits.md', priority: 'medium' },
      { label: 'Data model: Habit + per-day boolean log', priority: 'medium' },
      { label: 'Habit list with daily check-off', priority: 'medium' },
      { label: 'Per-habit heatmap (GitHub-contrib style)', priority: 'medium' },
      { label: 'Streak counter per habit', priority: 'low' },
    ],
    improvements: [
      'Heatmap on Dashboard as a widget',
      'Habit categories (health, learning, etc)',
      'Reminders via toast notifications',
    ],
    techDebt: [],
    ideas: [
      'Cross-habit dashboard (overall consistency)',
      'Streak-loss recovery: optional "freeze" days',
      'Share streak as an image',
    ],
    notes: 'Cheap implementation, high "lived-in" feeling. Pairs with Tasks Streaks. Ship after other S4 modules settle.',
  },

  games: {
    progress: 40,
    milestone: 'Lobby + 2048 shipped — Memory and Snake next',
    shippedTasks: [
      { label: 'Game lobby at /games with cards for each game', date: '2026-05-27' },
      { label: '2048 — CSS grid, merge logic, best score persistence', date: '2026-05-27' },
      { label: 'Arrow keys + WASD + swipe gesture support', date: '2026-05-27' },
      { label: 'Win / game-over overlays with continue / restart', date: '2026-05-27' },
    ],
    nextTasks: [
      { label: 'Implement Memory Cards — CSS 3D flip', priority: 'medium' },
      { label: 'Implement Snake — canvas + game loop', priority: 'medium' },
      { label: 'Achievements via event bus (S2 dep)', priority: 'low' },
      { label: 'High scores on Dashboard widget', priority: 'low' },
      { label: 'CRT vibe-pak easter-egg skin', priority: 'low' },
    ],
    improvements: [
      'Achievements feed (event bus integration)',
      'Daily challenge with shared seed',
      'Difficulty picker per game',
      'Sound effects toggle (Web Audio API)',
    ],
    techDebt: [],
    ideas: [
      'Tetris — most visually impressive, fits VibeOS grid aesthetic',
      'Minesweeper — flood-fill reveal, right-click flag',
      'Wordle clone (keyboard + word dictionary)',
      'Pong vs AI',
    ],
    notes: 'After Memory + Snake, recommended next: Tetris or Minesweeper (more visual than Wordle).',
  },
}
