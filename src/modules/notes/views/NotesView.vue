<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useNotes } from '../composables/useNotes'
import { useNotesStore } from '../stores/notes.store'
import { deriveTitle } from '../types'
import NoteList from '../components/NoteList.vue'
import NoteEditor from '../components/NoteEditor.vue'
import NotePreview from '../components/NotePreview.vue'
import { UiIcon } from '@/ui'

const {
  selectedId, mode, searchQuery,
  filteredNotes, selectedNote,
  selectNote, newNote, todayNote, debouncedSave, deleteNote, navigateToWikiLink,
} = useNotes()

const notesStore = useNotesStore()

// ── Backlinks ─────────────────────────────────────────────────────────
interface BacklinkNote { id: string; title: string }

const backlinks = computed((): BacklinkNote[] => {
  if (!selectedNote.value) return []
  const title = deriveTitle(selectedNote.value.content).trim()
  if (!title || title === 'Untitled') return []
  const pattern = `[[${title}]]`
  return notesStore.notes
    .filter(n => n.id !== selectedNote.value!.id && n.content.includes(pattern))
    .map(n => ({ id: n.id, title: deriveTitle(n.content) || 'Untitled' }))
})

const showBacklinks = ref(false)

// Word count + reading time
const wordCount = computed(() => {
  const text = selectedNote.value?.content ?? ''
  return text.trim() ? text.trim().split(/\s+/).length : 0
})
const readingTime = computed(() => Math.max(1, Math.ceil(wordCount.value / 200)))

// Export as .md file
function downloadNote() {
  if (!selectedNote.value) return
  const title = deriveTitle(selectedNote.value.content).replace(/[^\w\s-]/g, '').trim() || 'note'
  const blob  = new Blob([selectedNote.value.content], { type: 'text/markdown' })
  const url   = URL.createObjectURL(blob)
  const a     = Object.assign(document.createElement('a'), { href: url, download: `${title}.md` })
  a.click()
  URL.revokeObjectURL(url)
}

const noteListRef = ref<InstanceType<typeof NoteList>>()
// Mobile: show editor pane (true) or list pane (false)
const mobileShowEditor = ref(false)

function onContentUpdate(value: string) {
  if (selectedId.value) debouncedSave(selectedId.value, value)
}

function selectNoteOnMobile(id: string) {
  selectNote(id)
  mobileShowEditor.value = true
}

function newNoteOnMobile() {
  newNote()
  mobileShowEditor.value = true
}

function backToList() {
  mobileShowEditor.value = false
}

watch(filteredNotes, (notes) => {
  if (!selectedId.value && notes.length > 0) {
    selectedId.value = notes[0].id
  }
}, { immediate: true })

function onKeydown(e: KeyboardEvent) {
  const meta = e.metaKey || e.ctrlKey
  if (!meta) return
  if (e.key === 'n') {
    e.preventDefault()
    newNote()
  } else if (e.key === 'f') {
    e.preventDefault()
    noteListRef.value?.focusSearch()
  } else if (e.shiftKey && e.key === 'P') {
    e.preventDefault()
    mode.value = mode.value === 'preview' ? 'edit' : 'preview'
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="notes-workspace" :class="{ 'notes-workspace--editor': mobileShowEditor }">

    <!-- Note list (left) -->
    <NoteList
      ref="noteListRef"
      :notes="filteredNotes"
      :selected-id="selectedId"
      :search-query="searchQuery"
      @select="selectNoteOnMobile"
      @new="newNoteOnMobile"
      @pin="notesStore.togglePin"
      @update:search-query="searchQuery = $event"
    />

    <!-- Editor area (right of list) -->
    <div class="notes-editor-area">

      <!-- Toolbar -->
      <div class="notes-toolbar">
        <!-- Mobile: back button to return to list -->
        <button class="notes-toolbar__back" @click="backToList">
          ← Back
        </button>

        <div class="notes-toolbar__modes">
          <button
            v-for="m in (['edit', 'preview'] as const)"
            :key="m"
            class="notes-toolbar__mode"
            :class="{ 'notes-toolbar__mode--active': mode === m }"
            @click="mode = m"
          >{{ m }}</button>
        </div>

        <div class="notes-toolbar__right">
          <span v-if="selectedNote && wordCount > 0" class="notes-toolbar__stats">
            {{ wordCount }} words · {{ readingTime }} min
          </span>
          <button
            class="notes-toolbar__today"
            title="Open or create today's journal entry"
            @click="todayNote"
          >Today</button>
          <button
            v-if="selectedNote"
            class="notes-toolbar__action"
            title="Download note as .md file"
            @click="downloadNote"
          >↓ export</button>
          <button
            v-if="selectedNote"
            class="notes-toolbar__delete"
            title="Delete this note permanently"
            @click="deleteNote(selectedNote!.id)"
          >Delete</button>
        </div>
      </div>

      <!-- Panes -->
      <div v-if="selectedNote" class="notes-panes">
        <NoteEditor
          v-if="mode === 'edit'"
          :model-value="selectedNote.content"
          @update:model-value="onContentUpdate"
        />
        <NotePreview
          v-if="mode === 'preview'"
          :content="selectedNote.content"
          @wiki-navigate="navigateToWikiLink"
        />
      </div>

      <!-- Empty state -->
      <div v-else class="notes-empty">
        <p class="notes-empty__title">Nothing open.</p>
        <p class="notes-empty__sub">Pick a note from the list, or start fresh.</p>
        <button class="notes-empty__btn" @click="newNote">New note</button>
      </div>

      <!-- Backlinks bar (shown when note is open) -->
      <div v-if="selectedNote" class="notes-backlinks">
        <button
          class="notes-backlinks__toggle"
          :class="{ 'notes-backlinks__toggle--active': showBacklinks }"
          @click="showBacklinks = !showBacklinks"
        >
          <UiIcon name="Link2" :size="13" />
          <span>{{ backlinks.length }} backlink{{ backlinks.length !== 1 ? 's' : '' }}</span>
          <UiIcon
            :name="showBacklinks ? 'ChevronDown' : 'ChevronRight'"
            :size="13"
            class="notes-backlinks__chevron"
          />
        </button>

        <Transition name="bl">
          <div v-if="showBacklinks" class="notes-backlinks__list">
            <div v-if="backlinks.length === 0" class="notes-backlinks__empty">
              No notes link to this one yet. Use <code>[[{{ deriveTitle(selectedNote.content) || 'Note Title' }}]]</code> in another note.
            </div>
            <button
              v-for="bl in backlinks"
              :key="bl.id"
              class="notes-backlinks__item"
              @click="selectNote(bl.id); mobileShowEditor = true"
            >
              <UiIcon name="FileText" :size="13" />
              <span>{{ bl.title }}</span>
            </button>
          </div>
        </Transition>
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
  font-size: 15px;
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

.notes-toolbar__right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.notes-toolbar__stats {
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  padding: 0 8px;
}

.notes-toolbar__today {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-accent);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-accent-muted);
  background: var(--color-accent-muted);
  transition: opacity var(--t-fast);
}
.notes-toolbar__today:hover { opacity: 0.75; }

.notes-toolbar__action {
  font-size: 13px;
  color: var(--color-text-muted);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  transition: background var(--t-fast), color var(--t-fast);
}
.notes-toolbar__action:hover {
  background: var(--color-surface-elevated);
  color: var(--color-accent);
}

.notes-toolbar__delete {
  font-size: 15px;
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
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0;
}

.notes-empty__sub {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0;
}

.notes-empty__btn {
  margin-top: 8px;
  padding: 7px 18px;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  transition: opacity var(--t-fast);
}

.notes-empty__btn:hover { opacity: 0.88; }

/* ── Backlinks ───────────────────────────────────────────────── */
.notes-backlinks {
  flex-shrink: 0;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}

.notes-backlinks__toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 7px 16px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
  text-align: left;
  transition: color var(--t-fast), background var(--t-fast);
}

.notes-backlinks__toggle:hover,
.notes-backlinks__toggle--active {
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);
}

.notes-backlinks__chevron {
  margin-left: auto;
  opacity: 0.6;
}

.notes-backlinks__list {
  border-top: 1px solid var(--color-border);
  padding: 4px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.notes-backlinks__empty {
  padding: 8px;
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

.notes-backlinks__empty code {
  font-family: var(--font-mono);
  font-size: 11px;
  background: var(--color-surface-elevated);
  padding: 1px 4px;
  border-radius: 3px;
  color: var(--color-accent);
}

.notes-backlinks__item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--color-text-secondary);
  transition: background var(--t-fast), color var(--t-fast);
  text-align: left;
  width: 100%;
}

.notes-backlinks__item:hover {
  background: var(--color-accent-muted);
  color: var(--color-accent);
}

/* Backlinks expand transition */
.bl-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.bl-leave-active { transition: opacity 0.1s ease; }
.bl-enter-from   { opacity: 0; transform: translateY(-4px); }
.bl-leave-to     { opacity: 0; }

/* ── Mobile: back button ─────────────────────────────────────── */
.notes-toolbar__back {
  display: none;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-accent);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: background var(--t-fast);
  margin-right: 4px;
  min-height: 0;
  min-width: 0;
  white-space: nowrap;
}
.notes-toolbar__back:hover {
  background: var(--color-accent-muted);
}

/* ── Mobile layout: single pane at a time ────────────────────── */
@media (max-width: 767px) {
  .notes-workspace {
    /* Start showing list */
    flex-direction: column;
    overflow: visible;
    height: auto;
  }

  /* Default mobile: show list, hide editor */
  .notes-workspace :deep(.note-list) {
    display: flex;
    flex: none;
    width: 100%;
    height: auto;
    max-height: none;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }

  .notes-workspace .notes-editor-area {
    display: none;
  }

  /* When editor is active: show editor, hide list */
  .notes-workspace--editor :deep(.note-list) {
    display: none;
  }

  .notes-workspace--editor .notes-editor-area {
    display: flex;
    height: calc(100svh - var(--header-height-mobile) - env(safe-area-inset-top, 0px) - var(--tab-bar-height) - env(safe-area-inset-bottom, 0px));
  }

  /* Show back button only on mobile */
  .notes-toolbar__back { display: flex; }

  /* Compact toolbar */
  .notes-toolbar {
    height: 48px;
    padding: 0 12px;
    gap: 4px;
  }
  .notes-toolbar__stats  { display: none; }
  .notes-toolbar__action { display: none; }
  .notes-toolbar__mode   { font-size: 13px; padding: 4px 8px; }
}
</style>
