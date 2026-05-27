<script setup lang="ts">
import { ref } from 'vue'
import type { LearningPlan, LearningSession } from '../types'

const props = defineProps<{
  plan: LearningPlan
}>()

const emit = defineEmits<{
  submit: [data: Omit<LearningSession, 'id'>]
  cancel: []
}>()

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

function onOverlayKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('cancel')
}

function onPanelKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit()
}
</script>

<template>
  <div class="session-overlay" @keydown="onOverlayKeydown" @click.self="emit('cancel')">
    <div class="session-panel" @keydown="onPanelKeydown">
      <div class="session-panel__header">
        <span class="session-panel__emoji">{{ plan.coverEmoji }}</span>
        <div class="session-panel__heading">
          <span class="session-panel__eyebrow">Log session</span>
          <span class="session-panel__plan">{{ plan.title }}</span>
        </div>
        <button class="session-panel__close" @click="emit('cancel')" aria-label="Close">✕</button>
      </div>

      <div class="session-panel__body">
        <label class="session-panel__field">
          <span class="session-panel__label">Minutes spent</span>
          <input
            v-model.number="actualMinutes"
            type="number"
            min="1"
            max="480"
            class="session-panel__input session-panel__input--small"
          />
        </label>

        <label class="session-panel__field">
          <span class="session-panel__label">
            What did you study?
            <span class="session-panel__opt">optional</span>
          </span>
          <input
            v-model="topic"
            type="text"
            placeholder="e.g. Array methods, map / filter / reduce"
            class="session-panel__input"
            maxlength="120"
          />
        </label>

        <label class="session-panel__field">
          <span class="session-panel__label">
            Key takeaways
            <span class="session-panel__opt">optional</span>
          </span>
          <textarea
            v-model="notes"
            rows="3"
            placeholder="What did you learn? Any insights or questions?"
            class="session-panel__textarea"
            maxlength="600"
          />
        </label>

        <div class="session-panel__field">
          <span class="session-panel__label">Session quality</span>
          <div class="session-panel__stars">
            <button
              v-for="n in 5"
              :key="n"
              type="button"
              class="session-panel__star"
              :class="{ 'session-panel__star--on': n <= rating }"
              @click="rating = n as 1 | 2 | 3 | 4 | 5"
            >★</button>
          </div>
        </div>
      </div>

      <div class="session-panel__footer">
        <button class="session-panel__btn session-panel__btn--ghost" @click="emit('cancel')">
          Cancel
        </button>
        <button class="session-panel__btn session-panel__btn--primary" @click="submit">
          Log Session
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.session-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px;
}

.session-panel {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}

.session-panel__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--color-border);
}

.session-panel__emoji { font-size: 26px; flex-shrink: 0; }

.session-panel__heading {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.session-panel__eyebrow {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.session-panel__plan {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-panel__close {
  margin-left: auto;
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 15px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius);
  transition: color var(--t-fast);
}

.session-panel__close:hover { color: var(--color-text); }

.session-panel__body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.session-panel__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.session-panel__label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.session-panel__opt {
  font-weight: 400;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.session-panel__input {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 9px 12px;
  font-size: var(--text-sm);
  color: var(--color-text);
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
  transition: border-color var(--t-fast);
}

.session-panel__input--small { width: 96px; }

.session-panel__input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.session-panel__textarea {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 9px 12px;
  font-size: var(--text-sm);
  color: var(--color-text);
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
  resize: vertical;
  transition: border-color var(--t-fast);
}

.session-panel__textarea:focus {
  outline: none;
  border-color: var(--color-accent);
}

.session-panel__stars {
  display: flex;
  gap: 2px;
}

.session-panel__star {
  background: none;
  border: none;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  color: var(--color-border);
  padding: 2px;
  transition: color var(--t-fast), transform var(--t-fast);
}

.session-panel__star--on { color: var(--color-warning); }
.session-panel__star:hover { transform: scale(1.2); }

.session-panel__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px 20px;
  border-top: 1px solid var(--color-border);
}

.session-panel__btn {
  padding: 8px 18px;
  border-radius: var(--radius);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--t-fast);
  border: 1px solid transparent;
  font-family: inherit;
}

.session-panel__btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

.session-panel__btn--ghost:hover {
  color: var(--color-text);
}

.session-panel__btn--primary {
  background: var(--color-accent);
  color: #fff;
}

.session-panel__btn--primary:hover { background: var(--color-accent-hover); }

@media (max-width: 767px) {
  .session-overlay { align-items: flex-end; padding: 0; }
  .session-panel { border-radius: var(--radius-xl) var(--radius-xl) 0 0; max-width: 100%; }
}
</style>
