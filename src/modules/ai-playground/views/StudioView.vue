<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { marked } from 'marked'
import { useStudioStore } from '../stores/studio.store'
import { STUDIO_MODELS, FREE_MODELS } from '../types'
import { UiIcon } from '@/ui'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { useTasksStore } from '@/modules/task-manager/stores/tasks.store'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { useLearningStore } from '@/modules/learning/stores/learning.store'
import { useTrainingStore } from '@/modules/training/stores/training.store'

// ── Markdown renderer ──────────────────────────────────────────────
marked.setOptions({ breaks: true })
function renderMarkdown(content: string): string {
  return marked.parse(content) as string
}

// ── Project context stores ─────────────────────────────────────────
const goalsStore    = useGoalsStore()
const tasksStore    = useTasksStore()
const habitsStore   = useHabitsStore()
const learningStore = useLearningStore()
const trainingStore = useTrainingStore()

function buildProjectContext(): string {
  const today = new Date().toISOString().split('T')[0]
  const lines: string[] = [
    '=== YOUR VIBEOS PROJECT DATA ===',
    `Today: ${new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`,
    '',
  ]

  // Goals
  const activeGoals = goalsStore.activeGoals
  if (activeGoals.length > 0) {
    lines.push(`ACTIVE GOALS (${activeGoals.length}):`)
    for (const g of activeGoals.slice(0, 5)) {
      const prog = goalsStore.getProgress(g.id)
      const done = g.milestones.filter((m: { completed: boolean }) => m.completed).length
      lines.push(`• ${g.coverEmoji} ${g.title} — ${prog}% (${done}/${g.milestones.length} milestones)`)
    }
    lines.push('')
  }

  // Active tasks
  const activeTasks = tasksStore.tasks.filter(t => !t.done).slice(0, 8)
  if (activeTasks.length > 0) {
    lines.push(`ACTIVE TASKS (${tasksStore.activeCount} total, showing ${activeTasks.length}):`)
    for (const t of activeTasks) {
      const pri = t.priority !== 'none' ? ` [${t.priority}]` : ''
      const due = t.dueDate ? ` · due ${t.dueDate}` : ''
      lines.push(`• ${t.text}${pri}${due}`)
    }
    lines.push('')
  }

  // Habits today
  if (habitsStore.habits.length > 0) {
    const doneCnt = habitsStore.habits.filter(h => h.completedDates.includes(today)).length
    lines.push(`HABITS TODAY (${doneCnt}/${habitsStore.habits.length} done):`)
    for (const h of habitsStore.habits) {
      const isDone = h.completedDates.includes(today)
      lines.push(`• ${h.emoji} ${h.name}: ${isDone ? '✓ done' : '○ pending'}`)
    }
    lines.push('')
  }

  // Learning
  if (learningStore.activePlans.length > 0) {
    lines.push(`LEARNING (${learningStore.activePlans.length} active plans):`)
    for (const plan of learningStore.activePlans.slice(0, 5)) {
      const logged = learningStore.isLoggedToday(plan.id)
      lines.push(`• ${plan.coverEmoji} ${plan.title}: ${logged ? '✓ logged today' : '○ not yet today'}`)
    }
    lines.push('')
  }

  // Training
  if (trainingStore.activePlans.length > 0) {
    lines.push(`TRAINING (${trainingStore.activePlans.length} active plans):`)
    for (const plan of trainingStore.activePlans.slice(0, 5)) {
      const logged = trainingStore.isLoggedToday(plan.id)
      lines.push(`• ${plan.coverEmoji} ${plan.title}: ${logged ? '✓ logged today' : '○ not yet today'}`)
    }
    lines.push('')
  }

  lines.push('=== END OF PROJECT DATA ===')
  return lines.join('\n')
}

const store = useStudioStore()

// ── Local state ────────────────────────────────────
const inputText   = ref('')
const showSystem  = ref(false)
const showKey     = ref(false)
const showSidebar = ref(true)
const messagesEl  = ref<HTMLElement | null>(null)
const inputEl     = ref<HTMLTextAreaElement | null>(null)
const copiedId    = ref<string | null>(null)

// ── Sidebar helpers ────────────────────────────────
function fmtDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString(undefined, { weekday: 'short' })
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// ── Computed ───────────────────────────────────────
const isFree = computed(() => store.provider === 'free')

const canSend = computed(() =>
  !store.loading &&
  !!inputText.value.trim() &&
  (isFree.value || !!store.apiKey.trim())
)

// ── Quick prompts ──────────────────────────────────
const QUICK_PROMPTS = [
  'Help me plan my day effectively',
  'Suggest 3 habits to build this week',
  'Write a short motivational message',
  'Explain the Pomodoro technique',
]

// ── Send ───────────────────────────────────────────
async function send(): Promise<void> {
  if (!canSend.value) return
  const content = inputText.value.trim()
  inputText.value = ''
  if (inputEl.value) inputEl.value.style.height = 'auto'
  const ctx = store.includeContext ? buildProjectContext() : undefined
  await store.sendMessage(content, ctx)
}

async function useQuickPrompt(text: string): Promise<void> {
  inputText.value = text
  await nextTick()
  if (inputEl.value) autoResize(inputEl.value)
  await send()
}

// ── Input handlers ─────────────────────────────────
function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

function onInput(e: Event): void {
  autoResize(e.target as HTMLTextAreaElement)
}

function autoResize(el: HTMLTextAreaElement): void {
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 180) + 'px'
}

// ── Scroll ─────────────────────────────────────────
async function scrollToBottom(): Promise<void> {
  await nextTick()
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  }
}

watch(() => store.messages.length, scrollToBottom)
watch(() => store.loading, scrollToBottom)

// ── Copy ───────────────────────────────────────────
async function copyMessage(id: string, content: string): Promise<void> {
  await navigator.clipboard.writeText(content)
  copiedId.value = id
  setTimeout(() => { copiedId.value = null }, 1500)
}

// ── Formatting ─────────────────────────────────────
function fmtTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function fmtDuration(ms?: number): string {
  if (!ms) return ''
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}

function modelLabel(modelId?: string): string {
  if (!modelId) return ''
  if (modelId.startsWith('free:')) {
    const id = modelId.slice(5)
    return FREE_MODELS.find(m => m.id === id)?.label ?? id
  }
  return STUDIO_MODELS.find(m => m.id === modelId)?.label ?? modelId
}

function modelColor(modelId?: string): string {
  if (!modelId) return 'var(--color-text-muted)'
  if (modelId.startsWith('free:')) {
    const id = modelId.slice(5)
    return FREE_MODELS.find(m => m.id === id)?.color ?? '#10b981'
  }
  return STUDIO_MODELS.find(m => m.id === modelId)?.color ?? 'var(--color-accent)'
}

function errorText(raw: string): string {
  if (raw === 'no_key') return 'Claude API key required — add it in the settings bar above'
  if (raw === 'cors')   return 'Network error — free AI service may be temporarily unavailable. Try again.'
  return raw
}

onMounted(() => inputEl.value?.focus())
</script>

<template>
  <div class="studio studio--with-sidebar" :class="{ 'studio--sidebar-open': showSidebar }">

    <!-- ── History sidebar ──────────────────────────── -->
    <aside class="studio__sidebar">
      <div class="studio__sidebar-header">
        <span class="studio__sidebar-title">History</span>
        <button
          class="studio__sidebar-clear"
          :disabled="!store.savedConversations.length"
          title="Clear all history"
          @click="store.clearHistory()"
        >Clear</button>
      </div>

      <div class="studio__sidebar-list">
        <div v-if="!store.savedConversations.length" class="studio__sidebar-empty">
          No past conversations yet.<br>Start chatting and use "New chat" to save.
        </div>
        <button
          v-for="conv in store.savedConversations"
          :key="conv.id"
          class="studio__sidebar-item"
          @click="store.loadConversation(conv.id)"
        >
          <span class="studio__sidebar-item-date">{{ fmtDate(conv.updatedAt) }}</span>
          <span class="studio__sidebar-item-title">{{ conv.title }}</span>
          <button
            class="studio__sidebar-item-del"
            title="Delete this conversation"
            @click.stop="store.deleteConversation(conv.id)"
          >×</button>
        </button>
      </div>
    </aside>

    <!-- ── Main chat area ───────────────────────────── -->
    <div class="studio__main">

    <!-- ── Top bar ──────────────────────────────────── -->
    <div class="studio__topbar">
      <button
        class="studio__sidebar-toggle"
        :class="{ 'studio__sidebar-toggle--active': showSidebar }"
        :title="showSidebar ? 'Hide history' : 'Show history'"
        @click="showSidebar = !showSidebar"
      >
        <UiIcon name="PanelLeft" :size="15" />
      </button>
      <div class="studio__tabs">
        <button
          class="studio__tab"
          :class="{ 'studio__tab--active': isFree }"
          @click="store.provider = 'free'"
        >
          <UiIcon name="Sparkles" :size="13" />
          Free AI
          <span class="studio__tab-badge">no key</span>
        </button>
        <button
          class="studio__tab"
          :class="{ 'studio__tab--active': !isFree }"
          @click="store.provider = 'anthropic'"
        >
          <UiIcon name="Key" :size="13" />
          Claude API
        </button>
      </div>

      <button
        class="studio__new-btn"
        :disabled="!store.messages.length"
        title="Start a new conversation"
        @click="store.newConversation()"
      >
        <UiIcon name="SquarePen" :size="14" />
        New chat
      </button>
    </div>

    <!-- ── Settings bar ─────────────────────────────── -->
    <div class="studio__settings-bar">

      <!-- Model chips -->
      <div class="studio__model-row">
        <template v-if="isFree">
          <button
            v-for="m in FREE_MODELS"
            :key="m.id"
            class="studio__chip"
            :class="{ 'studio__chip--active': store.freeModel === m.id }"
            :style="store.freeModel === m.id ? { '--chip-color': m.color } : {}"
            :title="m.desc"
            @click="store.freeModel = m.id"
          >{{ m.label }}</button>
        </template>
        <template v-else>
          <button
            v-for="m in STUDIO_MODELS"
            :key="m.id"
            class="studio__chip"
            :class="{ 'studio__chip--active': store.model === m.id }"
            :style="store.model === m.id ? { '--chip-color': m.color } : {}"
            :title="m.desc"
            @click="store.model = m.id"
          >{{ m.label }}</button>
        </template>
      </div>

      <!-- API key (Claude only) -->
      <div v-if="!isFree" class="studio__key-row">
        <div class="studio__key-wrap">
          <input
            v-model="store.apiKey"
            :type="showKey ? 'text' : 'password'"
            class="studio__key-input"
            placeholder="sk-ant-..."
            autocomplete="off"
            spellcheck="false"
          />
          <button class="studio__key-eye" :title="showKey ? 'Hide' : 'Show'" @click="showKey = !showKey">
            <UiIcon :name="showKey ? 'EyeOff' : 'Eye'" :size="13" />
          </button>
        </div>
        <span v-if="store.apiKey" class="studio__key-ok">● key set</span>
      </div>

      <!-- System prompt toggle -->
      <button class="studio__sys-btn" @click="showSystem = !showSystem">
        <UiIcon name="Settings2" :size="13" />
        System
        <UiIcon :name="showSystem ? 'ChevronUp' : 'ChevronDown'" :size="12" />
      </button>

      <!-- Project context toggle -->
      <button
        class="studio__ctx-btn"
        :class="{ 'studio__ctx-btn--active': store.includeContext }"
        title="Include your VibeOS project data (goals, tasks, habits, learning, training) as AI context"
        @click="store.includeContext = !store.includeContext"
      >
        <UiIcon name="Database" :size="13" />
        My data
      </button>

    </div>

    <!-- ── System prompt (collapsible) ──────────────── -->
    <div v-if="showSystem" class="studio__system-area">
      <textarea
        v-model="store.system"
        class="studio__system-ta"
        placeholder="Optional system prompt — sets AI persona and behavior for this conversation…"
        rows="2"
      />
    </div>

    <!-- ── Messages ──────────────────────────────────── -->
    <div ref="messagesEl" class="studio__messages">

      <!-- Empty state -->
      <div v-if="!store.messages.length" class="studio__empty">
        <div class="studio__empty-icon">
          <UiIcon name="Sparkles" :size="30" />
        </div>
        <p class="studio__empty-title">
          {{ isFree ? 'Free AI — no account needed' : 'Claude API' }}
        </p>
        <p class="studio__empty-sub">
          <template v-if="isFree">
            Powered by Pollinations.ai · Llama 3, Mistral, GPT-4o mini
          </template>
          <template v-else>
            Enter your Anthropic API key above to start chatting
          </template>
        </p>

        <!-- Quick prompts -->
        <div v-if="isFree || store.apiKey" class="studio__quick">
          <p class="studio__quick-label">Try asking:</p>
          <button
            v-for="q in QUICK_PROMPTS"
            :key="q"
            class="studio__quick-btn"
            @click="useQuickPrompt(q)"
          >
            <UiIcon name="ArrowRight" :size="12" class="studio__quick-arrow" />
            {{ q }}
          </button>
        </div>

        <!-- No key warning -->
        <div v-if="!isFree && !store.apiKey" class="studio__no-key">
          <UiIcon name="AlertCircle" :size="14" />
          Add your Claude API key in the bar above to start chatting.
        </div>
      </div>

      <!-- Message list -->
      <template v-else>
        <div
          v-for="msg in store.messages"
          :key="msg.id"
          class="studio__msg"
          :class="{
            'studio__msg--user':      msg.role === 'user',
            'studio__msg--assistant': msg.role === 'assistant' && !msg.error,
            'studio__msg--error':     msg.error,
          }"
        >
          <div class="studio__bubble">
            <!-- Error bubble -->
            <p v-if="msg.error" class="studio__bubble-text">
              <span class="studio__err-row">
                <UiIcon name="AlertCircle" :size="14" />
                {{ errorText(msg.content) }}
              </span>
            </p>
            <!-- User message — plain text -->
            <p v-else-if="msg.role === 'user'" class="studio__bubble-text">{{ msg.content }}</p>
            <!-- Assistant message — rendered markdown -->
            <div
              v-else
              class="studio__bubble-text studio__md"
              v-html="renderMarkdown(msg.content)"
            />

            <!-- Meta row — assistant only -->
            <div v-if="msg.role === 'assistant'" class="studio__bubble-meta">
              <span
                v-if="msg.model && !msg.error"
                class="studio__meta-model"
                :style="{ color: modelColor(msg.model) }"
              >{{ modelLabel(msg.model) }}</span>
              <span v-if="msg.durationMs" class="studio__meta-dur">{{ fmtDuration(msg.durationMs) }}</span>
              <span class="studio__meta-time">{{ fmtTime(msg.timestamp) }}</span>
              <button
                v-if="!msg.error"
                class="studio__copy-btn"
                @click="copyMessage(msg.id, msg.content)"
              >{{ copiedId === msg.id ? 'Copied!' : 'Copy' }}</button>
            </div>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="store.loading" class="studio__msg studio__msg--assistant">
          <div class="studio__bubble studio__bubble--typing">
            <div class="studio__typing">
              <span /><span /><span />
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ── Input bar ─────────────────────────────────── -->
    <div class="studio__input-bar">
      <textarea
        ref="inputEl"
        v-model="inputText"
        class="studio__input"
        placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
        rows="1"
        @keydown="onKeydown"
        @input="onInput"
      />
      <button
        class="studio__send-btn"
        :class="{ 'studio__send-btn--ready': canSend }"
        :disabled="!canSend && !store.loading"
        @click="send"
      >
        <span :class="{ 'icon-spin': store.loading }">
          <UiIcon :name="store.loading ? 'Loader2' : 'ArrowUp'" :size="16" />
        </span>
      </button>
    </div>

    </div><!-- end studio__main -->
  </div>
</template>

<style scoped>
/* ── Layout ───────────────────────────────────────── */
.studio {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--color-bg);
}

.studio--with-sidebar {
  flex-direction: row;
}

/* ── Sidebar ──────────────────────────────────────── */
.studio__sidebar {
  width: 0;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 0px solid var(--color-border);
  background: var(--color-surface);
  transition: width 0.22s ease, border-width 0.22s ease;
}

.studio--sidebar-open .studio__sidebar {
  width: 224px;
  border-right-width: 1px;
}

.studio__sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 12px 8px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.studio__sidebar-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.studio__sidebar-clear {
  font-size: 11px;
  color: var(--color-text-muted);
  padding: 1px 6px;
  border-radius: var(--radius-xs);
  border: 1px solid var(--color-border);
  background: transparent;
  cursor: pointer;
  transition: color var(--t-fast);
}
.studio__sidebar-clear:hover:not(:disabled) { color: var(--color-danger); border-color: var(--color-danger); }
.studio__sidebar-clear:disabled { opacity: 0.4; cursor: not-allowed; }

.studio__sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.studio__sidebar-empty {
  padding: 16px 8px;
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.5;
  text-align: center;
}

.studio__sidebar-item {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 7px 8px;
  border-radius: var(--radius-sm);
  text-align: left;
  cursor: pointer;
  position: relative;
  transition: background var(--t-fast);
}
.studio__sidebar-item:hover {
  background: var(--color-surface-elevated);
}

.studio__sidebar-item-date {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  line-height: 1;
}

.studio__sidebar-item-title {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 175px;
  line-height: 1.4;
}

.studio__sidebar-item-del {
  position: absolute;
  top: 6px;
  right: 5px;
  font-size: 14px;
  line-height: 1;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  border-radius: 3px;
  opacity: 0;
  transition: opacity var(--t-fast), color var(--t-fast);
}
.studio__sidebar-item:hover .studio__sidebar-item-del { opacity: 1; }
.studio__sidebar-item-del:hover { color: var(--color-danger); }

/* ── Main area ────────────────────────────────────── */
.studio__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Sidebar toggle button ────────────────────────── */
.studio__sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
}
.studio__sidebar-toggle:hover { background: var(--color-surface-elevated); color: var(--color-text-secondary); }
.studio__sidebar-toggle--active { color: var(--color-accent); border-color: var(--color-accent); background: var(--color-accent-muted); }

/* ── Top bar ──────────────────────────────────────── */
.studio__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  flex-shrink: 0;
}

.studio__tabs {
  display: flex;
  gap: 2px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 2px;
}

.studio__tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: calc(var(--radius-sm) - 2px);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  background: transparent;
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast);
}
.studio__tab:hover:not(.studio__tab--active) {
  background: var(--color-surface);
  color: var(--color-text-secondary);
}
.studio__tab--active {
  background: var(--color-surface);
  color: var(--color-accent);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
}

.studio__tab-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 20px;
  background: color-mix(in srgb, #10b981 14%, transparent);
  color: #10b981;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.studio__new-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
}
.studio__new-btn:hover:not(:disabled) {
  background: var(--color-surface-elevated);
  color: var(--color-text);
  border-color: var(--color-accent);
}
.studio__new-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* ── Settings bar ─────────────────────────────────── */
.studio__settings-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.studio__model-row {
  display: flex;
  gap: 4px;
  flex: 1;
}

.studio__chip {
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid var(--color-border);
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
}
.studio__chip:hover:not(.studio__chip--active) {
  background: var(--color-surface-elevated);
  color: var(--color-text-secondary);
}
.studio__chip--active {
  border-color: var(--chip-color, var(--color-accent));
  background: color-mix(in srgb, var(--chip-color, var(--color-accent)) 12%, transparent);
  color: var(--chip-color, var(--color-accent));
  font-weight: 600;
}

/* API key */
.studio__key-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.studio__key-wrap {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  overflow: hidden;
}
.studio__key-input {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text);
  background: transparent;
  border: none;
  outline: none;
  padding: 4px 8px;
  width: 160px;
}
.studio__key-eye {
  padding: 4px 7px;
  color: var(--color-text-muted);
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  cursor: pointer;
  transition: color var(--t-fast);
}
.studio__key-eye:hover { color: var(--color-accent); }
.studio__key-ok {
  font-size: 11px;
  color: var(--color-success);
  white-space: nowrap;
}

/* System prompt button */
.studio__sys-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--t-fast), color var(--t-fast);
}
.studio__sys-btn:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text-secondary);
}

/* Context toggle button */
.studio__ctx-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
}
.studio__ctx-btn:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text-secondary);
}
.studio__ctx-btn--active {
  color: #10b981;
  border-color: color-mix(in srgb, #10b981 40%, transparent);
  background: color-mix(in srgb, #10b981 10%, transparent);
}

/* ── System area ──────────────────────────────────── */
.studio__system-area {
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  flex-shrink: 0;
}
.studio__system-ta {
  width: 100%;
  box-sizing: border-box;
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  resize: vertical;
  min-height: 56px;
  outline: none;
  line-height: 1.5;
  transition: border-color var(--t-fast);
}
.studio__system-ta:focus { border-color: var(--color-accent); }

/* ── Messages ─────────────────────────────────────── */
.studio__messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Empty state */
.studio__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 32px 24px;
  text-align: center;
}
.studio__empty-icon {
  color: var(--color-accent);
  opacity: 0.45;
  margin-bottom: 4px;
}
.studio__empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0;
}
.studio__empty-sub {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  max-width: 340px;
  line-height: 1.5;
}

/* Quick prompts */
.studio__quick {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
  width: 100%;
  max-width: 340px;
}
.studio__quick-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-muted);
  margin: 0 0 2px;
  text-align: left;
}
.studio__quick-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: 13px;
  color: var(--color-text-secondary);
  text-align: left;
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
}
.studio__quick-btn:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text);
  border-color: var(--color-accent);
}
.studio__quick-arrow {
  color: var(--color-accent);
  flex-shrink: 0;
}

/* No key warning */
.studio__no-key {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-warning);
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-warning) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-warning) 20%, transparent);
  margin-top: 4px;
  max-width: 380px;
  line-height: 1.4;
}

/* ── Chat messages ────────────────────────────────── */
.studio__msg {
  display: flex;
}
.studio__msg--user      { justify-content: flex-end; }
.studio__msg--assistant,
.studio__msg--error     { justify-content: flex-start; }

.studio__bubble {
  max-width: 75%;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* User bubble */
.studio__msg--user .studio__bubble {
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-accent) 22%, transparent);
  border-radius: 14px 14px 3px 14px;
  padding: 10px 14px;
}

/* Assistant bubble */
.studio__msg--assistant .studio__bubble {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px 14px 14px 3px;
  padding: 10px 14px;
}

/* Error bubble */
.studio__msg--error .studio__bubble {
  background: color-mix(in srgb, var(--color-danger) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-danger) 20%, transparent);
  border-radius: 14px 14px 14px 3px;
  padding: 10px 14px;
}

.studio__bubble-text {
  font-size: 14px;
  line-height: 1.65;
  color: var(--color-text);
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.studio__err-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  color: var(--color-danger);
}

/* Meta row */
.studio__bubble-meta {
  display: flex;
  align-items: center;
  gap: 7px;
}
.studio__meta-model {
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-mono);
}
.studio__meta-dur {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}
.studio__meta-time {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  margin-left: auto;
}
.studio__copy-btn {
  font-size: 11px;
  color: var(--color-text-muted);
  padding: 1px 7px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: transparent;
  cursor: pointer;
  transition: color var(--t-fast), background var(--t-fast);
}
.studio__copy-btn:hover {
  color: var(--color-accent);
  background: var(--color-surface-elevated);
}

/* Typing indicator */
.studio__bubble--typing {
  padding: 13px 16px;
}
.studio__typing {
  display: flex;
  gap: 5px;
  align-items: center;
}
.studio__typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-text-muted);
  animation: typing-dot 1.2s ease-in-out infinite;
}
.studio__typing span:nth-child(2) { animation-delay: 0.2s; }
.studio__typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-dot {
  0%, 100% { transform: translateY(0);    opacity: 0.4; }
  50%       { transform: translateY(-4px); opacity: 1;   }
}

/* ── Input bar ────────────────────────────────────── */
.studio__input-bar {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
  flex-shrink: 0;
}

.studio__input {
  flex: 1;
  font-size: 14px;
  font-family: var(--font-sans);
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  resize: none;
  min-height: 42px;
  max-height: 180px;
  outline: none;
  line-height: 1.5;
  overflow-y: auto;
  transition: border-color var(--t-fast);
}
.studio__input:focus { border-color: var(--color-accent); }
.studio__input::placeholder { color: var(--color-text-muted); }

.studio__send-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
}
.studio__send-btn--ready {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
}
.studio__send-btn--ready:hover { opacity: 0.88; }
.studio__send-btn:disabled:not(.studio__send-btn--ready) {
  opacity: 0.35;
  cursor: not-allowed;
}

.icon-spin {
  display: flex;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Responsive ───────────────────────────────────── */
@media (max-width: 1279px) {
  .studio__bubble { max-width: 82%; }
}

@media (max-width: 1279px) {
  .studio--sidebar-open .studio__sidebar { width: 200px; }
}

@media (max-width: 767px) {
  /* Sidebar hidden on mobile */
  .studio__sidebar           { display: none !important; }
  .studio__sidebar-toggle    { display: none; }
  .studio__topbar            { padding: 8px 12px; }
  .studio__settings-bar      { padding: 6px 12px; gap: 6px; }
  .studio__messages          { padding: 14px 12px; }
  .studio__input-bar         { padding: 10px 12px; }
  .studio__bubble            { max-width: 90%; }
  .studio__key-input         { width: 120px; }
  .studio__tab               { padding: 4px 8px; font-size: 12px; }
  .studio__tab-badge         { display: none; }
}

/* ── Markdown prose styles ────────────────────────────────────────── */
.studio__md { color: var(--color-text); }
.studio__md :deep(p)  { margin: 0 0 0.65em; line-height: 1.65; }
.studio__md :deep(p:last-child) { margin-bottom: 0; }
.studio__md :deep(h1),
.studio__md :deep(h2),
.studio__md :deep(h3) {
  font-weight: 700;
  color: var(--color-text);
  margin: 0.9em 0 0.4em;
  line-height: 1.3;
}
.studio__md :deep(h1) { font-size: 1.2em; }
.studio__md :deep(h2) { font-size: 1.1em; }
.studio__md :deep(h3) { font-size: 1em; }
.studio__md :deep(ul),
.studio__md :deep(ol) {
  padding-left: 1.4em;
  margin: 0.4em 0 0.65em;
}
.studio__md :deep(li) { margin: 0.25em 0; line-height: 1.6; }
.studio__md :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.88em;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  padding: 1px 5px;
  color: var(--color-accent);
}
.studio__md :deep(pre) {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  overflow-x: auto;
  margin: 0.6em 0;
}
.studio__md :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  color: var(--color-text);
}
.studio__md :deep(blockquote) {
  border-left: 3px solid var(--color-accent);
  padding: 4px 12px;
  margin: 0.5em 0;
  color: var(--color-text-secondary);
  font-style: italic;
}
.studio__md :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 0.8em 0;
}
.studio__md :deep(a) {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.studio__md :deep(strong) { font-weight: 700; color: var(--color-text); }
.studio__md :deep(em) { font-style: italic; }
.studio__md :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.6em 0;
  font-size: 13px;
}
.studio__md :deep(th),
.studio__md :deep(td) {
  border: 1px solid var(--color-border);
  padding: 5px 10px;
  text-align: left;
}
.studio__md :deep(th) {
  background: var(--color-surface-elevated);
  font-weight: 600;
}
</style>
