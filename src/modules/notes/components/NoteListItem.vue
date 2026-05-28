<script setup lang="ts">
import { computed } from 'vue'
import type { Note } from '../types'
import { deriveTitle } from '../types'
import { UiIcon } from '@/ui'

const props = defineProps<{
  note: Note
  active: boolean
}>()

const emit = defineEmits<{ pin: [id: string] }>()

const title = computed(() => deriveTitle(props.note.content))

const excerpt = computed(() => {
  const lines = props.note.content.split('\n').filter(l => l.trim())
  const hasHeading = lines.some(l => l.startsWith('#'))
  const bodyLines = hasHeading ? lines.filter(l => !l.startsWith('#')) : lines.slice(1)
  const body = bodyLines[0]?.trim() ?? ''
  return body.length > 72 ? body.slice(0, 72) + '…' : body
})

const date = computed(() => {
  const d = new Date(props.note.updatedAt)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffDays === 0) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString('en-GB', { weekday: 'short' })
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
})
</script>

<template>
  <div class="note-item" :class="{ 'note-item--active': active }">
    <div class="note-item__header">
      <span class="note-item__title">{{ title }}</span>
      <div class="note-item__meta">
        <button
          class="note-item__pin"
          :class="{ 'note-item__pin--active': note.pinned }"
          :title="note.pinned ? 'Unpin note' : 'Pin note'"
          @click.stop="emit('pin', note.id)"
        ><UiIcon name="Pin" :size="12" :stroke-width="1.75" /></button>
        <span class="note-item__date">{{ date }}</span>
      </div>
    </div>
    <p v-if="excerpt" class="note-item__excerpt">{{ excerpt }}</p>
    <p v-else class="note-item__empty">Empty note</p>
  </div>
</template>

<style scoped>
.note-item {
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
  transition: background var(--t-fast);
}

.note-item:hover:not(.note-item--active) {
  background: var(--color-surface-elevated);
}

.note-item--active {
  background: var(--color-accent-muted);
}

.note-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 3px;
}

.note-item__meta {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.note-item__pin {
  font-size: 13px;
  color: var(--color-text-muted);
  opacity: 0;
  transition: opacity var(--t-fast), color var(--t-fast);
  line-height: 1;
  padding: 1px;
}
.note-item:hover .note-item__pin { opacity: 1; }
.note-item__pin--active { opacity: 1; color: var(--color-accent); }

.note-item__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.note-item--active .note-item__title {
  color: var(--color-accent);
}

.note-item__date {
  font-size: 13px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.note-item__excerpt,
.note-item__empty {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.note-item__empty { font-style: italic; }
</style>
