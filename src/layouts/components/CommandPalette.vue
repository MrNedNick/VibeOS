<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCommandPaletteStore } from '@/core/stores/commandPalette.store'
import { useUiStore } from '@/core/stores/ui.store'
import { PLATFORM_MODULES } from '@/core/registry/modules'
import { UiIcon } from '@/ui'

const palette = useCommandPaletteStore()
const uiStore = useUiStore()
const router  = useRouter()

const query    = ref('')
const selIdx   = ref(0)
const inputRef = ref<HTMLInputElement>()
const listRef  = ref<HTMLElement>()

// ── Command definitions ────────────────────────────────────────────────
interface Command {
  id: string
  label: string
  icon: string
  group: string
  action: () => void
}

const commands = computed<Command[]>(() => [
  // Navigate to each available module
  ...PLATFORM_MODULES
    .filter(m => m.status === 'available')
    .map(m => ({
      id:     `nav:${m.id}`,
      label:  m.label,
      icon:   m.icon,
      group:  'Go to',
      action: () => { router.push(m.path); palette.close() },
    })),

  // System
  {
    id:     'system:theme',
    label:  uiStore.isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme',
    icon:   uiStore.isDark ? 'Sun' : 'Moon',
    group:  'System',
    action: () => { uiStore.toggleTheme(); palette.close() },
  },
  {
    id:     'system:sidebar',
    label:  uiStore.sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar',
    icon:   'PanelLeft',
    group:  'System',
    action: () => { uiStore.toggleSidebar() },
  },
])

// ── Fuzzy filter + scoring ─────────────────────────────────────────────
function score(label: string, q: string): number {
  if (!q) return 1
  const l  = label.toLowerCase()
  const lq = q.toLowerCase()
  if (l === lq) return 5
  if (l.startsWith(lq)) return 4
  if (l.split(/\s+/).some(w => w.startsWith(lq))) return 3
  if (l.includes(lq)) return 2
  return 0
}

const filtered = computed(() =>
  commands.value
    .map(cmd => ({ cmd, s: score(cmd.label, query.value.trim()) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .map(({ cmd }) => cmd)
)

// Grouped for display, flat for keyboard nav
const groups = computed(() => {
  const map = new Map<string, Command[]>()
  for (const cmd of filtered.value) {
    if (!map.has(cmd.group)) map.set(cmd.group, [])
    map.get(cmd.group)!.push(cmd)
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }))
})

// ── Focus management ───────────────────────────────────────────────────
watch(() => palette.isOpen, async (open) => {
  if (open) {
    query.value = ''
    selIdx.value = 0
    await nextTick()
    inputRef.value?.focus()
  }
})

watch(query, () => { selIdx.value = 0 })

// ── Selection helpers ──────────────────────────────────────────────────
function globalIdx(cmd: Command) {
  return filtered.value.findIndex(c => c.id === cmd.id)
}

function isSelected(cmd: Command) {
  return globalIdx(cmd) === selIdx.value
}

function scrollToSelected() {
  nextTick(() => {
    const el = listRef.value?.querySelector<HTMLElement>(
      `[data-idx="${selIdx.value}"]`
    )
    el?.scrollIntoView({ block: 'nearest' })
  })
}

// ── Keyboard navigation ────────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selIdx.value = Math.min(selIdx.value + 1, filtered.value.length - 1)
    scrollToSelected()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selIdx.value = Math.max(selIdx.value - 1, 0)
    scrollToSelected()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    filtered.value[selIdx.value]?.action()
  } else if (e.key === 'Escape') {
    palette.close()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="palette">
      <div v-if="palette.isOpen" class="palette-backdrop" @mousedown.self="palette.close">
        <div class="palette" role="dialog" aria-label="Command palette" @keydown="onKeydown">

          <!-- Search input -->
          <div class="palette__search">
            <UiIcon name="Search" :size="16" class="palette__search-icon" />
            <input
              ref="inputRef"
              v-model="query"
              class="palette__input"
              placeholder="Type a command or search…"
              autocomplete="off"
              spellcheck="false"
            />
            <kbd class="palette__esc-hint">Esc</kbd>
          </div>

          <div class="palette__divider" />

          <!-- Results -->
          <div ref="listRef" class="palette__list">
            <template v-if="filtered.length > 0">
              <div v-for="group in groups" :key="group.label" class="palette__group">
                <div class="palette__group-label">{{ group.label }}</div>
                <button
                  v-for="cmd in group.items"
                  :key="cmd.id"
                  :data-idx="globalIdx(cmd)"
                  class="palette__item"
                  :class="{ 'palette__item--selected': isSelected(cmd) }"
                  @mouseenter="selIdx = globalIdx(cmd)"
                  @click="cmd.action()"
                >
                  <span class="palette__item-icon">
                    <UiIcon :name="cmd.icon" :size="15" :stroke-width="1.75" />
                  </span>
                  <span class="palette__item-label">{{ cmd.label }}</span>
                  <span v-if="isSelected(cmd)" class="palette__item-enter">↵</span>
                </button>
              </div>
            </template>

            <div v-else class="palette__empty">
              No results for "{{ query }}"
            </div>
          </div>

          <!-- Footer -->
          <div class="palette__footer">
            <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
            <span><kbd>↵</kbd> select</span>
            <span><kbd>Esc</kbd> close</span>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Backdrop ──────────────────────────────────────────────────────────── */
.palette-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: clamp(60px, 12vh, 140px);
  padding-inline: 16px;
}

/* ── Palette card ─────────────────────────────────────────────────────── */
.palette {
  width: 100%;
  max-width: 600px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: min(520px, 72vh);
}

/* ── Search ───────────────────────────────────────────────────────────── */
.palette__search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  flex-shrink: 0;
}

.palette__search-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.palette__input {
  flex: 1;
  font-size: 17px;
  font-weight: 400;
  color: var(--color-text);
  background: transparent;
  border: none;
  outline: none;
}

.palette__input::placeholder { color: var(--color-text-muted); }

.palette__esc-hint {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  padding: 2px 6px;
  flex-shrink: 0;
}

.palette__divider {
  height: 1px;
  background: var(--color-border);
  flex-shrink: 0;
}

/* ── Results list ─────────────────────────────────────────────────────── */
.palette__list {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
}

.palette__group { padding: 0; }

.palette__group-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  padding: 8px 18px 4px;
}

.palette__item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 9px 18px;
  text-align: left;
  cursor: pointer;
  transition: background var(--t-fast);
  border-radius: 0;
}

.palette__item:hover,
.palette__item--selected {
  background: var(--color-surface-elevated);
}

.palette__item--selected {
  background: var(--color-accent-muted);
}

.palette__item-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.palette__item--selected .palette__item-icon {
  color: var(--color-accent);
}

.palette__item-label {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.palette__item--selected .palette__item-label {
  color: var(--color-text);
}

.palette__item-enter {
  font-size: 14px;
  color: var(--color-accent);
  flex-shrink: 0;
}

/* ── Empty state ──────────────────────────────────────────────────────── */
.palette__empty {
  padding: 32px 18px;
  text-align: center;
  font-size: 15px;
  color: var(--color-text-muted);
}

/* ── Footer ───────────────────────────────────────────────────────────── */
.palette__footer {
  display: flex;
  gap: 16px;
  padding: 9px 18px;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.palette__footer span {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
}

kbd {
  font-size: 11px;
  font-family: var(--font-mono);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  padding: 1px 5px;
  color: var(--color-text-muted);
}

/* ── Open/close transition ────────────────────────────────────────────── */
.palette-enter-active {
  transition: opacity 160ms ease;
}
.palette-enter-active .palette {
  transition: opacity 160ms ease, transform 160ms var(--ease-spring);
}
.palette-leave-active {
  transition: opacity 120ms ease;
}
.palette-leave-active .palette {
  transition: opacity 120ms ease, transform 120ms ease;
}

.palette-enter-from { opacity: 0; }
.palette-enter-from .palette { opacity: 0; transform: scale(0.96) translateY(-8px); }
.palette-leave-to   { opacity: 0; }
.palette-leave-to   .palette { opacity: 0; transform: scale(0.97); }

/* ── Responsive ───────────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .palette-backdrop { padding-top: 16px; align-items: flex-start; }
  .palette { max-height: 85vh; }
  .palette__input { font-size: 16px; }
}
</style>
