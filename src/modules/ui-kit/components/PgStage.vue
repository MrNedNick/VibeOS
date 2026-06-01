<script setup lang="ts">
// Playground wrapper: a live stage on the left, optional controls on the right,
// and an optional readout line below. The stage renders the REAL @/ui component.
defineProps<{
  hint?: string
  readout?: string
}>()
</script>

<template>
  <div class="pg">
    <p v-if="hint" class="pg__hint">{{ hint }}</p>
    <div class="pg__body">
      <div class="pg__stage">
        <slot name="stage" />
      </div>
      <div v-if="$slots.controls" class="pg__controls">
        <slot name="controls" />
      </div>
    </div>
    <code v-if="readout" class="pg__readout">{{ readout }}</code>
  </div>
</template>

<style scoped>
.pg {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  padding: 18px;
  box-shadow: var(--shadow-1);
}

.pg__hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin: 0;
}

.pg__body {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

.pg__stage {
  flex: 1;
  min-width: 0;
  min-height: 96px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--color-text-muted) 6%, transparent);
}

.pg__controls {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pg__readout {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);
  padding: 6px 10px;
  border-radius: var(--radius-xs);
  align-self: flex-start;
}

@media (max-width: 767px) {
  .pg__body { flex-direction: column; }
  .pg__controls { width: 100%; }
}
</style>
