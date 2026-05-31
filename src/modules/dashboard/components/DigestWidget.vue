<script setup lang="ts">
import { ref } from 'vue'
import { UiIcon, UiSkeleton } from '@/ui'
import { aiComplete } from '@/core/composables/useAI'
import { useTasksStore } from '@/modules/task-manager/stores/tasks.store'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { useLearningStore } from '@/modules/learning/stores/learning.store'
import { useTrainingStore } from '@/modules/training/stores/training.store'

const tasksStore   = useTasksStore()
const goalsStore   = useGoalsStore()
const habitsStore  = useHabitsStore()
const learningStore = useLearningStore()
const trainingStore = useTrainingStore()

const loading = ref(false)
const digest  = ref<string | null>(null)
const error   = ref<string | null>(null)
const open    = ref(false)

async function generate() {
  loading.value = true
  error.value   = null
  open.value    = true

  const today     = new Date().toISOString().slice(0, 10)
  const habitsDone  = habitsStore.habits.filter(h => h.completedDates.includes(today)).length
  const habitsTotal = habitsStore.habits.length
  const learningToday  = learningStore.todayItems.length
  const learningLogged = learningStore.todayItems.filter((i: { logged: boolean }) => i.logged).length
  const trainingToday  = trainingStore.todayItems.length
  const trainingLogged = trainingStore.todayItems.filter((i: { logged: boolean }) => i.logged).length

  const lines: string[] = [
    `Date: ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`,
    `Tasks: ${tasksStore.activeCount} pending, ${tasksStore.doneCount} done total`,
    `Goals: ${goalsStore.activeGoals.length} active`,
    `Habits: ${habitsDone}/${habitsTotal} completed today`,
    `Learning: ${learningLogged}/${learningToday} sessions done today`,
    `Training: ${trainingLogged}/${trainingToday} workouts done today`,
  ]

  if (goalsStore.activeGoals.length > 0) {
    const g = goalsStore.activeGoals[0]
    lines.push(`Top goal: "${g.title}" (${g.category})`)
  }

  const prompt = `Here's my productivity snapshot:\n${lines.join('\n')}\n\nWrite a brief, encouraging daily digest in 3–4 sentences. Highlight what's going well, suggest one thing to prioritise today, and end with a short motivational note. Be direct and concise.`

  try {
    digest.value = await aiComplete(prompt)
  } catch {
    error.value = 'Network error — check your connection'
  } finally {
    loading.value = false
  }
}

function dismiss() {
  open.value   = false
  digest.value = null
  error.value  = null
}
</script>

<template>
  <div class="digest" :class="{ 'digest--open': open }">
    <!-- Header row -->
    <div class="digest__header">
      <div class="digest__title-row">
        <UiIcon name="Sparkles" :size="13" :stroke-width="2" class="digest__icon" />
        <span class="digest__title">AI Digest</span>
      </div>
      <div class="digest__actions">
        <button
          v-if="!open || (!loading && !digest)"
          class="digest__generate-btn"
          :disabled="loading"
          @click="generate"
        >
          <UiIcon v-if="loading" name="Loader" :size="12" :stroke-width="2" class="digest__spinner" />
          {{ loading ? 'Generating…' : 'Generate' }}
        </button>
        <button v-if="open" class="digest__icon-btn" title="Refresh" :disabled="loading" @click="generate">
          <UiIcon name="RefreshCw" :size="12" :stroke-width="2" />
        </button>
        <button v-if="open" class="digest__icon-btn" title="Dismiss" @click="dismiss">
          <UiIcon name="X" :size="12" :stroke-width="2" />
        </button>
      </div>
    </div>

    <!-- Body -->
    <Transition name="digest-body">
      <div v-if="open" class="digest__body">
        <!-- Loading skeleton -->
        <div v-if="loading" class="digest__skeleton">
          <UiSkeleton width="100%" height="14px" rounded="full" />
          <UiSkeleton width="92%" height="14px" rounded="full" />
          <UiSkeleton width="78%" height="14px" rounded="full" />
          <UiSkeleton width="85%" height="14px" rounded="full" />
        </div>
        <!-- Error -->
        <div v-else-if="error" class="digest__error">
          <UiIcon name="AlertCircle" :size="13" :stroke-width="2" />
          <span>{{ error }}</span>
          <button class="digest__retry" @click="generate">Retry</button>
        </div>
        <!-- Digest text -->
        <p v-else-if="digest" class="digest__text">{{ digest }}</p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.digest {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color var(--t-fast);
}

.digest--open {
  border-color: color-mix(in srgb, var(--color-accent) 30%, var(--color-border));
}

.digest__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.digest__title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.digest__icon { color: var(--color-accent); }

.digest__title {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.digest__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.digest__generate-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-accent);
  background: transparent;
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--t-fast);
}

.digest__generate-btn:hover:not(:disabled) {
  background: var(--color-accent);
  color: #fff;
}

.digest__generate-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.digest__icon-btn {
  width: 24px;
  height: 24px;
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
.digest__icon-btn:hover:not(:disabled) { background: var(--color-surface-elevated); color: var(--color-text); }
.digest__icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.digest__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.digest__skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
}

.digest__error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-danger);
}

.digest__retry {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-accent);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.digest__text {
  font-size: 14px;
  line-height: 1.65;
  color: var(--color-text-secondary);
  margin: 0;
  white-space: pre-wrap;
}

/* Transition */
.digest-body-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.digest-body-leave-active { transition: opacity 0.15s ease; }
.digest-body-enter-from   { opacity: 0; transform: translateY(-6px); }
.digest-body-leave-to     { opacity: 0; }
</style>
