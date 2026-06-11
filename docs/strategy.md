# VibeOS — Strategy & Vision

> Updated 2026-06-11 (v6). Reflects shipped state at v2.7.16 — backend LIVE, S1–S30 closed except S13/S16-T7 (live review). Sprint truth lives in `docs/roadmap.md`; this file owns positioning + architecture decisions only.
> ⚠️ **Keep this file current.** Any change to product positioning, module direction, or architecture decisions must be reflected here in the same session.

> See `docs/privacy-security.md` for the public/private/auth plan.
> See `docs/roadmap.md` for the sprint execution plan.

---

## 1. What VibeOS Is

VibeOS is a personal life operating system — a single app where you manage everything that matters day to day:

- What to do (tasks, priorities, focus)
- What you're working towards (goals, milestones)
- How you're living (habits, training, health)
- What you're learning (structured learning plans)
- Notes and thinking (plans, ideas, project notes)
- Your progress over time (personal analytics)

It is not a portfolio demo that mimics real tools. It is a real tool that also happens to demonstrate sophisticated engineering.

It is not a SaaS. It is a personal system for one person — you. That framing is the product identity.

---

## 2. The Dual-Mode Reality

VibeOS must serve two audiences simultaneously:

| Mode | Audience | What they see |
|------|----------|--------------|
| **Personal** | You (owner) | Real data, full features, authenticated |
| **Demo** | Recruiters, visitors | Seeded fake data, all features, no personal exposure |

This is not a compromise — it is a feature. The "personal OS" concept is *more* compelling to recruiters than a generic task manager, because it shows you built a system you actually use. The demo mode lets them experience it without exposing your data.

See `docs/privacy-security.md` for implementation details.

---

## 3. Positioning

> **Repositioned 2026-06-01.** Primary audience is the owner + friends who want a simpler-than-Notion daily tool; recruiter is a welcome bonus, not the target. We lead with the *mechanism* (everything auto-connects), not a category metaphor. Dropped the short-lived "life efficiency accelerator" framing — too marketing-y for a personal tool. See `docs/roadmap.md` S11 for locked welcome copy.

### Core concept
**"A simpler Notion for your life — where everything is connected."**

Two real, demonstrable strengths drive everything:
1. **Simplicity** — open it and use it, no databases/templates to configure like Notion.
2. **Everything connected** — log a workout → linked habit checks off → linked goal advances, automatically. This auto-cascade across life domains is the one thing you can't rebuild from Notion/Todoist/Obsidian in an hour. It's implemented; the welcome page must *show* it (live cascade demo), not claim it.

Headline (locked): **"Log one thing. Everything updates."**

### Previous concept (superseded)
**"An operating system for your life — the one you actually use every day."**

Not just tasks. Not just habits. Not just notes. All of them, unified, with a dashboard that answers:

- *What should I do today?*
- *What am I building towards?*
- *Am I making progress?*
- *What did I learn this week?*
- *Did I train today?*

### Tagline candidates (choose one for S1 Identity pass)
- "Your personal OS — for life, not just work."
- "All of your life. One system. Zero friction."
- "Boot up your day."
- "An operating system for one person — you."

### Why this positioning is stronger than before
The old positioning ("developer OS for the vibe-coding era") targeted only developers and felt like a demo. The new positioning:
- Explains why these modules exist (they're real tools you use)
- Demonstrates broader engineering capability (auth, sync, multi-module data model, analytics)
- Is more memorable: "personal life OS" is a clear category
- Still has visual appeal (vibe-paks, OS metaphor, command palette)
- The developer-culture aesthetic stays — it is still VibeOS, not a corporate productivity tool

---

## 4. Module Ecosystem

### The unified data model principle

All modules share a coherent data model rather than storing disconnected entities. A task is a task regardless of which view shows it:

```
Task
├── categories: ['work' | 'learning' | 'training' | 'personal' | 'goal']
├── linkedGoal?: Goal
├── linkedHabit?: Habit
├── linkedLearningPlan?: LearningPlan
├── linkedWorkout?: Workout
├── dueDate, priority, status
└── source: 'manual' | 'habit' | 'learning' | 'training' | 'goal'
```

The same task entity can be shown as:
- **List** — Tasks module (current)
- **Kanban card** — Board module (already unified in S4)
- **Dashboard widget** — "Today's tasks" panel
- **Habit-generated** — daily habit check creates a task
- **Learning session** — "Study TypeScript today" auto-created from learning plan
- **Workout** — "Run 5km" auto-created from training plan

This avoids the trap of building many disconnected apps.

### Core modules (all shipped)

| Module | Status | Purpose |
|--------|--------|---------|
| **Dashboard** | ✅ | Daily command center — configurable widgets, live life stats |
| **Tasks** | ✅ | Priority tasks, categories, goal linking, Pomodoro, AI focus, heatmap |
| **Board** | ✅ | Kanban + Timeline, drag-and-drop, search & filter |
| **Notes** | ✅ | Markdown, wiki backlinks, note types (7), goal linking |
| **Habits** | ✅ | Streaks, categories, skip days, retroactive check-ins, milestones, drag sort |
| **Goals** | ✅ | Milestones, progress rings, AI suggestions, linked tasks, linked notes |
| **Learning** | ✅ | Study plans, session logs, AI analysis, resource library, streaks |
| **Training** | ✅ | Workout plans, logs, AI coaching, resource library, streaks |
| **Finance** | ✅ | Expenses, budgets, charts, multi-currency (ExchangeRate API), recurring |
| **Analytics** | ✅ | Habit heatmap, task completion, learning/training charts |
| **Calendar** | ✅ | Monthly grid, 5 activity dot types, day detail panel |
| **Games** | ✅ | Snake, Minesweeper, Memory, Sudoku, Tetris — each with unlock-gated skins |
| **Studio** | ✅ | AI chat: Free (Pollinations.ai, no key) + Claude API (user key) |
| **Settings** | ✅ | 6 vibe-paks, language EN/RU, module visibility, API keys, data export/import |
| **About** | ✅ | Portfolio page with live stats from stores |

### Module categories for sidebar

**Life** — Goals, Habits, Training, Learning (life-oriented modules)
**Work** — Tasks, Board, Notes, Snippets (productivity modules)
**System** — Dashboard, Settings, Studio, About (platform modules)

Replace old "System / Apps" split with "Life / Work / System".

---

## 5. Dashboard as Command Center

The dashboard is the most important screen. It should answer all daily questions in one view.

### Dashboard panels (S2 redesign)

| Panel | Content |
|-------|---------|
| **Today** | Today's tasks + habits + learning session + workout |
| **Focus** | Top 3 priorities for the day |
| **Goals** | Active goals with progress bars |
| **Habits** | Today's habit check-offs |
| **Learning** | Today's learning session (topic + time target) |
| **Training** | Is today a training day? What workout? |
| **Recent** | Last 10 activity events (event bus feed) |
| **Stats** | Weekly streak, task completion rate, habit consistency |

---

## 6. Architecture Decisions

### 6.1 Storage — same strategy, extended schema
```
core/storage/
  adapters/{localStorage,supabase}.ts
  schema/{registry,migrate}.ts
```
`useStorage(key, default, { version, migrations })` — already implemented.
Supabase sync added in S3 as optional layer. Offline-first always.

### 6.2 Backend — Supabase (unchanged)
- Postgres + Supabase Auth + Row Level Security
- Email/password auth (simpler than GitHub OAuth for personal use)
- Demo mode: special seeded account OR local static fixture data
- RLS ensures every user sees only their own rows
- Free tier covers personal use at any realistic scale

### 6.3 Unified task store (S4 architectural work)
Currently Tasks and Board cards share data via unified store (already done in S4). Extend this:
- Add `category` field (work / learning / training / personal / goal)
- Add `linkedGoalId?`, `linkedHabitId?`, `linkedPlanId?`
- Dashboard and all modules query from the same `useTaskStore()`

### 6.4 Event bus — unchanged, extend with new event types
New event types needed:
```ts
| { type: 'goal.created';    payload: Goal }
| { type: 'goal.completed';  payload: { id: string } }
| { type: 'habit.checked';   payload: { id: string; date: string } }
| { type: 'workout.logged';  payload: Workout }
| { type: 'learning.done';   payload: { planId: string; minutes: number } }
```

### 6.5 Command Palette — extend for life modules
Life modules register commands:
- "Log today's workout"
- "Mark habit done: [name]"
- "Add goal"
- "Open learning session"
- "What should I do today?" (AI hook, S6)

### 6.6 AI integration (S6 — roadmap only, no implementation)
Architecture: `core/services/ai.ts` — wrapper around Anthropic API (user provides key in Settings → Studio).

Planned capabilities (S6+):
- **Daily digest**: summarize today's tasks, habits, goals — one prompt on morning open
- **Goal planning**: given a goal, suggest tasks and milestones
- **Learning plans**: suggest a structured plan for a topic
- **Training analysis**: after workout log, suggest what to improve
- **Priority help**: "What should I focus on today?" — answers from current task/goal data

Key constraint: always user-provided API key. Never auto-call. Show cost estimate before each call. Free to run the app without any AI.

---

## 7. Visual Identity

### Name
**VibeOS** — unchanged. The name works for life OS too. "Vibe" = the feeling of your productive, intentional life.

### Tagline update
S1 Identity pass must update all copy from "developer workspace" to "personal life OS" framing.

### Vibe-paks (4 shipped)
Four packs since S10 consolidation: Dark (default), Light, Brutalist, CRT Retro (Synthwave removed, Soft Glass merged into Light). Visual signature and portfolio hook. The `/docs/ui-kit` catalogue ships with the design system (S8/S17).

### Icons
Lucide icons (planned S1) — include icons for new life modules: `Target` (goals), `Dumbbell` (training), `BookOpen` (learning), `BarChart2` (analytics).

### Sidebar structure (updated)
```
SYSTEM
  Dashboard
  Settings
  About

LIFE
  Goals          [new]
  Habits
  Training       [new]
  Learning       [new]
  Analytics      [new]

WORK
  Tasks
  Board
  Notes
  Snippets

STUDIO
  AI Studio
  Docs
```

---

## 8. Per-Module Direction

### Dashboard (major S2 upgrade)
Becomes the life command center. Replaces dev metrics with life metrics. Panels: Today / Focus / Goals / Habits / Learning / Training / Recent / Stats.

### Tasks (S4 depth)
- Add `category` field: work / learning / training / personal / goal
- Add `linkedGoalId` to connect tasks to goals
- Natural-language input ("run tomorrow morning" auto-sets date + category: training)
- Today view, Focus mode (Pomodoro), Streaks heatmap

### Board (already partially unified)
- Cards = Tasks (already done)
- Time swimlanes (already done)
- No further structural changes needed; polish follows naturally

### Notes (S4 depth)
- Wiki backlinks `[[page]]`
- Daily journal ("Today" button — already done)
- Note types: `plan | idea | journal | project | learning | training`
- Link notes to goals or learning plans

### Habits (✅ shipped — S4/S5/S6+)
- Categories (health/productivity/learning/social/other) with color indicators
- Retroactive check-ins for past 14 days (calendar grid per card)
- Skip day / vacation mode (doesn't break streak)
- Milestone celebrations at 7/14/30/60/100/180/365 days
- Check-in notes per day
- Best streak tracking + habit age display
- Weekly summary card + at-risk filter
- Quick-start templates for new users
- Drag-to-reorder
- Connected to goals, learning plans, training plans
- **Remaining:** Habit reordering by drag ✅ done; native reminder notifications (S8)

### Goals (new — S4)
- Goal entity: name, category (career / health / skill / personal / financial), target date, milestones, linked tasks, progress
- Progress auto-calculated from linked tasks + habits
- Dashboard widget shows active goals + progress bars
- Command palette: "Add goal", "View goals"

### Learning (new — S5)
- Learning plan entity: topic, total hours target, sessions/week, deadline
- Session = time-boxed daily task (auto-created each morning via habit-like mechanism)
- Progress tracked: hours done / target, topics covered
- Post-session: notes field, what did I learn today?
- Dashboard: "Today's learning: TypeScript generics — 20 min"

### Training (new — S5)
- Training plan entity: sport type, sessions/week, plan duration, goal (e.g., "Run 10km by July")
- Workout entity: date, type, duration, distance/reps, notes
- "Today" indicator: is today a training day?
- Post-workout: analysis prompt (optional AI), next session suggestion
- Dashboard: "Today: Rest day" or "Today: Run 5km"
- History: workout log with charts

### Analytics (new — S5)
- Personal stats aggregated from all modules
- Habit consistency heatmap (like GitHub contribution graph)
- Task completion rate over time
- Learning hours per week chart
- Workout frequency chart
- Goal progress overview
- Weekly digest summary

### Finance (✅ shipped — S6+)
- Expense entry with 8 categories, date, note
- Monthly budget limits per category with progress bars
- Overview tab: stacked category bar + day-by-day spending chart
- Transactions tab: sortable list, CSV export, recurring expense markers
- Budgets tab: inline editing, currency symbol config
- Multi-currency: base + display currency, exchange rates from open.er-api.com (free)
- Dashboard widget: monthly total + budget progress + top categories
- **Remaining:** Bank CSV import, multi-month comparison view, standalone iOS extraction (long-term)

### Studio (existing — maintain)
- Keep as AI prompt lab
- Add: "AI daily digest" button that generates a daily summary from your data
- S6: structured planning prompts (goal planning, learning plan generation)

---

## 9. Sprint Plan

**Single source of truth: `docs/roadmap.md` § Sprint status overview.** Summary as of 2026-06-11: S1–S12, S14–S30 ✅ complete (incl. S3 Backend LIVE, S21 sync architecture, S28 sync integrity, S29 XSS hardening). Open: S13 Design Pass + S16 T7 manual QA — both need a live review session with the user.

---

## 10. Future Standalone Projects

### Habit Tracker — iOS App
The VibeOS Habits module will eventually be extracted and refined into a standalone iOS app:
- **Stack**: SwiftUI (or React Native if web-native iteration is preferred)
- **Core features**: daily check-offs, streaks, heatmap, habit creation/editing, notifications, widgets
- **Differentiator**: clean opinionated design, no subscription, iCloud sync
- **Distribution**: App Store, free with optional tip/donation
- **Timeline**: after VibeOS Habits reaches full depth (post-S5); app iteration likely S8+
- **Why**: hands-on iOS distribution experience; existing logic maps directly to native implementation; VibeOS habits data model is already solid

---

## 11. Open Questions

| Item | Status |
|------|--------|
| Final module order / sidebar grouping | Proposed above — confirm before S2 |
| Demo mode implementation: seeded account vs local fixture | Decision needed in S3 (see privacy-security.md) |
| Goals vs Milestones naming | Goals module name is fine; consider "Milestones" for sub-goals |
| Learning plan daily task auto-creation: cron-like or manual? | Keep simple: manual "Start session" → creates task. Automate later. |
| Training plan auto-creation: same question | Same decision — manual "Log workout" → creates entry |
| Custom domain vibeos.dev / vibeos.app | Buy after S1 ships (design pass makes the URL worth sharing) |
| Tasks module final codename (Stride / Crisp / Loop) | Deprioritized — VibeOS Tasks is fine for now |
| Notes module final codename | Same — deprioritized |
