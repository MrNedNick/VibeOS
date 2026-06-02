<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { computeStreak, todayStr } from '@/modules/habits/types'
import { UiIcon, UiSectionLabel, UiButton } from '@/ui'

const router      = useRouter()
const habitsStore = useHabitsStore()

const today = todayStr()

const habits = computed(() => habitsStore.habits)

const doneToday  = computed(() => habits.value.filter(h => h.completedDates.includes(today)).length)
const totalCount = computed(() => habits.value.length)
const allDone    = computed(() => totalCount.value > 0 && doneToday.value === totalCount.value)

// Last 7 days for streak mini-chart
function last7(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

const weekDays = computed(() => last7())

// Overall week consistency: % of habits done each day
function weekDayTotal(date: string): number {
  if (!habits.value.length) return 0
  return Math.round(
    (habits.value.filter(h => h.completedDates.includes(date)).length / habits.value.length) * 100,
  )
}

function toggleHabit(id: string) {
  habitsStore.toggleToday(id)
}
</script>

<template>
  <div class="habits-panel">
    <div class="habits-panel__header">
      <UiSectionLabel as="span">Habits Today</UiSectionLabel>
      <div class="habits-panel__summary">
        <span
          class="habits-panel__count"
          :class="{ 'habits-panel__count--all': allDone }"
        >{{ doneToday }}/{{ totalCount }}</span>
        <UiButton variant="ghost" size="sm" @click="router.push('/habits')">
          View all <UiIcon name="ArrowRight" :size="12" />
        </UiButton>
      </div>
    </div>

    <!-- Week consistency bars -->
    <div v-if="habits.length > 0" class="habits-panel__week">
      <div
        v-for="date in weekDays"
        :key="date"
        class="habits-panel__week-col"
        :title="date + ': ' + weekDayTotal(date) + '%'"
      >
        <div
          class="habits-panel__week-bar"
          :class="{ 'habits-panel__week-bar--today': date === today }"
          :style="{ height: Math.max(4, weekDayTotal(date)) + '%' }"
        />
        <span class="habits-panel__week-day">{{ new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'narrow' }) }}</span>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="habits.length === 0" class="habits-panel__empty">
      <UiIcon name="Flame" :size="28" class="habits-panel__empty-icon" />
      <p>No habits yet. Start building a streak!</p>
      <UiButton @click="router.push('/habits')">Add habits</UiButton>
    </div>

    <!-- Habit rows (up to 6) -->
    <div v-else class="habits-panel__list">
      <div
        v-for="habit in habits.slice(0, 6)"
        :key="habit.id"
        class="habit-row"
        :class="{ 'habit-row--done': habit.completedDates.includes(today) }"
      >
        <span class="habit-row__emoji">{{ habit.emoji }}</span>
        <span class="habit-row__name">{{ habit.name }}</span>

        <!-- Streak -->
        <span
          v-if="computeStreak(habit.completedDates) > 0"
          class="habit-row__streak"
        >🔥{{ computeStreak(habit.completedDates) }}</span>

        <!-- Toggle button -->
        <button
          class="habit-row__toggle"
          :class="{ 'habit-row__toggle--done': habit.completedDates.includes(today) }"
          :title="habit.completedDates.includes(today) ? 'Undo' : 'Mark done'"
          @click.stop="toggleHabit(habit.id)"
        >
          <UiIcon
            :name="habit.completedDates.includes(today) ? 'CheckCircle2' : 'Circle'"
            :size="16"
            :stroke-width="1.75"
          />
        </button>
      </div>

      <div v-if="habits.length > 6" class="habits-panel__more" @click="router.push('/habits')">
        +{{ habits.length - 6 }} more habits →
      </div>
    </div>
  </div>
</template>

<style scoped>
.habits-panel {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.habits-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 8px;
}


.habits-panel__summary {
  display: flex;
  align-items: center;
  gap: 8px;
}

.habits-panel__count {
  font-size: 13px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}
.habits-panel__count--all { color: var(--color-success); }

.habits-panel__all {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-accent);
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  transition: background var(--t-fast);
}
.habits-panel__all:hover { background: var(--color-accent-muted); }

/* Week bars */
.habits-panel__week {
  display: flex;
  gap: 4px;
  height: 44px;
  align-items: flex-end;
  margin-bottom: 14px;
  padding-bottom: 18px;
  position: relative;
}

.habits-panel__week-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  height: 100%;
  justify-content: flex-end;
}

.habits-panel__week-bar {
  width: 100%;
  background: var(--color-accent);
  border-radius: 2px 2px 0 0;
  opacity: 0.5;
  transition: height 0.3s ease;
  min-height: 2px;
}
.habits-panel__week-bar--today { opacity: 0.9; }

.habits-panel__week-day {
  font-size: 9px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  position: absolute;
  bottom: 0;
}

/* Empty */
.habits-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 16px;
  text-align: center;
  color: var(--color-text-muted);
}
.habits-panel__empty-icon { opacity: 0.4; }
.habits-panel__empty p { font-size: 14px; margin: 0; }
.habits-panel__empty-btn {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-accent);
  padding: 4px 12px;
  border: 1px solid var(--color-accent-muted);
  border-radius: var(--radius-sm);
  background: var(--color-accent-muted);
  cursor: pointer;
  transition: opacity var(--t-fast);
}
.habits-panel__empty-btn:hover { opacity: 0.8; }

/* Habit rows */
.habits-panel__list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.habit-row {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  transition: background var(--t-fast);
}
.habit-row:hover { background: var(--color-surface-elevated); }
.habit-row--done { opacity: 0.65; }

.habit-row__emoji {
  font-size: 16px;
  line-height: 1;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.habit-row__name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.habit-row__streak {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-warning);
  flex-shrink: 0;
  white-space: nowrap;
}

.habit-row__toggle {
  flex-shrink: 0;
  color: var(--color-text-muted);
  transition: color var(--t-fast);
  display: flex;
  align-items: center;
}
.habit-row__toggle:hover { color: var(--color-accent); }
.habit-row__toggle--done { color: var(--color-accent); }

.habits-panel__more {
  font-size: 12px;
  color: var(--color-accent);
  padding: 6px 10px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity var(--t-fast);
}
.habits-panel__more:hover { opacity: 1; }
</style>
