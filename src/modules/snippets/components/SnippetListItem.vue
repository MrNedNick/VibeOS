<script setup lang="ts">
import type { Snippet } from '../types'
import { getLanguageLabel } from '../types'

defineProps<{
  snippet: Snippet
  active: boolean
}>()
</script>

<template>
  <div class="snippet-item" :class="{ 'snippet-item--active': active }">
    <div class="snippet-item__header">
      <span class="snippet-item__title">{{ snippet.title }}</span>
      <span class="snippet-item__lang">{{ getLanguageLabel(snippet.language) }}</span>
    </div>
    <p v-if="snippet.code.trim()" class="snippet-item__preview">
      {{ snippet.code.split('\n')[0].trim() || snippet.code.trim().split('\n')[0] }}
    </p>
    <p v-else class="snippet-item__empty">Empty snippet</p>
  </div>
</template>

<style scoped>
.snippet-item {
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
  transition: background var(--t-fast);
}

.snippet-item:hover:not(.snippet-item--active) {
  background: var(--color-surface-elevated);
}

.snippet-item--active {
  background: var(--color-accent-muted);
}

.snippet-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 3px;
}

.snippet-item__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.snippet-item--active .snippet-item__title {
  color: var(--color-accent);
}

.snippet-item__lang {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  padding: 2px 6px;
  border-radius: 99px;
  flex-shrink: 0;
}

.snippet-item--active .snippet-item__lang {
  background: var(--color-accent-muted);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.snippet-item__preview,
.snippet-item__empty {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.snippet-item__empty { font-style: italic; font-family: inherit; }
</style>
