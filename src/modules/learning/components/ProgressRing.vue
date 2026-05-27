<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  progress: number
  size?: number
  strokeWidth?: number
}>()

const SIZE = computed(() => props.size ?? 56)
const STROKE = computed(() => props.strokeWidth ?? 5)
const RADIUS = computed(() => (SIZE.value - STROKE.value) / 2)
const CIRC = computed(() => 2 * Math.PI * RADIUS.value)
const offset = computed(() => CIRC.value * (1 - Math.min(100, Math.max(0, props.progress)) / 100))
const center = computed(() => SIZE.value / 2)
</script>

<template>
  <svg
    :width="SIZE"
    :height="SIZE"
    class="progress-ring"
    :aria-label="`${progress}% complete`"
    role="img"
  >
    <circle
      :cx="center"
      :cy="center"
      :r="RADIUS"
      :stroke-width="STROKE"
      fill="none"
      class="progress-ring__track"
    />
    <circle
      :cx="center"
      :cy="center"
      :r="RADIUS"
      :stroke-width="STROKE"
      fill="none"
      class="progress-ring__arc"
      stroke-linecap="round"
      :style="{
        strokeDasharray: CIRC,
        strokeDashoffset: offset,
        transformOrigin: 'center',
        transform: 'rotate(-90deg)',
      }"
    />
    <text
      :x="center"
      :y="center"
      text-anchor="middle"
      dominant-baseline="central"
      class="progress-ring__label"
    >{{ progress }}%</text>
  </svg>
</template>

<style scoped>
.progress-ring { flex-shrink: 0; }

.progress-ring__track {
  stroke: var(--color-border);
}

.progress-ring__arc {
  stroke: var(--color-accent);
  transition: stroke-dashoffset 0.6s var(--ease);
}

.progress-ring__label {
  fill: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 600;
  font-family: inherit;
}
</style>
