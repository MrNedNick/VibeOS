<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useBoardStore } from '../stores/board.store'
import { useTasksStore } from '@/modules/task-manager/stores/tasks.store'
import { BOARD_COLUMNS } from '../types'
import type { BoardColumnId, CardPriority } from '../types'
import { useLocale } from '@/core/i18n'
import TimelineGrid from '../components/TimelineGrid.vue'
import BoardColumn from '../components/BoardColumn.vue'
import { useBoardDrag } from '../composables/useBoardDrag'
import { useConfirm } from '@/core/composables/useConfirm'
import { UiButton, UiIconButton, UiInput, UiSelect, UiTextarea, UiModal, UiFab } from '@/ui'
import type { SelectOption } from '@/ui'

const store      = useBoardStore()
const tasksStore = useTasksStore()
const i18n       = useLocale()
const { confirm } = useConfirm()
const { dragOverCol, onDragStart, onDragEnd, onDragEnter, onDragLeave, onDrop } = useBoardDrag()

async function deleteCard(cardId: string): Promise<void> {
  const ok = await confirm({
    title:        'Delete this card?',
    body:         'The card will be permanently removed from the board.',
    danger:       true,
    confirmLabel: 'Delete card',
  })
  if (ok) store.deleteCard(cardId)
}

// ── Expand state (one card at a time) ───────────────────────────────
const expandedId = ref<string | null>(null)
function toggleExpand(cardId: string): void {
  expandedId.value = expandedId.value === cardId ? null : cardId
}

// ── Add card modal ───────────────────────────────────────────────────
const showAddModal  = ref(false)
const modalCol      = ref<BoardColumnId>('backlog')
const modalTitle    = ref('')
const modalDesc     = ref('')
const modalPriority = ref<CardPriority>('none')
const modalDueDate  = ref('')
const modalTitleRef = ref<InstanceType<typeof UiInput> | null>(null)

async function startAdd(colId: BoardColumnId): Promise<void> {
  modalCol.value      = colId
  modalTitle.value    = ''
  modalDesc.value     = ''
  modalPriority.value = 'none'
  modalDueDate.value  = ''
  showAddModal.value  = true
  await nextTick(); modalTitleRef.value?.focus()
}

function confirmAdd(): void {
  if (!modalTitle.value.trim()) return
  const id = store.addCard(modalCol.value, modalTitle.value.trim(), modalDueDate.value || undefined)
  if (modalDesc.value.trim()) store.updateCard(id, { description: modalDesc.value.trim() })
  if (modalPriority.value !== 'none') store.updateCard(id, { priority: modalPriority.value })
  showAddModal.value = false
}
function cancelAdd(): void { showAddModal.value = false }

const colOptions = computed<SelectOption[]>(() =>
  BOARD_COLUMNS.map(c => ({ value: c.id, label: colLabel(c.id) }))
)
const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'none', label: 'None' }, { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' },
]
const modalColStr = computed({
  get: () => modalCol.value as string,
  set: (v: string | number) => { modalCol.value = String(v) as BoardColumnId },
})
const modalPriorityStr = computed({
  get: () => modalPriority.value as string,
  set: (v: string | number) => { modalPriority.value = String(v) as CardPriority },
})
function onModalKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape') cancelAdd()
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); confirmAdd() }
}

// ── Task import panel ────────────────────────────────────────────────
const showTaskPanel = ref(false)
const importableTasks = computed(() => tasksStore.tasks.filter(t => !t.done))

// ── Search + filter ──────────────────────────────────────────────────
const searchQuery    = ref('')
const priorityFilter = ref<CardPriority | 'all'>('all')

const PRIORITY_OPTS: { val: CardPriority | 'all'; label: string }[] = [
  { val: 'all', label: 'All' }, { val: 'high', label: '🔴 High' },
  { val: 'medium', label: '🟡 Medium' }, { val: 'low', label: '🟢 Low' }, { val: 'none', label: 'None' },
]

function filteredCardsForColumn(colId: BoardColumnId) {
  let cards = store.cardsForColumn(colId)
  const q = searchQuery.value.trim().toLowerCase()
  if (q) cards = cards.filter(c => c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
  if (priorityFilter.value !== 'all') cards = cards.filter(c => c.priority === priorityFilter.value)
  return cards
}

const colCounts = computed(() =>
  Object.fromEntries(BOARD_COLUMNS.map(c => [c.id, filteredCardsForColumn(c.id).length]))
)
const totalCards    = computed(() => store.cards.length)
const filteredTotal = computed(() => BOARD_COLUMNS.reduce((s, c) => s + filteredCardsForColumn(c.id).length, 0))

// ── Mobile tabs ──────────────────────────────────────────────────────
const activeColMobile = ref<BoardColumnId>('backlog')

// ── Helpers ──────────────────────────────────────────────────────────
function colLabel(colId: BoardColumnId): string {
  const camel = colId.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
  return i18n.t(`kanban.col${camel.charAt(0).toUpperCase() + camel.slice(1)}`)
}
</script>

<template>
  <div class="board">

    <!-- Header -->
    <div class="board__header">
      <div>
        <h1 class="board__title">{{ i18n.t('kanban.title') }}</h1>
        <p class="board__meta">{{ totalCards }} {{ i18n.t('kanban.totalCards') }}</p>
      </div>
      <div class="board__controls">
        <UiButton size="sm" @click="startAdd('backlog')">+ New card</UiButton>
        <div class="board__view-toggle">
          <button class="board__view-btn" :class="{ 'board__view-btn--active': store.viewMode === 'kanban' }" @click="store.viewMode = 'kanban'">{{ i18n.t('kanban.viewKanban') }}</button>
          <button class="board__view-btn" :class="{ 'board__view-btn--active': store.viewMode === 'timeline' }" @click="store.viewMode = 'timeline'">{{ i18n.t('kanban.viewTimeline') }}</button>
        </div>
        <button class="board__import-btn" :class="{ 'board__import-btn--active': showTaskPanel }" @click="showTaskPanel = !showTaskPanel">{{ i18n.t('kanban.fromTasks') }}</button>
      </div>
    </div>

    <!-- Search + filter bar -->
    <div v-if="store.cards.length > 0" class="board__filter-bar">
      <div class="board__search-wrap">
        <svg class="board__search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.4"/>
          <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
        <input v-model="searchQuery" class="board__search-input" placeholder="Search cards…" autocomplete="off" />
        <UiIconButton v-if="searchQuery" name="X" aria-label="Clear search" size="sm" @click="searchQuery = ''" />
      </div>
      <div class="board__priority-chips">
        <button v-for="opt in PRIORITY_OPTS" :key="opt.val" class="board__pri-chip" :class="{ 'board__pri-chip--active': priorityFilter === opt.val }" @click="priorityFilter = opt.val">{{ opt.label }}</button>
      </div>
      <span v-if="searchQuery || priorityFilter !== 'all'" class="board__filter-count">
        {{ filteredTotal }} card{{ filteredTotal !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Workspace -->
    <div class="board__workspace" :class="{ 'board__workspace--with-panel': showTaskPanel }">

      <!-- Mobile column tabs -->
      <div v-if="store.viewMode === 'kanban'" class="board__mobile-tabs">
        <button v-for="col in BOARD_COLUMNS" :key="col.id" class="board__mobile-tab" :class="{ 'board__mobile-tab--active': activeColMobile === col.id }" @click="activeColMobile = col.id">
          <span class="board__mobile-tab-dot" :style="{ background: col.color }" />
          {{ colLabel(col.id) }}
          <span class="board__mobile-tab-count">{{ colCounts[col.id] }}</span>
        </button>
      </div>

      <!-- Kanban columns -->
      <div v-if="store.viewMode === 'kanban'" class="board__columns">
        <BoardColumn
          v-for="col in BOARD_COLUMNS"
          :key="col.id"
          :col="col"
          :cards="filteredCardsForColumn(col.id)"
          :is-drag-over="dragOverCol === col.id"
          :is-mobile-hidden="activeColMobile !== col.id"
          :expanded-card-id="expandedId"
          :active-col-mobile="activeColMobile"
          @drag-enter="onDragEnter"
          @drag-leave="onDragLeave"
          @drop="onDrop"
          @add-card="startAdd"
          @toggle-expand="toggleExpand"
          @delete-card="deleteCard"
          @card-drag-start="(e, id) => { onDragStart(e, id) }"
          @card-drag-end="onDragEnd"
        />
      </div>

      <!-- Timeline view -->
      <TimelineGrid v-else class="board__timeline" />

      <!-- Task import panel -->
      <Transition name="panel-slide">
        <div v-if="showTaskPanel" class="task-panel">
          <div class="task-panel__header">
            <span class="task-panel__title">{{ i18n.t('kanban.fromTasks') }}</span>
            <UiIconButton name="X" aria-label="Close task panel" size="sm" @click="showTaskPanel = false" />
          </div>
          <div v-if="importableTasks.length === 0" class="task-panel__empty">{{ i18n.t('kanban.noTasks') }}</div>
          <ul v-else class="task-panel__list">
            <li v-for="task in importableTasks" :key="task.id" class="task-panel__item" :class="{ 'task-panel__item--added': store.isTaskOnBoard(task.id) }">
              <span class="task-panel__task-text">{{ task.text }}</span>
              <span v-if="store.isTaskOnBoard(task.id)" class="task-panel__on-board">{{ i18n.t('kanban.onBoard') }}</span>
              <button v-else class="task-panel__add-btn" @click="store.importFromTask(task.id, task.text)">+</button>
            </li>
          </ul>
        </div>
      </Transition>
    </div>

    <!-- Add card modal -->
    <UiModal v-model:open="showAddModal" size="sm" @close="cancelAdd">
      <template #header>
        <h2 class="modal__title">{{ i18n.t('kanban.modalTitle') }}</h2>
      </template>
      <template #body>
        <div class="modal__body-inner" @keydown="onModalKeydown">
          <UiInput ref="modalTitleRef" v-model="modalTitle" :placeholder="i18n.t('kanban.addPlaceholder')" @enter="confirmAdd" />
          <UiTextarea v-model="modalDesc" :placeholder="i18n.t('kanban.modalDescPlaceholder')" :rows="3" resize="none" />
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
        <UiButton :disabled="!modalTitle.trim()" @click="confirmAdd">{{ i18n.t('kanban.modalCreate') }}</UiButton>
      </template>
    </UiModal>

    <UiFab label="New card" icon="Layout" @click="startAdd('backlog')" />
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

.board__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
  flex-wrap: wrap;
}
.board__title { font-size: 24px; font-weight: 700; color: var(--color-text); margin: 0; }
.board__meta { font-size: 13px; color: var(--color-text-muted); margin: 3px 0 0; }
.board__controls { display: flex; align-items: center; gap: 8px; }

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
  background: none;
  border: none;
  cursor: pointer;
}
.board__view-btn:hover:not(.board__view-btn--active) { background: var(--color-surface-elevated); }
.board__view-btn--active { background: var(--color-accent); color: #fff; }

.board__import-btn {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
}
.board__import-btn:hover, .board__import-btn--active {
  background: var(--color-accent-muted);
  color: var(--color-accent);
  border-color: var(--color-accent-muted);
}

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
.board__search-input { flex: 1; font-size: 13px; color: var(--color-text); background: transparent; border: none; outline: none; min-width: 0; }
.board__search-input::placeholder { color: var(--color-text-muted); }
.board__priority-chips { display: flex; gap: 4px; flex-wrap: wrap; }
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
.board__pri-chip:hover:not(.board__pri-chip--active) { background: var(--color-surface-elevated); color: var(--color-text); }
.board__pri-chip--active { background: var(--color-accent-muted); border-color: var(--color-accent); color: var(--color-accent); }
.board__filter-count { font-size: 12px; font-family: var(--font-mono); color: var(--color-text-muted); white-space: nowrap; }

.board__workspace {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
  overflow: hidden;
}
.board__timeline { flex: 1; min-height: 0; overflow: hidden; }
.board__columns { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; flex: 1; min-height: 0; align-items: start; }

/* Task import panel */
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
.task-panel__header { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px 10px; border-bottom: 1px solid var(--color-border); flex-shrink: 0; }
.task-panel__title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-secondary); }
.task-panel__empty { padding: 20px 14px; font-size: 13px; color: var(--color-text-muted); text-align: center; }
.task-panel__list { list-style: none; padding: 8px 0; margin: 0; overflow-y: auto; flex: 1; }
.task-panel__item { display: flex; align-items: center; gap: 8px; padding: 7px 14px; transition: background var(--t-fast); }
.task-panel__item:hover { background: var(--color-surface-elevated); }
.task-panel__item--added { opacity: 0.5; }
.task-panel__task-text { font-size: 13px; color: var(--color-text); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.task-panel__on-board { font-size: 11px; font-family: var(--font-mono); color: var(--color-success); flex-shrink: 0; }
.task-panel__add-btn {
  font-size: 16px; font-weight: 300; color: var(--color-text-muted);
  width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; background: none; border: none; cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast);
}
.task-panel__add-btn:hover { background: var(--color-accent); color: #fff; }

/* Add card modal */
.modal__title { font-size: 17px; font-weight: 700; color: var(--color-text); margin: 0; }
.modal__body-inner { display: flex; flex-direction: column; gap: 14px; }
.modal__row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.modal__field { display: flex; flex-direction: column; gap: 4px; }
.modal__label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); }

/* Transitions */
.panel-slide-enter-active { transition: transform 160ms var(--ease), opacity 160ms var(--ease); }
.panel-slide-leave-active { transition: transform 120ms var(--ease), opacity 120ms var(--ease); }
.panel-slide-enter-from, .panel-slide-leave-to { transform: translateX(16px); opacity: 0; }

/* Mobile column tabs */
.board__mobile-tabs { display: none; }

@media (max-width: 1100px) {
  .board__workspace--with-panel .board__columns { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .board__columns { grid-template-columns: repeat(2, 1fr); }
  .task-panel { width: 220px; }
}
@media (max-width: 767px) {
  .board__workspace { flex-direction: column; overflow-y: auto; gap: 0; }
  .board__header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .board__controls { flex-wrap: wrap; gap: 6px; }
  /* Filter bar: horizontally scrollable on mobile */
  .board__filter-bar { overflow-x: auto; flex-wrap: nowrap; gap: 8px; padding-bottom: 4px; }
  .board__priority-chips { flex-shrink: 0; flex-wrap: nowrap; }
  .board__mobile-tabs { display: flex; gap: 4px; padding: 0 0 10px; flex-shrink: 0; }
  .board__mobile-tab {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px 10px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500;
    color: var(--color-text-muted); background: var(--color-surface); border: 1px solid var(--color-border);
    transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast); cursor: pointer;
  }
  .board__mobile-tab--active { background: var(--color-surface-elevated); color: var(--color-text); border-color: var(--color-accent); }
  .board__mobile-tab-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .board__mobile-tab-count { font-size: 11px; font-family: var(--font-mono); color: var(--color-text-muted); background: var(--color-surface-elevated); border: 1px solid var(--color-border); padding: 0 5px; border-radius: 99px; line-height: 1.6; }
  .board__columns { grid-template-columns: 1fr; flex: none; }
  .task-panel { width: 100%; align-self: auto; }
  /* Modal form: 3-col → 1-col on mobile */
  .modal__row { grid-template-columns: 1fr; }
}
</style>
