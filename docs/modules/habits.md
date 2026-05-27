# Habits module

**Status:** Available (S4)  
**Route:** `/habits`  
**Layout:** standard (content-max-width)

## Purpose

Daily habit tracking with long-term consistency visualization. The differentiator is the GitHub-style contribution heatmap per habit — it makes consistency (or lack of it) immediately visible. The goal is to feel lightweight and fast: open, check off, close.

## Data model

```ts
interface Habit {
  id: string
  name: string
  emoji: string          // single emoji as icon
  createdAt: string      // ISO timestamp
  completedDates: string[] // 'YYYY-MM-DD' array
}
```

Storage key: `platform:habits:habits` (via `useStorage`)

Dates are stored as `YYYY-MM-DD` strings (locale-independent, sortable).

## Streak logic

- Streak counts consecutive completed days backwards from today
- If today is not yet completed, the streak still counts from yesterday (user has until end of day)
- A "perfect day" is any past date where the habit was checked off

## Heatmap

- 16 weeks × 7 days = 112 cells
- CSS grid with `grid-template-rows: repeat(7, 10px)` and `grid-auto-flow: column`
- Completed day: `--color-accent`
- Empty day: `--color-border`
- Today's cell: accent border regardless of completion state
- No labels inside the card (streak count gives the context)

## Component architecture

```
HabitsView
├── header: title + date + "Add habit" button
├── HabitCard[]
│   ├── left: emoji + name + streak badge
│   ├── right: today toggle button
│   └── bottom: HabitHeatmap
└── inline new-habit form (shown on "+" click)
```

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `N` | New habit (when not focused on input) |
| `Enter` | Save new habit |
| `Escape` | Cancel new habit |

## Backlog / future ideas

- Weekly and monthly views
- Habit groups / categories
- Target frequency (e.g., 5x per week, not just daily)
- Reminder notifications (Web Notification API)
- Export as CSV
- Longest streak record
