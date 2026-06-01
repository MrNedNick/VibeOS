<script setup lang="ts">
// Two-column row: role/label + spec on the left, a live sample on the right.
// Used by Typography (rendered text) and reusable for any "spec + preview" row.
defineProps<{
  label: string
  meta?: string
}>()
</script>

<template>
  <div class="token-row">
    <div class="token-row__info">
      <div class="token-row__label">{{ label }}</div>
      <code v-if="meta" class="token-row__meta">{{ meta }}</code>
    </div>
    <div class="token-row__sample">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.token-row {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 20px;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--color-border-subtle);
}
.token-row:last-child { border-bottom: none; }

.token-row__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.token-row__label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
}

.token-row__meta {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--color-text-muted);
}

.token-row__sample {
  min-width: 0;
  color: var(--color-text);
  overflow: hidden;
}

@media (max-width: 767px) {
  .token-row { grid-template-columns: 1fr; gap: 8px; }
}
</style>
