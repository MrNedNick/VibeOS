<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Habit } from '../types'
import { useHabitsStore } from '../stores/habits.store'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { useLearningStore } from '@/modules/learning/stores/learning.store'
import { useTrainingStore } from '@/modules/training/stores/training.store'
import { UiIcon } from '@/ui'

const props = defineProps<{ habit: Habit }>()

const habitsStore   = useHabitsStore()
const goalsStore    = useGoalsStore()
const learningStore = useLearningStore()
const trainingStore = useTrainingStore()

const showLinks    = ref(false)
const linkGoal     = ref(props.habit.linkedGoalId ?? '')
const linkLearning = ref(props.habit.linkedLearningPlanId ?? '')
const linkTraining = ref(props.habit.linkedTrainingPlanId ?? '')

const linkedGoalName = computed(() =>
  props.habit.linkedGoalId ? goalsStore.goals.find(g => g.id === props.habit.linkedGoalId)?.title : null,
)
const linkedLearningName = computed(() =>
  props.habit.linkedLearningPlanId ? learningStore.plans.find(p => p.id === props.habit.linkedLearningPlanId)?.title : null,
)
const linkedTrainingName = computed(() =>
  props.habit.linkedTrainingPlanId ? trainingStore.plans.find(p => p.id === props.habit.linkedTrainingPlanId)?.title : null,
)
const hasLinks = computed(() =>
  !!(props.habit.linkedGoalId || props.habit.linkedLearningPlanId || props.habit.linkedTrainingPlanId),
)

function openLinks(): void {
  linkGoal.value     = props.habit.linkedGoalId ?? ''
  linkLearning.value = props.habit.linkedLearningPlanId ?? ''
  linkTraining.value = props.habit.linkedTrainingPlanId ?? ''
  showLinks.value    = !showLinks.value
}
function saveLinks(): void {
  habitsStore.updateHabitLink(props.habit.id, {
    linkedGoalId:         linkGoal.value     || undefined,
    linkedLearningPlanId: linkLearning.value || undefined,
    linkedTrainingPlanId: linkTraining.value || undefined,
  })
  showLinks.value = false
}
</script>

<template>
  <div class="hcl">
    <!-- Summary row -->
    <div class="hcl__row">
      <div class="hcl__chips">
        <span v-if="linkedGoalName" class="hcl-chip hcl-chip--goal">
          <UiIcon name="Target" :size="10" />{{ linkedGoalName }}
        </span>
        <span v-if="linkedLearningName" class="hcl-chip hcl-chip--learning">
          <UiIcon name="BookOpen" :size="10" />{{ linkedLearningName }}
        </span>
        <span v-if="linkedTrainingName" class="hcl-chip hcl-chip--training">
          <UiIcon name="Dumbbell" :size="10" />{{ linkedTrainingName }}
        </span>
        <span v-if="!hasLinks && !showLinks" class="hcl__hint">Connect to goal or plan</span>
      </div>
      <button
        class="hcl__toggle"
        :class="{ 'hcl__toggle--active': showLinks }"
        :title="showLinks ? 'Close' : 'Connect to goal / learning / training'"
        @click="openLinks"
      >
        <UiIcon :name="showLinks ? 'ChevronUp' : 'Link'" :size="12" />
      </button>
    </div>

    <!-- Picker panel -->
    <div v-if="showLinks" class="hcl__panel">
      <div class="hcl-field">
        <label class="hcl-field__label"><UiIcon name="Target" :size="11" /> Goal</label>
        <select v-model="linkGoal" class="hcl-field__select">
          <option value="">— none —</option>
          <option v-for="g in goalsStore.activeGoals" :key="g.id" :value="g.id">{{ g.coverEmoji }} {{ g.title }}</option>
        </select>
      </div>
      <div class="hcl-field">
        <label class="hcl-field__label"><UiIcon name="BookOpen" :size="11" /> Learning plan</label>
        <select v-model="linkLearning" class="hcl-field__select">
          <option value="">— none —</option>
          <option v-for="p in learningStore.activePlans" :key="p.id" :value="p.id">{{ p.coverEmoji }} {{ p.title }}</option>
        </select>
      </div>
      <div class="hcl-field">
        <label class="hcl-field__label"><UiIcon name="Dumbbell" :size="11" /> Training plan</label>
        <select v-model="linkTraining" class="hcl-field__select">
          <option value="">— none —</option>
          <option v-for="p in trainingStore.activePlans" :key="p.id" :value="p.id">{{ p.coverEmoji }} {{ p.title }}</option>
        </select>
      </div>
      <div class="hcl__actions">
        <button class="hcl__btn hcl__btn--ghost" @click="showLinks = false">Cancel</button>
        <button class="hcl__btn hcl__btn--primary" @click="saveLinks">Save</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hcl {
  border-top: 1px solid var(--color-border);
  padding: 10px 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hcl__row { display: flex; align-items: center; gap: 8px; }
.hcl__chips { display: flex; flex-wrap: wrap; gap: 5px; flex: 1; min-width: 0; align-items: center; }
.hcl__hint { font-size: 11px; color: var(--color-text-muted); font-style: italic; }
.hcl-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 20px;
  white-space: nowrap; max-width: 160px; overflow: hidden; text-overflow: ellipsis;
}
.hcl-chip--goal { background: color-mix(in srgb, var(--color-warning) 12%, transparent); color: var(--color-warning); border: 1px solid color-mix(in srgb, var(--color-warning) 25%, transparent); }
.hcl-chip--learning { background: color-mix(in srgb, var(--color-accent) 12%, transparent); color: var(--color-accent); border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent); }
.hcl-chip--training { background: color-mix(in srgb, #f97316 12%, transparent); color: #f97316; border: 1px solid color-mix(in srgb, #f97316 25%, transparent); }
.hcl__toggle {
  display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: var(--radius-sm);
  border: 1px solid var(--color-border); background: transparent;
  color: var(--color-text-muted); cursor: pointer; flex-shrink: 0;
  transition: color var(--t-fast), border-color var(--t-fast), background var(--t-fast);
}
.hcl__toggle:hover { color: var(--color-accent); border-color: var(--color-accent); }
.hcl__toggle--active { color: var(--color-accent); border-color: var(--color-accent); background: var(--color-accent-muted); }
.hcl__panel {
  display: flex; flex-direction: column; gap: 10px;
  padding: 12px 14px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
.hcl-field { display: flex; flex-direction: column; gap: 4px; }
.hcl-field__label { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); }
.hcl-field__select { padding: 6px 10px; font-size: 13px; font-family: var(--font-sans); color: var(--color-text); background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-sm); outline: none; cursor: pointer; transition: border-color var(--t-fast); }
.hcl-field__select:focus { border-color: var(--color-accent); }
.hcl__actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 2px; }
.hcl__btn { padding: 5px 14px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: opacity var(--t-fast), background var(--t-fast); }
.hcl__btn--ghost { background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text-secondary); }
.hcl__btn--ghost:hover { background: var(--color-border); }
.hcl__btn--primary { background: var(--color-accent); color: #fff; }
.hcl__btn--primary:hover { opacity: 0.88; }
</style>
