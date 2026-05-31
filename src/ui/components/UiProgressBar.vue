<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** 0 – 100 */
  value: number
  /** Visual fill color */
  color?: 'accent' | 'success' | 'danger' | 'warning'
  /** Bar height in px (default 4) */
  height?: number
  /** Show animated shimmer pulse when true */
  animated?: boolean
  /** Show value label on the right */
  showLabel?: boolean
}>(), {
  color:     'accent',
  height:    4,
  animated:  false,
  showLabel: false,
})

const pct = computed(() => `${Math.min(100, Math.max(0, props.value))}%`)

const trackStyle = computed(() => ({
  height: `${props.height}px`,
}))
</script>

<template>
  <div class="ui-progress" :class="{ 'ui-progress--labeled': showLabel }">
    <div
      class="ui-progress__track"
      :style="trackStyle"
      role="progressbar"
      :aria-valuenow="value"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="ui-progress__fill"
        :class="[`ui-progress__fill--${color}`, { 'ui-progress__fill--animated': animated }]"
        :style="{ width: pct }"
      />
    </div>
    <span v-if="showLabel" class="ui-progress__label">{{ Math.round(value) }}%</span>
  </div>
</template>

<style scoped>
.ui-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.ui-progress__track {
  flex: 1;
  background: var(--color-surface-elevated);
  border-radius: 99px;
  overflow: hidden;
}

.ui-progress__fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.4s var(--ease);
  min-width: 2px;
}

/* Color variants */
.ui-progress__fill--accent   { background: var(--color-accent); }
.ui-progress__fill--success  { background: var(--color-success); }
.ui-progress__fill--danger   { background: var(--color-danger); }
.ui-progress__fill--warning  { background: var(--color-warning); }

/* Animated shimmer */
.ui-progress__fill--animated {
  background-size: 200% 100%;
  animation: progress-shimmer 1.4s ease-in-out infinite;
}
.ui-progress__fill--animated.ui-progress__fill--accent {
  background-image: linear-gradient(
    90deg,
    var(--color-accent) 0%,
    color-mix(in srgb, var(--color-accent) 60%, white) 50%,
    var(--color-accent) 100%
  );
}

@keyframes progress-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Label */
.ui-progress__label {
  font-size: var(--text-2xs);
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  flex-shrink: 0;
  min-width: 28px;
  text-align: right;
}
</style>
