<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useBoardStore } from '../stores/board.store'
import { useTasksStore } from '@/modules/task-manager/stores/tasks.store'
import { BOARD_COLUMNS, PRIORITY_COLOR, classifyDueDate } from '../types'
import type { BoardColumnId, CardPriority } from '../types'
import { useLocale } from '@/core/i18n'
import TimelineGrid from '../components/TimelineGrid.vue'

const store      = useBoardStore()
const tasksStore = useTasksStore()
const i18n       = useLocale()

// ── Drag (Kanban mode only) ─────────────────────────────────────────
const draggingId  = ref<string | null>(null)
const dragOverCol = ref<BoardColumnId | null>(null)
const dragDepth   = ref<Record<string, number>>({ backlog: 0, 'in-progress': 0, done: 0 })

function onDragStart(e: DragEvent, cardId: string) {
  draggingId.value = cardId
  e.dataTransfer!.effectAllowed = 'move'
  e.dataTransfer!.setData('text/plain', cardId)
}
function onDragEnd() {
  draggingId.value  = null
  dragOverCol.value = null
  dragDepth.value   = { backlog: 0, 'in-progress': 0, done: 0 }
}
function onDragEnter(colId: BoardColumnId) {
  dragDepth.value[colId]++
  if (draggingId.value) dragOverCol.value = colId
}
function onDragLeave(colId: BoardColumnId) {
  dragDepth.value[colId] = Math.max(0, dragDepth.value[colId] - 1)
  if (dragDepth.value[colId] === 0 && dragOverCol.value === colId) dragOverCol.value = null
}
function onDrop(colId: BoardColumnId) {
  if (draggingId.value) store.moveCard(draggingId.value, colId)
  draggingId.value = null; dragOverCol.value = null
  dragDepth.value  = { backlog: 0, 'in-progress': 0, done: 0 }
}

// ── Add card (modal) ────────────────────────────────────────────────
const showAddModal     = ref(false)
const modalCol         = ref<BoardColumnId>('backlog')
const modalTitle       = ref('')
const modalDesc        = ref('')
const modalPriority    = ref<CardPriority>('none')
const modalDueDate     = ref('')
const modalTitleRef    = ref<HTMLInputElement | null>(null)

async function startAdd(colId: BoardColumnId) {
  modalCol.value      = colId
  modalTitle.value    = ''
  modalDesc.value     = ''
  modalPriority.value = 'none'
  modalDueDate.value  = ''
  showAddModal.value  = true
  await nextTick(); modalTitleRef.value?.focus()
}

function confirmAdd() {
  if (!modalTitle.value.trim()) return
  const id = store.addCard(modalCol.value, modalTitle.value.trim(), modalDueDate.value || undefined)
  if (modalDesc.value.trim()) store.updateCard(id, { description: modalDesc.value.trim() })
  if (modalPriority.value !== 'none') store.updateCard(id, { priority: modalPriority.value })
  showAddModal.value = false
}

function cancelAdd() { showAddModal.value = false }

function onModalKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') cancelAdd()
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); confirmAdd() }
}

// ── Edit card title ─────────────────────────────────────────────────
const editingId    = ref<string | null>(null)
const editTitle    = ref('')
const editInputRef = ref<HTMLInputElement | null>(null)

async function startEdit(cardId: string, title: string) {
  editingId.value = cardId; editTitle.value = title
  await nextTick(); editInputRef.value?.select()
}
function confirmEdit() {
  if (editingId.value && editTitle.value.trim())
    store.updateCard(editingId.value, { title: editTitle.value.trim() })
  editingId.value = null
}
function cancelEdit() { editingId.value = null }

// ── Expand / description ────────────────────────────────────────────
const expandedId  = ref<string | null>(null)
const editingDesc = ref(false)
const editDesc    = ref('')

function toggleExpand(id: string) {
  if (expandedId.value === id) { expandedId.value = null; editingDesc.value = false }
  else { expandedId.value = id; editingDesc.value = false }
}
async function startEditDesc(desc: string) {
  editingDesc.value = true; editDesc.value = desc
  await nextTick()
  ;(document.querySelector('.card-desc-edit') as HTMLElement)?.focus()
}
function confirmEditDesc(cardId: string) {
  store.updateCard(cardId, { description: editDesc.value }); editingDesc.value = false
}

// ── Task import panel ───────────────────────────────────────────────
const showTaskPanel = ref(false)

const importableTasks = computed(() =>
  tasksStore.tasks.filter(t => !t.done)
)

function importTask(taskId: string, text: string) {
  store.importFromTask(taskId, text)
}

// ── Helpers ─────────────────────────────────────────────────────────
function colLabel(colId: BoardColumnId): string {
  return i18n.t(`kanban.col${colId.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}`)
}
function priorityLabel(p: CardPriority): string {
  return i18n.t(`kanban.priority${p.charAt(0).toUpperCase() + p.slice(1)}`)
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(i18n.localeCode, { month: 'short', day: 'numeric' })
}

const colCounts  = computed(() =>
  Object.fromEntries(BOARD_COLUMNS.map(c => [c.id, store.cardsForColumn(c.id).length]))
)
const totalCards = computed(() => store.cards.length)
</script>

<template>
  <div class="board">

    <!-- Header ─────────────────────────────────────────────── -->
    <div class="board__header">
      <div>
        <h1 class="board__title">{{ i18n.t('kanban.title') }}</h1>
        <p class="board__meta">{{ totalCards }} {{ i18n.t('kanban.totalCards') }}</p>
      </div>

      <div class="board__controls">
        <!-- View toggle -->
        <div class="board__view-toggle">
          <button
            class="board__view-btn"
            :class="{ 'board__view-btn--active': store.viewMode === 'kanban' }"
            @click="store.viewMode = 'kanban'"
          >{{ i18n.t('kanban.viewKanban') }}</button>
          <button
            class="board__view-btn"
            :class="{ 'board__view-btn--active': store.viewMode === 'timeline' }"
            @click="store.viewMode = 'timeline'"
          >{{ i18n.t('kanban.viewTimeline') }}</button>
        </div>

        <!-- Import from tasks -->
        <button
          class="board__import-btn"
          :class="{ 'board__import-btn--active': showTaskPanel }"
          @click="showTaskPanel = !showTaskPanel"
        >{{ i18n.t('kanban.fromTasks') }}</button>
      </div>
    </div>

    <!-- Workspace ───────────────────────────────────────────── -->
    <div class="board__workspace" :class="{ 'board__workspace--with-panel': showTaskPanel }">

      <!-- ── Kanban view ──────────────────────────────────── -->
      <div v-if="store.viewMode === 'kanban'" class="board__columns">
        <div
          v-for="col in BOARD_COLUMNS"
          :key="col.id"
          class="board-col"
          :class="{ 'board-col--dragover': dragOverCol === col.id }"
          @dragenter.prevent="onDragEnter(col.id)"
          @dragleave="onDragLeave(col.id)"
          @dragover.prevent
          @drop.prevent="onDrop(col.id)"
        >
          <div class="board-col__header" :style="{ '--col-color': col.color }">
            <span class="board-col__dot" />
            <span class="board-col__name">{{ colLabel(col.id) }}</span>
            <span class="board-col__count">{{ colCounts[col.id] }}</span>
          </div>

          <div class="board-col__cards">
            <div
              v-for="card in store.cardsForColumn(col.id)"
              :key="card.id"
              class="board-card"
              :class="{
                'board-card--dragging': draggingId === card.id,
                'board-card--expanded': expandedId === card.id,
              }"
              :style="{ '--priority-color': PRIORITY_COLOR[card.priority] }"
              draggable="true"
              @dragstart="onDragStart($event, card.id)"
              @dragend="onDragEnd"
            >
              <span class="board-card__priority-strip" @click.stop="store.cyclePriority(card.id)" :title="priorityLabel(card.priority)" />

              <div class="board-card__body">
                <!-- Title row -->
                <div v-if="editingId !== card.id" class="board-card__title-row">
                  <span class="board-card__title" @dblclick="startEdit(card.id, card.title)">{{ card.title }}</span>
                  <button class="board-card__expand" @click.stop="toggleExpand(card.id)">
                    {{ expandedId === card.id ? '▴' : '▾' }}
                  </button>
                </div>
                <input
                  v-else
                  ref="editInputRef"
                  v-model="editTitle"
                  class="board-card__title-input"
                  @keydown.enter="confirmEdit"
                  @keydown.escape="cancelEdit"
                  @blur="confirmEdit"
                />

                <!-- Due date badge (Kanban view) -->
                <span
                  v-if="card.dueDate && expandedId !== card.id"
                  class="board-card__due"
                  :class="`board-card__due--${classifyDueDate(card.dueDate)}`"
                >{{ fmtDate(card.dueDate) }}</span>

                <!-- Expanded section -->
                <template v-if="expandedId === card.id">
                  <div v-if="!editingDesc" class="board-card__desc" @dblclick="startEditDesc(card.description)">
                    <span v-if="card.description" class="board-card__desc-text">{{ card.description }}</span>
                    <span v-else class="board-card__desc-empty">{{ i18n.t('kanban.addDesc') }}</span>
                  </div>
                  <textarea
                    v-else
                    class="board-card__desc-edit card-desc-edit"
                    v-model="editDesc"
                    rows="3"
                    :placeholder="i18n.t('kanban.descPlaceholder')"
                    @keydown.escape="editingDesc = false"
                    @blur="confirmEditDesc(card.id)"
                  />

                  <!-- Action row -->
                  <div class="board-card__actions">
                    <button
                      class="board-card__action board-card__action--priority"
                      :style="{ color: PRIORITY_COLOR[card.priority] }"
                      @click="store.cyclePriority(card.id)"
                    >{{ priorityLabel(card.priority) }}</button>

                    <!-- Inline date picker -->
                    <input
                      type="date"
                      class="board-card__date-input"
                      :value="card.dueDate ?? ''"
                      @change="store.setDueDate(card.id, ($event.target as HTMLInputElement).value || undefined)"
                    />

                    <button
                      class="board-card__action board-card__action--delete"
                      @click="store.deleteCard(card.id)"
                    >{{ i18n.t('kanban.delete') }}</button>
                  </div>

                  <!-- Source task indicator -->
                  <div v-if="card.sourceTaskId" class="board-card__source">
                    ⟵ {{ i18n.t('kanban.fromTasksLabel') }}
                  </div>
                </template>
              </div>
            </div>

            <div v-if="store.cardsForColumn(col.id).length === 0" class="board-col__empty">
              <span>{{ i18n.t('kanban.emptyCol') }}</span>
            </div>
          </div>

          <button class="board-col__add-btn" @click="startAdd(col.id)">
            + {{ i18n.t('kanban.addCard') }}
          </button>
        </div>
      </div>

      <!-- ── Timeline view ────────────────────────────────── -->
      <TimelineGrid v-else class="board__timeline" />

      <!-- ── Task import panel ─────────────────────────── -->
      <Transition name="panel-slide">
        <div v-if="showTaskPanel" class="task-panel">
          <div class="task-panel__header">
            <span class="task-panel__title">{{ i18n.t('kanban.fromTasks') }}</span>
            <button class="task-panel__close" @click="showTaskPanel = false">✕</button>
          </div>

          <div v-if="importableTasks.length === 0" class="task-panel__empty">
            {{ i18n.t('kanban.noTasks') }}
          </div>

          <ul v-else class="task-panel__list">
            <li
              v-for="task in importableTasks"
              :key="task.id"
              class="task-panel__item"
              :class="{ 'task-panel__item--added': store.isTaskOnBoard(task.id) }"
            >
              <span class="task-panel__task-text">{{ task.text }}</span>
              <span v-if="store.isTaskOnBoard(task.id)" class="task-panel__on-board">
                {{ i18n.t('kanban.onBoard') }}
              </span>
              <button
                v-else
                class="task-panel__add-btn"
                @click="importTask(task.id, task.text)"
              >+</button>
            </li>
          </ul>
        </div>
      </Transition>
    </div>

    <!-- ── Add card modal ──────────────────────────────── -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showAddModal" class="modal-backdrop" @mousedown.self="cancelAdd">
          <div class="modal" @keydown="onModalKeydown">
            <div class="modal__header">
              <h2 class="modal__title">{{ i18n.t('kanban.modalTitle') }}</h2>
              <button class="modal__close" @click="cancelAdd">✕</button>
            </div>

            <div class="modal__body">
              <input
                ref="modalTitleRef"
                v-model="modalTitle"
                class="modal__input"
                :placeholder="i18n.t('kanban.addPlaceholder')"
                @keydown.enter.prevent="confirmAdd"
              />

              <textarea
                v-model="modalDesc"
                class="modal__textarea"
                :placeholder="i18n.t('kanban.modalDescPlaceholder')"
                rows="3"
              />

              <div class="modal__row">
                <div class="modal__field">
                  <label class="modal__label">{{ i18n.t('kanban.modalColumn') }}</label>
                  <select v-model="modalCol" class="modal__select">
                    <option v-for="col in BOARD_COLUMNS" :key="col.id" :value="col.id">
                      {{ colLabel(col.id) }}
                    </option>
                  </select>
                </div>

                <div class="modal__field">
                  <label class="modal__label">{{ i18n.t('kanban.modalPriority') }}</label>
                  <select v-model="modalPriority" class="modal__select">
                    <option value="none">{{ i18n.t('kanban.priorityNone') }}</option>
                    <option value="low">{{ i18n.t('kanban.priorityLow') }}</option>
                    <option value="medium">{{ i18n.t('kanban.priorityMedium') }}</option>
                    <option value="high">{{ i18n.t('kanban.priorityHigh') }}</option>
                    <option value="urgent">{{ i18n.t('kanban.priorityUrgent') }}</option>
                  </select>
                </div>

                <div class="modal__field">
                  <label class="modal__label">{{ i18n.t('kanban.modalDueDate') }}</label>
                  <input type="date" v-model="modalDueDate" class="modal__date-input" />
                </div>
              </div>
            </div>

            <div class="modal__footer">
              <button class="modal__btn modal__btn--secondary" @click="cancelAdd">
                {{ i18n.t('kanban.modalCancel') }}
              </button>
              <button
                class="modal__btn modal__btn--primary"
                :disabled="!modalTitle.trim()"
                @click="confirmAdd"
              >
                {{ i18n.t('kanban.modalCreate') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<style scoped>
.board {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  gap: 16px;
}

/* Header */
.board__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.board__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.board__meta {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 3px 0 0;
}

.board__controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* View toggle */
.board__view-toggle {
  display: flex;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.board__view-btn {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: background var(--t-fast), color var(--t-fast);
}
.board__view-btn:hover:not(.board__view-btn--active) {
  background: var(--color-surface-elevated);
}
.board__view-btn--active {
  background: var(--color-accent);
  color: #fff;
}

/* Import button */
.board__import-btn {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
}
.board__import-btn:hover,
.board__import-btn--active {
  background: var(--color-accent-muted);
  color: var(--color-accent);
  border-color: var(--color-accent-muted);
}

/* Workspace */
.board__workspace {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
  overflow: hidden;
}

.board__timeline {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* Columns grid (Kanban) */
.board__columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  flex: 1;
  min-height: 0;
  align-items: start;
}

/* Column */
.board-col {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
  max-height: calc(100vh - 200px);
}
.board-col--dragover {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px var(--color-accent-muted);
}

.board-col__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px 10px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.board-col__dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--col-color);
  flex-shrink: 0;
}
.board-col__name {
  font-size: 13px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--color-text-secondary); flex: 1;
}
.board-col__count {
  font-size: 12px; font-family: var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  padding: 1px 7px; border-radius: 99px;
}

.board-col__cards {
  display: flex; flex-direction: column; gap: 6px;
  padding: 10px 10px 4px;
  overflow-y: auto; flex: 1; min-height: 60px;
}
.board-col__empty {
  padding: 20px 0; text-align: center;
  font-size: 13px; color: var(--color-text-muted); user-select: none;
}
.board-col__add-btn {
  margin: 4px 10px 10px;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  font-size: 13px; color: var(--color-text-muted); text-align: left;
  transition: background var(--t-fast), color var(--t-fast);
  flex-shrink: 0;
}
.board-col__add-btn:hover { background: var(--color-surface-elevated); color: var(--color-accent); }

/* Card */
.board-card {
  display: flex; gap: 0;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: grab;
  transition: border-color var(--t-fast), box-shadow var(--t-fast), opacity var(--t-fast);
  overflow: hidden;
}
.board-card:hover {
  border-color: color-mix(in srgb, var(--color-accent) 40%, var(--color-border));
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.board-card:active { cursor: grabbing; }
.board-card--dragging { opacity: 0.4; }
.board-card--expanded {
  border-color: color-mix(in srgb, var(--color-accent) 30%, var(--color-border));
}

.board-card__priority-strip {
  width: 4px; min-height: 100%;
  background: var(--priority-color); flex-shrink: 0;
  cursor: pointer;
  transition: width var(--t-fast), opacity var(--t-fast);
  opacity: 0.7;
}
.board-card__priority-strip:hover { width: 6px; opacity: 1; }

.board-card__body {
  flex: 1; padding: 10px 10px 8px 10px;
  display: flex; flex-direction: column; gap: 5px; min-width: 0;
}
.board-card__title-row {
  display: flex; align-items: flex-start; gap: 6px;
}
.board-card__title {
  font-size: 14px; color: var(--color-text);
  line-height: 1.4; flex: 1; min-width: 0;
  word-break: break-word; cursor: text;
}
.board-card__expand {
  font-size: 10px; color: var(--color-text-muted);
  flex-shrink: 0; padding: 2px 4px; border-radius: 3px; margin-top: 1px;
  transition: color var(--t-fast), background var(--t-fast);
}
.board-card__expand:hover { color: var(--color-accent); background: var(--color-accent-muted); }

.board-card__title-input {
  font-size: 14px; color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-accent);
  border-radius: 3px; padding: 2px 6px; width: 100%; outline: none;
}

/* Due date badge */
.board-card__due {
  font-size: 11px;
  font-family: var(--font-mono);
  padding: 1px 5px;
  border-radius: 3px;
  align-self: flex-start;
}
.board-card__due--overdue   { background: color-mix(in srgb, #ef4444 12%, transparent); color: #ef4444; }
.board-card__due--today     { background: color-mix(in srgb, #f59e0b 12%, transparent); color: #f59e0b; }
.board-card__due--tomorrow  { color: var(--color-text-muted); }
.board-card__due--this-week { color: var(--color-text-muted); }
.board-card__due--later     { color: var(--color-text-muted); opacity: 0.6; }

/* Description */
.board-card__desc { font-size: 12px; line-height: 1.5; cursor: text; min-height: 20px; }
.board-card__desc-text { color: var(--color-text-muted); white-space: pre-wrap; word-break: break-word; }
.board-card__desc-empty { color: var(--color-text-muted); opacity: 0.5; font-style: italic; }
.board-card__desc-edit {
  font-size: 12px; color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-accent); border-radius: 3px;
  padding: 4px 6px; width: 100%; outline: none; resize: none;
  line-height: 1.5; font-family: inherit;
}

/* Actions */
.board-card__actions {
  display: flex; align-items: center; gap: 6px;
  padding-top: 4px;
  border-top: 1px solid var(--color-border); margin-top: 2px;
}
.board-card__action {
  font-size: 11px; padding: 2px 7px;
  border-radius: var(--radius-sm);
  transition: background var(--t-fast);
}
.board-card__action--priority {
  font-weight: 500;
  background: color-mix(in srgb, currentColor 8%, transparent);
}
.board-card__action--priority:hover { background: color-mix(in srgb, currentColor 15%, transparent); }
.board-card__action--delete { color: var(--color-text-muted); margin-left: auto; }
.board-card__action--delete:hover {
  background: color-mix(in srgb, var(--color-danger) 10%, transparent);
  color: var(--color-danger);
}

/* Date picker in card */
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

/* Source task indicator */
.board-card__source {
  font-size: 10px;
  color: var(--color-text-muted);
  font-style: italic;
  padding-top: 2px;
}

/* ── Add card modal ──────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  width: 100%;
  max-width: 480px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px 14px;
  border-bottom: 1px solid var(--color-border);
}

.modal__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.modal__close {
  font-size: 14px;
  color: var(--color-text-muted);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: color var(--t-fast), background var(--t-fast);
}
.modal__close:hover {
  color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 8%, transparent);
}

.modal__body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px 22px;
}

.modal__input {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  outline: none;
  transition: border-color var(--t-fast);
}
.modal__input:focus { border-color: var(--color-accent); }

.modal__textarea {
  font-size: 14px;
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  outline: none;
  resize: vertical;
  min-height: 60px;
  line-height: 1.5;
  transition: border-color var(--t-fast);
}
.modal__textarea:focus { border-color: var(--color-accent); }

.modal__row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}

.modal__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal__label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}

.modal__select,
.modal__date-input {
  font-size: 13px;
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 6px 8px;
  outline: none;
  cursor: pointer;
  transition: border-color var(--t-fast);
}
.modal__select:focus,
.modal__date-input:focus { border-color: var(--color-accent); }

.modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 22px 18px;
  border-top: 1px solid var(--color-border);
}

.modal__btn {
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  transition: opacity var(--t-fast), background var(--t-fast);
  cursor: pointer;
}

.modal__btn--secondary {
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
}
.modal__btn--secondary:hover { background: var(--color-bg); }

.modal__btn--primary {
  color: #fff;
  background: var(--color-accent);
}
.modal__btn--primary:hover:not(:disabled) { opacity: 0.88; }
.modal__btn--primary:disabled { opacity: 0.4; cursor: not-allowed; }

/* Modal transition */
.modal-fade-enter-active { transition: opacity 160ms var(--ease); }
.modal-fade-enter-active .modal { transition: transform 160ms var(--ease), opacity 160ms var(--ease); }
.modal-fade-leave-active { transition: opacity 120ms var(--ease); }
.modal-fade-leave-active .modal { transition: transform 120ms var(--ease), opacity 120ms var(--ease); }
.modal-fade-enter-from { opacity: 0; }
.modal-fade-enter-from .modal { transform: scale(0.96) translateY(8px); opacity: 0; }
.modal-fade-leave-to { opacity: 0; }
.modal-fade-leave-to .modal { transform: scale(0.96) translateY(4px); opacity: 0; }

/* ── Task import panel ───────────────────────────────────── */
.task-panel {
  width: 260px;
  flex-shrink: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  align-self: flex-start;
  max-height: 100%;
}

.task-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 10px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.task-panel__title {
  font-size: 13px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}
.task-panel__close {
  font-size: 12px; color: var(--color-text-muted);
  padding: 2px 6px; border-radius: 3px;
  transition: color var(--t-fast), background var(--t-fast);
}
.task-panel__close:hover { color: var(--color-danger); background: color-mix(in srgb, var(--color-danger) 8%, transparent); }

.task-panel__empty {
  padding: 20px 14px; font-size: 13px; color: var(--color-text-muted); text-align: center;
}

.task-panel__list {
  list-style: none; padding: 8px 0; margin: 0;
  overflow-y: auto; flex: 1;
}

.task-panel__item {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 14px;
  transition: background var(--t-fast);
}
.task-panel__item:hover { background: var(--color-surface-elevated); }
.task-panel__item--added { opacity: 0.5; }

.task-panel__task-text {
  font-size: 13px; color: var(--color-text);
  flex: 1; min-width: 0;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.task-panel__on-board {
  font-size: 11px; font-family: var(--font-mono);
  color: var(--color-success);
  flex-shrink: 0;
}

.task-panel__add-btn {
  font-size: 16px; font-weight: 300;
  color: var(--color-text-muted);
  width: 22px; height: 22px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background var(--t-fast), color var(--t-fast);
}
.task-panel__add-btn:hover {
  background: var(--color-accent); color: #fff;
}

/* Panel slide transition */
.panel-slide-enter-active { transition: transform 160ms var(--ease), opacity 160ms var(--ease); }
.panel-slide-leave-active { transition: transform 120ms var(--ease), opacity 120ms var(--ease); }
.panel-slide-enter-from   { transform: translateX(16px); opacity: 0; }
.panel-slide-leave-to     { transform: translateX(16px); opacity: 0; }

/* Responsive */
@media (max-width: 1100px) {
  .board__workspace--with-panel .board__columns { grid-template-columns: repeat(2, 1fr); }
  .board__workspace--with-panel .board-col:last-child { grid-column: span 2; }
}

@media (max-width: 900px) {
  .board__columns { grid-template-columns: repeat(2, 1fr); }
  .board-col:last-child { grid-column: span 2; }
  .task-panel { width: 220px; }
}

@media (max-width: 767px) {
  .board__workspace { flex-direction: column; overflow-y: auto; }
  .board__columns { grid-template-columns: 1fr; }
  .board-col:last-child { grid-column: span 1; }
  .board-col { max-height: none; }
  .task-panel { width: 100%; align-self: auto; }
  .board__header { flex-direction: column; align-items: flex-start; }
}
</style>
