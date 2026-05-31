<script setup lang="ts">
import { useRouter } from 'vue-router'
import UiIcon from './UiIcon.vue'

defineProps<{
  icon: string
  title: string
  description: string
  sprint: string
  features: string[]
}>()

const router = useRouter()
</script>

<template>
  <div class="planned-view">
    <div class="planned-view__card">
      <div class="planned-view__icon">
        <UiIcon :name="icon" :size="32" :stroke-width="1.4" />
      </div>
      <h1 class="planned-view__title">{{ title }}</h1>
      <p class="planned-view__description">{{ description }}</p>

      <ul class="planned-view__features">
        <li v-for="feature in features" :key="feature" class="planned-view__feature">
          <UiIcon name="Check" :size="14" :stroke-width="2" class="planned-view__check" />
          {{ feature }}
        </li>
      </ul>

      <div class="planned-view__meta">
        <span class="planned-view__badge">{{ sprint }}</span>
        <span class="planned-view__eta">Planned</span>
      </div>

      <button class="planned-view__back" @click="router.push('/')">
        <UiIcon name="ArrowLeft" :size="14" :stroke-width="1.75" />
        Back to Dashboard
      </button>
    </div>
  </div>
</template>

<style scoped>
.planned-view {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.planned-view__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 480px;
  gap: 16px;
}

.planned-view__icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: var(--color-accent-muted);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.planned-view__title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.02em;
}

.planned-view__description {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: var(--leading-base);
  margin: 0;
}

.planned-view__features {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  width: 100%;
}

.planned-view__feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.planned-view__check {
  color: var(--color-accent);
  flex-shrink: 0;
}

.planned-view__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.planned-view__badge {
  font-size: var(--text-2xs);
  font-weight: 700;
  font-family: var(--font-mono);
  background: var(--color-accent-muted);
  color: var(--color-accent);
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  letter-spacing: 0.04em;
}

.planned-view__eta {
  font-size: var(--text-2xs);
  color: var(--color-text-muted);
  font-weight: 500;
}

.planned-view__back {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: background var(--t-fast), color var(--t-fast);
  margin-top: 8px;
}

.planned-view__back:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

@media (max-width: 767px) {
  .planned-view { padding: 24px 16px; }
  .planned-view__title { font-size: 22px; }
}
</style>
