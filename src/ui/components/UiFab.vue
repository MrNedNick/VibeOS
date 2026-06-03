<script setup lang="ts">
import { UiIcon } from '../index'

withDefaults(defineProps<{
  /** Lucide icon name */
  icon?: string
  /** Accessible label (aria-label) */
  label: string
  disabled?: boolean
}>(), {
  icon: 'Plus',
  disabled: false,
})

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    class="ui-fab"
    :class="{ 'ui-fab--disabled': disabled }"
    :aria-label="label"
    :disabled="disabled"
    type="button"
    @click="$emit('click')"
  >
    <UiIcon :name="icon" :size="24" :stroke-width="2" />
  </button>
</template>

<style scoped>
.ui-fab {
  position: fixed;
  right: 20px;
  bottom: calc(var(--tab-bar-height, 64px) + 20px + env(safe-area-inset-bottom, 0px));
  z-index: 100;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-3);
  transition: transform 80ms ease, box-shadow var(--t-fast);
  cursor: pointer;
  touch-action: manipulation;
}

.ui-fab:hover:not(:disabled) {
  box-shadow: var(--shadow-4);
}

.ui-fab:active:not(:disabled) {
  transform: scale(0.93);
  box-shadow: var(--shadow-2);
}

.ui-fab--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Only visible on mobile — desktop uses inline header button */
@media (min-width: 768px) {
  .ui-fab {
    display: none;
  }
}
</style>
