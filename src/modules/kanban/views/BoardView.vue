<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useBoardStore } from '../stores/board.store'
import { useTasksStore } from '@/modules/task-manager/stores/tasks.store'
import { BOARD_COLUMNS, PRIORITY_COLOR, classifyDueDate } from '../types'
import type { BoardColumnId, CardPriority } from '../types'
import { useLocale } from '@/core/i18n'
import TimelineGrid from '../components/TimelineGrid.vue'
import { useConfirm } from '@/core/composables/useConfirm'
import { UiButton, UiIconButton, UiInput, UiSelect, UiTextarea, UiModal } from '@/ui'
import type { SelectOption } from '@/ui'

const store      = useBoardStore()
const tasksStore = useTasksStore()
const i18n       = useLocale()
const { confirm } = useConfirm()

async function deleteCard(cardId: string) {
  const ok = await confirm({
    title:        'Delete this card?',
    body:         'The card will be permanently removed from the board.',
    danger:       true,
    confirmLabel: 'Delete card',
  })
  if (ok) store.deleteCard(cardId)
}

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
const modalTitleRef    = ref<InstanceType<typeof UiInput> | null>(null)

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

// UiSelect bridges: BoardColumnId + CardPriority are strings, UiSelect emits string|number
const colOptions = computed<SelectOption[]>(() =>
  BOARD_COLUMNS.map(c => ({ value: c.id, label: colLabel(c.id) }))
)

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'none',   label: 'None' },
  { value: 'low',    label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const modalColStr = computed({
  get: () => modalCol.value as string,
  set: (v: string | number) => { modalCol.value = String(v) as BoardColumnId },
})

const modalPriorityStr = computed({
  get: () => modalPriority.value as string,
  set: (v: string | number) => { modalPriority.value = String(v) as CardPriority },
})

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
  const camel = colId.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
  return i18n.t(`kanban.col${camel.charAt(0).toUpperCase() + camel.slice(1)}`)
}
function priorityLabel(p: CardPriority): string {
  return i18n.t(`kanban.priority${p.charAt(0).toUpperCase() + p.slice(1)}`)
}
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(i18n.localeCode, { month: 'short', day: 'numeric' })
}

// ── Search + filter ─────────────────────────────────────────────────
const searchQuery      = ref('')
const priorityFilter   = ref<CardPriority | 'all'>('all')

const PRIORITY_OPTS: { val: CardPriority | 'all'; label: string }[] = [
  { val: 'all',    label: 'All' },
  { val: 'high',   label: '🔴 High' },
  { val: 'medium', label: '🟡 Medium' },
  { val: 'low',    label: '🟢 Low' },
  { val: 'none',   label: 'None' },
]

function filteredCardsForColumn(colId: BoardColumnId) {
  let cards = store.cardsForColumn(colId)
  const q = searchQuery.value.trim().toLowerCase()
  if (q) cards = cards.filter(c => c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
  if (priorityFilter.value !== 'all') cards = cards.filter(c => c.priority === priorityFilter.value)
  return cards
}

const colCounts  = computed(() =>
  Object.fromEntries(BOARD_COLUMNS.map(c => [c.id, filteredCardsForColumn(c.id).length]))
)
const totalCards = computed(() => store.cards.length)
const filteredTotal = computed(() => BOARD_COLUMNS.reduce((s, c) => s + filteredCardsForColumn(c.id).length, 0))

// ── Mobile single-column view ────────────────────────────────────────
const activeColMobile = ref<BoardColumnId>('backlog')
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

    <!-- Search + priority filter bar -->
    <div v-if="store.cards.length > 0" class="board__filter-bar">
      <div class="board__search-wrap">
        <svg class="board__search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.4"/>
          <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
        <input
          v-model="searchQuery"
          class="board__search-input"
          placeholder="Search cards…"
          autocomplete="off"
        />
        <UiIconButton v-if="searchQuery" name="X" aria-label="Clear search" size="sm" class="board__search-clear" @click="searchQuery = ''" />
      </div>
      <div class="board__priority-chips">
        <button
          v-for="opt in PRIORITY_OPTS"
          :key="opt.val"
          class="board__pri-chip"
          :class="{ 'board__pri-chip--active': priorityFilter === opt.val }"
          @click="priorityFilter = opt.val"
        >{{ opt.label }}</button>
      </div>
      <span v-if="searchQuery || priorityFilter !== 'all'" class="board__filter-count">
        {{ filteredTotal }} card{{ filteredTotal !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Workspace ───────────────────────────────────────────── -->
    <div class="board__workspace" :class="{ 'board__workspace--with-panel': showTaskPanel }">

      <!-- ── Mobile column tabs (< 768px) ─────────────── -->
      <div v-if="store.viewMode === 'kanban'" class="board__mobile-tabs">
        <button
          v-for="col in BOARD_COLUMNS"
          :key="col.id"
          class="board__mobile-tab"
          :class="{ 'board__mobile-tab--active': activeColMobile === col.id }"
          @click="activeColMobile = col.id"
        >
          <span class="board__mobile-tab-dot" :style="{ background: col.color }" />
          {{ colLabel(col.id) }}
          <span class="board__mobile-tab-count">{{ colCounts[col.id] }}</span>
        </button>
      </div>

      <!-- ── Kanban view ──────────────────────────────────── -->
      <div v-if="store.viewMode === 'kanban'" class="board__columns">
        <div
          v-for="col in BOARD_COLUMNS"
          :key="col.id"
          class="board-col"
          :class="{
            'board-col--dragover': dragOverCol === col.id,
            'board-col--mobile-hidden': activeColMobile !== col.id,
          }"
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
              v-for="card in filteredCardsForColumn(col.id)"
              :key="card.id"
              class="board-card"
              :class="{
                'board-card--dragging':  draggingId === card.id,
                'board-card--expanded':  expandedId === card.id,
              }"
              :style="{ '--priority-color': PRIORITY_COLOR[card.priority] }"
              draggable="true"
              @dragstart="onDragStart($event, card.id)"
              @dragend="onDragEnd"
            >
              <!-- Left priority strip -->
              <span
                class="board-card__priority-strip"
                :title="priorityLabel(card.priority)"
                @click.stop="store.cyclePriority(card.id)"
              />

              <div class="board-card__body">
                <!-- Title (inline edit mode) -->
                <input
                  v-if="editingId === card.id"
                  ref="editInputRef"
                  v-model="editTitle"
                  class="board-card__title-input"
                  @keydown.enter="confirmEdit"
                  @keydown.escape="cancelEdit"
                  @blur="confirmEdit"
                />
                <span
                  v-else
                  class="board-card__title"
                  @dblclick="startEdit(card.id, card.title)"
                >{{ card.title }}</span>

                <!-- Meta row — always visible -->
                <div class="board-card__meta">
                  <!-- Priority dot -->
                  <span
                    v-if="card.priority !== 'none'"
                    class="board-card__pri-dot"
                    :style="{ background: PRIORITY_COLOR[card.priority] }"
                    :title="priorityLabel(card.priority)"
                    @click.stop="store.cyclePriority(card.id)"
                  />
                  <!-- Due date -->
                  <span
                    v-if="card.dueDate"
                    class="board-card__due"
                    :class="`board-card__due--${classifyDueDate(card.dueDate)}`"
                  >{{ fmtDate(card.dueDate) }}</span>
                  <!-- Source indicator -->
                  <span v-if="card.sourceTaskId" class="board-card__source-dot" title="Imported from Tasks">⊙</span>

                  <span class="board-card__meta-spacer" />

                  <!-- Expand toggle (shows if there's a description or card is expanded) -->
                  <button
                    class="board-card__expand"
                    :class="{ 'board-card__expand--open': expandedId === card.id }"
                    @click.stop="toggleExpand(card.id)"
                    :title="expandedId === card.id ? 'Collapse' : 'Expand'"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>

                  <!-- Delete (hover) -->
                  <UiIconButton
                    name="X"
                    aria-label="Delete card"
                    size="sm"
                    variant="danger"
                    class="board-card__del"
                    @click.stop="deleteCard(card.id)"
                  />
                </div>

                <!-- Expanded section -->
                <template v-if="expandedId === card.id">
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
                    @blur="confirmEditDesc(card.id)"
                  />

                  <!-- Expanded actions: priority + date -->
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
                      v-show="targetCol.id !== col.id"
                      class="board-card__move-btn"
                      :style="{ '--move-dot': targetCol.color }"
                      @click.stop="store.moveCard(card.id, targetCol.id); activeColMobile = targetCol.id"
                    >{{ colLabel(targetCol.id) }}</button>
                  </div>
                </template>
              </div>
            </div>

            <div v-if="store.cardsForColumn(col.id).length === 0" class="board-col__empty">
              <span>{{ i18n.t('kanban.emptyCol') }}</span>
            </div>
          </div>

          <UiButton variant="ghost" size="sm" class="board-col__add-btn" @click="startAdd(col.id)">
            + {{ i18n.t('kanban.addCard') }}
          </UiButton>
        </div>
      </div>

      <!-- ── Timeline view ────────────────────────────────── -->
      <TimelineGrid v-else class="board__timeline" />

      <!-- ── Task import panel ─────────────────────────── -->
      <Transition name="panel-slide">
        <div v-if="showTaskPanel" class="task-panel">
          <div class="task-panel__header">
            <span class="task-panel__title">{{ i18n.t('kanban.fromTasks') }}</span>
            <UiIconButton name="X" aria-label="Close task panel" size="sm" @click="showTaskPanel = false" />
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
    <UiModal v-model:open="showAddModal" size="sm" @close="cancelAdd">
      <template #header>
        <h2 class="modal__title">{{ i18n.t('kanban.modalTitle') }}</h2>
      </template>

      <template #body>
        <div class="modal__body-inner" @keydown="onModalKeydown">
          <UiInput
            ref="modalTitleRef"
            v-model="modalTitle"
            :placeholder="i18n.t('kanban.addPlaceholder')"
            @enter="confirmAdd"
          />

          <UiTextarea
            v-model="modalDesc"
            :placeholder="i18n.t('kanban.modalDescPlaceholder')"
            :rows="3"
            resize="none"
          />

          <div class="modal__row">
            <div class="modal__field">
              <label class="modal__label">{{ i18n.t('kanban.modalColumn') }}</label>
              <UiSelect v-model="modalColStr" :options="colOptions" />
            </div>
            <div class="modal__field">
              <label class="modal__label">{{ i18n.t('kanban.modalPriority') }}</label>
              <UiSelect v-model="modalPriorityStr" :options="PRIORITY_OPTIONS" />
            </div>
            <div class="modal__field">
              <label class="modal__label">{{ i18n.t('kanban.modalDueDate') }}</label>
              <UiInput v-model="modalDueDate" type="date" />
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <UiButton variant="ghost" @click="cancelAdd">{{ i18n.t('kanban.modalCancel') }}</UiButton>
        <UiButton :disabled="!modalTitle.trim()" @click="confirmAdd">
          {{ i18n.t('kanban.modalCreate') }}
        </UiButton>
      </template>
    </UiModal>

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

/* Filter bar */
.board__filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 6px 0 2px;
  flex-shrink: 0;
}

.board__search-wrap {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  flex: 0 1 220px;
  transition: border-color var(--t-fast);
}
.board__search-wrap:focus-within { border-color: var(--color-accent); }

.board__search-icon { color: var(--color-text-muted); flex-shrink: 0; }

.board__search-input {
  flex: 1;
  font-size: 13px;
  color: var(--color-text);
  background: transparent;
  border: none;
  outline: none;
  min-width: 0;
}
.board__search-input::placeholder { color: var(--color-text-muted); }

.board__search-clear {
  font-size: 16px;
  line-height: 1;
  color: var(--color-text-muted);
  padding: 0 2px;
  cursor: pointer;
  transition: color var(--t-fast);
}
.board__search-clear:hover { color: var(--color-text); }

.board__priority-chips {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.board__pri-chip {
  padding: 4px 10px;
  font-size: 12px;
  font-family: inherit;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--t-fast);
}
.board__pri-chip:hover:not(.board__pri-chip--active) {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}
.board__pri-chip--active {
  background: var(--color-accent-muted);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.board__filter-count {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  white-space: nowrap;
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

/* ── Card ──────────────────────────────────────────────────────────── */
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

/* Priority strip */
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

/* Card body */
.board-card__body {
  flex: 1;
  padding: 9px 10px 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

/* Title */
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

/* Meta row — priority dot + date + delete */
.board-card__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  min-height: 18px;
}
.board-card__meta-spacer { flex: 1; }

/* Priority dot */
.board-card__pri-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform var(--t-fast);
}
.board-card__pri-dot:hover { transform: scale(1.3); }

/* Due date badge */
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

/* Source dot */
.board-card__source-dot {
  font-size: 10px;
  color: var(--color-text-muted);
  opacity: 0.6;
  cursor: default;
}

/* Expand chevron */
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
}
.board-card:hover .board-card__expand,
.board-card--expanded .board-card__expand { opacity: 1; }
.board-card__expand:hover { color: var(--color-accent); background: var(--color-accent-muted); }
.board-card__expand--open { transform: rotate(180deg); color: var(--color-accent); opacity: 1; }

/* Delete button (hover-only) */
.board-card__del {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  border-radius: 3px;
  flex-shrink: 0;
  opacity: 0;
  transition: color var(--t-fast), background var(--t-fast), opacity var(--t-fast);
}
.board-card:hover .board-card__del { opacity: 1; }
.board-card__del:hover {
  color: #ef4444;
  background: color-mix(in srgb, #ef4444 10%, transparent);
}

/* Expanded: description */
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

/* Expanded: action row (priority chip + date picker) */
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

/* ── Mobile column tabs ──────────────────────────────────── */
.board__mobile-tabs {
  display: none; /* hidden on desktop */
}

/* ── Mobile: move-to buttons inside expanded card ─────── */
.board-card__move-row {
  display: none; /* hidden on desktop */
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
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
}
.board-card__move-btn:hover {
  background: var(--color-accent-muted);
  color: var(--color-accent);
  border-color: color-mix(in srgb, var(--color-accent) 30%, transparent);
}

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
  /* Mobile workspace stacks */
  .board__workspace {
    flex-direction: column;
    overflow-y: auto;
    gap: 0;
  }
  .board__header { flex-direction: column; align-items: flex-start; }

  /* Show mobile tab selector */
  .board__mobile-tabs {
    display: flex;
    gap: 4px;
    padding: 0 0 10px;
    flex-shrink: 0;
  }
  .board__mobile-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-muted);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
  }
  .board__mobile-tab--active {
    background: var(--color-surface-elevated);
    color: var(--color-text);
    border-color: var(--color-accent);
  }
  .board__mobile-tab-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .board__mobile-tab-count {
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--color-text-muted);
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    padding: 0 5px;
    border-radius: 99px;
    line-height: 1.6;
  }

  /* Hide non-active column */
  .board-col--mobile-hidden { display: none; }
  .board__columns {
    grid-template-columns: 1fr;
    flex: none;
  }
  .board-col:last-child { grid-column: span 1; }
  .board-col { max-height: none; }

  /* Show move-to buttons */
  .board-card__move-row { display: flex; }

  /* Disable drag cursor */
  .board-card { cursor: default; }
  .board-card:active { cursor: default; }

  .task-panel { width: 100%; align-self: auto; }
}
</style>
