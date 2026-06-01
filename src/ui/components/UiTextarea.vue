<script setup lang="ts">
interface Props {
  placeholder?: string
  rows?: number
  maxlength?: number
  disabled?: boolean
  autofocus?: boolean
  resize?: 'none' | 'vertical' | 'both'
}

withDefaults(defineProps<Props>(), {
  rows: 4,
  resize: 'vertical',
})

const model = defineModel<string>({ required: true })
</script>

<template>
  <textarea
    v-model="model"
    class="ui-textarea"
    :class="`ui-textarea--resize-${resize}`"
    v-bind="$attrs"
    :placeholder="placeholder"
    :rows="rows"
    :maxlength="maxlength"
    :disabled="disabled"
    :autofocus="autofocus"
  />
</template>

<style scoped>
.ui-textarea {
  width: 100%;
  padding: 10px 13px;
  font-family: inherit;
  font-size: var(--text-base);
  line-height: var(--leading-base);
  color: var(--color-text);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
  outline: none;
  min-height: 80px;
}

.ui-textarea::placeholder { color: var(--color-text-muted); opacity: 0.6; }

.ui-textarea:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 18%, transparent);
}

.ui-textarea:hover:not(:focus):not(:disabled) {
  border-color: var(--color-text-muted);
}

.ui-textarea:disabled { opacity: 0.45; cursor: not-allowed; }

.ui-textarea--resize-none     { resize: none; }
.ui-textarea--resize-vertical { resize: vertical; }
.ui-textarea--resize-both     { resize: both; }
</style>
