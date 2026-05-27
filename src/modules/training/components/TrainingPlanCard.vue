<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { TrainingPlan } from '../types'
import { useTrainingStore } from '../stores/training.store'

const props = defineProps<{
  plan: TrainingPlan
  loggedToday: boolean
}>()

const emit = defineEmits<{
  log: [planId: string]
}>()

const router = useRouter()
const store = useTrainingStore()

const streak = computed(() => store.getStreak(props.plan.id))
const totalMinutes = computed(() => store.getTotalMinutes(props.plan.id))
const totalKm = computed(() => store.getTotalKm(props.plan.id))
const totalHours = computed(() => Math.round((totalMinutes.value / 60) * 10) / 10)
const sessionCount = computed(() => store.getPlanLogs(props.plan.id).length)
</script>

<template>
  <div class="tplan-card" :class="{ 'tplan-card--done': loggedToday }">
    <div class="tplan-card__top">
      <button class="tplan-card__identity" @click="router.push(`/training/plans/${plan.id}`)">
        <span class="tplan-card__emoji">{{ plan.coverEmoji }}</span>
        <div class="tplan-card__info">
          <span class="tplan-card__title">{{ plan.title }}</span>
          <span class="tplan-card__meta">{{ plan.sessionsPerWeek }}× / week</span>
        </div>
      </button>
    </div>

    <div class="tplan-card__stats">
      <span class="tplan-card__stat">🔥 {{ streak }}d</span>
      <span class="tplan-card__stat">⏱ {{ totalHours }}h</span>
      <span v-if="totalKm > 0" class="tplan-card__stat">📍 {{ totalKm }} km</span>
      <span class="tplan-card__stat tplan-card__stat--end">{{ sessionCount }} sessions</span>
    </div>

    <div class="tplan-card__footer">
      <button
        v-if="loggedToday"
        class="tplan-card__action tplan-card__action--done"
        disabled
      >
        ✓ Done today
      </button>
      <button
        v-else
        class="tplan-card__action tplan-card__action--log"
        @click.stop="emit('log', plan.id)"
      >
        Log Workout
      </button>
    </div>
  </div>
</template>

<style scoped>
.tplan-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
}

.tplan-card:hover { box-shadow: var(--shadow-sm); }
.tplan-card--done { border-color: var(--color-success); }

.tplan-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.tplan-card__identity {
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  color: inherit;
  min-width: 0;
  flex: 1;
}

.tplan-card__identity:hover .tplan-card__title { color: var(--color-accent); }

.tplan-card__emoji { font-size: 28px; line-height: 1; flex-shrink: 0; }

.tplan-card__info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.tplan-card__title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--t-fast);
}

.tplan-card__meta {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.tplan-card__stats {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.tplan-card__stat {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.tplan-card__stat--end { margin-left: auto; color: var(--color-text-muted); }

.tplan-card__footer { display: flex; justify-content: flex-end; }

.tplan-card__action {
  padding: 7px 16px;
  border-radius: var(--radius);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all var(--t-fast);
  font-family: inherit;
}

.tplan-card__action--log { background: var(--color-accent); color: #fff; }
.tplan-card__action--log:hover { background: var(--color-accent-hover); }

.tplan-card__action--done {
  background: transparent;
  color: var(--color-success);
  border-color: var(--color-success);
  cursor: default;
  opacity: 0.75;
}

@media (max-width: 767px) {
  .tplan-card { padding: 16px; gap: 12px; }
  .tplan-card__emoji { font-size: 24px; }
}
</style>
