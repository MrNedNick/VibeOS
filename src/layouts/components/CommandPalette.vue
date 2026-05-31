<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCommandPaletteStore } from '@/core/stores/commandPalette.store'
import { useUiStore } from '@/core/stores/ui.store'
import { useLocale } from '@/core/i18n'
import { PLATFORM_MODULES } from '@/core/registry/modules'
import { useTasksStore } from '@/modules/task-manager/stores/tasks.store'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { useNotesStore } from '@/modules/notes/stores/notes.store'
import { UiIcon } from '@/ui'
import type { Theme } from '@/core/stores/ui.store'
import { aiComplete } from '@/core/composables/useAI'

const palette     = useCommandPaletteStore()
const uiStore     = useUiStore()
const router      = useRouter()
const i18n        = useLocale()
const tasksStore  = useTasksStore()
const habitsStore = useHabitsStore()
const goalsStore  = useGoalsStore()
const notesStore  = useNotesStore()

// ── Search state ──────────────────────────────────────────────────────
const query    = ref('')
const selIdx   = ref(0)
const inputRef = ref<HTMLInputElement>()
const listRef  = ref<HTMLElement>()

// ── Sub-input (action mode) ───────────────────────────────────────────
type ActionMode = 'new-task' | 'new-note' | 'new-goal' | 'ask-ai' | null

const activeAction  = ref<ActionMode>(null)
const subInputValue = ref('')
const subInputRef   = ref<HTMLInputElement>()

// AI result state
const aiResult  = ref<string | null>(null)
const aiLoading = ref(false)

// Computed labels (reactive to locale)
const actionMeta = computed(() => ({
  'new-task': {
    label: i18n.t('palette.newTask').replace('…', ''),
    placeholder: i18n.t('palette.taskPlaceholder'),
    icon: 'ListTodo',
  },
  'new-note': {
    label: i18n.t('palette.newNote').replace('…', ''),
    placeholder: i18n.t('palette.notePlaceholder'),
    icon: 'NotebookPen',
  },
  'new-goal': {
    label: i18n.t('palette.newGoal').replace('…', ''),
    placeholder: i18n.t('palette.goalPlaceholder'),
    icon: 'Target',
  },
  'ask-ai': {
    label: 'Ask AI',
    placeholder: 'Ask anything about your goals, tasks, habits…',
    icon: 'Sparkles',
  },
}))

function enterActionMode(mode: NonNullable<ActionMode>) {
  activeAction.value = mode
  subInputValue.value = ''
  aiResult.value = null
  aiLoading.value = false
  nextTick(() => subInputRef.value?.focus())
}

function cancelActionMode() {
  activeAction.value = null
  aiResult.value = null
  aiLoading.value = false
  nextTick(() => inputRef.value?.focus())
}

async function confirmAction() {
  const val = subInputValue.value.trim()
  if (!val || !activeAction.value) return

  if (activeAction.value === 'ask-ai') {
    // Fire AI query — stay open, show result inline
    aiLoading.value = true
    aiResult.value  = null
    try {
      aiResult.value = await aiComplete(val)
    } catch {
      aiResult.value = 'Could not reach AI — check your connection.'
    } finally {
      aiLoading.value = false
    }
    return  // don't close palette
  }

  if (activeAction.value === 'new-task') {
    tasksStore.addTask(val)
  } else if (activeAction.value === 'new-note') {
    const id = notesStore.createNote()
    notesStore.updateContent(id, `# ${val}\n`)
    router.push('/notes')
  } else if (activeAction.value === 'new-goal') {
    goalsStore.createGoal({
      title: val,
      category: 'other',
      coverEmoji: '🎯',
    })
    router.push('/goals')
  }

  palette.close()
}

// ── Command definitions ────────────────────────────────────────────────
interface Command {
  id: string
  label: string
  icon: string
  group: string
  badge?: string
  keywords?: string[]
  action: () => void
}

const THEME_OPTIONS: { id: Theme; labelKey: string; icon: string }[] = [
  { id: 'dark',      labelKey: 'palette.themeDark',      icon: 'Moon'     },
  { id: 'light',     labelKey: 'palette.themeLight',     icon: 'Sun'      },

  { id: 'brutalist', labelKey: 'palette.themeBrutalist', icon: 'Bold'     },
  { id: 'softglass', labelKey: 'palette.themeSoftglass', icon: 'Glasses'  },
  { id: 'crt',       labelKey: 'palette.themeCrt',       icon: 'Monitor'  },
]

const commands = computed<Command[]>(() => [
  // ── Actions: Create ───────────────────────────────────────────────
  {
    id:     'action:new-task',
    label:  i18n.t('palette.newTask'),
    icon:   'ListTodo',
    group:  i18n.t('palette.actionsGroup'),
    action: () => enterActionMode('new-task'),
  },
  {
    id:     'action:new-note',
    label:  i18n.t('palette.newNote'),
    icon:   'NotebookPen',
    group:  i18n.t('palette.actionsGroup'),
    action: () => enterActionMode('new-note'),
  },
  {
    id:     'action:new-goal',
    label:  i18n.t('palette.newGoal'),
    icon:   'Target',
    group:  i18n.t('palette.actionsGroup'),
    action: () => enterActionMode('new-goal'),
  },
  {
    id:       'action:ask-ai',
    label:    '✦ Ask AI…',
    icon:     'Sparkles',
    group:    i18n.t('palette.actionsGroup'),
    keywords: ['ai', 'ask', 'question', 'help', 'suggest', 'analyze', 'what', 'how', 'why'],
    action:   () => enterActionMode('ask-ai'),
  },

  // ── Habits toggle ─────────────────────────────────────────────────
  ...habitsStore.habits.map(h => {
    const done = habitsStore.isCompletedToday(h.id)
    return {
      id:     `habit:toggle:${h.id}`,
      label:  `${h.emoji} ${h.name}`,
      icon:   done ? 'CheckCircle2' : 'Circle',
      group:  i18n.t('palette.habitsGroup'),
      badge:  done ? '✓' : undefined,
      action: () => { habitsStore.toggleToday(h.id) },  // don't close — allow batch
    }
  }),

  // ── Navigate ──────────────────────────────────────────────────────
  ...PLATFORM_MODULES
    .filter(m => m.status === 'available' || m.status === 'wip')
    .map(m => {
      const key        = `modules.${m.id}`
      const translated = i18n.t(key)
      return {
        id:     `nav:${m.id}`,
        label:  translated === key ? m.label : translated,
        icon:   m.icon,
        group:  i18n.t('palette.gotoGroup'),
        action: () => { router.push(m.path); palette.close() },
      }
    }),

  // ── Theme ─────────────────────────────────────────────────────────
  ...THEME_OPTIONS.map(t => ({
    id:       `system:theme:${t.id}`,
    label:    i18n.t(t.labelKey),
    icon:     t.icon,
    group:    i18n.t('palette.themeGroup'),
    badge:    uiStore.theme === t.id ? '✓' : undefined,
    keywords: ['theme', 'appearance', 'pak', 'color', 'skin'],
    action:   () => { uiStore.setTheme(t.id); palette.close() },
  })),

  // ── System ────────────────────────────────────────────────────────
  {
    id:     'system:sidebar',
    label:  uiStore.sidebarOpen ? i18n.t('palette.collapseSidebar') : i18n.t('palette.expandSidebar'),
    icon:   'PanelLeft',
    group:  i18n.t('palette.systemGroup'),
    action: () => { uiStore.toggleSidebar() },
  },
])

// ── Fuzzy filter + scoring ─────────────────────────────────────────────
function scoreText(text: string, q: string): number {
  const l  = text.toLowerCase()
  const lq = q.toLowerCase()
  if (l === lq) return 5
  if (l.startsWith(lq)) return 4
  if (l.split(/\s+/).some(w => w.startsWith(lq))) return 3
  if (l.includes(lq)) return 2
  return 0
}

function score(cmd: Command, q: string): number {
  if (!q) return 1
  const labelScore = scoreText(cmd.label, q)
  if (labelScore > 0) return labelScore
  // Also score against optional keyword aliases (keywords match score capped at 2)
  if (cmd.keywords?.some(kw => kw.toLowerCase().startsWith(q.toLowerCase()))) return 2
  return 0
}

const filtered = computed(() =>
  commands.value
    .map(cmd => ({ cmd, s: score(cmd, query.value.trim()) }))
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
    query.value        = ''
    selIdx.value       = 0
    activeAction.value = null
    aiResult.value     = null
    aiLoading.value    = false
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
    const el = listRef.value?.querySelector<HTMLElement>(`[data-idx="${selIdx.value}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  })
}

// ── Keyboard navigation ────────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    palette.close()
    return
  }
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
  }
}

function onSubInputKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    cancelActionMode()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    confirmAction()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="palette">
      <div v-if="palette.isOpen" class="palette-backdrop" @mousedown.self="palette.close">
        <div class="palette" role="dialog" aria-label="Command palette" @keydown="!activeAction ? onKeydown($event) : undefined">

          <!-- ── Normal search mode ─────────────────────────────── -->
          <template v-if="!activeAction">
            <div class="palette__search">
              <UiIcon name="Search" :size="16" class="palette__search-icon" />
              <input
                ref="inputRef"
                v-model="query"
                class="palette__input"
                :placeholder="i18n.t('palette.placeholder')"
                autocomplete="off"
                spellcheck="false"
              />
              <kbd class="palette__esc-hint">Esc</kbd>
            </div>

            <div class="palette__divider" />

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
                    <span v-if="cmd.badge" class="palette__item-badge">{{ cmd.badge }}</span>
                    <span v-else-if="isSelected(cmd)" class="palette__item-enter">↵</span>
                  </button>
                </div>
              </template>

              <div v-else class="palette__empty">
                {{ i18n.t('palette.noResults') }} "{{ query }}"
              </div>
            </div>

            <div class="palette__footer">
              <span><kbd>↑</kbd><kbd>↓</kbd> {{ i18n.t('palette.footerNav') }}</span>
              <span><kbd>↵</kbd> {{ i18n.t('palette.footerSelect') }}</span>
              <span><kbd>Esc</kbd> {{ i18n.t('palette.footerClose') }}</span>
            </div>
          </template>

          <!-- ── Sub-input (action) mode ───────────────────────── -->
          <template v-else>
            <div class="palette__action-header">
              <button class="palette__back-btn" @click="cancelActionMode">
                <UiIcon name="ArrowLeft" :size="14" />
              </button>
              <UiIcon :name="actionMeta[activeAction].icon" :size="15" class="palette__action-icon" />
              <span class="palette__action-label">{{ actionMeta[activeAction].label }}</span>
            </div>

            <div class="palette__divider" />

            <!-- AI result display (ask-ai mode, after query submitted) -->
            <template v-if="activeAction === 'ask-ai' && (aiLoading || aiResult)">
              <div class="palette__ai-query">
                <UiIcon name="Sparkles" :size="12" />
                {{ subInputValue }}
              </div>
              <div class="palette__ai-body">
                <div v-if="aiLoading" class="palette__ai-loading">
                  <UiIcon name="Loader" :size="15" class="palette__ai-spinner" />
                  Thinking…
                </div>
                <p v-else class="palette__ai-response">{{ aiResult }}</p>
              </div>
              <div class="palette__footer palette__footer--action">
                <span><kbd>Esc</kbd> Close</span>
                <button class="palette__ai-ask-again" @click="() => { aiResult = null; nextTick(() => subInputRef?.focus()) }">
                  Ask again
                </button>
              </div>
            </template>

            <!-- Normal sub-input (create actions + ask-ai before submit) -->
            <template v-else>
              <div class="palette__sub-input-wrap">
                <input
                  ref="subInputRef"
                  v-model="subInputValue"
                  class="palette__input palette__input--sub"
                  :placeholder="actionMeta[activeAction].placeholder"
                  autocomplete="off"
                  spellcheck="false"
                  @keydown="onSubInputKeydown"
                />
              </div>
              <div class="palette__footer palette__footer--action">
                <span>
                  <kbd>↵</kbd>
                  {{ activeAction === 'ask-ai' ? 'Send' : i18n.t('palette.createConfirm') }}
                </span>
                <span class="palette__footer-hint">{{ i18n.t('palette.backHint') }}</span>
              </div>
            </template>
          </template>

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

.palette__item-badge {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-accent);
  flex-shrink: 0;
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

.palette__footer--action {
  justify-content: space-between;
}

.palette__footer-hint {
  opacity: 0.6;
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

/* ── Action mode header ───────────────────────────────────────────────── */
.palette__action-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  flex-shrink: 0;
}

.palette__back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--t-fast), color var(--t-fast);
}

.palette__back-btn:hover {
  background: var(--color-accent-muted);
  color: var(--color-accent);
}

.palette__action-icon {
  color: var(--color-accent);
  flex-shrink: 0;
}

.palette__action-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ── Sub-input area ───────────────────────────────────────────────────── */
.palette__sub-input-wrap {
  padding: 14px 18px;
  flex: 1;
}

.palette__input--sub {
  font-size: 20px;
  font-weight: 500;
  width: 100%;
}

/* ── AI query/result ─────────────────────────────────────────────────── */
.palette__ai-query {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.palette__ai-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 18px 16px;
  min-height: 80px;
}

.palette__ai-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-muted);
  padding: 8px 0;
}

@keyframes palette-spin {
  to { transform: rotate(360deg); }
}

.palette__ai-spinner {
  animation: palette-spin 1s linear infinite;
  flex-shrink: 0;
  color: var(--color-accent);
}

.palette__ai-response {
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-text);
  margin: 0;
  white-space: pre-wrap;
}

.palette__ai-ask-again {
  font-size: 12px;
  color: var(--color-accent);
  padding: 2px 8px;
  border: 1px solid var(--color-accent-muted);
  border-radius: var(--radius-xs);
  background: transparent;
  cursor: pointer;
  transition: background var(--t-fast);
}
.palette__ai-ask-again:hover { background: var(--color-accent-muted); }

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

.palette-enter-from         { opacity: 0; }
.palette-enter-from .palette { opacity: 0; transform: scale(0.96) translateY(-8px); }
.palette-leave-to            { opacity: 0; }
.palette-leave-to .palette   { opacity: 0; transform: scale(0.97); }

/* ── Responsive ───────────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .palette-backdrop { padding-top: 16px; align-items: flex-start; }
  .palette          { max-height: 85vh; }
  .palette__input   { font-size: 16px; }
}
</style>
