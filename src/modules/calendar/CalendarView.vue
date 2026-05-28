<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTasksStore } from '@/modules/task-manager/stores/tasks.store'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { useLearningStore } from '@/modules/learning/stores/learning.store'
import { useTrainingStore } from '@/modules/training/stores/training.store'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { useLocale } from '@/core/i18n'

const i18n         = useLocale()
const tasksStore   = useTasksStore()
const habitsStore  = useHabitsStore()
const learningStore = useLearningStore()
const trainingStore = useTrainingStore()
const goalsStore   = useGoalsStore()

// ─────────────────────────────────────────────────────────────
// Current month state
// ─────────────────────────────────────────────────────────────
const today         = new Date()
const currentYear   = ref(today.getFullYear())
const currentMonth  = ref(today.getMonth()) // 0-indexed
const selectedDate  = ref<string | null>(null)  // YYYY-MM-DD

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
  selectedDate.value = null
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
  selectedDate.value = null
}

function goToToday() {
  currentYear.value  = today.getFullYear()
  currentMonth.value = today.getMonth()
  selectedDate.value = toDateStr(today)
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

const todayStr = toDateStr(today)

const monthLabel = computed(() =>
  new Date(currentYear.value, currentMonth.value, 1)
    .toLocaleDateString(i18n.localeCode, { month: 'long', year: 'numeric' })
)

// ─────────────────────────────────────────────────────────────
// Event maps (precomputed for perf)
// ─────────────────────────────────────────────────────────────
interface DayDot {
  type: 'task' | 'habit' | 'learning' | 'training' | 'goal'
}

interface DayData {
  tasks:    { id: string; text: string; done: boolean; priority: string }[]
  habits:   { id: string; name: string; emoji: string; done: boolean }[]
  learning: { id: string; title: string; logged: boolean }[]
  training: { id: string; title: string; logged: boolean; mins: number }[]
  goals:    { id: string; title: string; emoji: string }[]
}

// Pre-index all data by date
const tasksByDate = computed(() => {
  const map = new Map<string, DayData['tasks']>()
  for (const t of tasksStore.tasks) {
    if (!t.dueDate) continue
    if (!map.has(t.dueDate)) map.set(t.dueDate, [])
    map.get(t.dueDate)!.push({ id: t.id, text: t.text, done: t.done, priority: t.priority })
  }
  return map
})

const habitsByDate = computed(() => {
  const map = new Map<string, DayData['habits']>()
  for (const h of habitsStore.habits) {
    for (const d of h.completedDates) {
      if (!map.has(d)) map.set(d, [])
      map.get(d)!.push({ id: h.id, name: h.name, emoji: h.emoji, done: true })
    }
  }
  return map
})

const learningByDate = computed(() => {
  const map = new Map<string, DayData['learning']>()
  for (const s of learningStore.sessions) {
    if (!map.has(s.date)) map.set(s.date, [])
    const plan = learningStore.getPlanById(s.planId)
    map.get(s.date)!.push({
      id: s.id,
      title: plan?.title ?? s.planId,
      logged: s.status === 'completed',
    })
  }
  return map
})

const trainingByDate = computed(() => {
  const map = new Map<string, DayData['training']>()
  for (const l of trainingStore.logs) {
    if (!map.has(l.date)) map.set(l.date, [])
    const plan = trainingStore.getPlanById(l.planId ?? '')
    map.get(l.date)!.push({
      id: l.id,
      title: plan?.title ?? l.title,
      logged: true,
      mins: l.actualDuration ?? 0,
    })
  }
  return map
})

const goalsByDate = computed(() => {
  const map = new Map<string, DayData['goals']>()
  for (const g of goalsStore.goals) {
    if (!g.targetDate) continue
    if (!map.has(g.targetDate)) map.set(g.targetDate, [])
    map.get(g.targetDate)!.push({ id: g.id, title: g.title, emoji: g.coverEmoji })
  }
  return map
})

function getDayData(dateStr: string): DayData {
  return {
    tasks:    tasksByDate.value.get(dateStr)    ?? [],
    habits:   habitsByDate.value.get(dateStr)   ?? [],
    learning: learningByDate.value.get(dateStr) ?? [],
    training: trainingByDate.value.get(dateStr) ?? [],
    goals:    goalsByDate.value.get(dateStr)    ?? [],
  }
}

function getDots(dateStr: string): DayDot[] {
  const dots: DayDot[] = []
  if ((tasksByDate.value.get(dateStr)?.length ?? 0) > 0)    dots.push({ type: 'task' })
  if ((habitsByDate.value.get(dateStr)?.length ?? 0) > 0)   dots.push({ type: 'habit' })
  if ((learningByDate.value.get(dateStr)?.length ?? 0) > 0) dots.push({ type: 'learning' })
  if ((trainingByDate.value.get(dateStr)?.length ?? 0) > 0) dots.push({ type: 'training' })
  if ((goalsByDate.value.get(dateStr)?.length ?? 0) > 0)    dots.push({ type: 'goal' })
  return dots
}

// ─────────────────────────────────────────────────────────────
// Calendar grid computation
// ─────────────────────────────────────────────────────────────
interface CalCell {
  date: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  dots: DayDot[]
}

const DAY_LABELS_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const DAY_LABELS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const dayLabels = computed(() =>
  i18n.localeCode === 'ru' ? DAY_LABELS_RU : DAY_LABELS_EN
)

const calGrid = computed((): CalCell[] => {
  const year  = currentYear.value
  const month = currentMonth.value

  const firstDay  = new Date(year, month, 1)
  const lastDay   = new Date(year, month + 1, 0)

  // Monday-start: 0=Mon…6=Sun
  const startDow = (firstDay.getDay() + 6) % 7  // convert Sun=0 to Mon=0
  const endDow   = (lastDay.getDay() + 6) % 7

  const cells: CalCell[] = []

  // Leading days from prev month
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    const ds = toDateStr(d)
    cells.push({
      date: ds, day: d.getDate(),
      isCurrentMonth: false,
      isToday: ds === todayStr,
      isSelected: ds === selectedDate.value,
      dots: getDots(ds),
    })
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d)
    const ds   = toDateStr(date)
    cells.push({
      date: ds, day: d,
      isCurrentMonth: true,
      isToday: ds === todayStr,
      isSelected: ds === selectedDate.value,
      dots: getDots(ds),
    })
  }

  // Trailing days to complete last row
  const remaining = (7 - ((endDow + 1) % 7)) % 7
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    const ds = toDateStr(d)
    cells.push({
      date: ds, day: d.getDate(),
      isCurrentMonth: false,
      isToday: ds === todayStr,
      isSelected: ds === selectedDate.value,
      dots: getDots(ds),
    })
  }

  return cells
})

// ─────────────────────────────────────────────────────────────
// Selected day detail
// ─────────────────────────────────────────────────────────────
const selectedDayData = computed((): DayData | null => {
  if (!selectedDate.value) return null
  return getDayData(selectedDate.value)
})

const selectedDayLabel = computed((): string => {
  if (!selectedDate.value) return ''
  return new Date(selectedDate.value + 'T12:00:00')
    .toLocaleDateString(i18n.localeCode, { weekday: 'long', day: 'numeric', month: 'long' })
})

const selectedHasEvents = computed(() => {
  if (!selectedDayData.value) return false
  const d = selectedDayData.value
  return d.tasks.length + d.habits.length + d.learning.length + d.training.length + d.goals.length > 0
})

function selectDate(ds: string) {
  selectedDate.value = selectedDate.value === ds ? null : ds
}

const PRIORITY_COLOR: Record<string, string> = {
  urgent: '#ef4444',
  high:   '#f97316',
  medium: '#f59e0b',
  low:    '#6b7280',
  none:   'var(--color-text-muted)',
}
</script>

<template>
  <div class="calendar">

    <!-- ── Top bar ──────────────────────────────────────────────── -->
    <div class="calendar__topbar">
      <div class="calendar__nav">
        <button class="cal-btn cal-btn--icon" @click="prevMonth" title="Previous month">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7l4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <h2 class="calendar__month">{{ monthLabel }}</h2>
        <button class="cal-btn cal-btn--icon" @click="nextMonth" title="Next month">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <button class="cal-btn" @click="goToToday">{{ i18n.t('calendar.today') }}</button>
    </div>

    <!-- ── Main: grid + detail ─────────────────────────────────── -->
    <div class="calendar__body">

      <!-- Grid -->
      <div class="calendar__grid-wrap">
        <!-- Day-of-week headers -->
        <div class="cal-header-row">
          <div v-for="label in dayLabels" :key="label" class="cal-header-cell">
            {{ label }}
          </div>
        </div>

        <!-- Day cells -->
        <div class="cal-grid">
          <button
            v-for="cell in calGrid"
            :key="cell.date"
            class="cal-cell"
            :class="{
              'cal-cell--other':    !cell.isCurrentMonth,
              'cal-cell--today':     cell.isToday,
              'cal-cell--selected':  cell.isSelected,
              'cal-cell--has-events': cell.dots.length > 0,
            }"
            @click="selectDate(cell.date)"
          >
            <span class="cal-cell__day">{{ cell.day }}</span>
            <div v-if="cell.dots.length > 0" class="cal-cell__dots">
              <span
                v-for="dot in cell.dots.slice(0, 4)"
                :key="dot.type"
                class="cal-dot"
                :class="`cal-dot--${dot.type}`"
              />
            </div>
          </button>
        </div>

        <!-- Dot legend -->
        <div class="cal-legend">
          <span class="legend-item">
            <span class="cal-dot cal-dot--task" />
            {{ i18n.t('calendar.tasks') }}
          </span>
          <span class="legend-item">
            <span class="cal-dot cal-dot--habit" />
            {{ i18n.t('calendar.habits') }}
          </span>
          <span class="legend-item">
            <span class="cal-dot cal-dot--learning" />
            {{ i18n.t('calendar.learning') }}
          </span>
          <span class="legend-item">
            <span class="cal-dot cal-dot--training" />
            {{ i18n.t('calendar.training') }}
          </span>
          <span class="legend-item">
            <span class="cal-dot cal-dot--goal" />
            {{ i18n.t('calendar.goals') }}
          </span>
        </div>
      </div>

      <!-- Detail panel -->
      <Transition name="detail">
        <div v-if="selectedDate" class="calendar__detail">
          <div class="detail__header">
            <h3 class="detail__title">{{ selectedDayLabel }}</h3>
            <button class="cal-btn cal-btn--icon detail__close" @click="selectedDate = null">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div v-if="!selectedHasEvents" class="detail__empty">
            {{ i18n.t('calendar.noEvents') }}
          </div>

          <div v-else class="detail__sections">

            <!-- Tasks -->
            <div v-if="selectedDayData!.tasks.length" class="detail__section">
              <div class="detail__section-title">
                <span class="cal-dot cal-dot--task" />
                {{ i18n.t('calendar.tasks') }}
              </div>
              <div class="detail__list">
                <div
                  v-for="t in selectedDayData!.tasks"
                  :key="t.id"
                  class="detail__row"
                  :class="{ 'detail__row--done': t.done }"
                >
                  <span
                    class="detail__priority-dot"
                    :style="{ background: PRIORITY_COLOR[t.priority] ?? PRIORITY_COLOR.none }"
                  />
                  <span class="detail__row-text">{{ t.text }}</span>
                  <span v-if="t.done" class="detail__row-badge detail__row-badge--done">
                    {{ i18n.t('calendar.completed') }}
                  </span>
                  <span v-else class="detail__row-badge">{{ i18n.t('calendar.due') }}</span>
                </div>
              </div>
            </div>

            <!-- Habits -->
            <div v-if="selectedDayData!.habits.length" class="detail__section">
              <div class="detail__section-title">
                <span class="cal-dot cal-dot--habit" />
                {{ i18n.t('calendar.habits') }}
              </div>
              <div class="detail__list">
                <div
                  v-for="h in selectedDayData!.habits"
                  :key="h.id"
                  class="detail__row"
                >
                  <span class="detail__emoji">{{ h.emoji }}</span>
                  <span class="detail__row-text">{{ h.name }}</span>
                  <span class="detail__row-badge detail__row-badge--done">✓</span>
                </div>
              </div>
            </div>

            <!-- Learning -->
            <div v-if="selectedDayData!.learning.length" class="detail__section">
              <div class="detail__section-title">
                <span class="cal-dot cal-dot--learning" />
                {{ i18n.t('calendar.learning') }}
              </div>
              <div class="detail__list">
                <div
                  v-for="l in selectedDayData!.learning"
                  :key="l.id"
                  class="detail__row"
                >
                  <span class="detail__row-text">{{ l.title }}</span>
                  <span class="detail__row-badge detail__row-badge--done">
                    {{ i18n.t('calendar.scheduled') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Training -->
            <div v-if="selectedDayData!.training.length" class="detail__section">
              <div class="detail__section-title">
                <span class="cal-dot cal-dot--training" />
                {{ i18n.t('calendar.training') }}
              </div>
              <div class="detail__list">
                <div
                  v-for="t in selectedDayData!.training"
                  :key="t.id"
                  class="detail__row"
                >
                  <span class="detail__row-text">{{ t.title }}</span>
                  <span v-if="t.mins > 0" class="detail__row-badge">{{ t.mins }}min</span>
                </div>
              </div>
            </div>

            <!-- Goals -->
            <div v-if="selectedDayData!.goals.length" class="detail__section">
              <div class="detail__section-title">
                <span class="cal-dot cal-dot--goal" />
                {{ i18n.t('calendar.goals') }}
              </div>
              <div class="detail__list">
                <div
                  v-for="g in selectedDayData!.goals"
                  :key="g.id"
                  class="detail__row"
                >
                  <span class="detail__emoji">{{ g.emoji }}</span>
                  <span class="detail__row-text">{{ g.title }}</span>
                  <span class="detail__row-badge">{{ i18n.t('calendar.due') }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Transition>

    </div>
  </div>
</template>

<style scoped>
/* ─────────────────────────────────────────────────────────────
   Layout
───────────────────────────────────────────────────────────── */
.calendar {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--content-padding);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ─────────────────────────────────────────────────────────────
   Top bar
───────────────────────────────────────────────────────────── */
.calendar__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.calendar__nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.calendar__month {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  min-width: 200px;
  text-align: center;
  text-transform: capitalize;
}

.cal-btn {
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.8125rem;
  font-weight: 500;
  background: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.15s;
}

.cal-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.cal-btn--icon {
  padding: 6px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

/* ─────────────────────────────────────────────────────────────
   Body: grid + detail side-by-side
───────────────────────────────────────────────────────────── */
.calendar__body {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  align-items: start;
}

/* When detail is visible, show 2 columns */
.calendar__body:has(.calendar__detail) {
  grid-template-columns: 1fr 280px;
}

/* ─────────────────────────────────────────────────────────────
   Grid
───────────────────────────────────────────────────────────── */
.calendar__grid-wrap {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.cal-header-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid var(--border);
}

.cal-header-cell {
  padding: 10px 0;
  text-align: center;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.cal-cell {
  aspect-ratio: 1 / 1;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 8px 4px 4px;
  gap: 4px;
  border-right: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  background: transparent;
  cursor: pointer;
  transition: background 0.12s;
  position: relative;
}

.cal-cell:nth-child(7n) {
  border-right: none;
}

/* Remove bottom border from last row */
.cal-cell:nth-last-child(-n+7) {
  border-bottom: none;
}

.cal-cell:hover {
  background: var(--bg-secondary);
}

.cal-cell--other {
  opacity: 0.35;
}

.cal-cell--today .cal-cell__day {
  background: var(--accent);
  color: #fff;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cal-cell--selected {
  background: var(--bg-secondary);
  outline: 2px solid var(--accent);
  outline-offset: -2px;
}

.cal-cell--selected:hover {
  background: var(--bg-secondary);
}

.cal-cell__day {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cal-cell--other .cal-cell__day {
  color: var(--text-secondary);
}

.cal-cell__dots {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: center;
}

/* ─────────────────────────────────────────────────────────────
   Dots
───────────────────────────────────────────────────────────── */
.cal-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}

.cal-dot--task     { background: #818cf8; }
.cal-dot--habit    { background: #34d399; }
.cal-dot--learning { background: #fbbf24; }
.cal-dot--training { background: #f87171; }
.cal-dot--goal     { background: #a78bfa; }

/* ─────────────────────────────────────────────────────────────
   Legend
───────────────────────────────────────────────────────────── */
.cal-legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding: 10px 16px;
  border-top: 1px solid var(--border);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.6875rem;
  color: var(--text-secondary);
}

/* ─────────────────────────────────────────────────────────────
   Detail panel
───────────────────────────────────────────────────────────── */
.calendar__detail {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--border);
  gap: 8px;
}

.detail__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  text-transform: capitalize;
}

.detail__close {
  color: var(--text-secondary);
}

.detail__empty {
  padding: 24px 16px;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.detail__sections {
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  max-height: 520px;
}

.detail__section {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}

.detail__section:last-child {
  border-bottom: none;
}

.detail__section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.detail__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail__row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: var(--text-primary);
  padding: 3px 0;
}

.detail__row--done {
  opacity: 0.6;
  text-decoration: line-through;
}

.detail__priority-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.detail__emoji {
  font-size: 0.875rem;
  flex-shrink: 0;
}

.detail__row-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail__row-badge {
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-radius: 99px;
  padding: 1px 6px;
  flex-shrink: 0;
  white-space: nowrap;
}

.detail__row-badge--done {
  color: #34d399;
  background: rgba(52, 211, 153, 0.12);
}

/* ─────────────────────────────────────────────────────────────
   Detail slide-in transition
───────────────────────────────────────────────────────────── */
.detail-enter-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.detail-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.detail-enter-from   { opacity: 0; transform: translateX(12px); }
.detail-leave-to     { opacity: 0; transform: translateX(8px); }

/* ─────────────────────────────────────────────────────────────
   Responsive — tablet
───────────────────────────────────────────────────────────── */
@media (max-width: 1023px) {
  .cal-cell {
    min-height: 52px;
  }

  .calendar__month {
    font-size: 1.125rem;
    min-width: 160px;
  }
}

/* ─────────────────────────────────────────────────────────────
   Responsive — mobile
───────────────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .calendar {
    gap: 14px;
  }

  /* On mobile: stack grid above detail */
  .calendar__body,
  .calendar__body:has(.calendar__detail) {
    grid-template-columns: 1fr;
  }

  .calendar__month {
    font-size: 1rem;
    min-width: 130px;
  }

  .cal-cell {
    min-height: 44px;
    padding: 5px 2px 3px;
    aspect-ratio: auto;
  }

  .cal-cell__day {
    font-size: 0.75rem;
    width: 22px;
    height: 22px;
  }

  .cal-cell--today .cal-cell__day {
    width: 22px;
    height: 22px;
  }

  .cal-dot {
    width: 4px;
    height: 4px;
  }

  .cal-legend {
    gap: 10px;
    padding: 8px 12px;
  }

  .detail__sections {
    max-height: 360px;
  }
}
</style>
