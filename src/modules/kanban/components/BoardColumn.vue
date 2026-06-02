<script setup lang="ts">
import type { BoardCard, BoardColumn, BoardColumnId } from '../types'
import { useLocale } from '@/core/i18n'
import { UiButton } from '@/ui'
import BoardCardCmp from './BoardCard.vue'

const props = defineProps<{
  col: BoardColumn
  cards: BoardCard[]
  isDragOver: boolean
  isMobileHidden: boolean
  expandedCardId: string | null
  activeColMobile: BoardColumnId
}>()

const emit = defineEmits<{
  'drag-enter': [colId: BoardColumnId]
  'drag-leave': [colId: BoardColumnId]
  'drop': [colId: BoardColumnId]
  'add-card': [colId: BoardColumnId]
  'toggle-expand': [cardId: string]
  'delete-card': [cardId: string]
  'card-drag-start': [event: DragEvent, cardId: string]
  'card-drag-end': []
}>()

const i18n = useLocale()

function colLabel(): string {
  const camel = props.col.id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
  return i18n.t(`kanban.col${camel.charAt(0).toUpperCase() + camel.slice(1)}`)
}
</script>

<template>
  <div
    class="board-col"
    :class="{
      'board-col--dragover':       isDragOver,
      'board-col--mobile-hidden':  isMobileHidden,
    }"
    @dragenter.prevent="emit('drag-enter', col.id)"
    @dragleave="emit('drag-leave', col.id)"
    @dragover.prevent
    @drop.prevent="emit('drop', col.id)"
  >
    <div class="board-col__header" :style="{ '--col-color': col.color }">
      <span class="board-col__dot" />
      <span class="board-col__name">{{ colLabel() }}</span>
      <span class="board-col__count">{{ cards.length }}</span>
    </div>

    <div class="board-col__cards">
      <BoardCardCmp
        v-for="card in cards"
        :key="card.id"
        :card="card"
        :col-id="col.id"
        :is-expanded="expandedCardId === card.id"
        :is-dragging="false"
        :active-col-mobile="activeColMobile"
        @toggle-expand="emit('toggle-expand', $event)"
        @delete="emit('delete-card', $event)"
        @drag-start="(e, id) => emit('card-drag-start', e, id)"
        @drag-end="emit('card-drag-end')"
      />

      <div v-if="cards.length === 0" class="board-col__empty">
        <span>{{ i18n.t('kanban.emptyCol') }}</span>
      </div>
    </div>

    <UiButton variant="ghost" size="sm" class="board-col__add-btn" @click="emit('add-card', col.id)">
      + {{ i18n.t('kanban.addCard') }}
    </UiButton>
  </div>
</template>

<style scoped>
.board-col {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
  transition: border-color var(--t-fast);
}

.board-col--dragover {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 20%, transparent);
}

.board-col__header {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 12px 8px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.board-col__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--col-color, var(--color-accent));
  flex-shrink: 0;
}

.board-col__name {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-secondary);
  flex: 1;
}

.board-col__count {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  padding: 0 5px;
  border-radius: 99px;
  line-height: 1.6;
}

.board-col__cards {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.board-col__empty {
  padding: 20px 12px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-muted);
  opacity: 0.6;
}

.board-col__add-btn {
  margin: 6px 8px 8px;
  justify-content: flex-start;
}
.board-col__add-btn:hover { background: var(--color-surface-elevated); color: var(--color-accent); }

@media (max-width: 767px) {
  .board-col--mobile-hidden { display: none; }
  .board-col { max-height: none; }
}
</style>
