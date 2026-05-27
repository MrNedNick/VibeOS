<script setup lang="ts">
import { computed } from 'vue'
import type { Habit } from '../types'
import { computeStreak, todayStr } from '../types'
import HabitHeatmap from './HabitHeatmap.vue'

const props = defineProps<{
  habit: Habit
  doneToday: boolean
}>()

const emit = defineEmits<{
  toggle: [id: string]
  delete: [id: string]
}>()

const streak = computed(() => computeStreak(props.habit.completedDates))

const todayFormatted = computed(() => {
  return new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
})

const totalDays = computed(() => props.habit.completedDates.filter(d => d <= todayStr()).length)
</script>

<template>
  <div class="habit-card" :class="{ 'habit-card--done': doneToday }">
    <div class="habit-card__top">
      <div class="habit-card__identity">
        <span class="habit-card__emoji">{{ habit.emoji }}</span>
        <div class="habit-card__info">
          <span class="habit-card__name">{{ habit.name }}</span>
          <div class="habit-card__meta">
            <span v-if="streak > 0" class="habit-card__streak">
              🔥 {{ streak }} day{{ streak === 1 ? '' : 's' }}
            </span>
            <span v-else class="habit-card__streak habit-card__streak--zero">No streak yet</span>
            <span class="habit-card__total">{{ totalDays }} total</span>
          </div>
        </div>
      </div>

      <div class="habit-card__actions">
        <button
          class="habit-card__toggle"
          :class="{ 'habit-card__toggle--done': doneToday }"
          :title="doneToday ? `Undo for today (${todayFormatted})` : `Mark done for today (${todayFormatted})`"
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
          title="Delete habit"
          @click="emit('delete', habit.id)"
        >×</button>
      </div>
    </div>

    <div class="habit-card__heatmap">
      <HabitHeatmap :completed-dates="habit.completedDates" :weeks="16" />
    </div>
  </div>
</template>

<style scoped>
.habit-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 18px 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: border-color var(--t-fast);
}

.habit-card--done {
  border-color: color-mix(in srgb, var(--color-accent) 40%, var(--color-border));
}

.habit-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.habit-card__identity {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
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
}

.habit-card__name {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.habit-card__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

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
  padding-bottom: 2px;
}
</style>
