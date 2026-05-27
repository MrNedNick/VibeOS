<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Goal } from '../types'
import { calcProgress, daysUntil, CATEGORY_LABEL } from '../types'
const props = defineProps<{ goal: Goal }>()

const router = useRouter()

const progress = computed(() => calcProgress(props.goal))
const milestoneDone = computed(() => props.goal.milestones.filter(m => m.completed).length)
const milestoneTotal = computed(() => props.goal.milestones.length)

const dueLabel = computed(() => {
  if (!props.goal.targetDate) return null
  const days = daysUntil(props.goal.targetDate)
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, overdue: true }
  if (days === 0) return { text: 'Due today', overdue: true }
  if (days === 1) return { text: 'Tomorrow', overdue: false }
  if (days <= 7) return { text: `${days}d left`, overdue: false }
  return {
    text: new Date(props.goal.targetDate + 'T00:00:00').toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short',
    }),
    overdue: false,
  }
})
</script>

<template>
  <div
    class="goal-card"
    :class="{ 'goal-card--completed': goal.status === 'completed' }"
    @click="router.push(`/goals/${goal.id}`)"
  >
    <div class="goal-card__top">
      <span class="goal-card__emoji">{{ goal.coverEmoji }}</span>
      <div class="goal-card__info">
        <span class="goal-card__title">{{ goal.title }}</span>
        <div class="goal-card__badges">
          <span class="goal-card__category">{{ CATEGORY_LABEL[goal.category] }}</span>
          <span
            v-if="dueLabel"
            class="goal-card__due"
            :class="{ 'goal-card__due--overdue': dueLabel.overdue }"
          >{{ dueLabel.text }}</span>
        </div>
      </div>
      <span class="goal-card__pct">{{ progress }}%</span>
    </div>

    <div class="goal-card__bar">
      <div class="goal-card__bar-fill" :style="{ width: progress + '%' }" />
    </div>

    <div v-if="milestoneTotal > 0" class="goal-card__milestones">
      {{ milestoneDone }} / {{ milestoneTotal }} milestones
    </div>
  </div>
</template>

<style scoped>
.goal-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
}

.goal-card:hover { box-shadow: var(--shadow-sm); }
.goal-card--completed { opacity: 0.65; }

.goal-card__top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.goal-card__emoji { font-size: 26px; line-height: 1; flex-shrink: 0; margin-top: 1px; }

.goal-card__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.goal-card__title {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goal-card__badges {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.goal-card__category {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  padding: 1px 7px;
}

.goal-card__due {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.goal-card__due--overdue { color: var(--color-danger); }

.goal-card__pct {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-accent);
  flex-shrink: 0;
}

.goal-card__bar {
  height: 5px;
  background: var(--color-border);
  border-radius: 99px;
  overflow: hidden;
}

.goal-card__bar-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: 99px;
  transition: width 0.5s var(--ease);
}

.goal-card--completed .goal-card__bar-fill { background: var(--color-success); }

.goal-card__milestones {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
</style>
