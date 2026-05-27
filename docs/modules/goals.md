# Module Spec: Goals

> Status: planned (S4)
> Sprint: S4 — Core Life Modules
> Purpose: life goal management with linked tasks, milestones, and progress tracking

---

## Purpose

Goals is the long-term anchor of VibeOS. While Tasks manages what you do today, Goals manages what you're building towards over weeks and months.

A goal answers: "What am I working on in life right now, and how far have I come?"

Goals connect to all other modules — tasks move you toward goals, habits sustain them, learning plans develop skills for them, training plans achieve health goals.

---

## Data Model

```ts
type GoalCategory =
  | 'career'
  | 'health'
  | 'skill'
  | 'personal'
  | 'financial'
  | 'project'
  | 'relationship'

type GoalStatus = 'active' | 'paused' | 'completed' | 'archived'

interface GoalMilestone {
  id: string
  goalId: string
  title: string
  completed: boolean
  completedAt?: string // ISO date
  order: number
}

interface Goal {
  id: string
  userId: string
  title: string
  description?: string
  category: GoalCategory
  status: GoalStatus
  targetDate?: string          // ISO date (YYYY-MM-DD)
  createdAt: string
  completedAt?: string
  milestones: GoalMilestone[]
  linkedTaskIds: string[]      // tasks that contribute to this goal
  linkedHabitIds: string[]     // habits that sustain this goal
  linkedLearningPlanIds: string[]
  linkedTrainingPlanIds: string[]
  progress: number             // 0–100, auto-calculated
  coverEmoji?: string          // visual identity (🏃 🎯 💻 📚)
  notes?: string               // free-text planning notes
}
```

### Progress calculation
```
progress = (completedMilestones / totalMilestones) * 100
  OR if no milestones:
progress = (completedLinkedTasks / totalLinkedTasks) * 100
  OR if no linked tasks:
progress = 0 (manual input only — future)
```

---

## Components

```
modules/goals/
├── index.ts                  # Routes + module constants
├── types/index.ts            # Goal, GoalMilestone, GoalCategory types
├── stores/goals.store.ts     # Pinia store
├── composables/
│   └── useGoals.ts           # Business logic
├── components/
│   ├── GoalCard.vue          # Summary card (used in list + dashboard)
│   ├── GoalDetail.vue        # Full goal view with milestones + linked items
│   ├── GoalForm.vue          # Create/edit goal
│   ├── MilestoneList.vue     # Checkable milestone items
│   ├── GoalProgressBar.vue   # Visual progress (also used in dashboard)
│   └── GoalCategoryBadge.vue # Color-coded category pill
└── views/
    ├── GoalsView.vue         # Main goals list (grid layout)
    └── GoalDetailView.vue    # Single goal detail page
```

---

## Views

### GoalsView (`/goals`)
- Grid of GoalCard components grouped by category (or status)
- Filter bar: All / Active / Completed / By category
- "Add Goal" button → GoalForm modal
- Empty state: "You have no active goals. Start with one big thing."

### GoalDetailView (`/goals/:id`)
- Goal header: title, category badge, target date, progress bar, status
- Milestone list: checkable, reorderable, add inline
- Linked tasks section: shows linked tasks with status
- Linked habits section: shows connected habits
- Notes area: free-text textarea
- "Mark Complete" button (only when all milestones done or confirmed manually)

---

## Store

```ts
// goals.store.ts
interface GoalsState {
  goals: Goal[]
}

actions:
  addGoal(data: Omit<Goal, 'id' | 'createdAt' | 'progress'>)
  updateGoal(id: string, patch: Partial<Goal>)
  deleteGoal(id: string)
  addMilestone(goalId: string, title: string)
  toggleMilestone(goalId: string, milestoneId: string)
  linkTask(goalId: string, taskId: string)
  unlinkTask(goalId: string, taskId: string)
  linkHabit(goalId: string, habitId: string)
  completeGoal(id: string)
  archiveGoal(id: string)

getters:
  activeGoals: Goal[]
  completedGoals: Goal[]
  goalById(id: string): Goal | undefined
  progressFor(id: string): number  // recalculated from milestones/tasks
```

---

## Dashboard Integration

### GoalsWidget (Dashboard panel)
Shows top 3 active goals with progress bars.
Clicking a goal opens GoalDetailView.
"Add goal" quick-action button.

```
┌─ Goals ──────────────────────────────────┐
│ 🏃 Run a half-marathon    ████░░░░  45%  │
│ 💻 Launch side project    ██░░░░░░  20%  │
│ 📚 Master TypeScript      ██████░░  60%  │
│                              + Add goal  │
└──────────────────────────────────────────┘
```

---

## Command Palette Commands

- "Add goal" → opens GoalForm modal
- "View goals" → navigates to /goals
- "Goal: [name]" → opens GoalDetailView for matching goal
- "Complete milestone: [name]" (future, with fuzzy search)

---

## Event Bus Events

```ts
| { type: 'goal.created';    payload: Goal }
| { type: 'goal.updated';    payload: { id: string } }
| { type: 'goal.completed';  payload: { id: string; title: string } }
| { type: 'milestone.completed'; payload: { goalId: string; title: string } }
```

---

## Backend (Supabase — S3+)

```sql
CREATE TABLE goals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active',
  target_date DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  cover_emoji TEXT,
  notes       TEXT
);

CREATE TABLE goal_milestones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id     UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  completed   BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  order_index INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own goals" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own milestones" ON goal_milestones FOR ALL USING (auth.uid() = user_id);
```

Linked tasks, habits, and plans are handled via junction tables:
```sql
CREATE TABLE goal_tasks (goal_id UUID, task_id UUID, user_id UUID);
CREATE TABLE goal_habits (goal_id UUID, habit_id UUID, user_id UUID);
```

---

## Open Questions

- Maximum active goals? Suggest soft limit of 5 active at once (UX: "Focus on fewer things").
- Goals vs Projects: if a goal has many tasks + milestones, it behaves like a project. Keep them unified in Goals module for now.
- Sub-goals: goals can have milestones (simple checklist). True sub-goals are not needed for v1.
- Progress manual override: allow user to drag progress bar for goals with no linked data? Defer to v2.
