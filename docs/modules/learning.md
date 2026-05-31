# Learning Module

> Updated 2026-05-31. Shipped at v0.7.0, features added through v0.8.0.

**Status:** ✅ Available  
**Route:** `/learning` + `/learning/:id`  
**Store keys:** `platform:learning:plans`, `platform:learning:sessions`

---

## Purpose

Structured learning plans with daily sessions, progress tracking, and AI analysis. A plan is a goal (e.g. "Learn TypeScript") with a target hours, sessions per week, and an emoji. Every session is logged manually.

---

## Data Model

```typescript
interface LearningPlan {
  id: string
  title: string
  topic: string
  category: LearningCategory   // programming|language|science|business|design|health|other
  minutesPerSession: number
  targetHours: number
  daysPerWeek: 3 | 5 | 7
  startDate: string
  active: boolean
  completedAt?: string
  notes?: string
  coverEmoji: string
  createdAt: string
  linkedHabitId?: string       // auto-check this habit when session logged
  resources?: LearningResource[] // URL bookmarks for the plan
}

interface LearningSession {
  id: string
  planId: string
  date: string
  status: 'completed' | 'skipped'
  plannedMinutes: number
  actualMinutes: number
  topic?: string
  notes?: string
  rating: 1 | 2 | 3 | 4 | 5
}

interface LearningResource {
  id: string; url: string; title: string
  type: 'article' | 'video' | 'book' | 'course' | 'podcast' | 'other'
  addedAt: string; done?: boolean
}
```

---

## Features (shipped)

- Plan list with progress rings + streak + today indicator
- Plan detail view: progress bar, stats (streak, hours, sessions, est. finish)
- Session log form: duration, topic, notes, rating
- Session history: all past sessions listed
- AI plan generator: type a topic, AI fills form (title, emoji, sessions/week, etc.)
- AI post-session analysis: after logging, AI suggests what to focus on next
- Resource library: add URL bookmarks (article/video/book/course/podcast/other), mark done
- Linked habit: logging a session auto-checks the linked habit

---

## AI Features

| Feature | Trigger | Prompt |
|---------|---------|--------|
| Plan generator | "✦ Fill with AI" button | Returns JSON with title, emoji, minutesPerSession, targetHours, daysPerWeek |
| Session analysis | Auto-fires after logging | Suggests 2-3 focus areas for next session |

---

## Planned

- Session timer integration (Pomodoro)
- Weekly learning report
- Export session log as CSV
