<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTasksStore } from '@/modules/task-manager/stores/tasks.store'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { useLearningStore } from '@/modules/learning/stores/learning.store'
import { useTrainingStore } from '@/modules/training/stores/training.store'
import { useLocale } from '@/core/i18n'
import { UiFilterChips } from '@/ui'
import type { FilterChipOption } from '@/ui'
import AnalyticsAiReport from './components/AnalyticsAiReport.vue'
import AnalyticsHabits from './components/AnalyticsHabits.vue'
import AnalyticsBarChart from './components/AnalyticsBarChart.vue'
import AnalyticsGoals from './components/AnalyticsGoals.vue'
import AnalyticsUsage from './components/AnalyticsUsage.vue'
import { useTrack } from '@/core/composables/useTrack'
import { useRoute } from 'vue-router'

const i18n = useLocale()
const route = useRoute()
const tasksStore    = useTasksStore()
const habitsStore   = useHabitsStore()
const learningStore = useLearningStore()
const trainingStore = useTrainingStore()
const { track } = useTrack()

// Tab switcher: data | usage. Supports #usage hash from command palette
type MainTab = 'data' | 'usage'
const mainTab = ref<MainTab>(route.hash === '#usage' ? 'usage' : 'data')

const MAIN_TAB_OPTIONS: FilterChipOption[] = [
  { value: 'data',  label: 'Data' },
  { value: 'usage', label: 'Usage' },
]
const mainTabStr = computed({
  get: () => mainTab.value as string,
  set: (v: string) => { mainTab.value = v as MainTab },
})

type Period = 7 | 30 | 90
const period = ref<Period>(30)

const PERIOD_OPTIONS = computed<FilterChipOption[]>(() => [
  { value: '7',  label: i18n.t('analytics.period7'  as 'analytics.period7') },
  { value: '30', label: i18n.t('analytics.period30' as 'analytics.period7') },
  { value: '90', label: i18n.t('analytics.period90' as 'analytics.period7') },
])
const periodStr = computed({
  get: () => String(period.value),
  set: (v: string) => { period.value = parseInt(v) as Period; track('period:changed', { days: parseInt(v) }) },
})

// ── Date helpers ──────────────────────────────────────────────────────
function toDateStr(d: Date): string { return d.toISOString().slice(0, 10) }

function getDateRange(days: number): string[] {
  const result: string[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i); result.push(toDateStr(d))
  }
  return result
}

function getDateSet(days: number): Set<string> { return new Set(getDateRange(days)) }

interface WeekBucket { label: string; start: string; end: string }
function getWeekBuckets(days: number): WeekBucket[] {
  const dates = getDateRange(days)
  const map = new Map<string, WeekBucket>()
  for (const d of dates) {
    const date = new Date(d)
    const dow = date.getDay()
    const diff = date.getDate() - dow + (dow === 0 ? -6 : 1)
    const mon = new Date(date); mon.setDate(diff)
    const key = toDateStr(mon)
    if (!map.has(key)) {
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
      map.set(key, { label: mon.toLocaleDateString('en', { month: 'short', day: 'numeric' }), start: key, end: toDateStr(sun) })
    }
  }
  return Array.from(map.values())
}

// ── Overview stats ────────────────────────────────────────────────────
const statTasksDone  = computed(() => tasksStore.tasks.filter(t => t.done).length)
const statTasksTotal = computed(() => tasksStore.tasks.length)
const statHabitRate  = computed((): number | null => {
  if (!habitsStore.habits.length) return null
  const dates = getDateRange(period.value)
  let total = 0, done = 0
  for (const h of habitsStore.habits) { for (const d of dates) { total++; if (h.completedDates.includes(d)) done++ } }
  return total === 0 ? 0 : Math.round((done / total) * 100)
})
const statLearningHours = computed((): string => {
  const dates = getDateSet(period.value)
  const mins = learningStore.sessions.filter(s => dates.has(s.date)).reduce((sum, s) => sum + s.actualMinutes, 0)
  return (mins / 60).toFixed(1)
})
const statWorkouts = computed(() => {
  const dates = getDateSet(period.value)
  return trainingStore.logs.filter(l => dates.has(l.date)).length
})

// ── Habits grid ───────────────────────────────────────────────────────
const GRID_DAYS = computed(() => Math.min(period.value, 35))
const habitRows = computed(() => {
  const today = toDateStr(new Date())
  const dates = getDateRange(GRID_DAYS.value)
  return habitsStore.habits.map(h => {
    const doneSet = new Set(h.completedDates)
    const done = dates.filter(d => doneSet.has(d)).length
    return {
      id: h.id, name: h.name, emoji: h.emoji,
      rate: dates.length === 0 ? 0 : Math.round((done / dates.length) * 100),
      cells: dates.map(d => ({ date: d, done: doneSet.has(d), isToday: d === today })),
    }
  })
})

// ── Bar chart data ────────────────────────────────────────────────────
interface BarItem { label: string; value: number; secondary: number; tooltip: string }

const taskBars = computed((): BarItem[] =>
  getWeekBuckets(period.value).map(w => {
    const items = tasksStore.tasks.filter(t => { const d = new Date(t.createdAt).toISOString().slice(0, 10); return d >= w.start && d <= w.end })
    const done = items.filter(t => t.done).length
    return { label: w.label, value: items.length, secondary: done, tooltip: `${items.length} ${i18n.t('analytics.tasksCreated')}, ${done} ${i18n.t('analytics.tasksDoneLabel')}` }
  }),
)
const learningBars = computed((): BarItem[] =>
  getWeekBuckets(period.value).map(w => {
    const mins = learningStore.sessions.filter(s => s.date >= w.start && s.date <= w.end).reduce((sum, s) => sum + s.actualMinutes, 0)
    const hrs = parseFloat((mins / 60).toFixed(1))
    return { label: w.label, value: hrs, secondary: 0, tooltip: `${hrs} ${i18n.t('analytics.learningUnit')}` }
  }),
)
const trainingBars = computed((): BarItem[] =>
  getWeekBuckets(period.value).map(w => {
    const items = trainingStore.logs.filter(l => l.date >= w.start && l.date <= w.end)
    const mins = items.reduce((sum, l) => sum + (l.actualDuration ?? 0), 0)
    return { label: w.label, value: items.length, secondary: 0, tooltip: `${items.length} ${i18n.t('analytics.trainingUnit')}${mins > 0 ? ` · ${mins}min` : ''}` }
  }),
)
</script>

<template>
  <div class="analytics">
    <!-- Header -->
    <div class="analytics__header">
      <h1 class="analytics__title">{{ i18n.t('modules.analytics') }}</h1>
      <div class="analytics__header-right">
        <UiFilterChips v-model="mainTabStr" :options="MAIN_TAB_OPTIONS" />
        <UiFilterChips v-if="mainTab === 'data'" v-model="periodStr" :options="PERIOD_OPTIONS" />
      </div>
    </div>

    <!-- ── Data tab ─────────────────────────────────────────────── -->
    <template v-if="mainTab === 'data'">
      <!-- AI report -->
      <AnalyticsAiReport :period="period" />

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
            <div class="stat-card__value">{{ statHabitRate !== null ? `${statHabitRate}%` : '—' }}</div>
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

      <!-- Habits -->
      <AnalyticsHabits :habit-rows="habitRows" />

      <!-- Tasks -->
      <AnalyticsBarChart
        :title="i18n.t('analytics.tasksTitle')"
        :bars="taskBars"
        :empty-label="i18n.t('analytics.noData')"
        :legend="[
          { colorClass: 'legend-dot--primary', label: i18n.t('analytics.tasksCreated') },
          { colorClass: 'legend-dot--secondary', label: i18n.t('analytics.tasksDoneLabel') },
        ]"
      />

      <!-- Learning -->
      <AnalyticsBarChart
        :title="i18n.t('analytics.learningTitle')"
        :bars="learningBars"
        fill-class="bar-col__fill--learning"
        :empty-label="i18n.t('analytics.noData')"
        :legend="[{ colorClass: 'legend-dot--learning', label: i18n.t('analytics.learningUnit') + ' / week' }]"
      />

      <!-- Training -->
      <AnalyticsBarChart
        :title="i18n.t('analytics.trainingTitle')"
        :bars="trainingBars"
        fill-class="bar-col__fill--training"
        :empty-label="i18n.t('analytics.noData')"
        :legend="[{ colorClass: 'legend-dot--training', label: i18n.t('analytics.trainingUnit') + ' / week' }]"
      />

      <!-- Goals -->
      <AnalyticsGoals />
    </template>

    <!-- ── Usage tab ─────────────────────────────────────────────── -->
    <AnalyticsUsage v-else :period="period" />
  </div>
</template>

<style scoped>
.analytics {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--content-padding);
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.analytics__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.analytics__title { font-size: 27px; font-weight: 700; color: var(--color-text); margin: 0; }
.analytics__header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.analytics__overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: box-shadow var(--t-fast);
  box-shadow: var(--shadow-1);
}
.stat-card:hover { box-shadow: var(--shadow-2); }
.stat-card__icon {
  width: 36px; height: 36px;
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0;
}
.stat-card__icon--tasks    { background: color-mix(in srgb, #22c55e 15%, transparent); color: #22c55e; }
.stat-card__icon--habits   { background: color-mix(in srgb, var(--color-accent) 15%, transparent); color: var(--color-accent); }
.stat-card__icon--learning { background: color-mix(in srgb, #a78bfa 15%, transparent); color: #a78bfa; }
.stat-card__icon--training { background: color-mix(in srgb, #34d399 15%, transparent); color: #34d399; }
.stat-card__body { display: flex; flex-direction: column; gap: 2px; }
.stat-card__value { font-size: 24px; font-weight: 700; font-family: var(--font-mono); color: var(--color-text); line-height: 1.2; }
.stat-card__label { font-size: 12px; font-weight: 600; color: var(--color-text-secondary); }
.stat-card__sub { font-size: 11px; color: var(--color-text-muted); }

/* Classes used by AnalyticsBarChart via prop */
:deep(.legend-dot--primary)   { background: var(--color-accent); opacity: 0.4; }
:deep(.legend-dot--secondary) { background: var(--color-accent); opacity: 0.9; }
:deep(.legend-dot--learning)  { background: #a78bfa; opacity: 0.8; }
:deep(.legend-dot--training)  { background: #34d399; opacity: 0.8; }

@media (max-width: 900px) { .analytics__overview { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 500px) { .analytics__overview { grid-template-columns: 1fr 1fr; } }

@media (max-width: 767px) {
  .analytics { gap: 20px; padding: var(--content-padding); }
  .analytics__title { font-size: 22px; }
  .analytics__header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .analytics__header-right { width: 100%; overflow-x: auto; flex-wrap: nowrap; }
  .analytics__overview { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .stat-card { padding: 12px; gap: 10px; }
  .stat-card__value { font-size: 20px; }
  .stat-card__icon { width: 30px; height: 30px; font-size: 14px; }
}
</style>
