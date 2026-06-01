<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTasksStore } from '@/modules/task-manager/stores/tasks.store'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { useLearningStore } from '@/modules/learning/stores/learning.store'
import { useTrainingStore } from '@/modules/training/stores/training.store'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { useLocale } from '@/core/i18n'
import { useAI } from '@/core/composables/useAI'
import { UiSectionLabel, UiFilterChips, UiProgressBar, UiIcon, UiSkeleton } from '@/ui'
import type { FilterChipOption } from '@/ui'

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

const PERIOD_OPTIONS = computed<FilterChipOption[]>(() => [
  { value: '7',  label: i18n.t('analytics.period7'  as 'analytics.period7') },
  { value: '30', label: i18n.t('analytics.period30' as 'analytics.period7') },
  { value: '90', label: i18n.t('analytics.period90' as 'analytics.period7') },
])

const periodStr = computed({
  get: () => String(period.value),
  set: (v: string) => { period.value = parseInt(v) as Period },
})

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

// ─────────────────────────────────────────────────────────────
// AI — Monthly report (cross-module narrative, S12 T1)
// Synthesises the SELECTED period's real data into one paragraph.
// ─────────────────────────────────────────────────────────────
const { complete, loading: reportLoading } = useAI()
const report      = ref<string | null>(null)
const reportError = ref<string | null>(null)
const reportOpen  = ref(false)

function buildSummary(): string {
  const dates = getDateSet(period.value)
  const days  = period.value

  // Tasks created / completed within the period
  const tasksCreated = tasksStore.tasks.filter(t =>
    dates.has(new Date(t.createdAt).toISOString().slice(0, 10)),
  ).length
  const tasksDone = tasksStore.tasks.filter(t =>
    t.done && t.completedAt && dates.has(t.completedAt.slice(0, 10)),
  ).length

  const lines: string[] = [
    `Period: last ${days} days`,
    `Habit consistency: ${statHabitRate.value !== null ? statHabitRate.value + '%' : 'no habits tracked'}` +
      `${habitsStore.habits.length ? ` across ${habitsStore.habits.length} habit(s)` : ''}`,
    `Tasks: ${tasksDone} completed, ${tasksCreated} created in this window (${statTasksDone.value} done of ${statTasksTotal.value} all-time)`,
    `Learning: ${statLearningHours.value} hours logged across ${learningStore.activePlans.length} active plan(s)`,
    `Training: ${statWorkouts.value} workout session(s)`,
  ]

  if (goalsProgress.value.length) {
    const goalsTxt = goalsProgress.value
      .map(g => `"${g.title}" ${g.progress}%`)
      .join(', ')
    lines.push(`Active goals: ${goalsTxt}`)
  } else {
    lines.push('Active goals: none')
  }
  if (goalsStore.completedGoals.length) {
    lines.push(`Completed goals: ${goalsStore.completedGoals.length}`)
  }

  return lines.join('\n')
}

async function generateReport() {
  reportError.value = null
  reportOpen.value  = true
  report.value      = null

  const prompt =
    `Here is my personal data for the period:\n${buildSummary()}\n\n` +
    `Write a single short paragraph (3–5 sentences) reviewing my month like a personal reflection. ` +
    `Mention concrete numbers from the data, note what went well and the weakest area, and keep an encouraging tone. ` +
    `Base everything strictly on the data above — do not invent anything. No preamble, no headings, no bullet points — just the paragraph.`

  try {
    report.value = await complete(prompt)
  } catch {
    reportError.value = 'Network error — check your connection'
  }
}

function dismissReport() {
  reportOpen.value  = false
  report.value      = null
  reportError.value = null
}
</script>

<template>
  <div class="analytics">
    <!-- Header -->
    <div class="analytics__header">
      <h1 class="analytics__title">{{ i18n.t('modules.analytics') }}</h1>
      <UiFilterChips v-model="periodStr" :options="PERIOD_OPTIONS" />
    </div>

    <!-- AI monthly report -->
    <section class="report" :class="{ 'report--open': reportOpen }">
      <div class="report__header">
        <div class="report__title-row">
          <UiIcon name="Sparkles" :size="14" :stroke-width="2" class="report__icon" />
          <span class="report__title">AI report · last {{ period }} days</span>
        </div>
        <div class="report__actions">
          <button
            v-if="!reportOpen || (!reportLoading && !report)"
            class="report__generate-btn"
            :disabled="reportLoading"
            @click="generateReport"
          >
            <UiIcon v-if="reportLoading" name="Loader" :size="13" :stroke-width="2" class="report__spinner" />
            {{ reportLoading ? 'Generating…' : '✦ Generate monthly report' }}
          </button>
          <button v-if="reportOpen && (report || reportError)" class="report__icon-btn" title="Regenerate" :disabled="reportLoading" @click="generateReport">
            <UiIcon name="RefreshCw" :size="13" :stroke-width="2" />
          </button>
          <button v-if="reportOpen" class="report__icon-btn" title="Dismiss" @click="dismissReport">
            <UiIcon name="X" :size="13" :stroke-width="2" />
          </button>
        </div>
      </div>

      <Transition name="report-body">
        <div v-if="reportOpen" class="report__body">
          <div v-if="reportLoading" class="report__skeleton">
            <UiSkeleton width="100%" height="14px" rounded="full" />
            <UiSkeleton width="96%" height="14px" rounded="full" />
            <UiSkeleton width="90%" height="14px" rounded="full" />
            <UiSkeleton width="70%" height="14px" rounded="full" />
          </div>
          <div v-else-if="reportError" class="report__error">
            <UiIcon name="AlertCircle" :size="14" :stroke-width="2" />
            <span>{{ reportError }}</span>
            <button class="report__retry" @click="generateReport">Retry</button>
          </div>
          <p v-else-if="report" class="report__text">{{ report }}</p>
        </div>
      </Transition>
    </section>

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
      <UiSectionLabel as="h2" class="analytics__section-label">{{ i18n.t('analytics.habitsTitle') }}</UiSectionLabel>

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
      <UiSectionLabel as="h2" class="analytics__section-label">{{ i18n.t('analytics.tasksTitle') }}</UiSectionLabel>

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
      <UiSectionLabel as="h2" class="analytics__section-label">{{ i18n.t('analytics.learningTitle') }}</UiSectionLabel>

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
      <UiSectionLabel as="h2" class="analytics__section-label">{{ i18n.t('analytics.trainingTitle') }}</UiSectionLabel>

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
      <UiSectionLabel as="h2" class="analytics__section-label">{{ i18n.t('analytics.goalsTitle') }}</UiSectionLabel>

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
          <UiProgressBar :value="g.progress" />
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
  font-size: 27px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

/* ────────────────────────────────────────────────────────────
   AI monthly report
──────────────────────────────────────────────────────────── */
.report {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: var(--shadow-1);
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
}

.report--open {
  border-color: color-mix(in srgb, var(--color-accent) 30%, var(--color-border));
  box-shadow: var(--shadow-2);
}

.report__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.report__title-row { display: flex; align-items: center; gap: 7px; }
.report__icon { color: var(--color-accent); }

.report__title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.report__actions { display: flex; align-items: center; gap: 4px; }

.report__generate-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-accent);
  background: transparent;
  color: var(--color-accent);
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast);
}

.report__generate-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
}

.report__generate-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.report__icon-btn {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  border-radius: var(--radius-xs);
  background: none;
  border: none;
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast);
}
.report__icon-btn:hover:not(:disabled) {
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-text);
}
.report__icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.report__spinner { animation: report-spin 0.8s linear infinite; }
@keyframes report-spin { to { transform: rotate(360deg); } }

.report__body { display: flex; flex-direction: column; gap: 8px; }
.report__skeleton { display: flex; flex-direction: column; gap: 8px; padding: 2px 0; }

.report__error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-danger);
}

.report__retry {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-accent);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.report__text {
  font-size: 14px;
  line-height: var(--leading-lg, 1.65);
  color: var(--color-text-secondary);
  margin: 0;
  white-space: pre-wrap;
}

.report-body-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.report-body-leave-active { transition: opacity 0.15s ease; }
.report-body-enter-from   { opacity: 0; transform: translateY(-6px); }
.report-body-leave-to     { opacity: 0; }

/* ────────────────────────────────────────────────────────────
   Overview stat cards
──────────────────────────────────────────────────────────── */
.analytics__overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
}

.stat-card:hover {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-muted);
}

.stat-card__icon {
  width: 38px;
  height: 38px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.stat-card__icon--tasks    { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
.stat-card__icon--habits   { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.stat-card__icon--learning { background: rgba(245,158,  11, 0.15); color: #fbbf24; }
.stat-card__icon--training { background: rgba(239, 68,  68, 0.15); color: #f87171; }

.stat-card__body { min-width: 0; }

.stat-card__value {
  font-size: var(--text-2xl, 26px);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.stat-card__label {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 3px;
  font-weight: 500;
}

.stat-card__sub {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

/* ────────────────────────────────────────────────────────────
   Section
──────────────────────────────────────────────────────────── */
.analytics__section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 22px 24px;
}

.analytics__section--last {
  margin-bottom: 0;
}

.analytics__section-label { margin-bottom: 18px; }

.empty-state {
  color: var(--color-text-muted);
  font-size: 14px;
  padding: 16px 0;
  text-align: center;
}

/* ────────────────────────────────────────────────────────────
   Habit grid
──────────────────────────────────────────────────────────── */
.habit-grid-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.habit-row {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-elevated);
  border: 1px solid transparent;
  transition: border-color var(--t-fast);
}

.habit-row:hover {
  border-color: var(--color-border);
}

.habit-row__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 170px;
  flex-shrink: 0;
}

.habit-row__emoji {
  font-size: 16px;
  line-height: 1;
  flex-shrink: 0;
}

.habit-row__name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.habit-row__rate {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-accent);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.habit-row__cells {
  display: flex;
  gap: 3px;
  flex: 1;
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
}

.habit-row__cells::-webkit-scrollbar { display: none; }

.habit-cell {
  width: 13px;
  height: 13px;
  border-radius: 3px;
  background: var(--color-border);
  flex-shrink: 0;
  transition: transform var(--t-fast);
  cursor: default;
}

.habit-cell:hover {
  transform: scale(1.4);
}

.habit-cell--done {
  background: var(--color-accent);
  opacity: 0.85;
}

.habit-cell--today {
  outline: 2px solid var(--color-accent);
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
  gap: 12px;
}

.bar-chart__bars {
  display: flex;
  align-items: flex-end;
  gap: 5px;
  height: 130px;
  background: repeating-linear-gradient(
    to top,
    var(--color-border) 0px,
    var(--color-border) 1px,
    transparent 1px,
    transparent 25%
  );
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 4px;
}

.bar-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
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
  border-radius: 4px 4px 0 0;
  min-height: 0;
  transition: height 0.4s var(--ease);
}

.bar-col__fill--primary   { background: var(--color-accent); opacity: 0.35; }
.bar-col__fill--secondary { background: var(--color-accent); opacity: 1; border-radius: 4px; }
.bar-col__fill--learning  { background: #fbbf24; opacity: 0.9; }
.bar-col__fill--training  { background: #f87171; opacity: 0.9; }

.bar-col__label {
  font-size: 9px;
  color: var(--color-text-muted);
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
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-dot--primary   { background: var(--color-accent); opacity: 0.35; }
.legend-dot--secondary { background: var(--color-accent); }
.legend-dot--learning  { background: #fbbf24; }
.legend-dot--training  { background: #f87171; }

/* ────────────────────────────────────────────────────────────
   Goals
──────────────────────────────────────────────────────────── */
.goals-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.goal-item {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 12px 14px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  transition: border-color var(--t-fast);
}

.goal-item:hover {
  border-color: var(--color-accent);
}

.goal-item__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}

.goal-item__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goal-item__pct {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-accent);
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.goal-item__date {
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.goals-completed-badge {
  font-size: 13px;
  color: var(--color-success);
  padding: 10px 14px;
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-success) 20%, transparent);
  border-radius: var(--radius);
  text-align: center;
  font-weight: 500;
}

/* ────────────────────────────────────────────────────────────
   Responsive — tablet
──────────────────────────────────────────────────────────── */
@media (max-width: 1023px) {
  .analytics__overview { grid-template-columns: repeat(2, 1fr); }
  .habit-row__meta { width: 130px; }
}

/* ────────────────────────────────────────────────────────────
   Responsive — mobile (iPhone)
──────────────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .analytics { gap: 16px; }
  .analytics__header { gap: 10px; }
  .analytics__title { font-size: 22px; }
  .analytics__section { padding: 14px 16px; }

  .analytics__overview {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .stat-card { padding: 14px; gap: 10px; }
  .stat-card__icon { width: 32px; height: 32px; font-size: 16px; }
  .stat-card__value { font-size: 22px; }

  .habit-row { padding: 6px 8px; gap: 8px; }
  .habit-row__meta { width: 90px; }
  .habit-row__name { font-size: 12px; }
  .habit-cell { width: 10px; height: 10px; border-radius: 2px; }
  .habit-row__cells { gap: 2px; }

  .bar-chart__bars { height: 90px; }
  .bar-col__label { font-size: 8px; }
}
</style>
