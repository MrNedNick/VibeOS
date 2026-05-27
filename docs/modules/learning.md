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

---

## Research: Modern Effective Learning Systems

> Research pass: 2026-05-27. Informs MVP decisions below.

---

### 1. Learning Psychology Fundamentals

These are the patterns that actually work, backed by cognitive science:

**Spaced Repetition**
Information recalled after a gap sticks longer than cramming. The forgetting curve (Ebbinghaus) shows retention drops fast without review. The fix: review at increasing intervals (1d → 3d → 7d → 14d → 30d). Best example: Anki. For VibeOS v1, we don't need a full SR engine — just showing "you haven't reviewed this topic in 7 days" is enough to trigger it.

**Chunking**
Break knowledge into small, discrete units. 20 minutes of focused learning on one concept > 60 minutes of scattered reading. Our `minutesPerSession` field already enforces this. The key UX implication: don't let users set sessions > 60 min — that's not learning, that's procrastination with extra steps.

**Retrieval Practice (Testing Effect)**
Recalling information from memory beats re-reading by 2–3× for long-term retention. Even simple prompts — "what did I learn yesterday?" — activate this. Our `notes` field in `LearningSession` does this passively: users who write session notes are doing retrieval practice.

**Interleaving**
Mixing topics/skills within a session is harder but produces deeper mastery than blocked practice (topic-by-topic). Relevant for future multi-plan views: show "you're studying TypeScript — maybe also do 10 min of algorithms today."

**The 2-Minute Rule + Identity Anchoring (James Clear / Atomic Habits)**
Habits form when the action is frictionless and tied to identity. "I am a person who learns every day" is more powerful than "I have a 20-min TypeScript task." Our Habits integration directly supports this — a learning plan that becomes a daily habit turns into identity, not obligation.

**Progress Effect / Goal Gradient**
Motivation increases as people approach a goal (proven in lab and app data — Duolingo, fitness trackers). A progress ring showing 60% completion pulls harder than 10%. Show progress prominently, especially when the user is 70%+ done.

---

### 2. What Works in Successful Learning Products

**Duolingo** — streak mechanics, micro-sessions (5 min), gamification, daily notification. Weakness: gamification becomes the goal, not learning.

**Anki** — spaced repetition as core mechanic, community decks. Strength: the most effective retention tool ever made. Weakness: horrible UX, high friction to start.

**Khan Academy** — mastery-based progression, topic tree, video + practice. Strength: clear structure. Weakness: too school-like for adult self-learners.

**Brilliant** — problem-first learning, interleaving, no passive video. Strength: forces active engagement. Weakness: narrow topic coverage.

**Readwise** — daily review of highlights. Strength: turns passive reading into active retention. Lightweight.

**Key patterns extracted:**
1. **Streak + consistency > volume** — showing up matters more than session length
2. **One thing per day** — decision fatigue kills learning; tell the user exactly what to do today
3. **Fast session logging** — if logging takes > 30 seconds, people skip it
4. **Visible progress** — a progress ring, heatmap, or streak counter as the main visual anchor
5. **Low-friction start** — "Start session" should be one tap, not a setup flow

---

### 3. Why Most Learning Apps Fail

- **Too much content, too little structure.** Users get overwhelmed choosing what to study.
- **No daily anchor.** Without a habit/reminder, the app gets opened once a week.
- **Passive content consumption.** Watching videos feels like learning but isn't.
- **No feedback loop.** Users don't know if they're actually improving.
- **Feature creep kills simplicity.** The moment you add quizzes, flashcards, videos, forums, the UX collapses.

VibeOS avoids all of these by design: the user defines the plan, we give them a daily task, they log it in 30 seconds, and the heatmap shows the result.

---

### 4. How AI Can Improve This Workflow

**Without AI (MVP):**
The system already works — user creates a plan, logs sessions, sees progress. This is the baseline. AI is an enhancement, not a requirement.

**AI Layer 1 — Plan Generation (S6):**
User says: "I want to learn arrays in JavaScript in 2 weeks with 20 min/day." AI generates:
- Week 1: Basics (declaration, indexing, length, iteration)
- Week 2: Methods (map, filter, reduce, splice), mini-project
- Suggested resources (MDN, javascript.info, Eloquent JavaScript chapter)
- Creates the `LearningPlan` pre-filled in the form

Prompt pattern: `Generate a structured learning path for: [topic], level: [beginner/intermediate], duration: [N weeks], daily time: [M min]. Output: weekly breakdown + resource list.`

**AI Layer 2 — Session Debrief (S6):**
After logging a session with notes, AI can:
- Extract 3 key concepts the user mentioned
- Generate 1 follow-up question to test recall tomorrow
- Suggest what to focus on next session

**AI Layer 3 — Weekly Review (S6):**
On Sunday, AI analyzes the week's sessions and generates: "You studied 4/5 days. Strong on X, gaps in Y. Suggestion for next week: ..."

**Key constraint:** All AI is user-initiated. No background calls, no auto-suggestions on load. User taps a button, AI responds. This keeps API costs predictable and UX uncluttered.

---

### 5. MVP Approach for VibeOS

**Principle: build the logging habit before building features.**

The most important thing is that the user actually logs sessions. Everything else (AI, spaced repetition, quizzes) is useless if the user doesn't open the module daily.

**MVP (S5) — what to ship:**
1. Create a learning plan (topic, minutes/day, duration, emoji)
2. Dashboard widget: "Today: [topic] — 20 min" with Start button
3. Session log form: actual time, notes (optional), rating
4. Progress ring + streak counter per plan
5. Habits auto-create when plan is created
6. Session history as a simple list (not calendar yet)

**What to defer post-MVP:**
- Custom day selection (ship weekdays-only first)
- Resources checklist (add in v1.1)
- Full heatmap calendar (add in v1.1)
- Spaced repetition engine (S6 or later)
- Quizzes / interactive exercises (much later)
- Session calendar grid (nice-to-have)
- AI plan generation (S6)

**Critical UX decisions:**
- Session logging must be under 5 taps from anywhere in the app
- Progress ring is the hero element in each plan card — make it beautiful
- Streak counter must be prominent — this is the #1 retention mechanic
- Empty state: pre-seed demo account with 2 active plans (TypeScript + Spanish basics) so first-time visitors immediately understand the value

---

### 6. Architecture Direction

**S5 MVP — localStorage first:**
- No backend dependency
- Full offline capability
- Same pattern as Habits and Tasks modules
- localStorage key: `platform:learning:plans` / `platform:learning:sessions`

**S6+ — Supabase sync:**
- Migrate to Supabase tables (schema already designed above)
- Real-time sync across devices
- Data survives device changes

**State shape (Pinia store):**
```ts
interface LearningState {
  plans: LearningPlan[]
  sessions: LearningSession[]
  resources: LearningResource[]
  activeSessionTimer?: { planId: string; startedAt: number }
}
```

**No external library needed for MVP.** All state is managed in-memory + localStorage. The spaced repetition algorithm, if ever added, is ~50 lines of TypeScript (SM-2 algorithm) — no library required.

---

### 7. Portfolio / Shareability Potential

This module has strong portfolio signal because it solves a real, personal problem in a measurable way.

**What makes it stand out:**
- AI-generated learning plans with real educational structure
- Cross-module data flow: Learning → Habits → Dashboard → Analytics
- Real UX challenge: how do you make daily study feel light, not heavy?
- Measurable outcomes: streaks, hours logged, plan completion rates

**Shareability path (post-S5):**
- Public learning profile URL: `vibeos.app/u/[username]/learning`
- "I'm learning TypeScript — 60% complete, 18-day streak" share card
- Exported learning plan as a markdown template (others can import)
- Community plan templates: "Front-end dev in 90 days" starter packs

**Differentiator vs. existing tools:**
Most learning apps are just content platforms (Coursera, Udemy). VibeOS is a *tracking + accountability* layer — you bring your own resources (any book, any course, any YouTube channel), we just make sure you show up every day. This is more like a personal coach than a course platform. That's the pitch.

---

### 8. Roadmap Additions (for `docs/roadmap.md`)

**S5 — Learning module delivery order:**
1. Data model + store + localStorage persistence
2. LearningView + create plan form
3. PlanDetailView + progress ring
4. SessionLogForm (the core action)
5. Dashboard widget (TodayLearning)
6. Habits auto-link on plan creation
7. Session history list
8. Heatmap + streak (v1.1 if time allows)

**S6 additions (AI layer):**
- AI plan generation from natural language input
- Session debrief summary
- Weekly progress review prompt

**Post-S7 (future):**
- Spaced repetition review queue
- Public learning profile
- Plan templates / community sharing
- Mobile push notification for daily study reminder
