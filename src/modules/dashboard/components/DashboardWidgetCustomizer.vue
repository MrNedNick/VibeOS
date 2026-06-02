<script setup lang="ts">
import { ref } from 'vue'
import { useWidgetsStore, WIDGET_META, type WidgetId } from '../stores/widgets.store'
import { UiIcon, UiButton, UiIconButton } from '@/ui'

const emit = defineEmits<{ close: [] }>()

const store = useWidgetsStore()

// ── Drag state ────────────────────────────────────────────────────────
const draggingId = ref<WidgetId | null>(null)
const dragOverId = ref<WidgetId | null>(null)

function onDragStart(id: WidgetId) {
  draggingId.value = id
}

function onDragOver(e: DragEvent, id: WidgetId) {
  e.preventDefault()
  if (id !== draggingId.value) dragOverId.value = id
}

function onDrop(id: WidgetId) {
  if (draggingId.value && draggingId.value !== id) {
    store.reorder(draggingId.value, id)
  }
  draggingId.value = null
  dragOverId.value = null
}

function onDragEnd() {
  draggingId.value = null
  dragOverId.value = null
}
</script>

<template>
  <div class="wc">
    <!-- Header -->
    <div class="wc__header">
      <div class="wc__title-row">
        <UiIcon name="LayoutDashboard" :size="14" :stroke-width="2" class="wc__icon" />
        <span class="wc__title">Customize Widgets</span>
      </div>
      <div class="wc__header-actions">
        <UiButton variant="ghost" size="sm" title="Reset to defaults" @click="store.resetToDefaults">
          <UiIcon name="RotateCcw" :size="12" :stroke-width="2" />
          Reset
        </UiButton>
        <UiIconButton name="X" aria-label="Close" size="sm" @click="emit('close')" />
      </div>
    </div>

    <p class="wc__hint">Drag to reorder · click eye to show/hide</p>

    <!-- Widget list -->
    <ul class="wc__list">
      <li
        v-for="cfg in store.allSorted"
        :key="cfg.id"
        class="wc__item"
        :class="{
          'wc__item--dragging': draggingId === cfg.id,
          'wc__item--over': dragOverId === cfg.id,
          'wc__item--hidden': !cfg.visible,
        }"
        draggable="true"
        @dragstart="onDragStart(cfg.id)"
        @dragover="(e) => onDragOver(e, cfg.id)"
        @drop="onDrop(cfg.id)"
        @dragend="onDragEnd"
      >
        <!-- Drag handle -->
        <span class="wc__drag-handle" title="Drag to reorder">
          <UiIcon name="GripVertical" :size="14" :stroke-width="1.75" />
        </span>

        <!-- Widget icon + name -->
        <span class="wc__item-icon">
          <UiIcon :name="WIDGET_META[cfg.id].icon" :size="14" :stroke-width="1.75" />
        </span>
        <div class="wc__item-info">
          <span class="wc__item-name">{{ WIDGET_META[cfg.id].label }}</span>
          <span class="wc__item-desc">{{ WIDGET_META[cfg.id].description }}</span>
        </div>

        <!-- Visibility toggle -->
        <UiIconButton
          :name="cfg.visible ? 'Eye' : 'EyeOff'"
          :aria-label="cfg.visible ? 'Hide widget' : 'Show widget'"
          size="sm"
          class="wc__eye"
          :class="{ 'wc__eye--off': !cfg.visible }"
          @click="store.toggleWidget(cfg.id)"
        />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.wc {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 8px 24px color-mix(in srgb, var(--color-bg) 60%, transparent);
  min-width: 260px;
}

/* Header */
.wc__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.wc__title-row {
  display: flex;
  align-items: center;
  gap: 7px;
}

.wc__icon { color: var(--color-accent); }

.wc__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
}

.wc__header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.wc__reset {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  padding: 3px 8px;
  cursor: pointer;
  transition: color var(--t-fast), border-color var(--t-fast);
}
.wc__reset:hover {
  color: var(--color-text);
  border-color: var(--color-text-muted);
}

.wc__close {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  background: none;
  border: none;
  border-radius: var(--radius-xs);
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast);
}
.wc__close:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

/* Hint */
.wc__hint {
  font-size: 11px;
  color: var(--color-text-muted);
  margin: 0;
}

/* List */
.wc__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wc__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: var(--color-surface-elevated);
  cursor: grab;
  transition: background var(--t-fast), border-color var(--t-fast), opacity var(--t-fast);
  user-select: none;
}
.wc__item:active { cursor: grabbing; }

.wc__item--dragging {
  opacity: 0.4;
}

.wc__item--over {
  border-color: var(--color-accent);
  background: var(--color-accent-muted);
}

.wc__item--hidden {
  opacity: 0.5;
}

.wc__drag-handle {
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.wc__item-icon {
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.wc__item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.wc__item-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wc__item-desc {
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Eye toggle */
.wc__eye {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xs);
  background: none;
  border: 1px solid transparent;
  color: var(--color-accent);
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
}
.wc__eye:hover {
  background: var(--color-accent-muted);
  border-color: var(--color-accent);
}
.wc__eye--off {
  color: var(--color-text-muted);
}
.wc__eye--off:hover {
  color: var(--color-text);
  background: var(--color-surface);
  border-color: var(--color-border);
}
</style>
