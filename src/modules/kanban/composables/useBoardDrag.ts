import { ref } from 'vue'
import { useBoardStore } from '../stores/board.store'
import type { BoardColumnId } from '../types'

export function useBoardDrag() {
  const store = useBoardStore()
  const draggingId  = ref<string | null>(null)
  const dragOverCol = ref<BoardColumnId | null>(null)
  const dragDepth   = ref<Record<string, number>>({ backlog: 0, 'in-progress': 0, done: 0 })

  function onDragStart(e: DragEvent, cardId: string): void {
    draggingId.value = cardId
    e.dataTransfer!.effectAllowed = 'move'
    e.dataTransfer!.setData('text/plain', cardId)
  }
  function onDragEnd(): void {
    draggingId.value  = null
    dragOverCol.value = null
    dragDepth.value   = { backlog: 0, 'in-progress': 0, done: 0 }
  }
  function onDragEnter(colId: BoardColumnId): void {
    dragDepth.value[colId]++
    if (draggingId.value) dragOverCol.value = colId
  }
  function onDragLeave(colId: BoardColumnId): void {
    dragDepth.value[colId] = Math.max(0, dragDepth.value[colId] - 1)
    if (dragDepth.value[colId] === 0 && dragOverCol.value === colId) dragOverCol.value = null
  }
  function onDrop(colId: BoardColumnId): void {
    if (draggingId.value) store.moveCard(draggingId.value, colId)
    draggingId.value = null
    dragOverCol.value = null
    dragDepth.value  = { backlog: 0, 'in-progress': 0, done: 0 }
  }

  return { draggingId, dragOverCol, onDragStart, onDragEnd, onDragEnter, onDragLeave, onDrop }
}
