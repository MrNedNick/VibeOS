# Module Spec: Training

> Status: planned (S5)
> Sprint: S5 — Life Depth
> Purpose: workout plans, session logging, progress tracking, goal integration

---

## Purpose

Training is the health and sports layer of VibeOS. It helps you plan and track physical activity — runs, strength training, cycling, or any sport — and connects that activity to your habits and life goals.

It answers: "Am I training consistently? What should I do today? How is my fitness progressing?"

---

## Data Model

```ts
type SportType =
  | 'running'
  | 'strength'
  | 'cycling'
  | 'swimming'
  | 'yoga'
  | 'hiit'
  | 'walking'
  | 'other'

type WorkoutStatus = 'planned' | 'completed' | 'skipped'

interface TrainingPlan {
  id: string
  userId: string
  title: string              // "Half-Marathon Training Plan"
  sportType: SportType
  startDate: string          // ISO date
  endDate?: string
  sessionsPerWeek: number
  linkedGoalId?: string      // e.g., "Run half-marathon by September"
  weeks: TrainingWeek[]
  active: boolean
  notes?: string
}

interface TrainingWeek {
  weekNumber: number
  sessions: PlannedSession[]
}

interface PlannedSession {
  id: string
  planId: string
  weekNumber: number
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6  // 0 = Sunday
  title: string              // "Easy run" / "Tempo run" / "Long run"
  description?: string       // "5km at comfortable pace"
  targetDuration?: number    // minutes
  targetDistance?: number    // km (for running/cycling)
}

interface WorkoutLog {
  id: string
  userId: string
  planId?: string            // null if ad-hoc workout
  sessionId?: string         // which planned session this fulfills
  date: string               // ISO date
  sportType: SportType
  title: string
  status: WorkoutStatus
  actualDuration?: number    // minutes
  actualDistance?: number    // km
  heartRateAvg?: number
  feeling: 1 | 2 | 3 | 4 | 5  // 1=terrible, 5=great
  notes?: string
  aiAnalysis?: string        // optional AI-generated analysis (S6)
}
```

---

## Components

```
modules/training/
├── index.ts
├── types/index.ts
├── stores/training.store.ts
├── composables/
│   ├── useTraining.ts
│   └── useWorkoutLog.ts
├── components/
│   ├── TrainingPlanCard.vue    # Plan summary + week progress
│   ├── WorkoutCalendar.vue     # Monthly calendar view of sessions
│   ├── WorkoutLogForm.vue      # Log a completed workout
│   ├── TodayWorkout.vue        # "Today is: Long Run 10km" (dashboard widget)
│   ├── WorkoutHistory.vue      # List of past workouts
│   ├── WorkoutStats.vue        # Charts: distance/duration over time
│   └── FeelingPicker.vue       # 1–5 emoji feeling selector
└── views/
    ├── TrainingView.vue        # Main training hub
    ├── PlanDetailView.vue      # Single plan + week-by-week breakdown
    └── WorkoutLogView.vue      # Full workout history + stats
```

---

## Views

### TrainingView (`/training`)
Layout: two sections

**Today's session** (top)
- "Today: Rest day" or "Today: Easy Run — 5km"
- "Log workout" button → WorkoutLogForm

**Active plans** (middle)
- PlanCard for each active training plan
- Progress: "Week 4 of 12 · 3/4 sessions done"
- "View plan" → PlanDetailView

**Recent workouts** (bottom)
- Last 5 WorkoutLog entries, compact list
- "View all" → WorkoutLogView

### PlanDetailView (`/training/plans/:id`)
- Plan header: sport, goal link, start/end date
- Week-by-week accordion: planned sessions for each week
- Session status: planned / completed / skipped
- "Log this workout" button on each session

### WorkoutLogView (`/training/log`)
- Full history of all workout logs
- Filter: by sport, by date range
- WorkoutStats charts below

---

## Today's Workout Logic

```ts
// composables/useTraining.ts
const todayWorkout = computed(() => {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const activeplan = plans.value.find(p => p.active)
  if (!activePlan) return null

  const currentWeek = calculateCurrentWeek(activePlan.startDate)
  const week = activePlan.weeks[currentWeek - 1]
  const session = week?.sessions.find(s => s.dayOfWeek === dayOfWeek)

  return session ?? null  // null = rest day
})
```

---

## Dashboard Integration

### TodayWorkout widget
```
┌─ Training ──────────────────────────────┐
│ Today   Long Run                        │
│         Target: 10km · ~60 min          │
│                   [Log Workout]         │
│ Week 4 of 12   ████████░░░░  67%        │
└─────────────────────────────────────────┘
```

On rest day:
```
┌─ Training ──────────────────────────────┐
│ Today   Rest Day 🧘                     │
│ Next:   Tempo Run (Wednesday)           │
│ Week 4 of 12   ████████░░░░  67%        │
└─────────────────────────────────────────┘
```

---

## Habits Integration

A training plan can create an associated habit: "Train Mon/Wed/Fri".
The habit's check-in is auto-linked to workout log status.

Flow:
1. User creates training plan with 3 sessions/week
2. Option: "Create habit for this plan" → creates Habit "Morning run 3x/week"
3. Logging a workout for that day marks the habit done
4. Habit heatmap shows training consistency visually

---

## Post-Workout Analysis (S6 — AI optional)

After logging a workout, an optional "Analyze" button triggers:

```
Prompt: "Here is my workout log for the last 4 weeks: [data].
Today I completed a 10km run in 58 minutes, feeling 4/5.
My goal is to run a half-marathon by September.
Give me a brief analysis and one suggestion for next training."
```

Response shown inline in the workout log entry. User must have API key in Settings → Studio.

---

## Event Bus Events

```ts
| { type: 'workout.logged';   payload: WorkoutLog }
| { type: 'workout.skipped';  payload: { sessionId: string; date: string } }
| { type: 'plan.created';     payload: TrainingPlan }
| { type: 'plan.completed';   payload: { planId: string; title: string } }
```

---

## Backend (Supabase — S3+)

```sql
CREATE TABLE training_plans (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  sport_type       TEXT NOT NULL,
  start_date       DATE NOT NULL,
  end_date         DATE,
  sessions_per_week INTEGER NOT NULL,
  linked_goal_id   UUID REFERENCES goals(id) ON DELETE SET NULL,
  active           BOOLEAN NOT NULL DEFAULT true,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE workout_logs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id          UUID REFERENCES training_plans(id) ON DELETE SET NULL,
  date             DATE NOT NULL,
  sport_type       TEXT NOT NULL,
  title            TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'completed',
  actual_duration  INTEGER,
  actual_distance  NUMERIC(6,2),
  feeling          SMALLINT CHECK (feeling BETWEEN 1 AND 5),
  notes            TEXT,
  ai_analysis      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own training plans" ON training_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own workout logs" ON workout_logs FOR ALL USING (auth.uid() = user_id);
```

---

## Open Questions

- Planned sessions stored as JSONB in the plan row, or as separate `planned_sessions` table? JSONB is simpler for v1; separate table if query patterns require it.
- Import from Strava/Garmin? Long-term future — requires OAuth. Not in v1.
- Heart rate and detailed metrics? Optional fields only — don't require them.
- Multiple active plans (e.g., running + strength)? Allow multiple active plans; dashboard shows all.
