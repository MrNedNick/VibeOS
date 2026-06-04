<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTasksStore } from '@/modules/task-manager/stores/tasks.store'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { useLearningStore } from '@/modules/learning/stores/learning.store'
import { useTrainingStore } from '@/modules/training/stores/training.store'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { calcProgress, daysUntil } from '@/modules/goals/types'
import { useLocale } from '@/core/i18n'
import { useNotesStore } from '@/modules/notes/stores/notes.store'
import { UiSectionLabel } from '@/ui'
import { deriveTitle } from '@/modules/notes/types'

const router       = useRouter()
const tasksStore   = useTasksStore()
const habitsStore  = useHabitsStore()
const learnStore   = useLearningStore()
const trainStore   = useTrainingStore()
const goalsStore   = useGoalsStore()
const notesStore   = useNotesStore()
const i18n         = useLocale()

const todayStr = computed(() => new Date().toISOString().split('T')[0])

// ── Tasks due today ────────────────────────────────────────────────
const todayTasks = computed(() =>
  tasksStore.tasks
    .filter(t => t.dueDate === todayStr.value)
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1
      const ord = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 } as const
      return (ord[a.priority] ?? 4) - (ord[b.priority] ?? 4)
    })
)
const tasksDone  = computed(() => todayTasks.value.filter(t => t.done).length)

// ── Quick-add task ─────────────────────────────────────────────────
const newTaskText  = ref('')
const taskInputRef = ref<HTMLInputElement>()

function submitNewTask() {
  const text = newTaskText.value.trim()
  if (!text) return
  tasksStore.addTask(text, 'none', todayStr.value)
  newTaskText.value = ''
}

function onTaskKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); submitNewTask() }
  if (e.key === 'Escape') { newTaskText.value = '';(e.target as HTMLInputElement).blur() }
}

// ── Habits ────────────────────────────────────────────────────────
const habits = computed(() =>
  habitsStore.habits
    .map(h => ({ ...h, doneToday: h.completedDates.includes(todayStr.value) }))
    .sort((a, b) => Number(a.doneToday) - Number(b.doneToday))
)
const habitsDone = computed(() => habits.value.filter(h => h.doneToday).length)

// ── Learning scheduled today ──────────────────────────────────────
const learningItems = computed(() => learnStore.todayItems)
const learningDone  = computed(() => learningItems.value.filter(i => i.logged).length)

// ── Training scheduled today ──────────────────────────────────────
const trainingItems = computed(() => trainStore.todayItems)
const trainingDone  = computed(() => trainingItems.value.filter(i => i.logged).length)

// ── Active goals ──────────────────────────────────────────────────
const activeGoals = computed(() =>
  goalsStore.activeGoals.map(g => ({ ...g, progress: calcProgress(g) })).slice(0, 5)
)

// ── Pinned notes ──────────────────────────────────────────────────
const pinnedNotes = computed(() =>
  notesStore.sortedNotes.filter(n => n.pinned).slice(0, 3)
)

const isEmpty = computed(() =>
  !todayTasks.value.length &&
  !habits.value.length &&
  !learningItems.value.length &&
  !trainingItems.value.length &&
  !activeGoals.value.length &&
  !pinnedNotes.value.length
)

// ── Helpers ───────────────────────────────────────────────────────
function daysLeftLabel(targetDate: string | undefined): string {
  if (!targetDate) return ''
  const d = daysUntil(targetDate)
  if (d < 0) return i18n.t('dashboardToday.overdue')
  if (d === 0) return i18n.t('dashboardToday.dueToday')
  return i18n.t('dashboardToday.daysLeft', { n: d })
}

const PRIORITY_CLASS: Record<string, string> = {
  urgent:  'badge--urgent',
  high:    'badge--high',
  medium:  'badge--medium',
  low:     'badge--low',
}

function priorityLabel(p: string): string {
  const map: Record<string, string> = {
    urgent: i18n.t('dashboardDetail.priorityUrgent'),
    high:   i18n.t('dashboardDetail.priorityHigh'),
    medium: i18n.t('dashboardDetail.priorityMedium'),
    low:    i18n.t('dashboardDetail.priorityLow'),
  }
  return map[p] ?? ''
}
</script>

<template>
  <div class="today">

    <!-- Empty state ──────────────────────────────────────────────── -->
    <div v-if="isEmpty" class="today__empty">
      <span class="today__empty-icon">☀️</span>
      <p class="today__empty-title">{{ i18n.t('dashboardToday.emptyTitle') }}</p>
      <p class="today__empty-desc">{{ i18n.t('dashboardToday.emptyDesc') }}</p>
    </div>

    <!-- ── Tasks (always visible) ─────────────────────────────── -->
    <section class="today__section">
      <div class="today__section-header">
        <UiSectionLabel as="span">{{ i18n.t('dashboardToday.sectionTasks') }}</UiSectionLabel>
        <span v-if="todayTasks.length" class="today__section-count">{{ tasksDone }}/{{ todayTasks.length }}</span>
        <button class="today__open-btn" @click="router.push('/tasks')">
          {{ i18n.t('dashboardToday.openBtn') }} →
        </button>
      </div>
      <div v-if="todayTasks.length" class="today__list">
        <div
          v-for="task in todayTasks"
          :key="task.id"
          class="today__task"
          :class="{ 'today__task--done': task.done }"
        >
          <button
            class="today__check"
            :class="{ 'today__check--done': task.done }"
            @click="tasksStore.toggleTask(task.id)"
          >
            <svg v-if="task.done" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7.5l2.5 2.5 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span v-if="task.priority !== 'none'" class="today__badge" :class="PRIORITY_CLASS[task.priority]">
            {{ priorityLabel(task.priority) }}
          </span>
          <span class="today__task-text">{{ task.text }}</span>
        </div>
      </div>
      <!-- Quick-add input -->
      <div class="today__add-task">
        <input
          ref="taskInputRef"
          v-model="newTaskText"
          class="today__add-input"
          :placeholder="i18n.t('dashboardToday.addTaskPlaceholder')"
          @keydown="onTaskKeydown"
        />
      </div>
    </section>

    <!-- ── Habits ─────────────────────────────────────────────── -->
    <section v-if="habits.length" class="today__section">
      <div class="today__section-header">
        <UiSectionLabel as="span">{{ i18n.t('dashboardToday.sectionHabits') }}</UiSectionLabel>
        <span class="today__section-count" :class="{ 'today__section-count--done': habitsDone === habits.length }">
          {{ habitsDone }}/{{ habits.length }}
        </span>
        <div class="today__habit-progress">
          <div
            class="today__habit-fill"
            :style="{ width: habits.length ? `${Math.round(habitsDone / habits.length * 100)}%` : '0%' }"
          />
        </div>
        <button class="today__open-btn" @click="router.push('/habits')">
          {{ i18n.t('dashboardToday.openBtn') }} →
        </button>
      </div>
      <div class="today__list">
        <div
          v-for="habit in habits"
          :key="habit.id"
          class="today__habit"
          :class="{ 'today__habit--done': habit.doneToday }"
          @click="router.push('/habits')"
        >
          <button
            class="today__check"
            :class="{ 'today__check--done': habit.doneToday }"
            @click.stop="habitsStore.toggleToday(habit.id)"
          >
            <svg v-if="habit.doneToday" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2.5 7.5l2.5 2.5 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="today__habit-emoji">{{ habit.emoji }}</span>
          <span class="today__habit-name">{{ habit.name }}</span>
        </div>
      </div>
    </section>

    <!-- ── Learning ───────────────────────────────────────────── -->
    <section v-if="learningItems.length" class="today__section">
      <div class="today__section-header">
        <UiSectionLabel as="span">{{ i18n.t('dashboardToday.sectionLearning') }}</UiSectionLabel>
        <span class="today__section-count" :class="{ 'today__section-count--done': learningDone === learningItems.length }">
          {{ learningDone }}/{{ learningItems.length }}
        </span>
        <button class="today__open-btn" @click="router.push('/learning')">
          {{ i18n.t('dashboardToday.openBtn') }} →
        </button>
      </div>
      <div class="today__list">
        <div
          v-for="item in learningItems"
          :key="item.plan.id"
          class="today__plan-row"
          :class="{ 'today__plan-row--done': item.logged }"
          @click="router.push('/learning')"
        >
          <span class="today__plan-emoji">{{ item.plan.coverEmoji }}</span>
          <span class="today__plan-title">{{ item.plan.title }}</span>
          <span class="today__plan-status" :class="item.logged ? 'today__plan-status--done' : 'today__plan-status--pending'">
            {{ item.logged ? i18n.t('dashboardToday.logged') : i18n.t('dashboardToday.pending') }}
          </span>
        </div>
      </div>
    </section>

    <!-- ── Training ───────────────────────────────────────────── -->
    <section v-if="trainingItems.length" class="today__section">
      <div class="today__section-header">
        <UiSectionLabel as="span">{{ i18n.t('dashboardToday.sectionTraining') }}</UiSectionLabel>
        <span class="today__section-count" :class="{ 'today__section-count--done': trainingDone === trainingItems.length }">
          {{ trainingDone }}/{{ trainingItems.length }}
        </span>
        <button class="today__open-btn" @click="router.push('/training')">
          {{ i18n.t('dashboardToday.openBtn') }} →
        </button>
      </div>
      <div class="today__list">
        <div
          v-for="item in trainingItems"
          :key="item.plan.id"
          class="today__plan-row"
          :class="{ 'today__plan-row--done': item.logged }"
          @click="router.push('/training')"
        >
          <span class="today__plan-emoji">{{ item.plan.coverEmoji }}</span>
          <span class="today__plan-title">{{ item.plan.title }}</span>
          <span class="today__plan-status" :class="item.logged ? 'today__plan-status--done' : 'today__plan-status--pending'">
            {{ item.logged ? i18n.t('dashboardToday.logged') : i18n.t('dashboardToday.pending') }}
          </span>
        </div>
      </div>
    </section>

    <!-- ── Goals ─────────────────────────────────────────────── -->
    <section v-if="activeGoals.length" class="today__section">
      <div class="today__section-header">
        <UiSectionLabel as="span">{{ i18n.t('dashboardToday.sectionGoals') }}</UiSectionLabel>
        <span class="today__section-count">{{ activeGoals.length }}</span>
        <button class="today__open-btn" @click="router.push('/goals')">
          {{ i18n.t('dashboardToday.openBtn') }} →
        </button>
      </div>
      <div class="today__list">
        <div
          v-for="goal in activeGoals"
          :key="goal.id"
          class="today__goal"
          @click="router.push('/goals')"
        >
          <span class="today__goal-emoji">{{ goal.coverEmoji }}</span>
          <div class="today__goal-body">
            <div class="today__goal-top">
              <span class="today__goal-title">{{ goal.title }}</span>
              <span class="today__goal-pct">{{ goal.progress }}%</span>
            </div>
            <div class="today__goal-bar">
              <div class="today__goal-fill" :style="{ width: `${goal.progress}%` }" />
            </div>
          </div>
          <span v-if="goal.targetDate" class="today__goal-days" :class="{ 'today__goal-days--overdue': daysUntil(goal.targetDate) < 0 }">
            {{ daysLeftLabel(goal.targetDate) }}
          </span>
        </div>
      </div>
    </section>

    <!-- ── Pinned notes ────────────────────────────────────────── -->
    <section v-if="pinnedNotes.length" class="today__section">
      <div class="today__section-header">
        <UiSectionLabel as="span">{{ i18n.t('dashboardToday.sectionPinnedNotes') }}</UiSectionLabel>
        <span class="today__section-count">{{ pinnedNotes.length }}</span>
        <button class="today__open-btn" @click="router.push('/notes')">
          {{ i18n.t('dashboardToday.openBtn') }} →
        </button>
      </div>
      <div class="today__list">
        <div
          v-for="note in pinnedNotes"
          :key="note.id"
          class="today__note"
          @click="router.push('/notes')"
        >
          <span class="today__note-pin">📌</span>
          <span class="today__note-title">{{ deriveTitle(note.content) }}</span>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.today {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Empty state */
.today__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 32px 24px 16px;
  text-align: center;
}

.today__empty-icon { font-size: 40px; }

.today__empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.today__empty-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0;
  max-width: 320px;
  line-height: 1.5;
}

/* Section */
.today__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.today__section-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.today__section-count {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  padding: 1px 6px;
  border-radius: 99px;
  flex-shrink: 0;
}
.today__section-count--done {
  color: var(--color-success);
  border-color: color-mix(in srgb, var(--color-success) 30%, transparent);
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
}

.today__habit-progress {
  flex: 1;
  height: 3px;
  background: var(--color-surface-elevated);
  border-radius: 99px;
  overflow: hidden;
  max-width: 80px;
}
.today__habit-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: 99px;
  transition: width 0.4s ease;
}

.today__open-btn {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-accent);
  margin-left: auto;
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  transition: background var(--t-fast);
}
.today__open-btn:hover { background: var(--color-accent-muted); }

/* List */
.today__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Task row */
.today__task {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  transition: opacity var(--t-fast);
}
.today__task--done { opacity: 0.45; }

.today__check {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color var(--t-fast), background var(--t-fast), color var(--t-fast);
  color: var(--color-text-muted);
}
.today__check:hover:not(.today__check--done) {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-muted);
}
.today__check--done {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.today__badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 5px;
  border-radius: var(--radius-xs);
  flex-shrink: 0;
}
.badge--urgent { background: rgba(240, 60, 60, 0.14);  color: var(--color-danger); }
.badge--high   { background: rgba(240, 160, 48, 0.14); color: var(--color-warning); }
.badge--medium { background: rgba(80, 140, 240, 0.12); color: var(--color-accent); }
.badge--low    { background: var(--color-surface-elevated); color: var(--color-text-muted); border: 1px solid var(--color-border); }

.today__task-text {
  flex: 1;
  color: var(--color-text-secondary);
  line-height: 1.4;
}
.today__task--done .today__task-text {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

/* Quick-add task input */
.today__add-task { margin-top: 2px; }

.today__add-input {
  width: 100%;
  padding: 8px 12px;
  background: transparent;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--color-text-secondary);
  transition: border-color var(--t-fast), background var(--t-fast);
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
}
.today__add-input:focus {
  border-color: var(--color-accent);
  border-style: solid;
  background: var(--color-surface-elevated);
}
.today__add-input::placeholder { color: var(--color-text-muted); }

/* Habit row */
.today__habit {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color var(--t-fast), opacity var(--t-fast);
}
.today__habit:hover { border-color: var(--color-accent); }
.today__habit--done { opacity: 0.55; }
.today__habit--done:hover { opacity: 1; }

.today__habit-emoji { font-size: 16px; flex-shrink: 0; }
.today__habit-name  { font-size: 14px; color: var(--color-text-secondary); flex: 1; }

/* Plan row (learning / training) */
.today__plan-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color var(--t-fast), opacity var(--t-fast);
}
.today__plan-row:hover { border-color: var(--color-accent); }
.today__plan-row--done { opacity: 0.55; }
.today__plan-row--done:hover { opacity: 1; }

.today__plan-emoji { font-size: 16px; flex-shrink: 0; }
.today__plan-title { font-size: 14px; color: var(--color-text-secondary); flex: 1; }

.today__plan-status {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 6px;
  border-radius: 99px;
  flex-shrink: 0;
}
.today__plan-status--done    { background: color-mix(in srgb, var(--color-success) 12%, transparent); color: var(--color-success); }
.today__plan-status--pending { background: var(--color-surface); color: var(--color-text-muted); border: 1px solid var(--color-border); }

/* Goal row */
.today__goal {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color var(--t-fast);
}
.today__goal:hover { border-color: var(--color-accent); }

.today__goal-emoji { font-size: 18px; flex-shrink: 0; }

.today__goal-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.today__goal-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.today__goal-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.today__goal-pct {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.today__goal-bar {
  height: 3px;
  background: var(--color-border);
  border-radius: 99px;
  overflow: hidden;
}
.today__goal-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: 99px;
  transition: width 0.4s ease;
}

.today__goal-days {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  flex-shrink: 0;
  white-space: nowrap;
}
.today__goal-days--overdue { color: var(--color-danger); }

/* Pinned note row */
.today__note {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color var(--t-fast);
}
.today__note:hover { border-color: var(--color-accent); }

.today__note-pin   { font-size: 14px; flex-shrink: 0; }

.today__note-title {
  font-size: 14px;
  color: var(--color-text-secondary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
