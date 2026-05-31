<script setup lang="ts">
interface Props {
  placeholder?: string
  maxlength?: number
  disabled?: boolean
  autofocus?: boolean
}

const model = defineModel<string>({ required: true })
defineProps<Props>()

const emit = defineEmits<{ enter: [] }>()
</script>

<template>
  <input
    v-model="model"
    class="ui-input"
    v-bind="$attrs"
    :placeholder="placeholder"
    :maxlength="maxlength"
    :disabled="disabled"
    :autofocus="autofocus"
    @keydown.enter="emit('enter')"
  />
</template>

<style scoped>
.ui-input {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  font-size: var(--text-base);
  color: var(--color-text);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  transition: border-color var(--t-fast);
  outline: none;
}

.ui-input::placeholder { color: var(--color-text-muted); }

.ui-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-muted);
}

.ui-input:disabled { opacity: 0.45; cursor: not-allowed; }
</style>
