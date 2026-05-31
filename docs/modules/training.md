# Training Module

> Updated 2026-05-31. Shipped at v0.7.0, features added through v0.8.0.

**Status:** ✅ Available  
**Route:** `/training` + `/training/:id`  
**Store keys:** `platform:training:plans`, `platform:training:logs`

---

## Purpose

Workout plans with session logging, streak tracking, and AI coaching. A plan has a sport type and sessions-per-week schedule. Every workout is logged manually with duration, distance, feeling, and notes.

---

## Data Model

```typescript
interface TrainingPlan {
  id: string
  title: string
  sportType: SportType    // running|strength|cycling|swimming|yoga|hiit|walking|other
  sessionsPerWeek: 2 | 3 | 5 | 7
  startDate: string
  active: boolean
  notes?: string
  coverEmoji: string
  createdAt: string
  linkedHabitId?: string
  resources?: TrainingResource[]
}

interface WorkoutLog {
  id: string; planId?: string; date: string
  sportType: SportType; title: string
  actualDuration?: number   // minutes
  actualDistance?: number   // km
  feeling: 1 | 2 | 3 | 4 | 5
  notes?: string; createdAt: string
}

interface TrainingResource {
  id: string; url: string; title: string
  type: 'article' | 'video' | 'book' | 'course' | 'podcast' | 'other'
  addedAt: string; done?: boolean
}
```

---

## Features (shipped)

- Plan list with sport type emoji, streak, today indicator
- Plan detail: stats (streak, total time, total km, sessions), workout log form
- Workout log form: duration, distance, feeling (1–5 emoji), notes
- Workout history: all past logs listed per plan
- AI plan generator: type a goal, AI fills sport type, sessions/week, etc.
- AI post-workout analysis: after logging, suggests improvements for next session
- Resource library: same pattern as Learning (article/video/book/course/podcast/other)
- Linked habit: logging a workout auto-checks the linked habit

---

## AI Features

| Feature | Trigger | Prompt |
|---------|---------|--------|
| Plan generator | "✦ Fill with AI" button | Returns JSON with title, emoji, sportType, sessionsPerWeek |
| Workout analysis | Auto-fires after logging | Suggests 2-3 specific improvements for next session |

---

## Planned

- Exercise library with personal records
- Volume/intensity progression charts
- Export workout log as CSV
