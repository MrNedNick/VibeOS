# Habits Module

> Updated 2026-05-31. Shipped at v0.7.7+, current v0.8.0.

**Status:** ✅ Available  
**Route:** `/habits`  
**Store:** `platform:habits:habits`

---

## Purpose

The primary daily-use feature of VibeOS. The habit tracker should be the thing you open every morning. Design principle: open → check off → close in under 10 seconds.

---

## Data Model

```typescript
interface Habit {
  id: string
  name: string
  emoji: string
  purpose?: string               // "why" motivation text (shown below name)
  category?: HabitCategory       // health | productivity | learning | social | other
  createdAt: string              // ISO
  completedDates: string[]       // 'YYYY-MM-DD' array
  skippedDates?: string[]        // vacation/intentional skip — doesn't break streak
  checkNotes?: Record<string, string>  // date → optional check-in note
  lastMilestone?: number         // highest milestone streak celebrated
  linkedGoalId?: string
  linkedLearningPlanId?: string
  linkedTrainingPlanId?: string
}
```

---

## Features (shipped)

### Core
- Daily check-off with today's toggle button
- Streak tracking (consecutive days) with visual display
- 16-week GitHub-style heatmap per card

### Depth
- **Categories** — health/productivity/learning/social/other with color + icon
- **Purpose field** — optional "why" subtitle on each habit (inline editable)
- **Retroactive check-ins** — 14-day calendar grid on each card, right-click to skip
- **Skip day** — mark any day as intentionally skipped, streak stays intact
- **Check-in notes** — optional short note when marking today done (stored per date)
- **Streak milestones** — celebration banner at 7/14/30/60/100/180/365 days
- **Best streak** — all-time record shown alongside current streak
- **Habit age** — "Day N" shown after 7+ days
- **At-risk indicator** — pulsing ⚠️ when streak > 2 but not done today

### UX
- **Quick-start templates** — 5 preset habits in empty state (one-click add)
- **Drag-to-reorder** — HTML5 drag to sort habits by priority
- **Category filter chips** — shown when 2+ categories in use
- **At-risk filter** — "⚠️ At risk (N)" chip to show only endangered habits
- **Weekly summary card** — 7-day %, total check-ins, best streak

### Integrations
- Auto-check linked habit when Learning session is logged
- Auto-check linked habit when Training workout is logged
- Auto-complete linked Goal milestone when habit is checked
- Link to Learning plan and Training plan (bidirectional)

---

## Store Methods

| Method | Description |
|--------|-------------|
| `createHabit(name, emoji, purpose?, category?)` | Create new habit |
| `updateHabit(id, name, emoji?, purpose?)` | Update name/emoji/purpose |
| `updateCategory(id, category)` | Change category |
| `updateHabitLink(id, links)` | Set goal/learning/training links |
| `toggleToday(id)` | Toggle today's completion (with milestone check) |
| `toggleDate(id, date)` | Retroactive edit (max 30 days back) |
| `toggleSkip(id, date)` | Toggle skip/vacation for a date |
| `setCheckNote(id, date, note)` | Save optional check-in note |
| `reorderHabits(fromId, toId)` | Drag-to-reorder |
| `deleteHabit(id)` | Remove habit |
| `isCompletedToday(id)` | Boolean check |

---

## Components

- `HabitsView.vue` — main view with form, filters, cards grid, weekly summary, milestone banner
- `HabitCard.vue` — individual habit: identity, heatmap, past-days calendar, connect section
- `HabitHeatmap.vue` — 16-week grid, reused by Tasks activity heatmap

---

## Planned (Habit v2 backlog)

- Native browser push notifications (daily reminder)
- Habit reordering by drag ✅ done
- "Habit of the day" spotlight
- Export habit history as CSV
- Habit notes history view
