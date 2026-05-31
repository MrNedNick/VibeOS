<script setup lang="ts">
import { computed } from 'vue'
import { useAchievementsStore, ACHIEVEMENTS } from '@/core/stores/achievements.store'
import { UiIcon } from '@/ui'

const store = useAchievementsStore()

const items = computed(() =>
  ACHIEVEMENTS.map(a => ({ ...a, unlocked: store.isUnlocked(a.id) }))
)

const unlockedCount = computed(() => items.value.filter(a => a.unlocked).length)
</script>

<template>
  <div class="ach-panel">
    <div class="ach-panel__header">
      <span class="ach-panel__title">Achievements</span>
      <span class="ach-panel__score">{{ unlockedCount }}/{{ items.length }}</span>
    </div>

    <!-- Progress bar -->
    <div class="ach-panel__progress">
      <div
        class="ach-panel__progress-fill"
        :style="{ width: (unlockedCount / items.length * 100) + '%' }"
      />
    </div>

    <!-- Achievement grid -->
    <div class="ach-panel__grid">
      <div
        v-for="a in items"
        :key="a.id"
        class="ach-item"
        :class="{ 'ach-item--locked': !a.unlocked }"
        :title="a.unlocked ? a.title + ' — ' + a.description : a.description + ' (locked)'"
      >
        <span class="ach-item__icon">{{ a.icon }}</span>
        <span class="ach-item__title">{{ a.title }}</span>
        <span v-if="a.unlocked" class="ach-item__check">
          <UiIcon name="Check" :size="10" :stroke-width="3" />
        </span>
        <span v-else class="ach-item__lock">
          <UiIcon name="Lock" :size="10" :stroke-width="2" />
        </span>
      </div>
    </div>

    <!-- Motivational message -->
    <p v-if="unlockedCount === 0" class="ach-panel__hint">
      Complete tasks, log habits, create goals — achievements unlock automatically.
    </p>
    <p v-else-if="unlockedCount === items.length" class="ach-panel__hint ach-panel__hint--done">
      🎉 All achievements unlocked — you're a Life OS power user!
    </p>
    <p v-else class="ach-panel__hint">
      {{ items.length - unlockedCount }} more to unlock. Keep going!
    </p>
  </div>
</template>

<style scoped>
.ach-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ach-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ach-panel__title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-secondary);
}

.ach-panel__score {
  font-size: 13px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--color-accent);
}

.ach-panel__progress {
  height: 4px;
  background: var(--color-surface-elevated);
  border-radius: 2px;
  overflow: hidden;
}

.ach-panel__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), #f59e0b);
  border-radius: 2px;
  transition: width 0.5s ease;
  min-width: 0;
}

.ach-panel__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.ach-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  position: relative;
  transition: border-color var(--t-fast);
}

.ach-item:not(.ach-item--locked) {
  border-color: color-mix(in srgb, #f59e0b 30%, var(--color-border));
  background: color-mix(in srgb, #f59e0b 5%, var(--color-surface-elevated));
}

.ach-item--locked {
  opacity: 0.45;
  filter: grayscale(0.5);
}

.ach-item__icon {
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
}

.ach-item__title {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ach-item__check {
  color: #f59e0b;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.ach-item__lock {
  color: var(--color-text-muted);
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.ach-panel__hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
  font-style: italic;
  text-align: center;
}

.ach-panel__hint--done {
  color: var(--color-success);
  font-style: normal;
  font-weight: 500;
}
</style>
