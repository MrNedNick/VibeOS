<script setup lang="ts">
import { ref } from 'vue'
import type { LearningPlan, LearningSession } from '../types'
import { UiModal, UiButton, UiIconButton, UiInput, UiTextarea } from '@/ui'

const props = defineProps<{
  plan: LearningPlan
}>()

const emit = defineEmits<{
  submit: [data: Omit<LearningSession, 'id'>]
  cancel: []
}>()

const isOpen = ref(true)
const actualMinutes = ref(props.plan.minutesPerSession)
const topic = ref('')
const notes = ref('')
const rating = ref<1 | 2 | 3 | 4 | 5>(3)

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function submit() {
  if (actualMinutes.value < 1) return
  emit('submit', {
    planId: props.plan.id,
    date: todayStr(),
    status: 'completed',
    plannedMinutes: props.plan.minutesPerSession,
    actualMinutes: actualMinutes.value,
    topic: topic.value.trim() || undefined,
    notes: notes.value.trim() || undefined,
    rating: rating.value,
  })
}

function onBodyKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit()
}
</script>

<template>
  <UiModal v-model:open="isOpen" size="sm" @close="emit('cancel')">
    <template #header>
      <div class="session-header">
        <span class="session-header__emoji">{{ plan.coverEmoji }}</span>
        <div class="session-header__text">
          <span class="session-header__eyebrow">Log session</span>
          <span class="session-header__plan">{{ plan.title }}</span>
        </div>
        <UiIconButton name="X" aria-label="Close" @click="emit('cancel')" />
      </div>
    </template>

    <template #body>
      <div class="session-body" @keydown="onBodyKeydown">
        <div class="session-field">
          <span class="session-label">Minutes spent</span>
          <!-- Number input — bespoke: type=number with min/max, not a text UiInput -->
          <input
            v-model.number="actualMinutes"
            type="number"
            min="1"
            max="480"
            class="session-input session-input--sm"
          />
        </div>

        <div class="session-field">
          <span class="session-label">
            What did you study?
            <span class="session-opt">optional</span>
          </span>
          <UiInput
            v-model="topic"
            placeholder="e.g. Array methods, map / filter / reduce"
            :maxlength="120"
          />
        </div>

        <div class="session-field">
          <span class="session-label">
            Key takeaways
            <span class="session-opt">optional</span>
          </span>
          <UiTextarea
            v-model="notes"
            :rows="3"
            placeholder="What did you learn? Any insights or questions?"
            :maxlength="600"
          />
        </div>

        <div class="session-field">
          <span class="session-label">Session quality</span>
          <!-- Star rating — bespoke: interactive rating widget -->
          <div class="session-stars">
            <button
              v-for="n in 5"
              :key="n"
              type="button"
              class="session-star"
              :class="{ 'session-star--on': n <= rating }"
              @click="rating = n as 1 | 2 | 3 | 4 | 5"
            >★</button>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <UiButton variant="ghost" @click="emit('cancel')">Cancel</UiButton>
      <UiButton @click="submit">Log Session</UiButton>
    </template>
  </UiModal>
</template>

<style scoped>
.session-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.session-header__emoji { font-size: 26px; flex-shrink: 0; }

.session-header__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.session-header__eyebrow {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.session-header__plan {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.session-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.session-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.session-opt {
  font-weight: 400;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/* Number input — bespoke: type=number with specific sizing */
.session-input {
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
.session-input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 18%, transparent); }
.session-input--sm { width: 96px; }

/* Star rating — bespoke interactive widget */
.session-stars { display: flex; gap: 2px; }

.session-star {
  background: none;
  border: none;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  color: var(--color-border);
  padding: 2px;
  transition: color var(--t-fast), transform var(--t-fast);
}
.session-star--on { color: var(--color-warning); }
.session-star:hover { transform: scale(1.2); }
</style>
