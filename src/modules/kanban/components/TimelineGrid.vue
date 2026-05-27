<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useBoardStore } from '../stores/board.store'
import {
  BOARD_COLUMNS, SWIMLANE_ROWS, PRIORITY_COLOR,
  classifyDueDate, dueDateForRow,
} from '../types'
import type { BoardColumnId, SwimlaneRowId } from '../types'
import { useLocale } from '@/core/i18n'

const store = useBoardStore()
const i18n  = useLocale()

// ── Drag ──────────────────────────────────────────────────────────
const draggingId  = ref<string | null>(null)
const dragOverKey = ref<string | null>(null)
const dragDepth   = ref<Record<string, number>>({})

function cellKey(row: SwimlaneRowId, col: BoardColumnId) { return `${row}:${col}` }

function onDragStart(e: DragEvent, cardId: string) {
  draggingId.value = cardId
  e.dataTransfer!.effectAllowed = 'move'
}
function onDragEnd() { draggingId.value = null; dragOverKey.value = null; dragDepth.value = {} }

function onDragEnter(row: SwimlaneRowId, col: BoardColumnId) {
  const k = cellKey(row, col)
  dragDepth.value[k] = (dragDepth.value[k] ?? 0) + 1
  if (draggingId.value) dragOverKey.value = k
}
function onDragLeave(row: SwimlaneRowId, col: BoardColumnId) {
  const k = cellKey(row, col)
  dragDepth.value[k] = Math.max(0, (dragDepth.value[k] ?? 0) - 1)
  if (dragDepth.value[k] === 0 && dragOverKey.value === k) dragOverKey.value = null
}
function onDrop(row: SwimlaneRowId, col: BoardColumnId) {
  if (draggingId.value) {
    const newDate = row === 'overdue' ? undefined : dueDateForRow(row)
    store.moveCard(draggingId.value, col, newDate)
  }
  draggingId.value = null; dragOverKey.value = null; dragDepth.value = {}
}

// ── Inline add in cell ─────────────────────────────────────────────
const addingCell    = ref<string | null>(null)
const newCardTitle  = ref('')
const addInputRef   = ref<HTMLTextAreaElement | null>(null)

async function startAdd(row: SwimlaneRowId, col: BoardColumnId) {
  addingCell.value  = cellKey(row, col)
  newCardTitle.value = ''
  await nextTick()
  addInputRef.value?.focus()
}
function confirmAdd(row: SwimlaneRowId, col: BoardColumnId) {
  if (newCardTitle.value.trim()) {
    store.addCard(col, newCardTitle.value.trim(), row === 'overdue' ? undefined : dueDateForRow(row))
  }
  addingCell.value = null; newCardTitle.value = ''
}
function cancelAdd() { addingCell.value = null; newCardTitle.value = '' }

// ── Labels ─────────────────────────────────────────────────────────
function colLabel(colId: BoardColumnId): string {
  return i18n.t(`kanban.col${colId.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`)
}
function rowLabel(rowId: SwimlaneRowId): string {
  return i18n.t(`kanban.row${rowId.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`)
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(i18n.localeCode, { month: 'short', day: 'numeric' })
}

// ── Visible rows ────────────────────────────────────────────────────
// Always show overdue / today / no-date; show others only if they have cards
const visibleRows = computed(() =>
  SWIMLANE_ROWS.filter(row => {
    if (['overdue', 'today', 'no-date'].includes(row.id)) return true
    return BOARD_COLUMNS.some(col => store.cardsForCell(row.id, col.id).length > 0)
  })
)

function rowTotal(rowId: SwimlaneRowId): number {
  return BOARD_COLUMNS.reduce((s, col) => s + store.cardsForCell(rowId, col.id).length, 0)
}
</script>

<template>
  <div class="timeline">
    <!-- Sticky header ───────────────────────────────────────── -->
    <div class="timeline__header">
      <div class="timeline__corner">
        <span class="timeline__corner-label">{{ i18n.t('kanban.timelineCorner') }}</span>
      </div>
      <div
        v-for="col in BOARD_COLUMNS"
        :key="col.id"
        class="timeline__col-head"
        :style="{ '--col-color': col.color }"
      >
        <span class="timeline__col-dot" />
        <span class="timeline__col-name">{{ colLabel(col.id) }}</span>
        <span class="timeline__col-count">{{ store.cardsForColumn(col.id).length }}</span>
      </div>
    </div>

    <!-- Rows ────────────────────────────────────────────────── -->
    <div class="timeline__body">
      <div
        v-for="row in visibleRows"
        :key="row.id"
        class="timeline__row"
        :class="`timeline__row--${row.id}`"
      >
        <!-- Row label -->
        <div class="timeline__row-head">
          <span class="timeline__row-icon">{{ row.icon }}</span>
          <span class="timeline__row-label">{{ rowLabel(row.id) }}</span>
          <span v-if="rowTotal(row.id) > 0" class="timeline__row-count">{{ rowTotal(row.id) }}</span>
        </div>

        <!-- Cells: one per column -->
        <div
          v-for="col in BOARD_COLUMNS"
          :key="col.id"
          class="timeline__cell"
          :class="{ 'timeline__cell--dragover': dragOverKey === cellKey(row.id, col.id) }"
          @dragenter.prevent="onDragEnter(row.id, col.id)"
          @dragleave="onDragLeave(row.id, col.id)"
          @dragover.prevent
          @drop.prevent="onDrop(row.id, col.id)"
        >
          <!-- Cards in this cell -->
          <div
            v-for="card in store.cardsForCell(row.id, col.id)"
            :key="card.id"
            class="tl-card"
            :class="{ 'tl-card--dragging': draggingId === card.id }"
            :style="{ '--priority-color': PRIORITY_COLOR[card.priority] }"
            draggable="true"
            @dragstart="onDragStart($event, card.id)"
            @dragend="onDragEnd"
          >
            <span class="tl-card__strip" />
            <div class="tl-card__body">
              <span class="tl-card__title">{{ card.title }}</span>
              <span
                v-if="card.dueDate"
                class="tl-card__date"
                :class="`tl-card__date--${classifyDueDate(card.dueDate)}`"
              >{{ fmtDate(card.dueDate) }}</span>
            </div>
          </div>

          <!-- Inline add form -->
          <div v-if="addingCell === cellKey(row.id, col.id)" class="tl-add">
            <textarea
              ref="addInputRef"
              v-model="newCardTitle"
              class="tl-add__input"
              rows="2"
              :placeholder="i18n.t('kanban.addPlaceholder')"
              @keydown.enter.prevent="confirmAdd(row.id, col.id)"
              @keydown.escape="cancelAdd"
              @blur="cancelAdd"
            />
          </div>

          <!-- Empty drop zone + add button -->
          <button
            v-if="store.cardsForCell(row.id, col.id).length === 0 && addingCell !== cellKey(row.id, col.id)"
            class="timeline__cell-add"
            @click="startAdd(row.id, col.id)"
          >+</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timeline {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}

/* Header */
.timeline__header {
  display: grid;
  grid-template-columns: 120px repeat(3, 1fr);
  border-bottom: 2px solid var(--color-border);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--color-surface);
}

.timeline__corner {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border-right: 1px solid var(--color-border);
}

.timeline__corner-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
}

.timeline__col-head {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 14px;
  border-right: 1px solid var(--color-border);
}
.timeline__col-head:last-child { border-right: none; }

.timeline__col-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--col-color);
  flex-shrink: 0;
}

.timeline__col-name {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  flex: 1;
}

.timeline__col-count {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  padding: 1px 6px;
  border-radius: 99px;
  border: 1px solid var(--color-border);
}

/* Body */
.timeline__body {
  flex: 1;
  overflow-y: auto;
}

/* Row */
.timeline__row {
  display: grid;
  grid-template-columns: 120px repeat(3, 1fr);
  border-bottom: 1px solid var(--color-border);
  min-height: 56px;
}
.timeline__row:last-child { border-bottom: none; }

/* Row color accents */
.timeline__row--overdue   { background: color-mix(in srgb, #ef4444 3%, transparent); }
.timeline__row--today     { background: color-mix(in srgb, #f59e0b 4%, transparent); }
.timeline__row--tomorrow  { background: transparent; }
.timeline__row--this-week { background: transparent; }
.timeline__row--later     { background: transparent; }
.timeline__row--no-date   { background: var(--color-surface-elevated); }

/* Row header */
.timeline__row-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 10px 10px 14px;
  border-right: 1px solid var(--color-border);
  position: sticky;
  left: 0;
  background: inherit;
  z-index: 1;
}

.timeline__row-icon {
  font-size: 12px;
  width: 16px;
  text-align: center;
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.timeline__row--overdue   .timeline__row-icon { color: #ef4444; }
.timeline__row--today     .timeline__row-icon { color: #f59e0b; }

.timeline__row-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
  flex: 1;
}

.timeline__row--overdue .timeline__row-label { color: #ef4444; }
.timeline__row--today   .timeline__row-label { color: #f59e0b; }

.timeline__row-count {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}

/* Cell */
.timeline__cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  border-right: 1px solid var(--color-border);
  transition: background var(--t-fast);
  min-height: 52px;
}
.timeline__cell:last-child { border-right: none; }

.timeline__cell--dragover {
  background: var(--color-accent-muted);
  outline: 2px dashed var(--color-accent);
  outline-offset: -2px;
}

.timeline__cell-add {
  align-self: flex-start;
  font-size: 14px;
  color: var(--color-text-muted);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  opacity: 0;
  transition: opacity var(--t-fast), color var(--t-fast);
}
.timeline__cell:hover .timeline__cell-add { opacity: 1; }
.timeline__cell-add:hover { color: var(--color-accent); }

/* Inline add */
.tl-add__input {
  font-size: 13px;
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  width: 100%;
  outline: none;
  resize: none;
  font-family: inherit;
  line-height: 1.4;
}

/* Timeline card */
.tl-card {
  display: flex;
  align-items: stretch;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: grab;
  transition: border-color var(--t-fast), box-shadow var(--t-fast), opacity var(--t-fast);
  gap: 0;
}

.tl-card:hover {
  border-color: color-mix(in srgb, var(--color-accent) 40%, var(--color-border));
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
}

.tl-card:active   { cursor: grabbing; }
.tl-card--dragging { opacity: 0.35; }

.tl-card__strip {
  width: 3px;
  background: var(--priority-color);
  flex-shrink: 0;
  opacity: 0.8;
}

.tl-card__body {
  flex: 1;
  padding: 5px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.tl-card__title {
  font-size: 12px;
  color: var(--color-text);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tl-card__date {
  font-size: 10px;
  font-family: var(--font-mono);
}
.tl-card__date--overdue   { color: #ef4444; }
.tl-card__date--today     { color: #f59e0b; }
.tl-card__date--tomorrow  { color: var(--color-text-muted); }
.tl-card__date--this-week { color: var(--color-text-muted); }
.tl-card__date--later     { color: var(--color-text-muted); opacity: 0.6; }
</style>
