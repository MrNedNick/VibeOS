<script setup lang="ts">
import { UiIcon } from '../index'

withDefaults(defineProps<{
  /** Lucide icon name */
  icon?: string
  /** Emoji alternative to icon */
  emoji?: string
  title: string
  subtitle?: string
  /** Button label — emits 'action' when clicked */
  actionLabel?: string
}>(), {
  icon: 'Inbox',
})
</script>

<template>
  <div class="ui-empty">
    <div class="ui-empty__icon">
      <span v-if="emoji" class="ui-empty__emoji">{{ emoji }}</span>
      <UiIcon v-else :name="icon!" :size="28" :stroke-width="1.25" />
    </div>
    <p class="ui-empty__title">{{ title }}</p>
    <p v-if="subtitle" class="ui-empty__sub">{{ subtitle }}</p>
    <button v-if="actionLabel" class="ui-empty__btn" @click="$emit('action')">
      {{ actionLabel }}
    </button>
  </div>
</template>

<style scoped>
.ui-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 52px 20px;
  text-align: center;
}

.ui-empty__icon {
  color: var(--color-text-muted);
  margin-bottom: 4px;
}

.ui-empty__emoji {
  font-size: 36px;
  line-height: 1;
}

.ui-empty__title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0;
}

.ui-empty__sub {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
  max-width: 380px;
  line-height: var(--leading-lg);
}

.ui-empty__btn {
  margin-top: 6px;
  padding: 9px 22px;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--t-fast);
}
.ui-empty__btn:hover { opacity: 0.88; }
</style>
