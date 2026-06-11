import { storagGet, storageSet, storageRemove, storageKey } from './storage'

const SEED_FLAG = 'platform:demo:v1:seeded'
const DEMO_ID_PREFIX = 'demo-'

/**
 * Remove demo-seeded records before a real (Supabase) session takes over the
 * same localStorage. Without this, register()/login() uploads the fake seed
 * data into the user's real account. Records the user created during demo
 * (non `demo-` ids) are kept and carry over. Flag-guarded — runs once.
 */
export function purgeDemoData(): void {
  if (!storagGet(SEED_FLAG, false)) return

  const seededListKeys = [
    storageKey('task-manager', 'tasks'),
    storageKey('goals', 'goals'),
    storageKey('habits', 'habits'),
    storageKey('notes', 'notes'),
    storageKey('finance', 'expenses'),
    storageKey('kanban', 'cards'),
  ]
  for (const key of seededListKeys) {
    const items = storagGet<Array<{ id?: string }>>(key, [])
    if (!Array.isArray(items)) continue
    const kept = items.filter(i => !String(i?.id ?? '').startsWith(DEMO_ID_PREFIX))
    if (kept.length !== items.length) storageSet(key, kept)
  }

  // Seeded budgets carry no ids, so they can't be told apart from budgets
  // edited during demo — drop the whole key (demo is a sandbox).
  storageRemove(storageKey('finance', 'budgets'))
  storageRemove(SEED_FLAG)
}

export function seedDemoData(): void {
  if (storagGet(SEED_FLAG, false)) return

  const today = new Date()
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return iso(d) }
  const daysFrom = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return iso(d) }

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const tasksKey = storageKey('task-manager', 'tasks')
  if (!storagGet<unknown[]>(tasksKey, []).length) {
    const now = Date.now()
    storageSet(tasksKey, [
      {
        id: 'demo-task-1', text: 'Finish project proposal draft', done: true,
        priority: 'high', category: 'work', dueDate: daysAgo(2),
        completedAt: new Date(now - 2 * 86400000).toISOString(),
        createdAt: now - 7 * 86400000,
      },
      {
        id: 'demo-task-2', text: 'Review Q2 analytics report', done: false,
        priority: 'urgent', category: 'work', dueDate: iso(today),
        createdAt: now - 86400000,
      },
      {
        id: 'demo-task-3', text: 'Morning run – 5K', done: true,
        priority: 'medium', category: 'training', dueDate: iso(today),
        completedAt: today.toISOString(),
        createdAt: now - 3 * 86400000,
      },
      {
        id: 'demo-task-4', text: 'Read chapter 5 of "Deep Work"', done: false,
        priority: 'low', category: 'learning', createdAt: now - 4 * 86400000,
      },
      {
        id: 'demo-task-5', text: 'Schedule dentist appointment', done: false,
        priority: 'medium', category: 'personal', dueDate: daysFrom(3),
        createdAt: now - 86400000,
      },
      {
        id: 'demo-task-6', text: 'Update portfolio with new case studies', done: false,
        priority: 'high', category: 'work', dueDate: daysFrom(7),
        createdAt: now - 5 * 86400000,
      },
      {
        id: 'demo-task-7', text: '10-minute meditation', done: true,
        priority: 'none', category: 'personal',
        completedAt: today.toISOString(), createdAt: now - 2 * 86400000,
      },
    ])
  }

  // ── Goals ─────────────────────────────────────────────────────────────────
  const goalsKey = storageKey('goals', 'goals')
  if (!storagGet<unknown[]>(goalsKey, []).length) {
    storageSet(goalsKey, [
      {
        id: 'demo-goal-1', title: 'Run a half marathon', category: 'health',
        coverEmoji: '🏃', description: 'Train consistently and complete a 21K race by fall.',
        targetDate: daysFrom(120), status: 'active',
        milestones: [
          { id: 'dm-1-1', title: 'Run 5K without stopping', completed: true, completedAt: daysAgo(14), order: 0 },
          { id: 'dm-1-2', title: 'Complete 10K training run', completed: true, completedAt: daysAgo(5), order: 1 },
          { id: 'dm-1-3', title: 'Run 15K', completed: false, order: 2 },
          { id: 'dm-1-4', title: 'Race day — half marathon', completed: false, order: 3 },
        ],
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: 'demo-goal-2', title: 'Launch a side project', category: 'project',
        coverEmoji: '🚀', description: 'Build and ship a SaaS product to first paying customers.',
        targetDate: daysFrom(90), status: 'active',
        milestones: [
          { id: 'dm-2-1', title: 'Define MVP scope', completed: true, completedAt: daysAgo(10), order: 0 },
          { id: 'dm-2-2', title: 'Build landing page', completed: true, completedAt: daysAgo(4), order: 1 },
          { id: 'dm-2-3', title: 'Beta launch to 10 testers', completed: false, order: 2 },
          { id: 'dm-2-4', title: 'First paying customer', completed: false, order: 3 },
        ],
        createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      },
      {
        id: 'demo-goal-3', title: 'Read 12 books this year', category: 'skill',
        coverEmoji: '📚', description: '1 book per month — mix of fiction and non-fiction.',
        targetDate: daysFrom(210), status: 'active',
        milestones: [
          { id: 'dm-3-1', title: 'Book 1: Atomic Habits', completed: true, completedAt: daysAgo(60), order: 0 },
          { id: 'dm-3-2', title: 'Book 2: Deep Work', completed: true, completedAt: daysAgo(25), order: 1 },
          { id: 'dm-3-3', title: 'Book 3: The Lean Startup', completed: false, order: 2 },
          { id: 'dm-3-4', title: 'Book 4: Thinking Fast and Slow', completed: false, order: 3 },
        ],
        createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      },
    ])
  }

  // ── Habits ────────────────────────────────────────────────────────────────
  const habitsKey = storageKey('habits', 'habits')
  if (!storagGet<unknown[]>(habitsKey, []).length) {
    const skip = (dates: string[], idx: number[]) => dates.filter((_, i) => !idx.includes(i))
    const last14 = Array.from({ length: 14 }, (_, i) => daysAgo(i)).reverse()
    const last10 = Array.from({ length: 10 }, (_, i) => daysAgo(i)).reverse()
    const last8  = Array.from({ length: 8  }, (_, i) => daysAgo(i)).reverse()
    const last5  = Array.from({ length: 5  }, (_, i) => daysAgo(i)).reverse()

    storageSet(habitsKey, [
      {
        id: 'demo-habit-1', name: 'Morning workout', emoji: '💪',
        purpose: 'Build strength and energy for the day', category: 'health',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        completedDates: skip(last14, [2, 9]), lastMilestone: 7,
      },
      {
        id: 'demo-habit-2', name: 'Read for 30 minutes', emoji: '📚',
        purpose: 'Learn something new every day', category: 'learning',
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
        completedDates: skip(last10, [4]),
      },
      {
        id: 'demo-habit-3', name: 'Drink 2L of water', emoji: '💧',
        category: 'health',
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        completedDates: skip(last8, [3, 7]),
      },
      {
        id: 'demo-habit-4', name: 'Evening journaling', emoji: '✍️',
        purpose: 'Reflect and decompress before sleep', category: 'productivity',
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        completedDates: last5,
      },
      {
        id: 'demo-habit-5', name: 'No social media before noon', emoji: '🚫',
        category: 'productivity',
        createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
        completedDates: skip(last8, [1, 5]),
      },
    ])
  }

  // ── Notes ─────────────────────────────────────────────────────────────────
  const notesKey = storageKey('notes', 'notes')
  if (!storagGet<unknown[]>(notesKey, []).length) {
    const now = Date.now()
    storageSet(notesKey, [
      {
        id: 'demo-note-1', pinned: true,
        content: '# Project Ideas\n\n## SaaS ideas to explore\n\n- **Habit tracker with AI coaching** — personalized suggestions based on streak patterns\n- **Invoice generator** for freelancers with automatic PDF export\n- **Team mood board** — daily 1-click check-in for remote teams\n\n## Notes\n\nThe habit tracker idea has the most traction. Research existing tools this week.',
        createdAt: new Date(now - 5 * 86400000).toISOString(),
        updatedAt: new Date(now - 2 * 86400000).toISOString(),
      },
      {
        id: 'demo-note-2',
        content: '# Meeting Notes — Monday\n\n## Attendees\nAlex, Sarah, Mike\n\n## Topics\n- Q2 goals review → on track\n- New feature roadmap for July\n- Budget allocation for marketing (agreed: €2,000/month trial)\n\n## Action items\n- [ ] Mike: analytics report by Wednesday\n- [ ] Sarah: A/B test for landing page CTA\n- [ ] Alex: review competitor pricing',
        createdAt: new Date(now - 3 * 86400000).toISOString(),
        updatedAt: new Date(now - 3 * 86400000).toISOString(),
      },
      {
        id: 'demo-note-3',
        content: '# 2026 Focus Areas\n\n1. **Health** — consistent workout routine, reach target weight\n2. **Projects** — ship at least one side project to paying customers\n3. **Learning** — 12 books, 2 online courses (technical + non-technical)\n4. **Finance** — 3-month emergency fund, start investing regularly\n\n> "Don\'t half-ass two things. Whole-ass one thing." — Ron Swanson',
        createdAt: new Date(now - 90 * 86400000).toISOString(),
        updatedAt: new Date(now - 7 * 86400000).toISOString(),
      },
    ])
  }

  // ── Finance ───────────────────────────────────────────────────────────────
  const expensesKey = storageKey('finance', 'expenses')
  const budgetsKey  = storageKey('finance', 'budgets')
  if (!storagGet<unknown[]>(expensesKey, []).length) {
    const m = today.toISOString().slice(0, 7)
    const md = (d: number) => `${m}-${String(d).padStart(2, '0')}`
    const nowIso = today.toISOString()
    storageSet(expensesKey, [
      { id: 'demo-exp-1',  amount: 87.50,  category: 'food',          note: 'Weekly grocery run',      date: md(1), recurring: false, createdAt: nowIso },
      { id: 'demo-exp-2',  amount: 1200,   category: 'housing',       note: 'Monthly rent',            date: md(1), recurring: true,  createdAt: nowIso },
      { id: 'demo-exp-3',  amount: 45,     category: 'transport',     note: 'Monthly transit pass',    date: md(2), recurring: true,  createdAt: nowIso },
      { id: 'demo-exp-4',  amount: 24.90,  category: 'food',          note: 'Lunch with colleagues',   date: md(2), recurring: false, createdAt: nowIso },
      { id: 'demo-exp-5',  amount: 14.99,  category: 'entertainment', note: 'Spotify Premium',         date: md(3), recurring: true,  createdAt: nowIso },
      { id: 'demo-exp-6',  amount: 67.20,  category: 'food',          note: 'Grocery run',             date: md(3), recurring: false, createdAt: nowIso },
      { id: 'demo-exp-7',  amount: 120,    category: 'health',        note: 'Gym membership',          date: md(1), recurring: true,  createdAt: nowIso },
      { id: 'demo-exp-8',  amount: 45.99,  category: 'shopping',      note: 'New running gear',        date: md(2), recurring: false, createdAt: nowIso },
      { id: 'demo-exp-9',  amount: 200,    category: 'savings',       note: 'Emergency fund transfer', date: md(1), recurring: true,  createdAt: nowIso },
      { id: 'demo-exp-10', amount: 18.50,  category: 'food',          note: 'Coffee shop work session',date: md(2), recurring: false, createdAt: nowIso },
    ])
    storageSet(budgetsKey, [
      { category: 'food',          monthlyLimit: 350 },
      { category: 'housing',       monthlyLimit: 1200 },
      { category: 'transport',     monthlyLimit: 60 },
      { category: 'health',        monthlyLimit: 150 },
      { category: 'entertainment', monthlyLimit: 50 },
      { category: 'shopping',      monthlyLimit: 100 },
      { category: 'savings',       monthlyLimit: 300 },
    ])
  }

  // ── Board ─────────────────────────────────────────────────────────────────
  const cardsKey = storageKey('kanban', 'cards')
  if (!storagGet<unknown[]>(cardsKey, []).length) {
    const nowIso = today.toISOString()
    const ago = (n: number) => new Date(Date.now() - n * 86400000).toISOString()
    storageSet(cardsKey, [
      {
        id: 'demo-card-1', title: 'Redesign landing page hero section',
        description: 'Focus on value proposition and social proof.',
        priority: 'high', columnId: 'in-progress', dueDate: daysFrom(5),
        createdAt: ago(7), updatedAt: nowIso,
      },
      {
        id: 'demo-card-2', title: 'Set up product analytics dashboard',
        description: 'Track key metrics: MAU, churn, feature adoption.',
        priority: 'medium', columnId: 'in-progress', dueDate: daysFrom(10),
        createdAt: ago(5), updatedAt: nowIso,
      },
      {
        id: 'demo-card-3', title: 'Write blog post: "5 productivity habits"',
        description: '',
        priority: 'low', columnId: 'backlog',
        createdAt: ago(10), updatedAt: nowIso,
      },
      {
        id: 'demo-card-4', title: 'Implement user onboarding flow',
        description: 'Welcome email + in-app checklist for new signups.',
        priority: 'urgent', columnId: 'backlog', dueDate: daysFrom(14),
        createdAt: ago(3), updatedAt: nowIso,
      },
      {
        id: 'demo-card-5', title: 'Fix mobile navigation overlap bug',
        description: 'Bottom tabs overlap page content on small screens.',
        priority: 'high', columnId: 'done',
        createdAt: ago(14), updatedAt: ago(2),
      },
      {
        id: 'demo-card-6', title: 'Add dark mode support',
        description: '',
        priority: 'medium', columnId: 'done',
        createdAt: ago(20), updatedAt: ago(5),
      },
    ])
  }

  storageSet(SEED_FLAG, true)
}
