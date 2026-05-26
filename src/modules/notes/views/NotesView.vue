<script setup lang="ts">
import { watch } from 'vue'
import { useNotes } from '../composables/useNotes'
import NoteList from '../components/NoteList.vue'
import NoteEditor from '../components/NoteEditor.vue'
import NotePreview from '../components/NotePreview.vue'

const {
  selectedId, mode, searchQuery,
  filteredNotes, selectedNote,
  selectNote, newNote, debouncedSave, deleteNote,
} = useNotes()

function onContentUpdate(value: string) {
  if (selectedId.value) debouncedSave(selectedId.value, value)
}

watch(filteredNotes, (notes) => {
  if (!selectedId.value && notes.length > 0) {
    selectedId.value = notes[0].id
  }
}, { immediate: true })
</script>

<template>
  <div class="notes-workspace">

    <!-- Note list (left) -->
    <NoteList
      :notes="filteredNotes"
      :selected-id="selectedId"
      :search-query="searchQuery"
      @select="selectNote"
      @new="newNote"
      @update:search-query="searchQuery = $event"
    />

    <!-- Editor area (right of list) -->
    <div class="notes-editor-area">

      <!-- Toolbar -->
      <div class="notes-toolbar">
        <div class="notes-toolbar__modes">
          <button
            v-for="m in (['edit', 'split', 'preview'] as const)"
            :key="m"
            class="notes-toolbar__mode"
            :class="{ 'notes-toolbar__mode--active': mode === m }"
            @click="mode = m"
          >{{ m }}</button>
        </div>

        <button
          v-if="selectedNote"
          class="notes-toolbar__delete"
          title="Delete note"
          @click="deleteNote(selectedNote!.id)"
        >Delete</button>
      </div>

      <!-- Panes -->
      <div v-if="selectedNote" class="notes-panes">
        <NoteEditor
          v-if="mode === 'edit' || mode === 'split'"
          :model-value="selectedNote.content"
          :class="{ 'notes-panes__half': mode === 'split' }"
          @update:model-value="onContentUpdate"
        />
        <NotePreview
          v-if="mode === 'preview' || mode === 'split'"
          :content="selectedNote.content"
        />
      </div>

      <!-- Empty state -->
      <div v-else class="notes-empty">
        <p class="notes-empty__title">No note selected</p>
        <p class="notes-empty__sub">Select a note from the list or create a new one</p>
        <button class="notes-empty__btn" @click="newNote">New note</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.notes-workspace {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.notes-editor-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Toolbar */
.notes-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 16px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  background: var(--color-surface);
}

.notes-toolbar__modes {
  display: flex;
  gap: 2px;
}

.notes-toolbar__mode {
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: capitalize;
  transition: background var(--t-fast), color var(--t-fast);
}

.notes-toolbar__mode:hover:not(.notes-toolbar__mode--active) {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

.notes-toolbar__mode--active {
  background: var(--color-accent-muted);
  color: var(--color-accent);
}

.notes-toolbar__delete {
  font-size: 12px;
  color: var(--color-text-muted);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  transition: background var(--t-fast), color var(--t-fast);
}

.notes-toolbar__delete:hover {
  background: color-mix(in srgb, var(--color-danger) 12%, transparent);
  color: var(--color-danger);
}

/* Panes */
.notes-panes {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.notes-panes__half {
  flex: 1;
  min-width: 0;
}

/* Empty state */
.notes-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--color-text-muted);
}

.notes-empty__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0;
}

.notes-empty__sub {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}

.notes-empty__btn {
  margin-top: 8px;
  padding: 7px 18px;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  transition: opacity var(--t-fast);
}

.notes-empty__btn:hover { opacity: 0.88; }
</style>
