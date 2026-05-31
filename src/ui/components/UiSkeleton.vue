<script setup lang="ts">
withDefaults(defineProps<{
  width?:   string
  height?:  string
  rounded?: 'none' | 'sm' | 'md' | 'full'
  inline?:  boolean
}>(), {
  width:   '100%',
  height:  '1em',
  rounded: 'md',
  inline:  false,
})
</script>

<template>
  <span
    class="ui-skeleton"
    :class="[`ui-skeleton--rounded-${rounded}`, { 'ui-skeleton--inline': inline }]"
    :style="{ width, height }"
    aria-hidden="true"
  />
</template>

<style scoped>
.ui-skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    var(--color-surface-elevated) 0%,
    var(--color-border)            50%,
    var(--color-surface-elevated) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
  flex-shrink: 0;
}

.ui-skeleton--inline { display: inline-block; }

.ui-skeleton--rounded-none { border-radius: 0; }
.ui-skeleton--rounded-sm   { border-radius: var(--radius-xs); }
.ui-skeleton--rounded-md   { border-radius: var(--radius-sm); }
.ui-skeleton--rounded-full { border-radius: 9999px; }

@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
