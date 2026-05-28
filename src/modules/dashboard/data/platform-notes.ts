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
  { id: 'd2', label: 'No Vue error boundary component — uncaught errors crash the view (planned S3)', severity: 'medium' },
  { id: 'd3', label: 'localStorage schema versioning just added — stores need opt-in migration', severity: 'low' },
  { id: 'd4', label: 'No loading skeletons for async operations', severity: 'medium' },
  { id: 'd5', label: 'Google Fonts loaded via @import (blocks render)', severity: 'low' },
]

export const PLATFORM_STATUS = [
  { labelKey: 'platformHealth.architecture', status: 'good',    note: 'Layered, module-based, consistent' },
  { labelKey: 'platformHealth.typescript',   status: 'good',    note: 'Strict mode, 0 errors' },
  { labelKey: 'platformHealth.build',        status: 'good',    note: 'Clean production build' },
  { labelKey: 'platformHealth.deployment',   status: 'good',    note: 'Live at mrnednick.github.io/VibeOS' },
  { labelKey: 'platformHealth.i18n',         status: 'good',    note: 'EN + RU, custom Pinia store, 90+ keys' },
  { labelKey: 'platformHealth.tests',        status: 'missing', note: 'Vitest planned in S5' },
  { labelKey: 'platformHealth.backend',      status: 'planned', note: 'Supabase sync planned in S3' },
  { labelKey: 'platformHealth.identity',     status: 'planned', note: 'Logo, vibe-paks, landing — active S1' },
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
    progress: 75,
    milestone: 'Life stats strip shipped — Habits/Goals/Learning/Training indicators live on Dashboard',
    shippedTasks: [
      { label: 'Module quick-launch → button in sidebar', date: '2026-05-26' },
      { label: 'Per-module detail panel with progress bars', date: '2026-05-26' },
      { label: 'All-tasks aggregated overview panel', date: '2026-05-26' },
      { label: 'Stat cards redesigned as widgets with icons and progress bar', date: '2026-05-26' },
      { label: 'Responsive layout: stat cards 2×2 on md, 1-col on sm', date: '2026-05-26' },
      { label: 'Life stats strip: Habits today, Active goals, Learning today, Training today', date: '2026-05-27' },
      { label: 'Dynamic version display via __APP_VERSION__ (no more hardcoded v0.x)', date: '2026-05-27' },
    ],
    nextTasks: [
      { label: 'S2: replace dev stat cards with live life widgets (Today tasks, habits, goals)', priority: 'high' },
      { label: 'S2: move platform metrics (modules, docs, build status) into a Platform tab', priority: 'high' },
      { label: 'Optional quote / motivational widget', priority: 'low' },
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
    progress: 85,
    milestone: 'Appearance + Keyboard cheatsheet + Data export/clear fully functional',
    shippedTasks: [
      { label: 'Settings view at /settings with Appearance section', date: '2026-05-27' },
      { label: 'Theme toggle: dark / light with instant preview', date: '2026-05-27' },
      { label: 'Language picker: EN / RU switch', date: '2026-05-27' },
      { label: 'Keyboard shortcuts cheatsheet — full table with <kbd> styling', date: '2026-05-27' },
      { label: 'Data export: download all localStorage as dated JSON backup', date: '2026-05-27' },
      { label: 'Clear all data with 5s confirm dialog + auto-cancel', date: '2026-05-27' },
      { label: 'Marked available in module registry (no more wip badge)', date: '2026-05-27' },
    ],
    nextTasks: [
      { label: 'API keys panel (Anthropic, OpenWeather) for Studio + widgets', priority: 'high' },
      { label: 'Vibe-pak / accent color picker in Appearance (S1)', priority: 'high' },
      { label: 'Notification preferences (toasts, sounds, frequency)', priority: 'medium' },
      { label: 'Privacy & data preferences section', priority: 'medium' },
    ],
    improvements: [
      'Vibe-pak + accent color + font picker in Appearance',
      'Per-app accent override',
      'API key storage abstraction (encrypted in localStorage)',
      'Account section with profile (S3 Supabase dep)',
      'Custom keyboard shortcuts editor',
      'Data import from JSON backup',
      'Notification toggle per module',
    ],
    techDebt: [],
    ideas: [
      'Settings sync via Supabase when logged in',
      'Profile photo + display name',
      'Data export/import between devices via QR code',
      'Reset individual module data (not just clear all)',
    ],
    notes: 'Core settings fully functional. Remaining gap: API keys panel (unblocks Studio production use) and vibe-paks picker. Future: account, notifications, privacy, data import.',
  },

  about: {
    progress: 82,
    milestone: 'Shipped modules list, quick stats, live site link, stack grid',
    shippedTasks: [
      { label: 'About page at /about with VibeOS logo SVG', date: '2026-05-27' },
      { label: 'Tech stack grid: Vue 3, Vite, Pinia, Router, Lucide, marked, highlight.js', date: '2026-05-27' },
      { label: 'Version row with GitHub + live site links', date: '2026-05-27' },
      { label: 'Responsive: single-column on mobile', date: '2026-05-27' },
      { label: 'Shipped modules list with icons and descriptions', date: '2026-05-27' },
      { label: 'Quick stats row: modules, TS errors, dependencies, bundle size', date: '2026-05-27' },
      { label: 'Marked available in module registry (no more wip badge)', date: '2026-05-27' },
    ],
    nextTasks: [
      { label: 'Personal card: name, role, short bio', priority: 'high' },
      { label: 'Links: GitHub, X/Twitter, LinkedIn, email', priority: 'high' },
      { label: 'Optional resume PDF link', priority: 'low' },
    ],
    improvements: [
      '"Made with" credits listing the tools that built VibeOS',
    ],
    techDebt: [],
    ideas: [
      'Photo or avatar',
      'Short timeline of projects',
      'Now / currently working on section',
    ],
    notes: 'Foundation solid. One remaining gap: personal bio + social links to complete portfolio anchor purpose.',
  },

  'task-manager': {
    progress: 76,
    milestone: 'Foundation solid + due dates + life categories — S4 Today/Focus/Streaks pending',
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
      { label: 'Due date field: dueDate?: string on Task type', date: '2026-05-27' },
      { label: 'Due date badge on task items: overdue (red), today (amber), upcoming (muted)', date: '2026-05-27' },
      { label: 'setDueDate() action on tasks store + propagation through TaskList', date: '2026-05-27' },
      { label: 'Life categories: work / learning / training / personal / goal with filter chips', date: '2026-05-27' },
      { label: 'Colored category badge on task items (blue/purple/orange/teal/pink)', date: '2026-05-27' },
      { label: 'Category selector in new task input row (shown when typing)', date: '2026-05-27' },
    ],
    nextTasks: [
      { label: 'S4: Today view (filter by due == today)', priority: 'high' },
      { label: 'S4: Focus mode with Pomodoro timer', priority: 'high' },
      { label: 'S4: Streak counter + heatmap (≥1 done/day)', priority: 'high' },
      { label: 'S4: Natural-language input ("tomorrow" → sets dueDate)', priority: 'medium' },
      { label: 'S4: Lock in product name (recommended: Stride)', priority: 'high' },
      { label: 'Date picker in task add input', priority: 'medium' },
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
    progress: 78,
    milestone: 'Split mode removed — clean edit/preview two-mode UX; backlinks still pending S4',
    shippedTasks: [
      { label: 'Three-pane workspace: list / editor / preview', date: '2026-05-26' },
      { label: 'Live markdown preview with marked', date: '2026-05-26' },
      { label: 'Auto-save with 300ms debounce', date: '2026-05-26' },
      { label: 'Keyboard shortcuts: ⌘N new, ⌘F search, ⌘⇧P toggle edit/preview', date: '2026-05-26' },
      { label: 'Pin notes to top of list', date: '2026-05-26' },
      { label: 'Word count + reading time in toolbar', date: '2026-05-26' },
      { label: 'Export note as .md file download', date: '2026-05-26' },
      { label: 'Code block syntax highlighting in preview (highlight.js)', date: '2026-05-26' },
      { label: '"Today" button — opens/creates daily journal note (# YYYY-MM-DD)', date: '2026-05-27' },
      { label: 'Remove split mode — EditorMode is edit | preview only (cleaner UX)', date: '2026-05-27' },
    ],
    nextTasks: [
      { label: 'S4: Parse [[wiki-style links]] + clickable navigation', priority: 'high' },
      { label: 'S4: Backlinks panel (incoming references)', priority: 'high' },
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
    progress: 90,
    milestone: 'S4 differentiators shipped — timeline swimlanes + task import + due dates',
    shippedTasks: [
      { label: 'Board module at /kanban — 3-column layout (Backlog / In Progress / Done)', date: '2026-05-27' },
      { label: 'Native HTML5 drag-and-drop cards between columns', date: '2026-05-27' },
      { label: 'Add card inline per column (textarea, Enter to confirm)', date: '2026-05-27' },
      { label: 'Inline card title editing (double-click)', date: '2026-05-27' },
      { label: 'Expandable card detail: description (double-click to edit)', date: '2026-05-27' },
      { label: 'Priority system (5 levels) — color strip on card left edge, click to cycle', date: '2026-05-27' },
      { label: 'Card count per column + total count in header', date: '2026-05-27' },
      { label: 'Drag-over column highlight with depth counter (no false triggers)', date: '2026-05-27' },
      { label: 'localStorage persistence via useStorage', date: '2026-05-27' },
      { label: 'Event bus: card added → card:created, card moved → card:moved, Done → task:completed', date: '2026-05-27' },
      { label: 'Responsive: 2-col on md, 1-col on sm', date: '2026-05-27' },
      { label: 'Timeline swimlane view — rows = overdue/today/tomorrow/this-week/later/no-date', date: '2026-05-27' },
      { label: '2D drag-and-drop in timeline: dropping sets both column AND due date simultaneously', date: '2026-05-27' },
      { label: 'Kanban ↔ Timeline view toggle (persisted in localStorage)', date: '2026-05-27' },
      { label: 'Card due dates: inline date picker in expanded card, badge with overdue/today/later styling', date: '2026-05-27' },
      { label: 'Task import panel: slide-in panel lists active tasks, import as board card with link', date: '2026-05-27' },
      { label: 'Auto-complete linked Task when card moves to Done (lazy store import, no circular deps)', date: '2026-05-27' },
      { label: 'Source task indicator on imported cards', date: '2026-05-27' },
    ],
    nextTasks: [
      { label: 'Drag to reorder within a column', priority: 'medium' },
      { label: 'WIP limits per column with visual warning', priority: 'medium' },
      { label: 'Labels / color tags on cards', priority: 'low' },
    ],
    improvements: [
      'Drag within column for reordering',
      'Column WIP limits with visual overflow indicator',
    ],
    techDebt: [
      { label: 'No drag-to-reorder within a column — only cross-column/row drag', severity: 'low' },
    ],
    ideas: [
      'Sprint planning view (group cards into time-boxed sprints)',
      'Import from Trello / Linear JSON export',
      'Archived column for closed cards',
      'Board activity log via event bus',
    ],
    notes: 'Foundation solid. S4 differentiator = time-based swimlanes + Tasks unification. Current cards store is separate — merge in S4.',
  },

  'ai-playground': {
    progress: 70,
    milestone: 'Core Prompt Lab live + studio:run event wired to activity feed',
    shippedTasks: [
      { label: 'Studio module at /ai — prompt input + response output two-pane layout', date: '2026-05-27' },
      { label: 'Model selector: Opus / Sonnet / Haiku with visual differentiation', date: '2026-05-27' },
      { label: 'API key stored locally (platform:studio:apikey), show/hide toggle', date: '2026-05-27' },
      { label: 'System prompt section (collapsible)', date: '2026-05-27' },
      { label: 'Response meta: model, token count (in/out), duration', date: '2026-05-27' },
      { label: 'Copy response to clipboard', date: '2026-05-27' },
      { label: 'Run history — last 20 runs, searchable, click to restore', date: '2026-05-27' },
      { label: 'Keyboard shortcut ⌘↵ to run', date: '2026-05-27' },
      { label: 'CORS error with helpful hint message', date: '2026-05-27' },
      { label: 'studio:run event emitted on each successful run — visible in Recent Activity', date: '2026-05-27' },
    ],
    nextTasks: [
      { label: 'Parallel run: same prompt → Opus + Sonnet + Haiku side-by-side', priority: 'high' },
      { label: 'Streaming responses with cancel button', priority: 'high' },
      { label: 'Move API key storage to Settings → API Keys panel', priority: 'medium' },
      { label: 'Prompt templates library with categories', priority: 'medium' },
      { label: 'Export run to markdown / clipboard', priority: 'low' },
      { label: 'Temperature + top_p sliders', priority: 'low' },
    ],
    improvements: [
      'Streaming with partial response rendering',
      'Side-by-side model comparison (the main differentiator)',
      'Prompt versioning with diff view',
      'Token cost tracker (calculate $$ per run)',
    ],
    techDebt: [
      { label: 'Direct browser API call — may hit CORS on some setups', severity: 'medium' },
    ],
    ideas: [
      'Tool use / function calling demo panel',
      'Prompt eval / scoring (A/B compare)',
      'Export conversation as markdown',
      'Prompt library shared between users (Supabase dep)',
    ],
    notes: 'Differentiator = parallel model comparison, NOT another ChatGPT clone. Currently single-model; parallel view is the S4 upgrade.',
  },

  snippets: {
    progress: 100,
    milestone: 'Full module shipped — list, detail, filter, copy, tags, syntax highlighting, event bus',
    shippedTasks: [
      { label: 'Snippets module at /snippets — list + detail two-pane layout', date: '2026-05-27' },
      { label: 'Data model: Snippet { id, title, language, code, tags, createdAt }', date: '2026-05-27' },
      { label: 'highlight.js syntax highlighting in detail view', date: '2026-05-27' },
      { label: 'Language filter bar + tag filter', date: '2026-05-27' },
      { label: 'One-click copy button per snippet', date: '2026-05-27' },
      { label: 'Create / edit / delete snippets with localStorage persistence', date: '2026-05-27' },
      { label: 'snippet:created event emitted on create — visible in Recent Activity', date: '2026-05-27' },
    ],
    nextTasks: [
      { label: 'Import from GitHub gists', priority: 'low' },
      { label: 'Snippet → Note cross-link', priority: 'low' },
    ],
    improvements: [
      'Code editor with real syntax highlighting (CodeMirror — evaluate bundle cost)',
      'Snippet templates (component scaffolds, common patterns)',
      'Public sharing via short URL (S3 dep)',
    ],
    techDebt: [],
    ideas: [
      'Variables in snippets ({{name}} placeholders)',
      'Import from GitHub gists',
      'Export all snippets as a JSON backup',
    ],
    notes: 'Fully shipped. Retained for now — unique developer value. Open decision: user is evaluating whether to keep or remove. Will decide after more usage.',
  },

  habits: {
    progress: 85,
    milestone: 'Full module live — check-offs, streaks, heatmap, inline edit, confirm delete',
    shippedTasks: [
      { label: 'Habits module at /habits — daily check-off list', date: '2026-05-27' },
      { label: 'Data model: Habit + per-day boolean log in localStorage', date: '2026-05-27' },
      { label: 'Per-habit GitHub-style contribution heatmap', date: '2026-05-27' },
      { label: 'Streak counter with Russian plural support (1 день / 2 дня / 5 дней)', date: '2026-05-27' },
      { label: 'Inline habit name editing (click to edit, Enter/Esc)', date: '2026-05-27' },
      { label: 'Confirm-before-delete with 4s auto-cancel timeout', date: '2026-05-27' },
      { label: 'Add / remove habits with empty state', date: '2026-05-27' },
    ],
    nextTasks: [
      { label: 'Achievements via event bus (S2 dep)', priority: 'low' },
      { label: 'Habit categories (health, learning, etc)', priority: 'low' },
      { label: 'Reminders via toast notifications', priority: 'low' },
    ],
    improvements: [
      'Heatmap widget on Dashboard',
      'Cross-habit consistency overview',
      'Freeze days (skip one day without breaking streak)',
    ],
    techDebt: [],
    ideas: [
      'Streak-loss recovery: optional "freeze" days',
      'Share streak as an image',
      'Weekly summary notification',
    ],
    notes: 'Feature-complete v1. High "lived-in" feeling. Next: event bus integration for achievements.',
  },

  games: {
    progress: 97,
    milestone: 'All four games shipped — Minesweeper (replaced 2048), Memory, Snake (wall wrap)',
    shippedTasks: [
      { label: 'Game lobby at /games — SVG previews, best scores, colored accents', date: '2026-05-27' },
      { label: 'Memory Cards — CSS 3D flip, best time per difficulty', date: '2026-05-27' },
      { label: 'Snake — canvas game loop, difficulty levels, best score', date: '2026-05-27' },
      { label: 'Snake: wall wrap — boundary collision wraps (modulo) instead of game over', date: '2026-05-27' },
      { label: 'Minesweeper — 9×9 grid, 10 mines, first-click safety (3×3 safe zone)', date: '2026-05-27' },
      { label: 'Minesweeper — flood-fill reveal, right-click flags, timer, best-time persistence', date: '2026-05-27' },
      { label: 'Replaced 2048 with Minesweeper (more original + showcases algorithm knowledge)', date: '2026-05-27' },
    ],
    nextTasks: [
      { label: 'Achievements via event bus (S2 dep)', priority: 'low' },
      { label: 'High scores on Dashboard widget', priority: 'low' },
      { label: 'CRT vibe-pak easter-egg skin', priority: 'low' },
      { label: 'New game: Tetris (most visually impressive)', priority: 'low' },
    ],
    improvements: [
      'Achievements feed (event bus integration)',
      'Daily challenge with shared seed',
      'Sound effects toggle (Web Audio API)',
    ],
    techDebt: [],
    ideas: [
      'Tetris — most visually impressive, fits VibeOS grid aesthetic',
      'Wordle clone (keyboard + word dictionary)',
      'Pong vs AI',
    ],
    notes: 'Four games, all original implementations. Minesweeper showcases flood-fill + first-click safety algorithm. Tetris is the natural next pick.',
  },

  goals: {
    progress: 85,
    milestone: 'Full Goals module shipped — milestones, progress tracking, target dates, sorted by deadline',
    shippedTasks: [
      { label: 'Goals module at /goals — list view with GoalCard components', date: '2026-05-27' },
      { label: 'Data model: Goal { id, title, description, status, category, targetDate, progress, milestones }', date: '2026-05-27' },
      { label: 'Milestone support: nested milestones per goal with completion tracking', date: '2026-05-27' },
      { label: 'Auto-computed progress from milestone completion %', date: '2026-05-27' },
      { label: 'Goal detail view with debounced notes editor', date: '2026-05-27' },
      { label: 'Goal status lifecycle: active → paused / completed', date: '2026-05-27' },
      { label: 'Active goals sorted by nearest target date first', date: '2026-05-27' },
      { label: 'Dashboard integration: Active Goals count in life stats strip', date: '2026-05-27' },
      { label: 'Event bus: goal:created, goal:completed, goal:milestone:completed', date: '2026-05-27' },
    ],
    nextTasks: [
      { label: 'S4: Link tasks to goals (linkedGoalId on Task)', priority: 'high' },
      { label: 'S4: Habit → Goal integration (habit completion increments goal progress)', priority: 'high' },
      { label: 'Goal progress ring / visual indicator on GoalCard', priority: 'medium' },
      { label: 'Goal category filter (work / learning / training / personal)', priority: 'medium' },
      { label: 'Archive completed goals with history view', priority: 'low' },
    ],
    improvements: [
      'Visual progress ring on GoalCard (like Learning/Training rings)',
      'Milestone due dates',
      'Goal dependency graph (this goal requires that goal)',
      'Weekly goal review prompt',
    ],
    techDebt: [
      { label: 'Progress is milestone-only — no manual override', severity: 'low' },
    ],
    ideas: [
      'AI: suggest tasks and milestones for a goal (S6)',
      'Goal templates (e.g. "Run a half-marathon" → pre-filled milestones)',
      'Share goal publicly (Supabase dep)',
      'Goal retrospective after completion',
    ],
    notes: 'Central connector for all life modules. S4: Tasks + Habits link here. S5: Learning/Training sessions increment goal progress. S6: AI goal planning.',
  },

  learning: {
    progress: 85,
    milestone: 'Full Learning module shipped — plans, session logs, progress rings, streaks, today strip',
    shippedTasks: [
      { label: 'Learning module at /learning — plans list + detail view', date: '2026-05-27' },
      { label: 'Data model: LearningPlan { id, title, topic, description, sessions, targetDate }', date: '2026-05-27' },
      { label: 'Session log: log study sessions with minutes and notes', date: '2026-05-27' },
      { label: 'Progress ring: visual completion % per plan', date: '2026-05-27' },
      { label: 'Streak counter: consecutive days with at least one session', date: '2026-05-27' },
      { label: 'Today strip: shows if learning session logged today', date: '2026-05-27' },
      { label: 'Plan detail view with session history list', date: '2026-05-27' },
      { label: 'Dashboard integration: Learning today indicator in life stats strip', date: '2026-05-27' },
      { label: 'Event bus: learning:session:completed, learning:plan:created, learning:plan:completed', date: '2026-05-27' },
    ],
    nextTasks: [
      { label: 'S4/S5: Link sessions to goals (linkedGoalId)', priority: 'high' },
      { label: 'S5: Learning analytics — total hours, daily chart, topic breakdown', priority: 'high' },
      { label: 'S5: Habits → Learning integration (logging session marks habit done)', priority: 'medium' },
      { label: 'Resource list per plan (links, books, courses)', priority: 'medium' },
      { label: 'Focus timer in session log (Pomodoro-style)', priority: 'low' },
    ],
    improvements: [
      'Resource list (links, books, courses) per plan',
      'Weekly learning hours chart',
      'Spaced repetition reminders',
      'Session notes with markdown',
    ],
    techDebt: [],
    ideas: [
      'AI: generate a learning plan for a topic in N weeks (S6)',
      'Import from Notion / Obsidian',
      'Flashcard mode from session notes',
      'Public study room (Supabase dep)',
    ],
    notes: 'Foundation solid. S5 adds analytics and Dashboard full integration. S6 adds AI plan generation.',
  },

  training: {
    progress: 85,
    milestone: 'Full Training module shipped — plans, workout logs, feeling emoji, streaks, km tracking',
    shippedTasks: [
      { label: 'Training module at /training — plans list + detail view', date: '2026-05-27' },
      { label: 'Data model: TrainingPlan { id, title, type, description, sessions, targetDate }', date: '2026-05-27' },
      { label: 'Workout log: log sessions with duration, km distance, feeling emoji', date: '2026-05-27' },
      { label: 'Streak counter: consecutive training days', date: '2026-05-27' },
      { label: 'km tracking: total distance across all sessions per plan', date: '2026-05-27' },
      { label: 'Today strip: shows if workout logged today', date: '2026-05-27' },
      { label: 'Plan detail view with session history list', date: '2026-05-27' },
      { label: 'Dashboard integration: Training today indicator in life stats strip', date: '2026-05-27' },
      { label: 'Event bus: training:workout:logged, training:plan:created', date: '2026-05-27' },
    ],
    nextTasks: [
      { label: 'S4/S5: Link workouts to goals (linkedGoalId)', priority: 'high' },
      { label: 'S5: Training analytics — workout frequency chart, km over time, feeling trends', priority: 'high' },
      { label: 'S5: Habits → Training integration (logging workout marks habit done)', priority: 'medium' },
      { label: 'Exercise library per plan (exercise name, sets, reps, weight)', priority: 'medium' },
      { label: 'Rest day tracking', priority: 'low' },
    ],
    improvements: [
      'Exercise list per session (sets × reps × weight)',
      'Weekly training volume chart',
      'Heart rate / RPE zones',
      'Personal records tracking',
    ],
    techDebt: [],
    ideas: [
      'AI: analyze session and suggest improvements (S6)',
      'Strava integration for auto-import',
      'Body weight / measurement tracking',
      'Training plan templates (5K plan, strength program)',
    ],
    notes: 'Foundation solid. S5 adds analytics. S6 adds AI workout analysis. Mobile check-ins important — PWA planned post-S5.',
  },
}
