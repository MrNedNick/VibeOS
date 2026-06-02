<script setup lang="ts">
import { useStudioStore } from '../stores/studio.store'
import { useConfirm } from '@/core/composables/useConfirm'
import { UiButton, UiIconButton } from '@/ui'

const store = useStudioStore()
const { confirm } = useConfirm()

async function askClearHistory(): Promise<void> {
  const ok = await confirm({
    title:        'Clear all history?',
    body:         'All saved conversations will be permanently deleted.',
    danger:       true,
    confirmLabel: 'Delete all',
  })
  if (ok) store.clearHistory()
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString(undefined, { weekday: 'short' })
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="sidebar__header">
    <span class="sidebar__title">History</span>
    <UiButton variant="ghost" size="sm" :disabled="!store.savedConversations.length" title="Clear all history" @click="askClearHistory">
      Clear
    </UiButton>
  </div>

  <div class="sidebar__list">
    <div v-if="!store.savedConversations.length" class="sidebar__empty">
      No past conversations yet.<br>Start chatting and use "New chat" to save.
    </div>
    <button
      v-for="conv in store.savedConversations"
      :key="conv.id"
      class="sidebar__item"
      @click="store.loadConversation(conv.id)"
    >
      <span class="sidebar__item-date">{{ fmtDate(conv.updatedAt) }}</span>
      <span class="sidebar__item-title">{{ conv.title }}</span>
      <UiIconButton name="X" aria-label="Delete conversation" size="sm" @click.stop="store.deleteConversation(conv.id)" />
    </button>
  </div>
</template>

<style scoped>
.sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 12px 8px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.sidebar__title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); }
.sidebar__list { overflow-y: auto; flex: 1; display: flex; flex-direction: column; }
.sidebar__empty { padding: 16px 12px; font-size: 12px; color: var(--color-text-muted); line-height: 1.5; }
.sidebar__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  border-radius: 0;
  text-align: left;
  transition: background var(--t-fast);
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
}
.sidebar__item:hover { background: var(--color-surface-elevated); }
.sidebar__item-date { font-size: 10px; color: var(--color-text-muted); font-family: var(--font-mono); flex-shrink: 0; }
.sidebar__item-title { font-size: 12px; color: var(--color-text-secondary); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
