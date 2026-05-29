<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** 0–100 */
  progress: number
  /** SVG size in px */
  size?: number
  /** Ring stroke width */
  strokeWidth?: number
  /** Override ring colour (CSS color/var) */
  color?: string
  /** Show the % label inside — pass false to hide */
  showLabel?: boolean
  /** Custom label text (overrides "XX%") */
  label?: string
}>(), {
  size: 56,
  strokeWidth: 5,
  showLabel: true,
})

const SIZE   = computed(() => props.size)
const STROKE = computed(() => props.strokeWidth)
const RADIUS = computed(() => (SIZE.value - STROKE.value) / 2)
const CIRC   = computed(() => 2 * Math.PI * RADIUS.value)
const offset = computed(() =>
  CIRC.value * (1 - Math.min(100, Math.max(0, props.progress)) / 100)
)
const center = computed(() => SIZE.value / 2)

const displayLabel = computed(() =>
  props.label !== undefined ? props.label : `${Math.round(props.progress)}%`
)
</script>

<template>
  <svg
    :width="SIZE"
    :height="SIZE"
    class="ui-ring"
    :aria-label="`${progress}% complete`"
    role="img"
  >
    <!-- Track -->
    <circle
      :cx="center"
      :cy="center"
      :r="RADIUS"
      :stroke-width="STROKE"
      fill="none"
      class="ui-ring__track"
    />
    <!-- Progress arc -->
    <circle
      :cx="center"
      :cy="center"
      :r="RADIUS"
      :stroke-width="STROKE"
      fill="none"
      stroke-linecap="round"
      class="ui-ring__arc"
      :style="{
        strokeDasharray: CIRC,
        strokeDashoffset: offset,
        transformOrigin: 'center',
        transform: 'rotate(-90deg)',
        stroke: color ?? 'var(--color-accent)',
      }"
    />
    <!-- Label -->
    <text
      v-if="showLabel"
      :x="center"
      :y="center"
      text-anchor="middle"
      dominant-baseline="central"
      class="ui-ring__label"
      :style="{ fontSize: `${Math.max(9, SIZE / 5.5)}px` }"
    >{{ displayLabel }}</text>
  </svg>
</template>

<style scoped>
.ui-ring { flex-shrink: 0; }

.ui-ring__track {
  stroke: var(--color-border);
}

.ui-ring__arc {
  transition: stroke-dashoffset 0.6s var(--ease, ease);
}

.ui-ring__label {
  fill: var(--color-text-secondary);
  font-weight: 600;
  font-family: inherit;
}
</style>
