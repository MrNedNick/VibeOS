<script setup lang="ts">
// Single color swatch — renders the actual color via its CSS var.
defineProps<{
  role: string
  cssVar: string
}>()
</script>

<template>
  <div class="swatch">
    <div class="swatch__box" :style="{ background: `var(${cssVar})` }" />
    <div class="swatch__role">{{ role }}</div>
    <code class="swatch__var">{{ cssVar }}</code>
  </div>
</template>

<style scoped>
.swatch {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.swatch__box {
  height: 64px;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
}

.swatch__role {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text);
}

.swatch__var {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--color-text-muted);
  word-break: break-all;
}
</style>
