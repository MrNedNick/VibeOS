export interface Habit {
  id: string
  name: string
  emoji: string
  createdAt: string
  completedDates: string[]
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

export function computeStreak(completedDates: string[]): number {
  const dateSet = new Set(completedDates)
  const today = todayStr()
  const date = new Date()
  let streak = 0
  let checkedToday = false

  while (true) {
    const ds = date.toISOString().split('T')[0]
    if (dateSet.has(ds)) {
      streak++
      date.setDate(date.getDate() - 1)
    } else if (!checkedToday && ds === today) {
      // today not completed yet — peek at yesterday before breaking
      checkedToday = true
      date.setDate(date.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export function generateHeatmapDates(weeks: number): string[][] {
  const today = new Date()
  const totalDays = weeks * 7
  const days: string[] = []

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }

  // chunk into weeks of 7 (columns)
  const grid: string[][] = []
  for (let w = 0; w < weeks; w++) {
    grid.push(days.slice(w * 7, w * 7 + 7))
  }
  return grid
}
