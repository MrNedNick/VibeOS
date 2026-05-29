<script setup lang="ts">
import { ref } from 'vue'
import type { Note, NoteType } from '../types'
import { NOTE_TYPE_META, NOTE_TYPES } from '../types'
import NoteListItem from './NoteListItem.vue'
import { UiIcon } from '@/ui'

defineProps<{
  notes: Note[]
  selectedId: string | null
  searchQuery: string
  typeFilter: NoteType | 'all'
}>()

const emit = defineEmits<{
  select: [id: string]
  new: []
  pin: [id: string]
  'update:searchQuery': [value: string]
  'update:typeFilter': [value: NoteType | 'all']
}>()

const searchInputRef = ref<HTMLInputElement>()
defineExpose({ focusSearch: () => searchInputRef.value?.focus() })
</script>

<template>
  <aside class="note-list">
    <!-- Header -->
    <div class="note-list__header">
      <span class="note-list__title">Notes <span class="note-list__count">{{ notes.length }}</span></span>
      <button class="note-list__new" title="New note (⌘N)" @click="emit('new')">+</button>
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

    <!-- Type filter chips -->
    <div class="note-list__filters">
      <button
        class="note-list__filter"
        :class="{ 'note-list__filter--active': typeFilter === 'all' }"
        @click="emit('update:typeFilter', 'all')"
      >All</button>
      <button
        v-for="t in NOTE_TYPES.filter(x => x !== 'note')"
        :key="t"
        class="note-list__filter"
        :class="{ 'note-list__filter--active': typeFilter === t }"
        :style="typeFilter === t ? { '--filter-color': NOTE_TYPE_META[t].color } : {}"
        @click="emit('update:typeFilter', typeFilter === t ? 'all' : t)"
      >
        <UiIcon :name="NOTE_TYPE_META[t].icon" :size="11" :stroke-width="2" />
        {{ NOTE_TYPE_META[t].label }}
      </button>
    </div>

    <!-- List -->
    <div class="note-list__items">
      <NoteListItem
        v-for="note in notes"
        :key="note.id"
        :note="note"
        :active="note.id === selectedId"
        @click="emit('select', note.id)"
        @pin="emit('pin', $event)"
      />
      <div v-if="notes.length === 0" class="note-list__empty">
        <span v-if="searchQuery">Nothing found for "{{ searchQuery }}"</span>
        <span v-else-if="typeFilter !== 'all'">No {{ NOTE_TYPE_META[typeFilter as NoteType].label.toLowerCase() }} notes yet.</span>
        <span v-else>No notes yet. Start with ⌘N — plans, ideas, or today's journal.</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.note-list {
  width: 320px;
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
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 6px;
}

.note-list__count {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  padding: 1px 5px;
  border-radius: 99px;
}

.note-list__new {
  font-size: 19px;
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
  font-size: 13px;
  color: var(--color-text);
  outline: none;
}

.note-list__search:focus {
  border-color: var(--color-accent);
}

.note-list__search::placeholder { color: var(--color-text-muted); }

/* Type filter chips */
.note-list__filters {
  display: flex;
  gap: 4px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.note-list__filters::-webkit-scrollbar { display: none; }

.note-list__filter {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all var(--t-fast);
}
.note-list__filter:hover:not(.note-list__filter--active) {
  background: var(--color-surface-elevated);
  color: var(--color-text-secondary);
}
.note-list__filter--active {
  background: color-mix(in srgb, var(--filter-color, var(--color-accent)) 12%, transparent);
  border-color: color-mix(in srgb, var(--filter-color, var(--color-accent)) 40%, transparent);
  color: var(--filter-color, var(--color-accent));
}

.note-list__items {
  flex: 1;
  overflow-y: auto;
}

.note-list__empty {
  padding: 24px 14px;
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
}

@media (max-width: 1279px) {
  .note-list { width: 260px; }
}
@media (max-width: 1023px) {
  .note-list { width: 220px; }
}
</style>
