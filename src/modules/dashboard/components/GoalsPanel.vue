<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { calcProgress, daysUntil, CATEGORY_LABEL } from '@/modules/goals/types'
import { UiIcon, UiSectionLabel, UiButton } from '@/ui'

const router     = useRouter()
const goalsStore = useGoalsStore()

const activeGoals = computed(() => goalsStore.activeGoals)

const completedGoals = computed(() =>
  goalsStore.goals.filter(g => g.status === 'completed'),
)

function progressColor(pct: number): string {
  if (pct >= 80) return 'var(--color-success)'
  if (pct >= 40) return 'var(--color-accent)'
  return 'var(--color-warning)'
}

function dueSoon(targetDate?: string): boolean {
  if (!targetDate) return false
  return daysUntil(targetDate) <= 7
}

function dueLabel(targetDate?: string): string {
  if (!targetDate) return ''
  const d = daysUntil(targetDate)
  if (d < 0)  return `${Math.abs(d)}d overdue`
  if (d === 0) return 'Due today'
  if (d === 1) return '1 day left'
  return `${d}d left`
}
</script>

<template>
  <div class="goals-panel">
    <div class="goals-panel__header">
      <UiSectionLabel as="span">Active Goals</UiSectionLabel>
      <UiButton variant="ghost" size="sm" @click="router.push('/goals')">
        View all <UiIcon name="ArrowRight" :size="12" />
      </UiButton>
    </div>

    <!-- Empty state -->
    <div v-if="activeGoals.length === 0" class="goals-panel__empty">
      <UiIcon name="Target" :size="28" class="goals-panel__empty-icon" />
      <p>No active goals yet.</p>
      <UiButton @click="router.push('/goals')">Create a goal</UiButton>
    </div>

    <!-- Goals list -->
    <div v-else class="goals-panel__list">
      <div
        v-for="goal in activeGoals"
        :key="goal.id"
        class="goal-row"
        @click="router.push(`/goals/${goal.id}`)"
      >
        <!-- Emoji + info -->
        <div class="goal-row__left">
          <span class="goal-row__emoji">{{ goal.coverEmoji }}</span>
          <div class="goal-row__info">
            <span class="goal-row__title">{{ goal.title }}</span>
            <span class="goal-row__meta">
              <span class="goal-row__cat">{{ CATEGORY_LABEL[goal.category] }}</span>
              <span
                v-if="goal.targetDate"
                class="goal-row__due"
                :class="{ 'goal-row__due--soon': dueSoon(goal.targetDate) }"
              >{{ dueLabel(goal.targetDate) }}</span>
            </span>
          </div>
        </div>

        <!-- Progress -->
        <div class="goal-row__right">
          <span
            class="goal-row__pct"
            :style="{ color: progressColor(calcProgress(goal)) }"
          >{{ calcProgress(goal) }}%</span>
          <!-- Milestone sub-bar -->
          <div class="goal-row__bar-wrap">
            <div
              class="goal-row__bar"
              :style="{
                width: calcProgress(goal) + '%',
                background: progressColor(calcProgress(goal)),
              }"
            />
          </div>
          <span class="goal-row__milestones">
            {{ goal.milestones.filter(m => m.completed).length }}/{{ goal.milestones.length }}
          </span>
        </div>
      </div>
    </div>

    <!-- Footer stats -->
    <div v-if="completedGoals.length > 0" class="goals-panel__footer">
      <UiIcon name="CheckCircle2" :size="12" />
      {{ completedGoals.length }} goal{{ completedGoals.length !== 1 ? 's' : '' }} completed
    </div>
  </div>
</template>

<style scoped>
.goals-panel {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.goals-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}


.goals-panel__all {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-accent);
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  transition: background var(--t-fast);
}
.goals-panel__all:hover { background: var(--color-accent-muted); }

/* Empty */
.goals-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
  text-align: center;
  color: var(--color-text-muted);
}
.goals-panel__empty-icon { opacity: 0.4; }
.goals-panel__empty p { font-size: 14px; margin: 0; }
.goals-panel__empty-btn {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-accent);
  padding: 4px 12px;
  border: 1px solid var(--color-accent-muted);
  border-radius: var(--radius-sm);
  background: var(--color-accent-muted);
  cursor: pointer;
  transition: opacity var(--t-fast);
}
.goals-panel__empty-btn:hover { opacity: 0.8; }

/* Goals list */
.goals-panel__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.goal-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background var(--t-fast);
}
.goal-row:hover { background: var(--color-surface-elevated); }

.goal-row__left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.goal-row__emoji {
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
}

.goal-row__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.goal-row__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.goal-row__meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.goal-row__cat {
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: capitalize;
}

.goal-row__due {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}
.goal-row__due--soon { color: var(--color-warning); }

.goal-row__right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.goal-row__pct {
  font-size: 13px;
  font-weight: 700;
  font-family: var(--font-mono);
  min-width: 36px;
  text-align: right;
}

.goal-row__bar-wrap {
  width: 60px;
  height: 4px;
  background: var(--color-surface-elevated);
  border-radius: 2px;
  overflow: hidden;
}

.goal-row__bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.4s ease;
  min-width: 2px;
}

.goal-row__milestones {
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  min-width: 28px;
  text-align: right;
}

/* Footer */
.goals-panel__footer {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--color-success);
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
}
</style>
