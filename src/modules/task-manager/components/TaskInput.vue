<script setup lang="ts">
import { UiInput, UiButton } from '@/ui'

interface Props {
  modelValue: string
  maxLength?: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), { maxLength: 120, loading: false })
const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()

const charCount = () => props.modelValue.length
const isNearLimit = () => charCount() > props.maxLength * 0.85
const isOverLimit = () => charCount() > props.maxLength
</script>

<template>
  <div class="task-input">
    <div class="task-input__field">
      <UiInput
        :model-value="modelValue"
        placeholder="Add a new task…"
        :maxlength="maxLength + 10"
        autofocus
        @update:model-value="emit('update:modelValue', $event)"
        @enter="emit('submit')"
      />
      <span
        v-if="isNearLimit()"
        class="task-input__counter"
        :class="{ 'task-input__counter--over': isOverLimit() }"
      >
        {{ charCount() }}/{{ maxLength }}
      </span>
    </div>
    <UiButton
      :disabled="!modelValue.trim() || isOverLimit()"
      :loading="loading"
      @click="emit('submit')"
    >
      Add
    </UiButton>
  </div>
</template>

<style scoped>
.task-input {
  display: flex;
  gap: 8px;
  align-items: center;
}

.task-input__field {
  flex: 1;
  position: relative;
}

.task-input__counter {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  pointer-events: none;
}

.task-input__counter--over { color: var(--color-danger); }
</style>
