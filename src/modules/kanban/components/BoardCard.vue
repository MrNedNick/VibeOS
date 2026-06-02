<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useBoardStore } from '../stores/board.store'
import { BOARD_COLUMNS, PRIORITY_COLOR, classifyDueDate } from '../types'
import type { BoardCard, BoardColumnId, CardPriority } from '../types'
import { useLocale } from '@/core/i18n'
import { UiIconButton } from '@/ui'

const props = defineProps<{
  card: BoardCard
  colId: BoardColumnId
  isExpanded: boolean
  isDragging: boolean
  activeColMobile: BoardColumnId
}>()

const emit = defineEmits<{
  'toggle-expand': [cardId: string]
  'delete': [cardId: string]
  'drag-start': [event: DragEvent, cardId: string]
  'drag-end': []
}>()

const store = useBoardStore()
const i18n  = useLocale()

// ── Title inline edit ────────────────────────────────────────────────
const isEditing    = ref(false)
const editTitle    = ref('')
const editInputRef = ref<HTMLInputElement | null>(null)

async function startEdit(): Promise<void> {
  isEditing.value = true
  editTitle.value = props.card.title
  await nextTick(); editInputRef.value?.select()
}
function confirmEdit(): void {
  if (editTitle.value.trim()) store.updateCard(props.card.id, { title: editTitle.value.trim() })
  isEditing.value = false
}
function cancelEdit(): void { isEditing.value = false }

// ── Description edit (only when expanded) ───────────────────────────
const editingDesc = ref(false)
const editDesc    = ref('')

async function startEditDesc(desc: string | undefined): Promise<void> {
  editingDesc.value = true
  editDesc.value = desc ?? ''
  await nextTick()
  ;(document.querySelector('.card-desc-edit') as HTMLElement)?.focus()
}
function confirmEditDesc(): void {
  store.updateCard(props.card.id, { description: editDesc.value })
  editingDesc.value = false
}

// ── Helpers ──────────────────────────────────────────────────────────
function priorityLabel(p: CardPriority): string {
  return i18n.t(`kanban.priority${p.charAt(0).toUpperCase() + p.slice(1)}`)
}
function colLabel(colId: BoardColumnId): string {
  const camel = colId.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
  return i18n.t(`kanban.col${camel.charAt(0).toUpperCase() + camel.slice(1)}`)
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(i18n.localeCode, { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div
    class="board-card"
    :class="{
      'board-card--dragging':  isDragging,
      'board-card--expanded':  isExpanded,
    }"
    :style="{ '--priority-color': PRIORITY_COLOR[card.priority] }"
    draggable="true"
    @dragstart="emit('drag-start', $event, card.id)"
    @dragend="emit('drag-end')"
  >
    <!-- Priority strip -->
    <span
      class="board-card__priority-strip"
      :title="priorityLabel(card.priority)"
      @click.stop="store.cyclePriority(card.id)"
    />

    <div class="board-card__body">
      <!-- Title -->
      <input
        v-if="isEditing"
        ref="editInputRef"
        v-model="editTitle"
        class="board-card__title-input"
        @keydown.enter="confirmEdit"
        @keydown.escape="cancelEdit"
        @blur="confirmEdit"
      />
      <span v-else class="board-card__title" @dblclick="startEdit">{{ card.title }}</span>

      <!-- Meta row -->
      <div class="board-card__meta">
        <span
          v-if="card.priority !== 'none'"
          class="board-card__pri-dot"
          :style="{ background: PRIORITY_COLOR[card.priority] }"
          :title="priorityLabel(card.priority)"
          @click.stop="store.cyclePriority(card.id)"
        />
        <span
          v-if="card.dueDate"
          class="board-card__due"
          :class="`board-card__due--${classifyDueDate(card.dueDate)}`"
        >{{ fmtDate(card.dueDate) }}</span>
        <span v-if="card.sourceTaskId" class="board-card__source-dot" title="Imported from Tasks">⊙</span>

        <span class="board-card__meta-spacer" />

        <button
          class="board-card__expand"
          :class="{ 'board-card__expand--open': isExpanded }"
          :title="isExpanded ? 'Collapse' : 'Expand'"
          @click.stop="emit('toggle-expand', card.id)"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <UiIconButton
          name="X"
          aria-label="Delete card"
          size="sm"
          variant="danger"
          class="board-card__del"
          @click.stop="emit('delete', card.id)"
        />
      </div>

      <!-- Expanded section -->
      <template v-if="isExpanded">
        <div v-if="!editingDesc" class="board-card__desc" @dblclick="startEditDesc(card.description)">
          <span v-if="card.description" class="board-card__desc-text">{{ card.description }}</span>
          <span v-else class="board-card__desc-empty">{{ i18n.t('kanban.addDesc') }}</span>
        </div>
        <textarea
          v-else
          v-model="editDesc"
          class="board-card__desc-edit card-desc-edit"
          rows="3"
          :placeholder="i18n.t('kanban.descPlaceholder')"
          @keydown.escape="editingDesc = false"
          @blur="confirmEditDesc"
        />

        <div class="board-card__actions">
          <button
            class="board-card__action board-card__action--priority"
            :style="{ color: PRIORITY_COLOR[card.priority] }"
            @click="store.cyclePriority(card.id)"
          >{{ priorityLabel(card.priority) }}</button>
          <input
            type="date"
            class="board-card__date-input"
            :value="card.dueDate ?? ''"
            @change="store.setDueDate(card.id, ($event.target as HTMLInputElement).value || undefined)"
          />
        </div>

        <!-- Mobile: move to column buttons -->
        <div class="board-card__move-row">
          <span class="board-card__move-label">{{ i18n.t('kanban.moveTo') }}:</span>
          <button
            v-for="targetCol in BOARD_COLUMNS"
            :key="targetCol.id"
            v-show="targetCol.id !== colId"
            class="board-card__move-btn"
            :style="{ '--move-dot': targetCol.color }"
            @click.stop="store.moveCard(card.id, targetCol.id)"
          >{{ colLabel(targetCol.id) }}</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.board-card {
  display: flex;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: grab;
  transition: border-color var(--t-fast), box-shadow var(--t-fast), opacity var(--t-fast);
  overflow: hidden;
  position: relative;
}
.board-card:hover {
  border-color: color-mix(in srgb, var(--color-accent) 35%, var(--color-border));
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.board-card:active { cursor: grabbing; }
.board-card--dragging { opacity: 0.35; }
.board-card--expanded { border-color: color-mix(in srgb, var(--color-accent) 40%, var(--color-border)); }

.board-card__priority-strip {
  width: 3px;
  flex-shrink: 0;
  background: var(--priority-color);
  cursor: pointer;
  opacity: 0.75;
  transition: width var(--t-fast), opacity var(--t-fast);
  align-self: stretch;
}
.board-card__priority-strip:hover { width: 5px; opacity: 1; }

.board-card__body {
  flex: 1;
  padding: 9px 10px 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.board-card__title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.45;
  word-break: break-word;
  cursor: text;
}
.board-card__title-input {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-accent);
  border-radius: 3px;
  padding: 2px 6px;
  width: 100%;
  outline: none;
  font-family: inherit;
}

.board-card__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  min-height: 18px;
}
.board-card__meta-spacer { flex: 1; }

.board-card__pri-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform var(--t-fast);
}
.board-card__pri-dot:hover { transform: scale(1.3); }

.board-card__due {
  font-size: 10px;
  font-family: var(--font-mono);
  padding: 1px 5px;
  border-radius: 3px;
  line-height: 1.5;
  white-space: nowrap;
}
.board-card__due--overdue   { background: color-mix(in srgb, #ef4444 12%, transparent); color: #ef4444; }
.board-card__due--today     { background: color-mix(in srgb, #f59e0b 12%, transparent); color: #f59e0b; }
.board-card__due--tomorrow  { color: var(--color-text-muted); }
.board-card__due--this-week { color: var(--color-text-muted); }
.board-card__due--later     { color: var(--color-text-muted); opacity: 0.55; }

.board-card__source-dot { font-size: 10px; color: var(--color-text-muted); opacity: 0.6; cursor: default; }

.board-card__expand {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  border-radius: 3px;
  flex-shrink: 0;
  transition: color var(--t-fast), background var(--t-fast), transform var(--t-fast);
  opacity: 0;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.board-card:hover .board-card__expand,
.board-card--expanded .board-card__expand { opacity: 1; }
.board-card__expand:hover { color: var(--color-accent); background: var(--color-accent-muted); }
.board-card__expand--open { transform: rotate(180deg); color: var(--color-accent); opacity: 1; }

.board-card__del {
  width: 18px;
  height: 18px;
  opacity: 0;
  transition: opacity var(--t-fast);
}
.board-card:hover .board-card__del { opacity: 1; }

.board-card__desc {
  font-size: 12px;
  line-height: 1.5;
  cursor: text;
  min-height: 20px;
  margin-top: 2px;
}
.board-card__desc-text { color: var(--color-text-muted); white-space: pre-wrap; word-break: break-word; }
.board-card__desc-empty { color: var(--color-text-muted); opacity: 0.45; font-style: italic; }
.board-card__desc-edit {
  font-size: 12px;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-accent);
  border-radius: 3px;
  padding: 5px 7px;
  width: 100%;
  outline: none;
  resize: none;
  line-height: 1.5;
  font-family: inherit;
  margin-top: 2px;
}

.board-card__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 6px;
  border-top: 1px solid var(--color-border);
  margin-top: 4px;
}
.board-card__action {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: var(--radius-sm);
  transition: background var(--t-fast);
  background: none;
  border: none;
  cursor: pointer;
}
.board-card__action--priority {
  font-weight: 600;
  background: color-mix(in srgb, currentColor 8%, transparent);
}
.board-card__action--priority:hover { background: color-mix(in srgb, currentColor 15%, transparent); }
.board-card__date-input {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  padding: 1px 4px;
  outline: none;
  cursor: pointer;
}
.board-card__date-input:focus { border-color: var(--color-accent); }

.board-card__move-row {
  display: none;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding-top: 6px;
  border-top: 1px solid var(--color-border);
  margin-top: 2px;
}
.board-card__move-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}
.board-card__move-btn {
  font-size: 12px;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
}
.board-card__move-btn:hover {
  background: var(--color-accent-muted);
  color: var(--color-accent);
  border-color: color-mix(in srgb, var(--color-accent) 30%, transparent);
}

@media (max-width: 767px) {
  .board-card__move-row { display: flex; }
  .board-card { cursor: default; }
  .board-card:active { cursor: default; }
}
</style>
