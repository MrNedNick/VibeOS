<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import type { Habit } from '../types'
import { computeStreak, todayStr } from '../types'
import { useLocale, pluralRu } from '@/core/i18n'
import HabitHeatmap from './HabitHeatmap.vue'
import { UiIcon } from '@/ui'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { useLearningStore } from '@/modules/learning/stores/learning.store'
import { useTrainingStore } from '@/modules/training/stores/training.store'
import { useHabitsStore } from '../stores/habits.store'
import { useConfirm } from '@/core/composables/useConfirm'

const props = defineProps<{
  habit: Habit
  doneToday: boolean
}>()

const emit = defineEmits<{
  toggle: [id: string]
  delete: [id: string]
  update: [id: string, name: string]
}>()

const i18n = useLocale()

// ── Computed ──────────────────────────────────────────────────────────
const streak = computed(() => computeStreak(props.habit.completedDates))
const totalDays = computed(() => props.habit.completedDates.filter(d => d <= todayStr()).length)

const streakLabel = computed(() => {
  const n = streak.value
  if (n === 0) return i18n.t('habits.streakNone')
  if (i18n.locale === 'ru') return `🔥 ${pluralRu(n, 'день', 'дня', 'дней')}`
  return `🔥 ${n} day${n === 1 ? '' : 's'}`
})

const totalLabel = computed(() =>
  i18n.t('habits.total', { n: totalDays.value })
)

const todayFormatted = computed(() =>
  new Date().toLocaleDateString(i18n.localeCode, { weekday: 'short', day: 'numeric', month: 'short' })
)

// ── Inline edit (name) ────────────────────────────────────────────────
const editing = ref(false)
const editName = ref('')
const editInput = ref<HTMLInputElement>()

async function startEdit() {
  editName.value = props.habit.name
  editing.value = true
  await nextTick()
  editInput.value?.select()
}

function saveEdit() {
  if (editName.value.trim()) {
    emit('update', props.habit.id, editName.value.trim())
  }
  editing.value = false
}

function cancelEdit() {
  editing.value = false
}

function onEditKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); saveEdit() }
  if (e.key === 'Escape') { e.preventDefault(); cancelEdit() }
}

// ── Inline edit (purpose) ─────────────────────────────────────────────
const editingPurpose = ref(false)
const editPurpose    = ref('')
const editPurposeInput = ref<HTMLInputElement>()

async function startPurposeEdit() {
  editPurpose.value = props.habit.purpose ?? ''
  editingPurpose.value = true
  await nextTick()
  editPurposeInput.value?.select()
}

function savePurposeEdit() {
  habitsStore.updateHabit(props.habit.id, props.habit.name, props.habit.emoji, editPurpose.value)
  editingPurpose.value = false
}

function cancelPurposeEdit() {
  editingPurpose.value = false
}

function onPurposeKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); savePurposeEdit() }
  if (e.key === 'Escape') { e.preventDefault(); cancelPurposeEdit() }
}

// ── Confirm delete ────────────────────────────────────────────────────
const { confirm } = useConfirm()

async function askConfirm() {
  const ok = await confirm({
    title:        `Delete "${props.habit.name}"?`,
    body:         'All streak data and check-in history will be lost.',
    danger:       true,
    confirmLabel: 'Delete habit',
  })
  if (ok) emit('delete', props.habit.id)
}

// ── Link / connect ────────────────────────────────────────────────────
const goalsStore    = useGoalsStore()
const learningStore = useLearningStore()
const trainingStore = useTrainingStore()
const habitsStore   = useHabitsStore()

const showLinks   = ref(false)
const linkGoal     = ref(props.habit.linkedGoalId ?? '')
const linkLearning = ref(props.habit.linkedLearningPlanId ?? '')
const linkTraining = ref(props.habit.linkedTrainingPlanId ?? '')

const linkedGoalName = computed(() =>
  props.habit.linkedGoalId
    ? goalsStore.goals.find(g => g.id === props.habit.linkedGoalId)?.title
    : null,
)
const linkedLearningName = computed(() =>
  props.habit.linkedLearningPlanId
    ? learningStore.plans.find(p => p.id === props.habit.linkedLearningPlanId)?.title
    : null,
)
const linkedTrainingName = computed(() =>
  props.habit.linkedTrainingPlanId
    ? trainingStore.plans.find(p => p.id === props.habit.linkedTrainingPlanId)?.title
    : null,
)

const hasLinks = computed(() =>
  !!(props.habit.linkedGoalId || props.habit.linkedLearningPlanId || props.habit.linkedTrainingPlanId),
)

function openLinks() {
  linkGoal.value     = props.habit.linkedGoalId ?? ''
  linkLearning.value = props.habit.linkedLearningPlanId ?? ''
  linkTraining.value = props.habit.linkedTrainingPlanId ?? ''
  showLinks.value    = !showLinks.value
}

function saveLinks() {
  habitsStore.updateHabitLink(props.habit.id, {
    linkedGoalId:           linkGoal.value     || undefined,
    linkedLearningPlanId:   linkLearning.value || undefined,
    linkedTrainingPlanId:   linkTraining.value || undefined,
  })
  showLinks.value = false
}
</script>

<template>
  <div class="habit-card" :class="{ 'habit-card--done': doneToday }">

    <!-- ── Main body row (info left + heatmap right on desktop) ──── -->
    <div class="habit-card__body">

      <!-- Left: identity + stats + actions -->
      <div class="habit-card__left">
        <div class="habit-card__identity">
          <span class="habit-card__emoji">{{ habit.emoji }}</span>

          <div class="habit-card__info">
            <!-- Edit mode -->
            <input
              v-if="editing"
              ref="editInput"
              v-model="editName"
              class="habit-card__edit-input"
              :placeholder="i18n.t('habits.editPlaceholder')"
              maxlength="60"
              @keydown="onEditKeydown"
              @blur="saveEdit"
            />
            <!-- Display mode -->
            <span
              v-else
              class="habit-card__name"
              :title="i18n.t('habits.editPlaceholder')"
              @click="startEdit"
            >{{ habit.name }}</span>

            <!-- Purpose (why) — inline editable -->
            <input
              v-if="editingPurpose"
              ref="editPurposeInput"
              v-model="editPurpose"
              class="habit-card__purpose-input"
              placeholder="Why are you building this habit?"
              maxlength="120"
              @keydown="onPurposeKeydown"
              @blur="savePurposeEdit"
            />
            <span
              v-else-if="habit.purpose"
              class="habit-card__purpose"
              title="Click to edit your why"
              @click="startPurposeEdit"
            >{{ habit.purpose }}</span>
            <span
              v-else
              class="habit-card__purpose habit-card__purpose--empty"
              title="Add your why"
              @click="startPurposeEdit"
            >+ Add why…</span>

            <div class="habit-card__meta">
              <span :class="['habit-card__streak', streak === 0 ? 'habit-card__streak--zero' : '']">
                {{ streakLabel }}
              </span>
              <span class="habit-card__total">{{ totalLabel }}</span>
            </div>
          </div>
        </div>

        <div class="habit-card__actions">
          <button
            class="habit-card__toggle"
            :class="{ 'habit-card__toggle--done': doneToday }"
            :title="`${doneToday ? i18n.t('habits.toggleDoneTitle') : i18n.t('habits.toggleTodoTitle')} (${todayFormatted})`"
            @click="emit('toggle', habit.id)"
          >
            <svg v-if="doneToday" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.5 9.5l3.5 3.5 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
          <button
            class="habit-card__delete"
            :title="i18n.t('habits.deleteConfirm')"
            @click="askConfirm"
          >×</button>
        </div>
      </div>

      <!-- Right: heatmap -->
      <div class="habit-card__heatmap">
        <HabitHeatmap :completed-dates="habit.completedDates" :weeks="16" />
      </div>

    </div>

    <!-- ── Connected to (full-width footer) ────────────────────────── -->
    <div class="habit-card__connect">
      <!-- Summary row (always visible if links exist) -->
      <div class="habit-card__connect-row">
        <div class="habit-card__connect-chips">
          <span v-if="linkedGoalName" class="habit-chip habit-chip--goal">
            <UiIcon name="Target" :size="10" />{{ linkedGoalName }}
          </span>
          <span v-if="linkedLearningName" class="habit-chip habit-chip--learning">
            <UiIcon name="BookOpen" :size="10" />{{ linkedLearningName }}
          </span>
          <span v-if="linkedTrainingName" class="habit-chip habit-chip--training">
            <UiIcon name="Dumbbell" :size="10" />{{ linkedTrainingName }}
          </span>
          <span v-if="!hasLinks && !showLinks" class="habit-card__connect-hint">
            Connect to goal or plan
          </span>
        </div>
        <button
          class="habit-card__connect-toggle"
          :class="{ 'habit-card__connect-toggle--active': showLinks }"
          :title="showLinks ? 'Close' : 'Connect to goal / learning / training'"
          @click="openLinks"
        >
          <UiIcon :name="showLinks ? 'ChevronUp' : 'Link'" :size="12" />
        </button>
      </div>

      <!-- Picker panel -->
      <div v-if="showLinks" class="habit-card__link-panel">
        <!-- Goal -->
        <div class="habit-link-field">
          <label class="habit-link-label">
            <UiIcon name="Target" :size="11" /> Goal
          </label>
          <select v-model="linkGoal" class="habit-link-select">
            <option value="">— none —</option>
            <option v-for="g in goalsStore.activeGoals" :key="g.id" :value="g.id">
              {{ g.coverEmoji }} {{ g.title }}
            </option>
          </select>
        </div>

        <!-- Learning plan -->
        <div class="habit-link-field">
          <label class="habit-link-label">
            <UiIcon name="BookOpen" :size="11" /> Learning plan
          </label>
          <select v-model="linkLearning" class="habit-link-select">
            <option value="">— none —</option>
            <option v-for="p in learningStore.activePlans" :key="p.id" :value="p.id">
              {{ p.coverEmoji }} {{ p.title }}
            </option>
          </select>
        </div>

        <!-- Training plan -->
        <div class="habit-link-field">
          <label class="habit-link-label">
            <UiIcon name="Dumbbell" :size="11" /> Training plan
          </label>
          <select v-model="linkTraining" class="habit-link-select">
            <option value="">— none —</option>
            <option v-for="p in trainingStore.activePlans" :key="p.id" :value="p.id">
              {{ p.coverEmoji }} {{ p.title }}
            </option>
          </select>
        </div>

        <div class="habit-link-actions">
          <button class="habit-link-btn habit-link-btn--ghost" @click="showLinks = false">Cancel</button>
          <button class="habit-link-btn habit-link-btn--primary" @click="saveLinks">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.habit-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  transition: border-color var(--t-fast);
  overflow: hidden;
}

.habit-card--done {
  border-color: color-mix(in srgb, var(--color-accent) 40%, var(--color-border));
}

/* ── Body row ───────────────────────────────────────────────── */
.habit-card__body {
  display: flex;
  flex-direction: column;
}

/* ── Left panel ─────────────────────────────────────────────── */
.habit-card__left {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px 14px;
}

.habit-card__identity {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex: 1;
}

.habit-card__emoji {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
  user-select: none;
}

.habit-card__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.habit-card__name {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: text;
  border-radius: var(--radius-xs);
  padding: 1px 3px;
  margin: -1px -3px;
  transition: background var(--t-fast);
}
.habit-card__name:hover {
  background: var(--color-surface-elevated);
}

.habit-card__edit-input {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  background: var(--color-surface-elevated);
  border: 1.5px solid var(--color-accent);
  border-radius: var(--radius-xs);
  padding: 2px 6px;
  outline: none;
  width: 100%;
  font-family: inherit;
}

.habit-card__purpose {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.4;
  cursor: text;
  border-radius: var(--radius-xs);
  padding: 1px 3px;
  margin: -1px -3px;
  transition: background var(--t-fast), color var(--t-fast);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.habit-card__purpose:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text-secondary);
}

.habit-card__purpose--empty {
  color: var(--color-text-muted);
  opacity: 0;
  font-style: italic;
  font-size: 11px;
  transition: opacity var(--t-fast), background var(--t-fast);
}
.habit-card:hover .habit-card__purpose--empty { opacity: 0.6; }
.habit-card__purpose--empty:hover { opacity: 1 !important; }

.habit-card__purpose-input {
  font-size: 12px;
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-xs);
  padding: 2px 6px;
  outline: none;
  width: 100%;
  font-family: inherit;
  font-style: italic;
}

.habit-card__meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.habit-card__streak {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.habit-card__streak--zero {
  color: var(--color-text-muted);
  font-weight: 400;
}

.habit-card__total {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}

/* Actions */
.habit-card__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* Toggle button */
.habit-card__toggle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--color-border);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--t-fast);
  background: var(--color-surface-elevated);
}

.habit-card__toggle:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-muted);
}

.habit-card__toggle--done {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.habit-card__toggle--done:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
  color: #fff;
}

/* Delete button */
.habit-card__delete {
  font-size: 18px;
  line-height: 1;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  opacity: 0;
  transition: opacity var(--t-fast), color var(--t-fast), background var(--t-fast);
  cursor: pointer;
}

.habit-card:hover .habit-card__delete { opacity: 1; }
.habit-card__delete:hover {
  color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 12%, transparent);
}

.habit-card__heatmap {
  overflow-x: auto;
  padding: 0 20px 14px;
  scrollbar-width: none;
}
.habit-card__heatmap::-webkit-scrollbar { display: none; }

/* Mobile: always show delete on touch */
@media (max-width: 767px) {
  .habit-card__delete { opacity: 0.5; }
  .habit-card__heatmap { padding: 0 16px 14px; }
}

@media (min-width: 900px) {
  /* On desktop: body switches to horizontal row */
  .habit-card__body {
    flex-direction: row;
    align-items: stretch;
  }

  /* Left panel — fixed width, vertical stack */
  .habit-card__left {
    flex: 0 0 300px;
    flex-direction: column;
    align-items: flex-start;
    padding: 20px 22px 18px;
    border-right: 1px solid var(--color-border);
    justify-content: space-between;
    gap: 14px;
  }

  .habit-card__identity {
    align-items: flex-start;
    flex: 1;
  }

  .habit-card__actions {
    align-self: flex-start;
  }

  /* Right panel — heatmap centered */
  .habit-card__heatmap {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px 24px;
  }

}

/* ── Connect section (full-width footer) ──────────────────── */
.habit-card__connect {
  border-top: 1px solid var(--color-border);
  padding: 10px 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.habit-card__connect-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.habit-card__connect-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  flex: 1;
  min-width: 0;
  align-items: center;
}

.habit-card__connect-hint {
  font-size: 11px;
  color: var(--color-text-muted);
  font-style: italic;
}

.habit-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 20px;
  white-space: nowrap;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.habit-chip--goal {
  background: color-mix(in srgb, #f59e0b 12%, transparent);
  color: #f59e0b;
  border: 1px solid color-mix(in srgb, #f59e0b 25%, transparent);
}

.habit-chip--learning {
  background: color-mix(in srgb, #6366f1 12%, transparent);
  color: #6366f1;
  border: 1px solid color-mix(in srgb, #6366f1 25%, transparent);
}

.habit-chip--training {
  background: color-mix(in srgb, #f97316 12%, transparent);
  color: #f97316;
  border: 1px solid color-mix(in srgb, #f97316 25%, transparent);
}

.habit-card__connect-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: color var(--t-fast), border-color var(--t-fast), background var(--t-fast);
}
.habit-card__connect-toggle:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}
.habit-card__connect-toggle--active {
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: var(--color-accent-muted);
}

/* Link picker panel */
.habit-card__link-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.habit-link-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.habit-link-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.habit-link-select {
  padding: 6px 10px;
  font-size: 13px;
  font-family: var(--font-sans);
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  cursor: pointer;
  transition: border-color var(--t-fast);
}
.habit-link-select:focus { border-color: var(--color-accent); }

.habit-link-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 2px;
}

.habit-link-btn {
  padding: 5px 14px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity var(--t-fast), background var(--t-fast);
}

.habit-link-btn--ghost {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}
.habit-link-btn--ghost:hover { background: var(--color-border); }

.habit-link-btn--primary {
  background: var(--color-accent);
  color: #fff;
}
.habit-link-btn--primary:hover { opacity: 0.88; }
</style>
