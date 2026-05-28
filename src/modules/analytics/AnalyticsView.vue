<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTasksStore } from '@/modules/task-manager/stores/tasks.store'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { useLearningStore } from '@/modules/learning/stores/learning.store'
import { useTrainingStore } from '@/modules/training/stores/training.store'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { useLocale } from '@/core/i18n'

const i18n = useLocale()
const tasksStore = useTasksStore()
const habitsStore = useHabitsStore()
const learningStore = useLearningStore()
const trainingStore = useTrainingStore()
const goalsStore = useGoalsStore()

// ─────────────────────────────────────────────────────────────
// Period selector
// ─────────────────────────────────────────────────────────────
type Period = 7 | 30 | 90
const period = ref<Period>(30)

// ─────────────────────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────────────────────
function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function getDateRange(days: number): string[] {
  const result: string[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    result.push(toDateStr(d))
  }
  return result
}

function getDateSet(days: number): Set<string> {
  return new Set(getDateRange(days))
}

interface WeekBucket {
  label: string
  start: string
  end: string
}

function getWeekBuckets(days: number): WeekBucket[] {
  const dates = getDateRange(days)
  const map = new Map<string, WeekBucket>()
  for (const d of dates) {
    const date = new Date(d)
    const dow = date.getDay()
    const diff = date.getDate() - dow + (dow === 0 ? -6 : 1)
    const mon = new Date(date)
    mon.setDate(diff)
    const key = toDateStr(mon)
    if (!map.has(key)) {
      const sun = new Date(mon)
      sun.setDate(mon.getDate() + 6)
      map.set(key, {
        label: mon.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        start: key,
        end: toDateStr(sun),
      })
    }
  }
  return Array.from(map.values())
}

// ─────────────────────────────────────────────────────────────
// Overview stats
// ─────────────────────────────────────────────────────────────
const statTasksDone = computed(() => tasksStore.tasks.filter(t => t.done).length)
const statTasksTotal = computed(() => tasksStore.tasks.length)

const statHabitRate = computed((): number | null => {
  if (!habitsStore.habits.length) return null
  const dates = getDateRange(period.value)
  let total = 0
  let done = 0
  for (const h of habitsStore.habits) {
    for (const d of dates) {
      total++
      if (h.completedDates.includes(d)) done++
    }
  }
  return total === 0 ? 0 : Math.round((done / total) * 100)
})

const statLearningHours = computed((): string => {
  const dates = getDateSet(period.value)
  const mins = learningStore.sessions
    .filter(s => dates.has(s.date))
    .reduce((sum, s) => sum + s.actualMinutes, 0)
  return (mins / 60).toFixed(1)
})

const statWorkouts = computed((): number => {
  const dates = getDateSet(period.value)
  return trainingStore.logs.filter(l => dates.has(l.date)).length
})

// ─────────────────────────────────────────────────────────────
// Habits grid
// ─────────────────────────────────────────────────────────────
const GRID_DAYS = computed(() => Math.min(period.value, 35))

interface HabitRow {
  id: string
  name: string
  emoji: string
  rate: number
  cells: { date: string; done: boolean; isToday: boolean }[]
}

const habitRows = computed((): HabitRow[] => {
  const today = toDateStr(new Date())
  const dates = getDateRange(GRID_DAYS.value)
  return habitsStore.habits.map(h => {
    const doneSet = new Set(h.completedDates)
    const done = dates.filter(d => doneSet.has(d)).length
    return {
      id: h.id,
      name: h.name,
      emoji: h.emoji,
      rate: dates.length === 0 ? 0 : Math.round((done / dates.length) * 100),
      cells: dates.map(d => ({ date: d, done: doneSet.has(d), isToday: d === today })),
    }
  })
})

// ─────────────────────────────────────────────────────────────
// Bar chart data
// ─────────────────────────────────────────────────────────────
interface BarItem {
  label: string
  value: number
  secondary: number
  tooltip: string
}

const taskBars = computed((): BarItem[] => {
  const weeks = getWeekBuckets(period.value)
  return weeks.map(w => {
    const items = tasksStore.tasks.filter(t => {
      const d = new Date(t.createdAt).toISOString().slice(0, 10)
      return d >= w.start && d <= w.end
    })
    const done = items.filter(t => t.done).length
    return {
      label: w.label,
      value: items.length,
      secondary: done,
      tooltip: `${items.length} ${i18n.t('analytics.tasksCreated')}, ${done} ${i18n.t('analytics.tasksDoneLabel')}`,
    }
  })
})

const learningBars = computed((): BarItem[] => {
  const weeks = getWeekBuckets(period.value)
  return weeks.map(w => {
    const mins = learningStore.sessions
      .filter(s => s.date >= w.start && s.date <= w.end)
      .reduce((sum, s) => sum + s.actualMinutes, 0)
    const hrs = parseFloat((mins / 60).toFixed(1))
    return {
      label: w.label,
      value: hrs,
      secondary: 0,
      tooltip: `${hrs} ${i18n.t('analytics.learningUnit')}`,
    }
  })
})

const trainingBars = computed((): BarItem[] => {
  const weeks = getWeekBuckets(period.value)
  return weeks.map(w => {
    const items = trainingStore.logs.filter(l => l.date >= w.start && l.date <= w.end)
    const mins = items.reduce((sum, l) => sum + (l.actualDuration ?? 0), 0)
    return {
      label: w.label,
      value: items.length,
      secondary: mins,
      tooltip: `${items.length} ${i18n.t('analytics.trainingUnit')}${mins > 0 ? ` · ${mins}min` : ''}`,
    }
  })
})

function maxVal(bars: BarItem[]): number {
  return Math.max(...bars.map(b => b.value), 1)
}

function pct(value: number, max: number): string {
  if (value === 0) return '0%'
  return `${Math.max((value / max) * 100, 3)}%`
}

function pctSecondary(value: number, max: number): string {
  if (value === 0) return '0%'
  return `${Math.max((value / max) * 100, 2)}%`
}

// ─────────────────────────────────────────────────────────────
// Goals
// ─────────────────────────────────────────────────────────────
const goalsProgress = computed(() =>
  goalsStore.activeGoals.map(g => ({
    ...g,
    progress: goalsStore.getProgress(g.id),
  }))
)
</script>

<template>
  <div class="analytics">
    <!-- Header -->
    <div class="analytics__header">
      <h1 class="analytics__title">{{ i18n.t('modules.analytics') }}</h1>
      <div class="analytics__period">
        <button
          v-for="p in ([7, 30, 90] as const)"
          :key="p"
          class="period-btn"
          :class="{ 'period-btn--active': period === p }"
          @click="period = p"
        >
          {{ i18n.t(`analytics.period${p}` as 'analytics.period7') }}
        </button>
      </div>
    </div>

    <!-- Overview stat cards -->
    <section class="analytics__overview">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--tasks">✓</div>
        <div class="stat-card__body">
          <div class="stat-card__value">{{ statTasksDone }}</div>
          <div class="stat-card__label">{{ i18n.t('analytics.statTasksDone') }}</div>
          <div class="stat-card__sub">{{ i18n.t('analytics.ofTotal') }} {{ statTasksTotal }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--habits">◉</div>
        <div class="stat-card__body">
          <div class="stat-card__value">
            {{ statHabitRate !== null ? `${statHabitRate}%` : '—' }}
          </div>
          <div class="stat-card__label">{{ i18n.t('analytics.statHabitRate') }}</div>
          <div class="stat-card__sub">{{ period }}d window</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--learning">▶</div>
        <div class="stat-card__body">
          <div class="stat-card__value">{{ statLearningHours }}</div>
          <div class="stat-card__label">{{ i18n.t('analytics.statLearning') }}</div>
          <div class="stat-card__sub">{{ period }}d window</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--training">⚡</div>
        <div class="stat-card__body">
          <div class="stat-card__value">{{ statWorkouts }}</div>
          <div class="stat-card__label">{{ i18n.t('analytics.statWorkouts') }}</div>
          <div class="stat-card__sub">{{ period }}d window</div>
        </div>
      </div>
    </section>

    <!-- Habits Consistency -->
    <section class="analytics__section">
      <h2 class="section-title">{{ i18n.t('analytics.habitsTitle') }}</h2>

      <div v-if="habitRows.length === 0" class="empty-state">
        {{ i18n.t('analytics.habitsEmpty') }}
      </div>

      <div v-else class="habit-grid-wrap">
        <div
          v-for="row in habitRows"
          :key="row.id"
          class="habit-row"
        >
          <div class="habit-row__meta">
            <span class="habit-row__emoji">{{ row.emoji }}</span>
            <span class="habit-row__name">{{ row.name }}</span>
            <span class="habit-row__rate">{{ row.rate }}%</span>
          </div>
          <div class="habit-row__cells">
            <div
              v-for="cell in row.cells"
              :key="cell.date"
              class="habit-cell"
              :class="{
                'habit-cell--done': cell.done,
                'habit-cell--today': cell.isToday,
              }"
              :title="cell.date"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Task Activity -->
    <section class="analytics__section">
      <h2 class="section-title">{{ i18n.t('analytics.tasksTitle') }}</h2>

      <div v-if="taskBars.every(b => b.value === 0)" class="empty-state">
        {{ i18n.t('analytics.noData') }}
      </div>

      <div v-else class="bar-chart">
        <div class="bar-chart__bars">
          <div
            v-for="(bar, i) in taskBars"
            :key="i"
            class="bar-col"
            :title="bar.tooltip"
          >
            <div class="bar-col__stack">
              <div
                class="bar-col__fill bar-col__fill--secondary"
                :style="{ height: pctSecondary(bar.secondary, maxVal(taskBars)) }"
              />
              <div
                class="bar-col__fill bar-col__fill--primary"
                :style="{ height: pct(bar.value - bar.secondary, maxVal(taskBars)) }"
              />
            </div>
            <span class="bar-col__label">{{ bar.label }}</span>
          </div>
        </div>
        <div class="bar-chart__legend">
          <span class="legend-dot legend-dot--primary" />
          <span>{{ i18n.t('analytics.tasksCreated') }}</span>
          <span class="legend-dot legend-dot--secondary" />
          <span>{{ i18n.t('analytics.tasksDoneLabel') }}</span>
        </div>
      </div>
    </section>

    <!-- Learning Hours -->
    <section class="analytics__section">
      <h2 class="section-title">{{ i18n.t('analytics.learningTitle') }}</h2>

      <div v-if="learningBars.every(b => b.value === 0)" class="empty-state">
        {{ i18n.t('analytics.noData') }}
      </div>

      <div v-else class="bar-chart bar-chart--single">
        <div class="bar-chart__bars">
          <div
            v-for="(bar, i) in learningBars"
            :key="i"
            class="bar-col"
            :title="bar.tooltip"
          >
            <div class="bar-col__stack">
              <div
                class="bar-col__fill bar-col__fill--learning"
                :style="{ height: pct(bar.value, maxVal(learningBars)) }"
              />
            </div>
            <span class="bar-col__label">{{ bar.label }}</span>
          </div>
        </div>
        <div class="bar-chart__legend">
          <span class="legend-dot legend-dot--learning" />
          <span>{{ i18n.t('analytics.learningUnit') }} / week</span>
        </div>
      </div>
    </section>

    <!-- Training Sessions -->
    <section class="analytics__section">
      <h2 class="section-title">{{ i18n.t('analytics.trainingTitle') }}</h2>

      <div v-if="trainingBars.every(b => b.value === 0)" class="empty-state">
        {{ i18n.t('analytics.noData') }}
      </div>

      <div v-else class="bar-chart bar-chart--single">
        <div class="bar-chart__bars">
          <div
            v-for="(bar, i) in trainingBars"
            :key="i"
            class="bar-col"
            :title="bar.tooltip"
          >
            <div class="bar-col__stack">
              <div
                class="bar-col__fill bar-col__fill--training"
                :style="{ height: pct(bar.value, maxVal(trainingBars)) }"
              />
            </div>
            <span class="bar-col__label">{{ bar.label }}</span>
          </div>
        </div>
        <div class="bar-chart__legend">
          <span class="legend-dot legend-dot--training" />
          <span>{{ i18n.t('analytics.trainingUnit') }} / week</span>
        </div>
      </div>
    </section>

    <!-- Goals -->
    <section class="analytics__section analytics__section--last">
      <h2 class="section-title">{{ i18n.t('analytics.goalsTitle') }}</h2>

      <div v-if="goalsStore.goals.length === 0" class="empty-state">
        {{ i18n.t('analytics.goalsEmpty') }}
      </div>

      <div v-else class="goals-list">
        <div
          v-for="g in goalsProgress"
          :key="g.id"
          class="goal-item"
        >
          <div class="goal-item__header">
            <span class="goal-item__title">{{ g.title }}</span>
            <span class="goal-item__pct">{{ g.progress }}%</span>
          </div>
          <div class="goal-item__bar">
            <div
              class="goal-item__bar-fill"
              :style="{ width: `${g.progress}%` }"
            />
          </div>
          <div v-if="g.targetDate" class="goal-item__date">
            {{ g.targetDate }}
          </div>
        </div>

        <div v-if="goalsStore.completedGoals.length > 0" class="goals-completed-badge">
          ✓ {{ goalsStore.completedGoals.length }} {{ i18n.t('analytics.goalsCompleted') }}
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ────────────────────────────────────────────────────────────
   Layout
──────────────────────────────────────────────────────────── */
.analytics {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--content-padding);
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* ────────────────────────────────────────────────────────────
   Header
──────────────────────────────────────────────────────────── */
.analytics__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.analytics__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.analytics__period {
  display: flex;
  gap: 4px;
  background: var(--bg-secondary);
  border-radius: 10px;
  padding: 3px;
}

.period-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 7px;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.15s ease;
  min-width: 44px;
  min-height: 32px;
}

.period-btn:hover {
  color: var(--text-primary);
  background: var(--bg-card);
}

.period-btn--active {
  background: var(--accent);
  color: #fff;
}

.period-btn--active:hover {
  background: var(--accent);
  color: #fff;
  opacity: 0.9;
}

/* ────────────────────────────────────────────────────────────
   Overview stat cards
──────────────────────────────────────────────────────────── */
.analytics__overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: border-color 0.15s;
}

.stat-card:hover {
  border-color: var(--accent);
}

.stat-card__icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.stat-card__icon--tasks    { background: rgba(99,  102, 241, 0.15); color: #818cf8; }
.stat-card__icon--habits   { background: rgba(16,  185, 129, 0.15); color: #34d399; }
.stat-card__icon--learning { background: rgba(245, 158,  11, 0.15); color: #fbbf24; }
.stat-card__icon--training { background: rgba(239,  68,  68, 0.15); color: #f87171; }

.stat-card__body {
  min-width: 0;
}

.stat-card__value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-card__label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.stat-card__sub {
  font-size: 0.6875rem;
  color: var(--text-secondary);
  margin-top: 2px;
  opacity: 0.6;
}

/* ────────────────────────────────────────────────────────────
   Section
──────────────────────────────────────────────────────────── */
.analytics__section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
}

.analytics__section--last {
  margin-bottom: 0;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px;
  letter-spacing: 0.01em;
}

.empty-state {
  color: var(--text-secondary);
  font-size: 0.875rem;
  padding: 12px 0;
  text-align: center;
}

/* ────────────────────────────────────────────────────────────
   Habit grid
──────────────────────────────────────────────────────────── */
.habit-grid-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.habit-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.habit-row__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 150px;
  flex-shrink: 0;
}

.habit-row__emoji {
  font-size: 1rem;
  line-height: 1;
}

.habit-row__name {
  font-size: 0.8125rem;
  color: var(--text-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.habit-row__rate {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--accent);
  flex-shrink: 0;
}

.habit-row__cells {
  display: flex;
  gap: 3px;
  flex: 1;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.habit-cell {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: var(--bg-secondary);
  flex-shrink: 0;
  transition: transform 0.1s;
  cursor: default;
}

.habit-cell:hover {
  transform: scale(1.3);
}

.habit-cell--done {
  background: var(--accent);
  opacity: 0.85;
}

.habit-cell--today {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

.habit-cell--done.habit-cell--today {
  opacity: 1;
}

/* ────────────────────────────────────────────────────────────
   Bar charts
──────────────────────────────────────────────────────────── */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bar-chart__bars {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 120px;
}

.bar-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 100%;
}

.bar-col__stack {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 1px;
  min-height: 0;
}

.bar-col__fill {
  width: 100%;
  border-radius: 3px 3px 0 0;
  min-height: 0;
  transition: height 0.3s ease;
}

.bar-col__fill--primary   { background: var(--accent); opacity: 0.45; }
.bar-col__fill--secondary { background: var(--accent); opacity: 0.95; border-radius: 3px; }
.bar-col__fill--learning  { background: #fbbf24; opacity: 0.85; }
.bar-col__fill--training  { background: #f87171; opacity: 0.85; }

.bar-col__label {
  font-size: 0.5rem;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.2;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
}

.bar-chart__legend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot--primary   { background: var(--accent); opacity: 0.45; }
.legend-dot--secondary { background: var(--accent); }
.legend-dot--learning  { background: #fbbf24; }
.legend-dot--training  { background: #f87171; }

/* ────────────────────────────────────────────────────────────
   Goals
──────────────────────────────────────────────────────────── */
.goals-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.goal-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.goal-item__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}

.goal-item__title {
  font-size: 0.875rem;
  color: var(--text-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goal-item__pct {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--accent);
  flex-shrink: 0;
}

.goal-item__bar {
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.goal-item__bar-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 3px;
  transition: width 0.4s ease;
  min-width: 4px;
}

.goal-item__date {
  font-size: 0.6875rem;
  color: var(--text-secondary);
  opacity: 0.7;
}

.goals-completed-badge {
  font-size: 0.75rem;
  color: var(--text-secondary);
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  text-align: center;
}

/* ────────────────────────────────────────────────────────────
   Responsive — tablet
──────────────────────────────────────────────────────────── */
@media (max-width: 1023px) {
  .analytics__overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .habit-row__meta {
    width: 120px;
  }
}

/* ────────────────────────────────────────────────────────────
   Responsive — mobile (iPhone)
──────────────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .analytics {
    gap: 16px;
  }

  .analytics__header {
    gap: 10px;
  }

  .analytics__title {
    font-size: 1.25rem;
  }

  .analytics__section {
    padding: 14px 16px;
  }

  .analytics__overview {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .stat-card {
    padding: 12px;
    gap: 8px;
  }

  .stat-card__icon {
    width: 30px;
    height: 30px;
    font-size: 0.875rem;
  }

  .stat-card__value {
    font-size: 1.25rem;
  }

  .habit-row {
    gap: 8px;
  }

  .habit-row__meta {
    width: 80px;
  }

  .habit-row__name {
    font-size: 0.6875rem;
  }

  .habit-cell {
    width: 9px;
    height: 9px;
    border-radius: 2px;
  }

  .habit-row__cells {
    gap: 2px;
  }

  .bar-chart__bars {
    height: 80px;
  }

  .bar-col__label {
    font-size: 0.4375rem;
  }
}
</style>
