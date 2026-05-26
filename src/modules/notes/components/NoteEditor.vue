<script setup lang="ts">
defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function handleTab(e: KeyboardEvent) {
  e.preventDefault()
  const el = e.target as HTMLTextAreaElement
  const start = el.selectionStart
  const end = el.selectionEnd
  const before = el.value.substring(0, start)
  const after = el.value.substring(end)
  const newValue = before + '  ' + after
  emit('update:modelValue', newValue)
  requestAnimationFrame(() => {
    el.selectionStart = el.selectionEnd = start + 2
  })
}
</script>

<template>
  <div class="note-editor">
    <textarea
      class="note-editor__textarea"
      :value="modelValue"
      placeholder="Start writing… Markdown supported"
      spellcheck="false"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      @keydown.tab="handleTab"
    />
  </div>
</template>

<style scoped>
.note-editor {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border);
}

.note-editor__textarea {
  flex: 1;
  width: 100%;
  resize: none;
  border: none;
  outline: none;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.8;
  padding: 24px 28px;
  caret-color: var(--color-accent);
}

.note-editor__textarea::placeholder {
  color: var(--color-text-muted);
}
</style>
