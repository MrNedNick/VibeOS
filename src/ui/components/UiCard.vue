<script setup lang="ts">
withDefaults(defineProps<{
  /** Inner padding preset */
  padding?:   'none' | 'sm' | 'md' | 'lg'
  /** Adds hover border + shadow lift */
  hoverable?: boolean
  /** Adds cursor:pointer + hover styles (implies hoverable) */
  clickable?: boolean
  /** Surface elevation — 'base' uses --color-surface, 'raised' uses --color-surface-elevated */
  surface?:   'base' | 'raised'
  /** HTML tag to render */
  as?:        string
}>(), {
  padding:   'md',
  hoverable: false,
  clickable: false,
  surface:   'base',
  as:        'div',
})
</script>

<template>
  <component
    :is="as"
    class="ui-card"
    :class="[
      `ui-card--pad-${padding}`,
      `ui-card--surface-${surface}`,
      {
        'ui-card--hoverable': hoverable || clickable,
        'ui-card--clickable': clickable,
      },
    ]"
  >
    <slot />
  </component>
</template>

<style scoped>
.ui-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
}

/* Surface */
.ui-card--surface-base   { background: var(--color-surface); }
.ui-card--surface-raised { background: var(--color-surface-elevated); box-shadow: var(--shadow-1); }

/* Padding */
.ui-card--pad-none { padding: 0; gap: 0; }
.ui-card--pad-sm   { padding: 12px 14px; gap: 8px; }
.ui-card--pad-md   { padding: 16px 18px; gap: 12px; }
.ui-card--pad-lg   { padding: 22px 24px; gap: 16px; }

/* Hoverable */
.ui-card--surface-base.ui-card--hoverable:hover {
  background: color-mix(in srgb, var(--color-accent) var(--hover-tint-pct, 7%), var(--color-surface));
  border-color: var(--color-accent);
  box-shadow: var(--shadow-2);
}
.ui-card--surface-raised.ui-card--hoverable:hover {
  background: color-mix(in srgb, var(--color-accent) var(--hover-tint-pct, 7%), var(--color-surface-elevated));
  border-color: var(--color-accent);
  box-shadow: var(--shadow-2);
}

/* Clickable */
.ui-card--clickable {
  cursor: pointer;
  user-select: none;
}
.ui-card--clickable:active {
  transform: translateY(1px);
  box-shadow: var(--shadow-0);
}
</style>
