<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { LearningPlan } from '../types'
import { estimateTargetDate } from '../types'
import { useLearningStore } from '../stores/learning.store'
import ProgressRing from './ProgressRing.vue'

const props = defineProps<{
  plan: LearningPlan
  loggedToday: boolean
}>()

const emit = defineEmits<{
  log: [planId: string]
}>()

const router = useRouter()
const store = useLearningStore()

const progress = computed(() => store.getProgress(props.plan.id))
const streak = computed(() => store.getStreak(props.plan.id))
const hoursLogged = computed(() => store.getHoursLogged(props.plan.id))
const targetDate = computed(() => estimateTargetDate(props.plan))

function formatShortDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

function openDetail() {
  router.push(`/learning/plans/${props.plan.id}`)
}
</script>

<template>
  <div class="plan-card" :class="{ 'plan-card--done': loggedToday }">
    <div class="plan-card__top">
      <button class="plan-card__identity" @click="openDetail">
        <span class="plan-card__emoji">{{ plan.coverEmoji }}</span>
        <div class="plan-card__info">
          <span class="plan-card__title">{{ plan.title }}</span>
          <span class="plan-card__meta">
            {{ plan.minutesPerSession }} min/day · {{ plan.targetHours }}h total
          </span>
        </div>
      </button>
      <ProgressRing :progress="progress" :size="54" :stroke-width="5" />
    </div>

    <div class="plan-card__stats">
      <span class="plan-card__stat">🔥 {{ streak }}d</span>
      <span class="plan-card__stat">⏱ {{ hoursLogged }}h / {{ plan.targetHours }}h</span>
      <span class="plan-card__stat plan-card__stat--end">{{ formatShortDate(targetDate) }}</span>
    </div>

    <div class="plan-card__bar">
      <div class="plan-card__bar-fill" :style="{ width: progress + '%' }" />
    </div>

    <div class="plan-card__footer">
      <button
        v-if="loggedToday"
        class="plan-card__action plan-card__action--done"
        disabled
      >
        ✓ Done today
      </button>
      <button
        v-else
        class="plan-card__action plan-card__action--log"
        @click.stop="emit('log', plan.id)"
      >
        Log Session
      </button>
    </div>
  </div>
</template>

<style scoped>
.plan-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
  box-shadow: var(--shadow-1);
}

.plan-card:hover {
  border-color: color-mix(in srgb, var(--color-accent) 50%, var(--color-border));
  box-shadow: var(--shadow-2);
}

.plan-card--done {
  border-color: var(--color-success);
}

.plan-card--done .plan-card__bar-fill {
  background: var(--color-success);
}

.plan-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.plan-card__identity {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
  color: inherit;
}

.plan-card__identity:hover .plan-card__title {
  color: var(--color-accent);
}

.plan-card__emoji {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
}

.plan-card__info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.plan-card__title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--t-fast);
}

.plan-card__meta {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.plan-card__stats {
  display: flex;
  align-items: center;
  gap: 14px;
}

.plan-card__stat {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.plan-card__stat--end {
  margin-left: auto;
  color: var(--color-text-muted);
}

.plan-card__bar {
  height: 5px;
  background: var(--color-surface-elevated);
  border-radius: 99px;
  overflow: hidden;
}

.plan-card__bar-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: 99px;
  transition: width 0.6s var(--ease);
  min-width: 0;
}

.plan-card__footer {
  display: flex;
  justify-content: flex-end;
}

.plan-card__action {
  padding: 7px 16px;
  border-radius: var(--radius);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all var(--t-fast);
  font-family: inherit;
}

.plan-card__action--log {
  background: var(--color-accent);
  color: #fff;
}

.plan-card__action--log:hover { background: var(--color-accent-hover); }

.plan-card__action--done {
  background: transparent;
  color: var(--color-success);
  border-color: var(--color-success);
  cursor: default;
  opacity: 0.75;
}

@media (max-width: 767px) {
  .plan-card {
    padding: 16px;
    gap: 12px;
  }

  .plan-card__emoji { font-size: 24px; }
}
</style>
