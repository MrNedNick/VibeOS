<script setup lang="ts">
import { ref } from 'vue'
import type { Note } from '../types'
import NoteListItem from './NoteListItem.vue'

defineProps<{
  notes: Note[]
  selectedId: string | null
  searchQuery: string
}>()

const emit = defineEmits<{
  select: [id: string]
  new: []
  'update:searchQuery': [value: string]
}>()

const searchInputRef = ref<HTMLInputElement>()
defineExpose({ focusSearch: () => searchInputRef.value?.focus() })
</script>

<template>
  <aside class="note-list">
    <!-- Header -->
    <div class="note-list__header">
      <span class="note-list__title">Notes</span>
      <button class="note-list__new" title="New note" @click="emit('new')">+</button>
    </div>

    <!-- Search -->
    <div class="note-list__search-wrap">
      <input
        ref="searchInputRef"
        class="note-list__search"
        type="search"
        placeholder="Search…"
        :value="searchQuery"
        @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- List -->
    <div class="note-list__items">
      <NoteListItem
        v-for="note in notes"
        :key="note.id"
        :note="note"
        :active="note.id === selectedId"
        @click="emit('select', note.id)"
      />
      <div v-if="notes.length === 0" class="note-list__empty">
        <span v-if="searchQuery">No results</span>
        <span v-else>No notes yet</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.note-list {
  width: 240px;
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-surface);
}

.note-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  height: var(--header-height);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.note-list__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.note-list__new {
  font-size: 18px;
  line-height: 1;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  transition: background var(--t-fast), color var(--t-fast);
}

.note-list__new:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

.note-list__search-wrap {
  padding: 8px 10px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.note-list__search {
  width: 100%;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 5px 10px;
  font-size: 12px;
  color: var(--color-text);
  outline: none;
}

.note-list__search:focus {
  border-color: var(--color-accent);
}

.note-list__search::placeholder { color: var(--color-text-muted); }

.note-list__items {
  flex: 1;
  overflow-y: auto;
}

.note-list__empty {
  padding: 24px 14px;
  font-size: 12px;
  color: var(--color-text-muted);
  text-align: center;
}
</style>
