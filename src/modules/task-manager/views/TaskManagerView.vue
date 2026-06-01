<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTasks } from '../composables/useTasks'
import TaskInput from '../components/TaskInput.vue'
import TaskFilters from '../components/TaskFilters.vue'
import TaskList from '../components/TaskList.vue'
import TaskProgress from '../components/TaskProgress.vue'
import PomodoroPanel from '../components/PomodoroPanel.vue'
import HabitHeatmap from '@/modules/habits/components/HabitHeatmap.vue'
import { useLocale } from '@/core/i18n'
import { UiButton, UiSectionLabel, UiFilterChips, UiIconButton, UiSelect } from '@/ui'
import type { FilterChipOption, SelectOption } from '@/ui'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { useAiInsight } from '@/core/composables/useAiInsight'

const i18n = useLocale()
const goalsStore = useGoalsStore()

import type { TaskCategory } from '../types'

const {
  inputText, inputPriority, inputCategory, inputGoalId,
  submitTask, removeTask, clearCompleted, exportTasks,
  store, MAX_LENGTH,
} = useTasks()

const CATEGORIES: { val: TaskCategory | 'all'; labelKey: string }[] = [
  { val: 'all',      labelKey: 'tasks.catAll'      },
  { val: 'work',     labelKey: 'tasks.catWork'     },
  { val: 'learning', labelKey: 'tasks.catLearning' },
  { val: 'training', labelKey: 'tasks.catTraining' },
  { val: 'personal', labelKey: 'tasks.catPersonal' },
  { val: 'goal',     labelKey: 'tasks.catGoal'     },
]

const categoryOptions = computed<FilterChipOption[]>(() =>
  CATEGORIES.map(cat => ({ value: cat.val, label: i18n.t(cat.labelKey) }))
)

const goalOptions = computed<SelectOption[]>(() => [
  { value: '', label: '— none —' },
  ...goalsStore.activeGoals.map(g => ({ value: g.id, label: `${g.coverEmoji} ${g.title}` })),
])

const focusedId    = ref<string | null>(null)
const taskInputRef = ref<InstanceType<typeof TaskInput>>()
const showPomodoro  = ref(false)
const showHeatmap   = ref(false)

// Task completion dates for the activity heatmap (from completedAt timestamps)
const taskCompletedDates = computed(() =>
  store.tasks
    .filter(t => t.done && t.completedAt)
    .map(t => t.completedAt!.slice(0, 10)),
)

// ── AI priority assistant ──────────────────────────────────────────
const { result: aiPriority, loading: aiPriorityLoading, run: runAiPriority, dismiss: dismissAiPriority } = useAiInsight()

function askAIPriority() {
  const pending = store.tasks.filter(t => !t.done).slice(0, 15)
  const list = pending.length
    ? pending.map(t => {
        const parts = [`• ${t.text}`]
        if (t.priority !== 'none') parts.push(`[${t.priority}]`)
        if (t.dueDate) parts.push(`due ${t.dueDate}`)
        if (t.category) parts.push(`(${t.category})`)
        return parts.join(' ')
      }).join('\n')
    : 'No pending tasks.'
  runAiPriority(`My pending tasks:\n${list}\n\nWhat should I focus on right now? Pick the 2-3 most important and explain why. Be direct and practical (3-4 sentences max).`)
}

function onKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

  const tasks = store.filteredTasks
  if (!tasks.length) return

  const idx = focusedId.value ? tasks.findIndex(t => t.id === focusedId.value) : -1

  if (e.key === 'j' || e.key === 'ArrowDown') {
    e.preventDefault()
    focusedId.value = tasks[Math.min(idx + 1, tasks.length - 1)].id
  } else if (e.key === 'k' || e.key === 'ArrowUp') {
    e.preventDefault()
    focusedId.value = tasks[Math.max(idx - 1, 0)].id
  } else if (e.key === ' ' && focusedId.value) {
    e.preventDefault()
    store.toggleTask(focusedId.value)
  } else if (e.key === 'd' && focusedId.value) {
    e.preventDefault()
    removeTask(focusedId.value)
    focusedId.value = tasks[Math.min(idx, tasks.length - 2)]?.id ?? null
  } else if (e.key === '/') {
    e.preventDefault()
    document.querySelector<HTMLInputElement>('.ui-input__field')?.focus()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="tm-view">
    <!-- Header row -->
    <div class="tm-view__header">
      <div>
        <h1 class="tm-view__title">{{ i18n.t('tasks.title') }}</h1>
        <p class="tm-view__subtitle">
          <span v-if="store.totalCount > 0">
            {{ i18n.t('tasks.remaining', { n: store.activeCount }) }} · {{ i18n.t('tasks.done', { n: store.doneCount }) }}
          </span>
          <span v-else>{{ i18n.t('tasks.empty') }}</span>
          <span v-if="store.doneThisWeek > 0" class="tm-view__week-pill">🗓 {{ store.doneThisWeek }} this week</span>
          <span class="tm-view__hint">j/k · space · d · /</span>
        </p>
      </div>
      <div class="tm-view__actions">
        <UiButton
          variant="ghost"
          size="sm"
          :title="showPomodoro ? 'Hide focus timer' : 'Show focus timer'"
          @click="showPomodoro = !showPomodoro"
        >🍅 Focus</UiButton>
        <UiButton
          v-if="taskCompletedDates.length > 0"
          variant="ghost"
          size="sm"
          :title="showHeatmap ? 'Hide activity heatmap' : 'Show task completion activity'"
          @click="showHeatmap = !showHeatmap"
        >📊 Activity</UiButton>
        <UiButton
          v-if="store.totalCount > 0"
          variant="ghost"
          size="sm"
          title="Download tasks as JSON"
          @click="exportTasks('json')"
        >↓ JSON</UiButton>
        <UiButton
          v-if="store.totalCount > 0"
          variant="ghost"
          size="sm"
          title="Download tasks as CSV"
          @click="exportTasks('csv')"
        >↓ CSV</UiButton>
        <UiButton
          v-if="store.doneCount > 0"
          variant="ghost"
          size="sm"
          title="Remove all completed tasks from the list"
          @click="clearCompleted"
        >{{ i18n.t('tasks.clearDone') }}</UiButton>
        <UiButton
          variant="ghost"
          size="sm"
          :title="aiPriorityLoading ? 'Thinking…' : 'AI: What to focus on right now?'"
          :disabled="aiPriorityLoading"
          @click="askAIPriority"
        >{{ aiPriorityLoading ? '✦ …' : '✦ Focus' }}</UiButton>
      </div>
    </div>

    <!-- AI priority card -->
    <Transition name="ai-fade">
      <div v-if="aiPriority" class="tm-view__ai-card">
        <div class="tm-view__ai-header">
          <span class="tm-view__ai-label">✦ AI Focus Suggestion</span>
          <UiIconButton name="X" aria-label="Dismiss AI suggestion" size="sm" @click="dismissAiPriority" />
        </div>
        <p class="tm-view__ai-text">{{ aiPriority }}</p>
      </div>
    </Transition>

    <!-- Activity heatmap (collapsible) -->
    <Transition name="heat-slide">
      <div v-if="showHeatmap" class="tm-view__heatmap-panel">
        <div class="tm-view__heatmap-header">
          <UiSectionLabel size="sm">Task Activity</UiSectionLabel>
          <span class="tm-view__heatmap-meta">{{ taskCompletedDates.length }} tasks completed · last 20 weeks</span>
        </div>
        <div class="tm-view__heatmap-wrap">
          <HabitHeatmap :completed-dates="taskCompletedDates" :weeks="20" />
        </div>
      </div>
    </Transition>

    <!-- Pomodoro panel (collapsible) -->
    <Transition name="pomo-slide">
      <PomodoroPanel v-if="showPomodoro" />
    </Transition>

    <!-- Input -->
    <TaskInput
      ref="taskInputRef"
      v-model="inputText"
      :priority="inputPriority"
      :max-length="MAX_LENGTH"
      @update:priority="inputPriority = $event"
      @submit="submitTask"
    />

    <!-- Progress -->
    <TaskProgress
      v-if="store.totalCount > 0"
      :progress="store.progress"
      :active-count="store.activeCount"
      :done-count="store.doneCount"
    />

    <!-- Status filters -->
    <TaskFilters
      v-model="store.filter"
      :total-count="store.totalCount"
      :active-count="store.activeCount"
      :done-count="store.doneCount"
      :today-count="store.todayCount"
    />

    <!-- Category filter chips -->
    <UiFilterChips
      :model-value="store.categoryFilter as string"
      :options="categoryOptions"
      variant="pills"
      @update:model-value="store.setCategoryFilter($event as TaskCategory | 'all')"
    />

    <!-- New task category + goal selector (only when input has text) -->
    <div v-if="inputText.trim()" class="tm-view__input-cats">
      <span class="tm-view__input-cat-label">Category:</span>
      <button
        v-for="cat in CATEGORIES.slice(1)"
        :key="`in-${cat.val}`"
        class="tm-view__cat tm-view__cat--sm"
        :class="{ 'tm-view__cat--active': inputCategory === cat.val }"
        @click="inputCategory = (inputCategory === cat.val ? undefined : cat.val as TaskCategory)"
      >{{ i18n.t(cat.labelKey) }}</button>

      <template v-if="goalsStore.activeGoals.length">
        <span class="tm-view__input-cat-label tm-view__input-cat-label--sep">Goal:</span>
        <div class="tm-view__goal-wrap">
          <UiSelect v-model="inputGoalId" size="sm" :options="goalOptions" title="Link to a goal" />
        </div>
      </template>
    </div>

    <!-- List -->
    <TaskList
      :tasks="store.filteredTasks"
      :focused-id="focusedId"
      @toggle="store.toggleTask"
      @delete="removeTask"
      @edit="store.updateTask"
      @set-due-date="store.setDueDate"
      @focus="focusedId = $event"
    />
  </div>
</template>

<style scoped>
.tm-view {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tm-view__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.tm-view__title {
  font-size: 27px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  line-height: var(--leading-3xl);
}

.tm-view__subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 3px 0 0;
  line-height: var(--leading-sm);
}

.tm-view__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.tm-view__week-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-accent);
  background: var(--color-accent-muted);
  border-radius: 99px;
  padding: 2px 8px;
  margin: 0 4px;
}

.tm-view__hint {
  font-size: 13px;
  color: var(--color-text-muted);
  opacity: 0.5;
  font-family: var(--font-mono);
}

/* Activity heatmap panel */
.tm-view__heatmap-panel {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: var(--shadow-1);
}

.tm-view__heatmap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.tm-view__heatmap-meta {
  font-size: 12px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.tm-view__heatmap-wrap {
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
}
.tm-view__heatmap-wrap::-webkit-scrollbar { display: none; }

.heat-slide-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.heat-slide-leave-active { transition: opacity 0.15s ease; }
.heat-slide-enter-from   { opacity: 0; transform: translateY(-8px); }
.heat-slide-leave-to     { opacity: 0; }

/* Pomodoro transition */
.pomo-slide-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.pomo-slide-leave-active { transition: opacity 0.15s ease; }
.pomo-slide-enter-from   { opacity: 0; transform: translateY(-8px); }
.pomo-slide-leave-to     { opacity: 0; }

/* AI priority card */
.tm-view__ai-card {
  background: color-mix(in srgb, var(--color-accent) 6%, var(--color-surface));
  border: 1px solid color-mix(in srgb, var(--color-accent) 25%, var(--color-border));
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: var(--shadow-1);
}

.tm-view__ai-header { display: flex; align-items: center; justify-content: space-between; }
.tm-view__ai-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-accent); }
.tm-view__ai-text { font-size: var(--text-sm); line-height: var(--leading-base); color: var(--color-text-secondary); margin: 0; }

.ai-fade-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.ai-fade-leave-active { transition: opacity 0.15s ease; }
.ai-fade-enter-from   { opacity: 0; transform: translateY(-6px); }
.ai-fade-leave-to     { opacity: 0; }

/* Input category chips */
.tm-view__input-cats {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: -10px;
}

.tm-view__input-cat-label {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-right: 2px;
}

.tm-view__input-cat-label--sep { margin-left: 8px; }

.tm-view__cat {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--t-fast);
}

.tm-view__cat--sm { font-size: 12px; padding: 3px 8px; }

.tm-view__cat:hover:not(.tm-view__cat--active) {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

.tm-view__cat--active {
  background: var(--color-accent-muted);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.tm-view__goal-wrap {
  max-width: 200px;
}

@media (max-width: 767px) {
  .tm-view__goal-wrap { max-width: 150px; }
}
</style>
