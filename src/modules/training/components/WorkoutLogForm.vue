<script setup lang="ts">
import { ref } from 'vue'
import type { TrainingPlan, WorkoutLog } from '../types'
import { FEELING_EMOJI } from '../types'

const props = defineProps<{
  plan: TrainingPlan
}>()

const emit = defineEmits<{
  submit: [data: Omit<WorkoutLog, 'id' | 'createdAt'>]
  cancel: []
}>()

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

function onOverlayKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('cancel')
}

function onPanelKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit()
}

const FEELINGS = ([1, 2, 3, 4, 5] as const).map(n => ({ val: n, emoji: FEELING_EMOJI[n] }))
</script>

<template>
  <div class="wlog-overlay" @keydown="onOverlayKeydown" @click.self="emit('cancel')">
    <div class="wlog-panel" @keydown="onPanelKeydown">

      <div class="wlog-panel__header">
        <span class="wlog-panel__emoji">{{ plan.coverEmoji }}</span>
        <div class="wlog-panel__heading">
          <span class="wlog-panel__eyebrow">Log workout</span>
          <span class="wlog-panel__plan">{{ plan.title }}</span>
        </div>
        <button class="wlog-panel__close" @click="emit('cancel')" aria-label="Close">✕</button>
      </div>

      <div class="wlog-panel__body">
        <label class="wlog-panel__field">
          <span class="wlog-panel__label">
            What did you do?
            <span class="wlog-panel__opt">defaults to plan name</span>
          </span>
          <input
            v-model="title"
            type="text"
            :placeholder="plan.title"
            class="wlog-panel__input"
            maxlength="80"
          />
        </label>

        <div class="wlog-panel__row">
          <label class="wlog-panel__field">
            <span class="wlog-panel__label">Duration (min)</span>
            <input
              v-model.number="duration"
              type="number"
              min="1"
              max="600"
              class="wlog-panel__input wlog-panel__input--sm"
            />
          </label>

          <label class="wlog-panel__field">
            <span class="wlog-panel__label">
              Distance (km)
              <span class="wlog-panel__opt">optional</span>
            </span>
            <input
              v-model="distance"
              type="number"
              min="0"
              step="0.1"
              max="999"
              placeholder="—"
              class="wlog-panel__input wlog-panel__input--sm"
            />
          </label>
        </div>

        <div class="wlog-panel__field">
          <span class="wlog-panel__label">How did it feel?</span>
          <div class="wlog-panel__feeling">
            <button
              v-for="f in FEELINGS"
              :key="f.val"
              type="button"
              class="wlog-panel__feel-btn"
              :class="{ 'wlog-panel__feel-btn--on': f.val === feeling }"
              @click="feeling = f.val"
            >{{ f.emoji }}</button>
          </div>
        </div>

        <label class="wlog-panel__field">
          <span class="wlog-panel__label">
            Notes
            <span class="wlog-panel__opt">optional</span>
          </span>
          <textarea
            v-model="notes"
            rows="2"
            placeholder="How'd it go? Any PRs, challenges, or notes?"
            class="wlog-panel__textarea"
            maxlength="400"
          />
        </label>
      </div>

      <div class="wlog-panel__footer">
        <button class="wlog-panel__btn wlog-panel__btn--ghost" @click="emit('cancel')">Cancel</button>
        <button class="wlog-panel__btn wlog-panel__btn--primary" @click="submit">Log Workout</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.wlog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px;
}

.wlog-panel {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}

.wlog-panel__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--color-border);
}

.wlog-panel__emoji { font-size: 26px; flex-shrink: 0; }

.wlog-panel__heading {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.wlog-panel__eyebrow {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.wlog-panel__plan {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wlog-panel__close {
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

.wlog-panel__close:hover { color: var(--color-text); }

.wlog-panel__body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wlog-panel__row {
  display: flex;
  gap: 16px;
}

.wlog-panel__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.wlog-panel__label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.wlog-panel__opt {
  font-weight: 400;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.wlog-panel__input {
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

.wlog-panel__input--sm { width: 96px; flex: none; }

.wlog-panel__input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.wlog-panel__textarea {
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

.wlog-panel__textarea:focus {
  outline: none;
  border-color: var(--color-accent);
}

.wlog-panel__feeling {
  display: flex;
  gap: 4px;
}

.wlog-panel__feel-btn {
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

.wlog-panel__feel-btn--on {
  opacity: 1;
  border-color: var(--color-border);
  background: var(--color-surface);
  transform: scale(1.15);
}

.wlog-panel__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px 20px;
  border-top: 1px solid var(--color-border);
}

.wlog-panel__btn {
  padding: 8px 18px;
  border-radius: var(--radius);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all var(--t-fast);
  font-family: inherit;
}

.wlog-panel__btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

.wlog-panel__btn--ghost:hover { color: var(--color-text); }

.wlog-panel__btn--primary {
  background: var(--color-accent);
  color: #fff;
}

.wlog-panel__btn--primary:hover { background: var(--color-accent-hover); }

@media (max-width: 767px) {
  .wlog-overlay { align-items: flex-end; padding: 0; }
  .wlog-panel { border-radius: var(--radius-xl) var(--radius-xl) 0 0; max-width: 100%; }
}
</style>
