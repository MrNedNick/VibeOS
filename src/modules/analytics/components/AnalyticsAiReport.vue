<script setup lang="ts">
import { ref } from 'vue'
import { useTasksStore } from '@/modules/task-manager/stores/tasks.store'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { useLearningStore } from '@/modules/learning/stores/learning.store'
import { useTrainingStore } from '@/modules/training/stores/training.store'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { useAI } from '@/core/composables/useAI'
import { UiIcon, UiSkeleton } from '@/ui'

const props = defineProps<{ period: number }>()

const tasksStore    = useTasksStore()
const habitsStore   = useHabitsStore()
const learningStore = useLearningStore()
const trainingStore = useTrainingStore()
const goalsStore    = useGoalsStore()

const { complete, loading: reportLoading } = useAI()
const report      = ref<string | null>(null)
const reportError = ref<string | null>(null)
const reportOpen  = ref(false)

function getDateSet(days: number): Set<string> {
  const result = new Set<string>()
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    result.add(d.toISOString().slice(0, 10))
  }
  return result
}

function buildSummary(): string {
  const dates = getDateSet(props.period)
  const days  = props.period
  const habitsLen = habitsStore.habits.length

  let habitRate: number | null = null
  if (habitsLen) {
    const dateArr = Array.from(dates)
    let total = 0, done = 0
    for (const h of habitsStore.habits) {
      for (const d of dateArr) { total++; if (h.completedDates.includes(d)) done++ }
    }
    habitRate = total === 0 ? 0 : Math.round((done / total) * 100)
  }

  const mins = learningStore.sessions.filter(s => dates.has(s.date)).reduce((sum, s) => sum + s.actualMinutes, 0)
  const learningHours = (mins / 60).toFixed(1)
  const workouts = trainingStore.logs.filter(l => dates.has(l.date)).length
  const tasksDone = tasksStore.tasks.filter(t => t.done && t.completedAt && dates.has(t.completedAt.slice(0, 10))).length
  const tasksCreated = tasksStore.tasks.filter(t => dates.has(new Date(t.createdAt).toISOString().slice(0, 10))).length

  const activeGoals = goalsStore.activeGoals.map(g => ({
    title: g.title,
    progress: goalsStore.getProgress(g.id),
  }))

  const lines = [
    `Period: last ${days} days`,
    `Habit consistency: ${habitRate !== null ? habitRate + '%' : 'no habits tracked'}${habitsLen ? ` across ${habitsLen} habit(s)` : ''}`,
    `Tasks: ${tasksDone} completed, ${tasksCreated} created in this window (${tasksStore.tasks.filter(t => t.done).length} done of ${tasksStore.tasks.length} all-time)`,
    `Learning: ${learningHours} hours logged across ${learningStore.activePlans.length} active plan(s)`,
    `Training: ${workouts} workout session(s)`,
  ]
  if (activeGoals.length) lines.push(`Active goals: ${activeGoals.map(g => `"${g.title}" ${g.progress}%`).join(', ')}`)
  else lines.push('Active goals: none')
  if (goalsStore.completedGoals.length) lines.push(`Completed goals: ${goalsStore.completedGoals.length}`)
  return lines.join('\n')
}

async function generateReport(): Promise<void> {
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
function dismissReport(): void {
  reportOpen.value  = false
  report.value      = null
  reportError.value = null
}
</script>

<template>
  <section class="report" :class="{ 'report--open': reportOpen }">
    <div class="report__header">
      <div class="report__title-row">
        <UiIcon name="Sparkles" :size="14" :stroke-width="2" class="report__icon" />
        <span class="report__title">AI report · last {{ period }} days</span>
      </div>
      <div class="report__actions">
        <button v-if="!reportOpen || (!reportLoading && !report)" class="report__generate-btn" :disabled="reportLoading" @click="generateReport">
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
</template>

<style scoped>
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
.report__header { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.report__title-row { display: flex; align-items: center; gap: 7px; }
.report__icon { color: var(--color-accent); flex-shrink: 0; }
.report__title { font-size: 13px; font-weight: 600; color: var(--color-text-secondary); }
.report__actions { display: flex; align-items: center; gap: 6px; }
.report__generate-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; font-size: 13px; font-weight: 600;
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 25%, var(--color-border));
  border-radius: var(--radius-sm);
  cursor: pointer; font-family: inherit;
  transition: background var(--t-fast), opacity var(--t-fast);
}
.report__generate-btn:hover:not(:disabled) { background: color-mix(in srgb, var(--color-accent) 14%, transparent); }
.report__generate-btn:disabled { opacity: 0.6; cursor: default; }
.report__icon-btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: var(--radius-sm);
  color: var(--color-text-muted); background: transparent; border: none; cursor: pointer;
  transition: color var(--t-fast), background var(--t-fast);
}
.report__icon-btn:hover:not(:disabled) { color: var(--color-text); background: var(--color-surface-elevated); }
.report__icon-btn:disabled { opacity: 0.4; cursor: default; }
.report__spinner { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.report__body { display: flex; flex-direction: column; gap: 10px; }
.report__skeleton { display: flex; flex-direction: column; gap: 8px; }
.report__error {
  display: flex; align-items: center; gap: 8px;
  color: var(--color-danger); font-size: 13px;
}
.report__retry {
  font-size: 12px; font-weight: 600; color: var(--color-accent);
  background: none; border: none; cursor: pointer; padding: 0; font-family: inherit;
}
.report__text {
  font-size: 14px; line-height: var(--leading-lg);
  color: var(--color-text-secondary); margin: 0;
}
.report-body-enter-active, .report-body-leave-active { transition: opacity 0.2s ease, max-height 0.2s ease; overflow: hidden; }
.report-body-enter-from, .report-body-leave-to { opacity: 0; max-height: 0; }
.report-body-enter-to, .report-body-leave-from { opacity: 1; max-height: 300px; }
</style>
