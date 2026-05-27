# Module Spec: Learning

> Status: planned (S5)
> Sprint: S5 — Life Depth
> Purpose: structured learning plans, daily sessions, topic tracking, progress measurement

---

## Purpose

Learning is the knowledge-growth layer of VibeOS. It gives structure to self-education: instead of "I should learn TypeScript sometime," you create a plan with a topic, daily time commitment, and deadline — and the system makes sure each day's session appears on your dashboard.

It answers: "What am I learning right now? Did I study today? How much progress have I made?"

---

## Data Model

```ts
type LearningCategory =
  | 'programming'
  | 'language'
  | 'science'
  | 'business'
  | 'design'
  | 'health'
  | 'other'

type SessionStatus = 'planned' | 'completed' | 'skipped'

interface LearningPlan {
  id: string
  userId: string
  title: string              // "Master TypeScript"
  topic: string              // "TypeScript advanced patterns"
  category: LearningCategory
  description?: string
  targetHours: number        // total hours to invest
  minutesPerSession: number  // e.g., 20
  daysPerWeek: number        // e.g., 5 (weekdays)
  startDate: string          // ISO date
  targetDate?: string        // deadline (or estimated from hours/pace)
  linkedGoalId?: string      // connects to a Goal
  linkedHabitId?: string     // connects to a Habit for daily accountability
  active: boolean
  completedAt?: string
  resources: LearningResource[]
  notes?: string
  coverEmoji?: string        // 📚 🧠 💻 🗣️
}

interface LearningResource {
  id: string
  planId: string
  title: string              // "TypeScript Handbook"
  url?: string
  type: 'book' | 'video' | 'course' | 'article' | 'podcast' | 'other'
  completed: boolean
}

interface LearningSession {
  id: string
  userId: string
  planId: string
  date: string               // ISO date
  status: SessionStatus
  plannedMinutes: number
  actualMinutes?: number
  topic?: string             // what specifically was studied today
  notes?: string             // what did I learn / key takeaways
  rating: 1 | 2 | 3 | 4 | 5 // session quality
}
```

### Progress calculation
```
hoursCompleted = sum(session.actualMinutes where status = 'completed') / 60
progress = (hoursCompleted / plan.targetHours) * 100
```

---

## Components

```
modules/learning/
├── index.ts
├── types/index.ts
├── stores/learning.store.ts
├── composables/
│   ├── useLearning.ts
│   └── useSessionLog.ts
├── components/
│   ├── LearningPlanCard.vue    # Plan summary with progress ring
│   ├── TodayLearning.vue       # "Today: TypeScript — 20 min" (dashboard widget)
│   ├── SessionLogForm.vue      # Log a completed session
│   ├── ResourceList.vue        # Checklist of resources
│   ├── LearningProgress.vue    # Hours chart + streak
│   ├── SessionHistory.vue      # Past sessions calendar
│   └── LearningHeatmap.vue     # GitHub-style consistency heatmap
└── views/
    ├── LearningView.vue        # Learning hub: active plans list
    ├── PlanDetailView.vue      # Single plan detail
    └── SessionHistoryView.vue  # Full session log + stats
```

---

## Views

### LearningView (`/learning`)
- Active learning plans as cards (title, progress ring, "today's session" indicator)
- "Add Plan" button → create plan form
- "Completed plans" collapsible section below
- Empty state: "You have no active learning plans. Pick something to learn."

### PlanDetailView (`/learning/plans/:id`)
- Header: title, category, progress bar (hours done / target), target date countdown
- "Today's session" prominent block: topic + time target + "Start session" button
- Session log: calendar grid showing completed/skipped days (30 days back)
- Resources checklist
- Notes textarea
- Stats: current streak, total hours, completion rate

### SessionHistoryView (`/learning/history`)
- All sessions across all plans
- Filter by plan or date range
- Heatmap of learning activity (all plans combined)

---

## "Today's Session" Logic

```ts
// composables/useLearning.ts
const todaySession = computed(() => {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday

  return activePlans.value.map(plan => {
    // Check if today is a study day (based on daysPerWeek — assume weekdays for simplicity)
    const isStudyDay = isScheduledDay(plan, today)
    if (!isStudyDay) return null

    // Check if already logged for today
    const alreadyLogged = sessions.value.some(
      s => s.planId === plan.id && s.date === toISODate(today) && s.status === 'completed'
    )

    return { plan, alreadyLogged }
  }).filter(Boolean)
})
```

---

## Dashboard Integration

### TodayLearning widget
```
┌─ Learning ────────────────────────────────┐
│ Today   TypeScript Advanced Patterns      │
│         Target: 20 min                   │
│                    [Start Session]        │
│ Progress  ██████░░░░  60%  · 18/30 hrs   │
│ Streak    12 days 🔥                      │
└───────────────────────────────────────────┘
```

On rest day or completed:
```
┌─ Learning ────────────────────────────────┐
│ Today   Done ✓  TypeScript               │
│         30 min logged                    │
│ Progress  ██████░░░░  62%  · 18.5/30 hrs │
└───────────────────────────────────────────┘
```

---

## Session Logging Flow

"Start Session" button (or "Log Session") opens `SessionLogForm`:
1. Pre-filled: plan name, date = today, planned minutes
2. User fills: actual minutes, today's topic (free text, optional), notes/takeaways (optional), rating (1–5)
3. Submit → creates `LearningSession` with `status: 'completed'`
4. Event emitted: `learning.session.completed`
5. If habit linked: habit marked done for today

---

## Habits Integration

A learning plan can create an associated habit: "Study TypeScript · 20 min/day".

Flow:
1. Creating a plan → optional "Also create habit" toggle
2. Habit tracks daily consistency
3. Logging a session → marks the habit done
4. Habit heatmap shows learning consistency alongside other habits

---

## Event Bus Events

```ts
| { type: 'learning.session.completed'; payload: LearningSession }
| { type: 'learning.session.skipped';   payload: { planId: string; date: string } }
| { type: 'learning.plan.created';      payload: LearningPlan }
| { type: 'learning.plan.completed';    payload: { planId: string; title: string } }
```

---

## Backend (Supabase — S3+)

```sql
CREATE TABLE learning_plans (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  topic               TEXT NOT NULL,
  category            TEXT NOT NULL,
  description         TEXT,
  target_hours        NUMERIC(6,1) NOT NULL,
  minutes_per_session INTEGER NOT NULL,
  days_per_week       INTEGER NOT NULL,
  start_date          DATE NOT NULL,
  target_date         DATE,
  linked_goal_id      UUID REFERENCES goals(id) ON DELETE SET NULL,
  active              BOOLEAN NOT NULL DEFAULT true,
  completed_at        TIMESTAMPTZ,
  notes               TEXT,
  cover_emoji         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE learning_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id          UUID NOT NULL REFERENCES learning_plans(id) ON DELETE CASCADE,
  date             DATE NOT NULL,
  status           TEXT NOT NULL DEFAULT 'completed',
  planned_minutes  INTEGER NOT NULL,
  actual_minutes   INTEGER,
  topic            TEXT,
  notes            TEXT,
  rating           SMALLINT CHECK (rating BETWEEN 1 AND 5),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE learning_resources (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id   UUID NOT NULL REFERENCES learning_plans(id) ON DELETE CASCADE,
  title     TEXT NOT NULL,
  url       TEXT,
  type      TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own learning plans" ON learning_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own sessions" ON learning_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own resources" ON learning_resources FOR ALL USING (auth.uid() = user_id);
```

---

## AI Integration (S6 — optional)

When user has API key set in Studio:

**Plan generation**: "I want to learn [topic] in [N] weeks with [M] minutes/day. Create a structured learning plan with resources and weekly goals."

**Session summary**: After logging a session with notes, optionally generate a "key takeaways" summary.

**Progress review**: Weekly "What should I focus on this week in TypeScript?" based on session history.

All AI features are user-initiated (button click), never automatic.

---

## Open Questions

- "Days per week" scheduling: weekdays vs. custom day selection? Start with "weekdays only" for simplicity, add custom day picker in v2.
- External integrations: Notion, Readwise, Kindle highlights? Long-term future — out of scope for v1.
- Social/sharing: show learning progress on a public profile? Possible portfolio feature — defer past S5.
- Learning plan templates: pre-built plans for common topics (TypeScript in 4 weeks, basic Spanish, etc.)? Good for empty state onboarding — add as demo content first.
