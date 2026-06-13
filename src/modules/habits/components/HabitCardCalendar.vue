<script setup lang="ts">
import { computed } from 'vue'
import type { Habit } from '../types'
import { useHabitsStore } from '../stores/habits.store'
import { UiIcon } from '@/ui'

const props = defineProps<{
  habit: Habit
  doneToday: boolean
  gridYear?: number
  gridMonth?: number
}>()

const emit = defineEmits<{ toggle: [id: string] }>()

const habitsStore = useHabitsStore()

const pastDays = computed(() => {
  const letters = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const todayIso = new Date().toISOString().split('T')[0]
  const days: { date: string; dayLetter: string; dayNum: number; isToday: boolean }[] = []

  if (props.gridYear !== undefined && props.gridMonth !== undefined) {
    // Show the selected month's days
    const daysInMonth = new Date(props.gridYear, props.gridMonth + 1, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(props.gridYear, props.gridMonth, d)
      const iso = dt.toISOString().split('T')[0]
      days.push({ date: iso, dayLetter: letters[dt.getDay()], dayNum: dt.getDate(), isToday: iso === todayIso })
    }
  } else {
    // Fall back to last 14 days
    const now = new Date()
    for (let i = 13; i >= 0; i--) {
      const dt = new Date(now)
      dt.setDate(now.getDate() - i)
      const iso = dt.toISOString().split('T')[0]
      days.push({ date: iso, dayLetter: letters[dt.getDay()], dayNum: dt.getDate(), isToday: i === 0 })
    }
  }
  return days
})

function isDone(date: string): boolean { return props.habit.completedDates.includes(date) }
function isSkipped(date: string): boolean { return props.habit.skippedDates?.includes(date) ?? false }
</script>

<template>
  <div class="hcc">
    <div class="hcc__label">
      <UiIcon name="CalendarDays" :size="12" />
      Edit past days
      <span class="hcc__hint">· right-click to mark skip</span>
    </div>
    <div class="hcc__grid">
      <button
        v-for="day in pastDays"
        :key="day.date"
        class="hcc-day"
        :class="{
          'hcc-day--done':    isDone(day.date),
          'hcc-day--skipped': isSkipped(day.date),
          'hcc-day--today':   day.isToday,
        }"
        :title="isSkipped(day.date) ? day.date + ' (skipped — right-click to undo)' : day.date + ' (right-click to mark as skip day)'"
        @click="day.isToday ? emit('toggle', habit.id) : habitsStore.toggleDate(habit.id, day.date)"
        @contextmenu.prevent="habitsStore.toggleSkip(habit.id, day.date)"
      >
        <span class="hcc-day__letter">{{ day.dayLetter }}</span>
        <span class="hcc-day__num">{{ day.dayNum }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.hcc {
  padding: 12px 20px 14px;
  border-top: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-accent) 3%, var(--color-surface));
}
.hcc__label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-muted);
  margin-bottom: 10px;
}
.hcc__hint { font-size: 9px; color: var(--color-text-muted); opacity: 0.6; font-style: italic; text-transform: none; letter-spacing: 0; font-weight: 400; }
.hcc__grid { display: flex; gap: 5px; }
.hcc-day {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 2px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface-elevated);
  cursor: pointer;
  transition: all var(--t-fast);
  min-width: 0;
}
.hcc-day:hover:not(.hcc-day--done) { border-color: var(--color-accent); background: var(--color-accent-muted); }
.hcc-day--done { background: var(--color-accent); border-color: var(--color-accent); }
.hcc-day--done .hcc-day__letter, .hcc-day--done .hcc-day__num { color: #fff; }
.hcc-day--skipped {
  background: repeating-linear-gradient(45deg, var(--color-border) 0px, var(--color-border) 2px, transparent 2px, transparent 6px);
  border-color: var(--color-border);
  opacity: 0.7;
}
.hcc-day--skipped .hcc-day__letter, .hcc-day--skipped .hcc-day__num { color: var(--color-text-muted); }
.hcc-day--today { border-color: var(--color-accent); }
.hcc-day--today:not(.hcc-day--done) { background: var(--color-accent-muted); }
.hcc-day__letter { font-size: 9px; font-weight: 700; text-transform: uppercase; color: var(--color-text-muted); line-height: 1; }
.hcc-day__num { font-size: 12px; font-weight: 600; color: var(--color-text); line-height: 1; font-family: var(--font-mono); }

@media (max-width: 767px) {
  .hcc { padding: 10px 16px 12px; }
  .hcc-day { padding: 5px 2px; }
  .hcc-day__num { font-size: 11px; }
}
</style>
