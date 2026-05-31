<script setup lang="ts">
withDefaults(defineProps<{
  /** Label shown above the input */
  label?:    string
  /** Helper text shown below — hidden when error is set */
  hint?:     string
  /** Error message — replaces hint, colors red */
  error?:    string
  /** Adds asterisk to label */
  required?: boolean
  /** Unique id to wire label[for] → input */
  fieldId?:  string
}>(), {
  required: false,
})
</script>

<template>
  <div class="ui-field" :class="{ 'ui-field--error': !!error }">
    <label v-if="label" class="ui-field__label" :for="fieldId">
      {{ label }}
      <span v-if="required" class="ui-field__required" aria-hidden="true">*</span>
    </label>

    <div class="ui-field__control">
      <slot />
    </div>

    <Transition name="field-msg">
      <p v-if="error" class="ui-field__msg ui-field__msg--error">{{ error }}</p>
      <p v-else-if="hint" class="ui-field__msg ui-field__msg--hint">{{ hint }}</p>
    </Transition>
  </div>
</template>

<style scoped>
.ui-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 100%;
}

/* Label */
.ui-field__label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 3px;
  cursor: default;
}

.ui-field--error .ui-field__label { color: var(--color-danger); }

.ui-field__required {
  color: var(--color-danger);
  font-weight: 700;
}

/* Control slot wrapper */
.ui-field__control {
  display: flex;
  flex-direction: column;
}

/* Messages */
.ui-field__msg {
  font-size: var(--text-2xs);
  margin: 0;
  line-height: 1.4;
}

.ui-field__msg--hint  { color: var(--color-text-muted); }
.ui-field__msg--error { color: var(--color-danger); }

/* Transition */
.field-msg-enter-active { transition: opacity 150ms var(--ease), transform 150ms var(--ease); }
.field-msg-leave-active { transition: opacity 100ms var(--ease); }
.field-msg-enter-from   { opacity: 0; transform: translateY(-4px); }
.field-msg-leave-to     { opacity: 0; }
</style>
