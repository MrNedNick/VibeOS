<script setup lang="ts">
import { ref } from 'vue'
import type { TrainingPlan, WorkoutLog } from '../types'
import { FEELING_EMOJI } from '../types'
import { UiModal, UiButton, UiIconButton, UiInput, UiTextarea } from '@/ui'

const props = defineProps<{
  plan: TrainingPlan
}>()

const emit = defineEmits<{
  submit: [data: Omit<WorkoutLog, 'id' | 'createdAt'>]
  cancel: []
}>()

const isOpen = ref(true)
const title = ref('')
const duration = ref(45)
const distance = ref<number | ''>('')
const feeling = ref<1 | 2 | 3 | 4 | 5>(4)
const notes = ref('')

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function submit() {
  emit('submit', {
    planId: props.plan.id,
    date: todayStr(),
    sportType: props.plan.sportType,
    title: title.value.trim() || props.plan.title,
    actualDuration: duration.value > 0 ? duration.value : undefined,
    actualDistance: distance.value !== '' && Number(distance.value) > 0
      ? Number(distance.value)
      : undefined,
    feeling: feeling.value,
    notes: notes.value.trim() || undefined,
  })
}

function onBodyKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit()
}

const FEELINGS = ([1, 2, 3, 4, 5] as const).map(n => ({ val: n, emoji: FEELING_EMOJI[n] }))
</script>

<template>
  <UiModal v-model:open="isOpen" size="sm" @close="emit('cancel')">
    <template #header>
      <div class="wlog-header">
        <span class="wlog-header__emoji">{{ plan.coverEmoji }}</span>
        <div class="wlog-header__text">
          <span class="wlog-header__eyebrow">Log workout</span>
          <span class="wlog-header__plan">{{ plan.title }}</span>
        </div>
        <UiIconButton name="X" aria-label="Close" @click="emit('cancel')" />
      </div>
    </template>

    <template #body>
      <div class="wlog-body" @keydown="onBodyKeydown">
        <div class="wlog-field">
          <span class="wlog-label">
            What did you do?
            <span class="wlog-opt">defaults to plan name</span>
          </span>
          <UiInput v-model="title" :placeholder="plan.title" :maxlength="80" />
        </div>

        <div class="wlog-row">
          <div class="wlog-field">
            <span class="wlog-label">Duration (min)</span>
            <!-- Number inputs — bespoke: type=number with min/max/step -->
            <input
              v-model.number="duration"
              type="number"
              min="1"
              max="600"
              class="wlog-input wlog-input--sm"
            />
          </div>
          <div class="wlog-field">
            <span class="wlog-label">
              Distance (km)
              <span class="wlog-opt">optional</span>
            </span>
            <input
              v-model="distance"
              type="number"
              min="0"
              step="0.1"
              max="999"
              placeholder="—"
              class="wlog-input wlog-input--sm"
            />
          </div>
        </div>

        <div class="wlog-field">
          <span class="wlog-label">How did it feel?</span>
          <!-- Feeling emoji — bespoke: emoji rating widget with opacity + scale -->
          <div class="wlog-feeling">
            <button
              v-for="f in FEELINGS"
              :key="f.val"
              type="button"
              class="wlog-feel-btn"
              :class="{ 'wlog-feel-btn--on': f.val === feeling }"
              @click="feeling = f.val"
            >{{ f.emoji }}</button>
          </div>
        </div>

        <div class="wlog-field">
          <span class="wlog-label">
            Notes
            <span class="wlog-opt">optional</span>
          </span>
          <UiTextarea
            v-model="notes"
            :rows="2"
            placeholder="How'd it go? Any PRs, challenges, or notes?"
            :maxlength="400"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <UiButton variant="ghost" @click="emit('cancel')">Cancel</UiButton>
      <UiButton @click="submit">Log Workout</UiButton>
    </template>
  </UiModal>
</template>

<style scoped>
.wlog-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wlog-header__emoji { font-size: 26px; flex-shrink: 0; }

.wlog-header__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.wlog-header__eyebrow {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.wlog-header__plan {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wlog-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wlog-row { display: flex; gap: 16px; }

.wlog-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.wlog-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.wlog-opt {
  font-weight: 400;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/* Number inputs — bespoke: type=number with specific sizing */
.wlog-input {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  font-size: var(--text-sm);
  color: var(--color-text);
  font-family: inherit;
  transition: border-color var(--t-fast);
  outline: none;
}
.wlog-input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 18%, transparent); }
.wlog-input--sm { width: 96px; flex: none; }

/* Feeling emoji — bespoke: opacity + scale interactive widget */
.wlog-feeling { display: flex; gap: 4px; }

.wlog-feel-btn {
  font-size: 24px;
  background: none;
  border: 1px solid transparent;
  border-radius: var(--radius);
  padding: 4px 8px;
  cursor: pointer;
  opacity: 0.4;
  transition: all var(--t-fast);
  line-height: 1;
}
.wlog-feel-btn--on {
  opacity: 1;
  border-color: var(--color-border);
  background: var(--color-surface-elevated);
  transform: scale(1.15);
}
</style>
