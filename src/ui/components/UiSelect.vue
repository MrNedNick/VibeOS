<script setup lang="ts">
export interface SelectOption {
  value: string | number
  label: string
}

interface Props {
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  size?: 'sm' | 'md'
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  disabled: false,
})

const model = defineModel<string | number>()
</script>

<template>
  <div class="ui-select__wrapper" :class="`ui-select__wrapper--${size}`">
    <select
      v-model="model"
      class="ui-select"
      :class="[`ui-select--${size}`, { 'ui-select--placeholder': !model && placeholder }]"
      :disabled="disabled"
      v-bind="$attrs"
    >
      <option v-if="placeholder" value="" disabled :selected="!model">{{ placeholder }}</option>
      <option
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
      >{{ opt.label }}</option>
    </select>
    <span class="ui-select__chevron" aria-hidden="true" />
  </div>
</template>

<style scoped>
.ui-select__wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.ui-select {
  width: 100%;
  padding-right: 32px;
  appearance: none;
  -webkit-appearance: none;
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  outline: none;
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
}

.ui-select--sm { height: 28px; padding-left: 8px;  font-size: var(--text-xs); }
.ui-select--md { height: 40px; padding-left: 12px; font-size: var(--text-base); }

.ui-select--placeholder { color: var(--color-text-muted); }

.ui-select:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 18%, transparent);
}

.ui-select:hover:not(:focus):not(:disabled) {
  border-color: var(--color-text-muted);
}

.ui-select:disabled { opacity: 0.45; cursor: not-allowed; }

/* Custom chevron icon */
.ui-select__chevron {
  position: absolute;
  right: 10px;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid var(--color-text-muted);
  pointer-events: none;
}
</style>
