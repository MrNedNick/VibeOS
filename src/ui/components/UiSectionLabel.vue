<script setup lang="ts">
withDefaults(defineProps<{
  /** HTML tag to render as */
  as?: string
  /** 'sm' = 11px / 'md' = 12px (default) */
  size?: 'sm' | 'md'
}>(), {
  as:   'p',
  size: 'md',
})
</script>

<template>
  <component
    :is="as"
    class="ui-section-label"
    :class="`ui-section-label--${size}`"
  >
    <slot />
  </component>
</template>

<style scoped>
.ui-section-label {
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.2;
  user-select: none;
}

.ui-section-label--md { font-size: var(--text-2xs); } /* 12px */
.ui-section-label--sm { font-size: 11px; }
</style>
