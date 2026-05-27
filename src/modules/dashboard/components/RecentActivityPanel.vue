<script setup lang="ts">
import { computed } from 'vue'
import { useEventBus } from '@/core/events'
import type { PlatformEvent } from '@/core/events'

const bus = useEventBus()

const events = computed(() => bus.recent(12))

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffH   = Math.floor(diffMs / 3_600_000)
  const diffD   = Math.floor(diffMs / 86_400_000)
  if (diffMin < 1)  return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffH   < 24) return `${diffH}h ago`
  return `${diffD}d ago`
}

function describeEvent(e: PlatformEvent): { icon: string; text: string } {
  switch (e.type) {
    case 'task:created':   return { icon: '＋', text: `Created task "${e.label}"` }
    case 'task:completed': return { icon: '✓', text: `Completed "${e.label}"` }
    case 'task:deleted':   return { icon: '×', text: `Deleted task "${e.label}"` }
    case 'habit:checked':  return { icon: '●', text: `Checked habit "${e.habitName}"` }
    case 'habit:unchecked':return { icon: '○', text: `Unchecked "${e.habitName}"` }
    case 'note:created':   return { icon: '📝', text: `New note "${e.title}"` }
    case 'note:deleted':   return { icon: '🗑', text: `Deleted note "${e.title}"` }
    case 'snippet:created':return { icon: '{ }', text: `New snippet "${e.title}"` }
    case 'game:score':     return { icon: '🎮', text: `${e.game} — score ${e.score}` }
    default:               return { icon: '·', text: 'Activity' }
  }
}

function iconColor(e: PlatformEvent): string {
  switch (e.type) {
    case 'task:completed':  return 'var(--color-success)'
    case 'task:created':    return 'var(--color-accent)'
    case 'task:deleted':    return 'var(--color-danger)'
    case 'habit:checked':   return 'var(--color-success)'
    case 'habit:unchecked': return 'var(--color-text-muted)'
    case 'note:created':    return 'var(--color-accent)'
    default:                return 'var(--color-text-muted)'
  }
}
</script>

<template>
  <div class="activity">
    <p class="activity__heading">Recent Activity</p>

    <div v-if="events.length === 0" class="activity__empty">
      <p>No activity yet.</p>
      <p class="activity__empty-sub">Start using modules and events will appear here.</p>
    </div>

    <ul v-else class="activity__list">
      <li
        v-for="(e, i) in events"
        :key="i"
        class="activity__item"
      >
        <span class="activity__icon" :style="{ color: iconColor(e) }">
          {{ describeEvent(e).icon }}
        </span>
        <span class="activity__text">{{ describeEvent(e).text }}</span>
        <span class="activity__time">{{ formatTime(e.timestamp) }}</span>
      </li>
    </ul>

    <button
      v-if="events.length > 0"
      class="activity__clear"
      @click="bus.clear()"
    >Clear</button>
  </div>
</template>

<style scoped>
.activity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity__heading {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin: 0 0 8px;
}

.activity__empty {
  font-size: 14px;
  color: var(--color-text-muted);
  padding: 12px 0;
}

.activity__empty p { margin: 0; }
.activity__empty-sub { font-size: 12px; margin-top: 4px !important; }

.activity__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.activity__item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 13px;
}

.activity__item:last-child { border-bottom: none; }

.activity__icon {
  font-size: 12px;
  font-family: var(--font-mono);
  flex-shrink: 0;
  width: 18px;
  text-align: center;
  line-height: 1;
}

.activity__text {
  flex: 1;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.activity__time {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.activity__clear {
  margin-top: 8px;
  align-self: flex-start;
  font-size: 11px;
  color: var(--color-text-muted);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  transition: background var(--t-fast), color var(--t-fast);
}

.activity__clear:hover {
  background: var(--color-surface-elevated);
  color: var(--color-danger);
}
</style>
