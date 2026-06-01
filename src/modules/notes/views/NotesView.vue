<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useNotes } from '../composables/useNotes'
import { useNotesStore } from '../stores/notes.store'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { deriveTitle, NOTE_TYPE_META, NOTE_TYPES } from '../types'
import type { NoteType } from '../types'
import NoteList from '../components/NoteList.vue'
import NoteEditor from '../components/NoteEditor.vue'
import NotePreview from '../components/NotePreview.vue'
import { UiIcon, UiButton, UiIconButton } from '@/ui'
import { useConfirm } from '@/core/composables/useConfirm'
import { useAiInsight } from '@/core/composables/useAiInsight'

const {
  selectedId, mode, searchQuery, typeFilter,
  filteredNotes, selectedNote,
  selectNote, newNote, todayNote, debouncedSave, deleteNote: _deleteNote, navigateToWikiLink,
} = useNotes()

const { confirm } = useConfirm()

async function deleteNote(id: string) {
  const ok = await confirm({
    title:        'Delete this note?',
    body:         'This action cannot be undone.',
    danger:       true,
    confirmLabel: 'Delete note',
  })
  if (ok) _deleteNote(id)
}

const notesStore = useNotesStore()
const goalsStore = useGoalsStore()

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

// ── AI: summarise / action items (S12 T2) ─────────────────────────────
const { result: aiResult, loading: aiLoading, run: runAi, dismiss: dismissAi } = useAiInsight()
const aiKind = ref<'summary' | 'actions' | null>(null)

const canAnalyse = computed(() => (selectedNote.value?.content.trim().length ?? 0) > 200)

function summariseNote() {
  if (!canAnalyse.value) return
  aiKind.value = 'summary'
  runAi([
    'Summarise the following note into 3-5 concise bullet points. Output only the bullets, each starting with "- ". No preamble, no title.',
    '',
    selectedNote.value!.content,
  ].join('\n'))
}

function extractActions() {
  if (!canAnalyse.value) return
  aiKind.value = 'actions'
  runAi([
    'Extract concrete action items / next steps from the following note. Output only a bullet list, each starting with "- ". If there are no actionable items, reply with the single line "- No clear action items found." No preamble.',
    '',
    selectedNote.value!.content,
  ].join('\n'))
}

function dismissAiCard() {
  dismissAi()
  aiKind.value = null
}

watch(selectedId, () => dismissAiCard())

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
      :type-filter="typeFilter"
      @select="selectNoteOnMobile"
      @new="newNoteOnMobile"
      @pin="notesStore.togglePin"
      @update:search-query="searchQuery = $event"
      @update:type-filter="typeFilter = $event"
    />

    <!-- Editor area (right of list) -->
    <div class="notes-editor-area">

      <!-- Toolbar -->
      <div class="notes-toolbar">
        <!-- Mobile: back to list -->
        <UiButton class="notes-toolbar__back" variant="ghost" size="sm" @click="backToList">
          ← Back
        </UiButton>

        <!-- Edit / Preview mode toggle — bespoke: active state not in UiButton variants -->
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

          <!-- AI actions -->
          <template v-if="canAnalyse">
            <UiButton variant="ghost" size="sm" :disabled="aiLoading" @click="summariseNote">
              {{ aiLoading && aiKind === 'summary' ? '✦ …' : '✦ Summarise' }}
            </UiButton>
            <UiButton variant="ghost" size="sm" :disabled="aiLoading" @click="extractActions">
              {{ aiLoading && aiKind === 'actions' ? '✦ …' : '✦ Action items' }}
            </UiButton>
          </template>

          <!-- Note type selector — bespoke: icon-prefixed compact toolbar control -->
          <div v-if="selectedNote" class="notes-type-select">
            <UiIcon
              :name="NOTE_TYPE_META[(selectedNote.type ?? 'note') as NoteType].icon"
              :size="13"
              :stroke-width="2"
              :style="{ color: NOTE_TYPE_META[(selectedNote.type ?? 'note') as NoteType].color }"
            />
            <select
              class="notes-type-select__sel"
              :value="selectedNote.type ?? 'note'"
              @change="notesStore.setNoteType(selectedNote!.id, ($event.target as HTMLSelectElement).value as NoteType)"
            >
              <option v-for="t in NOTE_TYPES" :key="t" :value="t">
                {{ NOTE_TYPE_META[t].label }}
              </option>
            </select>
          </div>

          <!-- Goal link selector — bespoke: icon-prefixed compact toolbar control -->
          <div v-if="selectedNote && goalsStore.activeGoals.length" class="notes-goal-select">
            <UiIcon name="Target" :size="12" :stroke-width="2" class="notes-goal-icon" />
            <select
              class="notes-type-select__sel"
              :value="selectedNote.linkedGoalId ?? ''"
              @change="notesStore.setNoteGoal(selectedNote!.id, ($event.target as HTMLSelectElement).value || undefined)"
            >
              <option value="">No goal</option>
              <option v-for="g in goalsStore.activeGoals" :key="g.id" :value="g.id">
                {{ g.coverEmoji }} {{ g.title }}
              </option>
            </select>
          </div>

          <UiButton size="sm" @click="todayNote" title="Open or create today's journal entry">
            Today
          </UiButton>
          <UiButton v-if="selectedNote" variant="ghost" size="sm" @click="downloadNote">
            ↓ export
          </UiButton>
          <UiButton v-if="selectedNote" variant="danger" size="sm" @click="deleteNote(selectedNote!.id)">
            Delete
          </UiButton>
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
        <UiButton class="notes-empty__cta" @click="newNote">New note</UiButton>
      </div>

      <!-- AI result card -->
      <Transition name="ai-fade">
        <div v-if="aiResult" class="notes-ai-card">
          <div class="notes-ai-card__head">
            <span class="notes-ai-card__label">✦ {{ aiKind === 'actions' ? 'Action items' : 'Summary' }}</span>
            <UiIconButton name="X" aria-label="Dismiss AI result" size="sm" @click="dismissAiCard" />
          </div>
          <p class="notes-ai-card__text">{{ aiResult }}</p>
        </div>
      </Transition>

      <!-- Backlinks bar — bespoke navigation widget -->
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

/* Mode toggle — bespoke: active state not in UiButton variants */
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

/* Goal link selector */
.notes-goal-select {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-elevated);
  cursor: pointer;
  transition: border-color var(--t-fast);
}
.notes-goal-select:focus-within { border-color: var(--color-accent); }

.notes-goal-icon {
  color: var(--color-warning);
  flex-shrink: 0;
}

/* Note type selector */
.notes-type-select {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-elevated);
  cursor: pointer;
  transition: border-color var(--t-fast);
}
.notes-type-select:focus-within { border-color: var(--color-accent); }

.notes-type-select__sel {
  font-size: 12px;
  font-family: var(--font-sans);
  font-weight: 500;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0;
  appearance: none;
  -webkit-appearance: none;
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

.notes-empty__cta { margin-top: 8px; }

/* AI toolbar buttons — Now use UiButton, these styles are removed */

/* AI result card */
.notes-ai-card {
  flex-shrink: 0;
  margin: 0 16px 12px;
  background: color-mix(in srgb, var(--color-accent) 6%, var(--color-surface));
  border: 1px solid color-mix(in srgb, var(--color-accent) 25%, var(--color-border));
  border-radius: var(--radius-lg);
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: var(--shadow-1);
}
.notes-ai-card__head { display: flex; align-items: center; justify-content: space-between; }
.notes-ai-card__label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-accent); }
.notes-ai-card__text { font-size: var(--text-sm); line-height: var(--leading-lg); color: var(--color-text-secondary); margin: 0; white-space: pre-line; }

.ai-fade-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.ai-fade-leave-active { transition: opacity 0.2s ease; }
.ai-fade-enter-from   { opacity: 0; transform: translateY(-8px); }
.ai-fade-leave-to     { opacity: 0; }

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
  line-height: var(--leading-sm);
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

.bl-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.bl-leave-active { transition: opacity 0.1s ease; }
.bl-enter-from   { opacity: 0; transform: translateY(-4px); }
.bl-leave-to     { opacity: 0; }

/* ── Mobile: back button ─────────────────────────────────────── */
.notes-toolbar__back {
  display: none !important;
  margin-right: 4px;
}

/* ── Mobile layout ────────────────────────────────────────────── */
@media (max-width: 767px) {
  .notes-workspace {
    flex-direction: column;
    overflow: visible;
    height: auto;
  }
  .notes-workspace :deep(.note-list) {
    display: flex;
    flex: none;
    width: 100%;
    height: auto;
    max-height: none;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
  .notes-workspace .notes-editor-area { display: none; }
  .notes-workspace--editor :deep(.note-list) { display: none; }
  .notes-workspace--editor .notes-editor-area {
    display: flex;
    height: calc(100svh - var(--header-height-mobile) - env(safe-area-inset-top, 0px) - var(--tab-bar-height) - env(safe-area-inset-bottom, 0px));
  }

  /* Show back button only on mobile */
  .notes-toolbar__back { display: inline-flex !important; }

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
