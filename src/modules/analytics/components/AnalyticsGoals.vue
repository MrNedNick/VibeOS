<script setup lang="ts">
import { computed } from 'vue'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { useLocale } from '@/core/i18n'
import { UiSectionLabel, UiProgressBar } from '@/ui'

const goalsStore = useGoalsStore()
const i18n       = useLocale()

const goalsProgress = computed(() =>
  goalsStore.activeGoals.map(g => ({ ...g, progress: goalsStore.getProgress(g.id) })),
)
</script>

<template>
  <section class="analytics__section analytics__section--last">
    <UiSectionLabel as="h2" class="analytics__section-label">{{ i18n.t('analytics.goalsTitle') }}</UiSectionLabel>

    <div v-if="goalsStore.goals.length === 0" class="empty-state">{{ i18n.t('analytics.goalsEmpty') }}</div>

    <div v-else class="goals-list">
      <div v-for="g in goalsProgress" :key="g.id" class="goal-item">
        <div class="goal-item__header">
          <span class="goal-item__title">{{ g.title }}</span>
          <span class="goal-item__pct">{{ g.progress }}%</span>
        </div>
        <UiProgressBar :value="g.progress" />
        <div v-if="g.targetDate" class="goal-item__date">{{ g.targetDate }}</div>
      </div>
      <div v-if="goalsStore.completedGoals.length > 0" class="goals-completed-badge">
        ✓ {{ goalsStore.completedGoals.length }} {{ i18n.t('analytics.goalsCompleted') }}
      </div>
    </div>
  </section>
</template>

<style scoped>
.analytics__section { display: flex; flex-direction: column; gap: 16px; }
.analytics__section--last { padding-bottom: 40px; }
.analytics__section-label { margin-bottom: 0; }
.empty-state { font-size: 13px; color: var(--color-text-muted); padding: 8px 0; }

.goals-list { display: flex; flex-direction: column; gap: 12px; }
.goal-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.goal-item__header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.goal-item__title { font-size: 14px; font-weight: 600; color: var(--color-text); }
.goal-item__pct { font-size: 14px; font-weight: 700; font-family: var(--font-mono); color: var(--color-accent); }
.goal-item__date { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); }

.goals-completed-badge {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-success);
  padding: 8px 14px;
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-success) 25%, transparent);
  border-radius: var(--radius-sm);
}
</style>
