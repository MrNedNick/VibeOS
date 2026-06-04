<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { marked } from 'marked'
import { useStudioStore } from '../stores/studio.store'
import { STUDIO_MODELS, FREE_MODELS, GROQ_MODELS, GEMINI_MODELS } from '../types'
import { UiIcon, UiButton } from '@/ui'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { useTasksStore } from '@/modules/task-manager/stores/tasks.store'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { useLearningStore } from '@/modules/learning/stores/learning.store'
import { useTrainingStore } from '@/modules/training/stores/training.store'

marked.setOptions({ breaks: true })
function renderMarkdown(content: string): string { return marked.parse(content) as string }

const store         = useStudioStore()
const goalsStore    = useGoalsStore()
const tasksStore    = useTasksStore()
const habitsStore   = useHabitsStore()
const learningStore = useLearningStore()
const trainingStore = useTrainingStore()

const isFree = computed(() => store.provider === 'free')
const inputText   = ref('')
const messagesEl  = ref<HTMLElement | null>(null)
const inputEl     = ref<HTMLTextAreaElement | null>(null)
const copiedId    = ref<string | null>(null)

const activeKey = computed(() => {
  switch (store.provider) {
    case 'groq':       return store.groqApiKey
    case 'gemini':     return store.geminiApiKey
    case 'openrouter': return store.openrouterApiKey
    case 'anthropic':  return store.apiKey
    default:           return ''
  }
})

const canSend = computed(() =>
  !store.loading && !!inputText.value.trim() && (isFree.value || !!activeKey.value.trim()),
)

const emptyTitle = computed(() => {
  switch (store.provider) {
    case 'free':        return 'Free AI — no account needed'
    case 'anthropic':   return 'Claude API'
    case 'groq':        return 'Groq — Fast Llama3 & Mixtral'
    case 'gemini':      return 'Gemini Flash'
    case 'openrouter':  return 'OpenRouter — Multi-model'
    default:            return 'AI Studio'
  }
})

const emptySub = computed(() => {
  switch (store.provider) {
    case 'free':        return 'Powered by Pollinations.ai · Llama 3, Mistral, GPT-4o mini'
    case 'anthropic':   return 'Enter your Anthropic API key above to start chatting'
    case 'groq':        return 'Fast inference · Get a free key at console.groq.com'
    case 'gemini':      return 'Google Gemini · Get a free key at aistudio.google.com'
    case 'openrouter':  return 'Route to 100+ models · Get a key at openrouter.ai'
    default:            return ''
  }
})

const QUICK_PROMPTS = [
  'Help me plan my day effectively',
  'Suggest 3 habits to build this week',
  'Write a short motivational message',
  'Explain the Pomodoro technique',
]

function buildProjectContext(): string {
  const today = new Date().toISOString().split('T')[0]
  const lines: string[] = [
    '=== YOUR VIBEOS PROJECT DATA ===',
    `Today: ${new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`,
    '',
  ]
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
  const activeTasks = tasksStore.tasks.filter(t => !t.done).slice(0, 8)
  if (activeTasks.length > 0) {
    lines.push(`ACTIVE TASKS (${tasksStore.activeCount} total, showing ${activeTasks.length}):`)
    for (const t of activeTasks) {
      lines.push(`• ${t.text}${t.priority !== 'none' ? ` [${t.priority}]` : ''}${t.dueDate ? ` · due ${t.dueDate}` : ''}`)
    }
    lines.push('')
  }
  if (habitsStore.habits.length > 0) {
    const doneCnt = habitsStore.habits.filter(h => h.completedDates.includes(today)).length
    lines.push(`HABITS TODAY (${doneCnt}/${habitsStore.habits.length} done):`)
    for (const h of habitsStore.habits) lines.push(`• ${h.emoji} ${h.name}: ${h.completedDates.includes(today) ? '✓ done' : '○ pending'}`)
    lines.push('')
  }
  if (learningStore.activePlans.length > 0) {
    lines.push(`LEARNING (${learningStore.activePlans.length} active plans):`)
    for (const plan of learningStore.activePlans.slice(0, 5)) lines.push(`• ${plan.coverEmoji} ${plan.title}: ${learningStore.isLoggedToday(plan.id) ? '✓ logged today' : '○ not yet today'}`)
    lines.push('')
  }
  if (trainingStore.activePlans.length > 0) {
    lines.push(`TRAINING (${trainingStore.activePlans.length} active plans):`)
    for (const plan of trainingStore.activePlans.slice(0, 5)) lines.push(`• ${plan.coverEmoji} ${plan.title}: ${trainingStore.isLoggedToday(plan.id) ? '✓ logged today' : '○ not yet today'}`)
    lines.push('')
  }
  lines.push('=== END OF PROJECT DATA ===')
  return lines.join('\n')
}

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
  if (inputEl.value) { inputEl.value.style.height = 'auto'; inputEl.value.style.height = Math.min(inputEl.value.scrollHeight, 180) + 'px' }
  await send()
}
function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
}
function onInput(e: Event): void {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 180) + 'px'
}
async function scrollToBottom(): Promise<void> {
  await nextTick()
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}
watch(() => store.messages.length, scrollToBottom)
watch(() => store.loading, scrollToBottom)

async function copyMessage(id: string, content: string): Promise<void> {
  await navigator.clipboard.writeText(content)
  copiedId.value = id
  setTimeout(() => { copiedId.value = null }, 1500)
}

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
  if (modelId.startsWith('free:')) { const id = modelId.slice(5); return FREE_MODELS.find(m => m.id === id)?.label ?? id }
  return (
    STUDIO_MODELS.find(m => m.id === modelId)?.label ??
    GROQ_MODELS.find(m => m.id === modelId)?.label ??
    GEMINI_MODELS.find(m => m.id === modelId)?.label ??
    modelId
  )
}
function modelColor(modelId?: string): string {
  if (!modelId) return 'var(--color-text-muted)'
  if (modelId.startsWith('free:')) { const id = modelId.slice(5); return FREE_MODELS.find(m => m.id === id)?.color ?? '#10b981' }
  return (
    STUDIO_MODELS.find(m => m.id === modelId)?.color ??
    GROQ_MODELS.find(m => m.id === modelId)?.color ??
    GEMINI_MODELS.find(m => m.id === modelId)?.color ??
    'var(--color-accent)'
  )
}
function providerKeyName(): string {
  switch (store.provider) {
    case 'groq':       return 'Groq'
    case 'gemini':     return 'Gemini'
    case 'openrouter': return 'OpenRouter'
    default:           return 'Claude'
  }
}
function errorText(raw: string): string {
  if (raw === 'no_key') return `${providerKeyName()} API key required — add it in the settings bar above`
  if (raw === 'cors')   return 'Network error — AI service may be temporarily unavailable. Try again.'
  return raw
}

onMounted(() => inputEl.value?.focus())
</script>

<template>
  <!-- Messages -->
  <div ref="messagesEl" class="sc-messages">
    <div v-if="!store.messages.length" class="sc-empty">
      <div class="sc-empty-icon"><UiIcon name="Sparkles" :size="30" /></div>
      <p class="sc-empty-title">{{ emptyTitle }}</p>
      <p class="sc-empty-sub">{{ emptySub }}</p>
      <div v-if="isFree || activeKey" class="sc-quick">
        <p class="sc-quick-label">Try asking:</p>
        <button v-for="q in QUICK_PROMPTS" :key="q" class="sc-quick-btn" @click="useQuickPrompt(q)">
          <UiIcon name="ArrowRight" :size="12" class="sc-quick-arrow" />
          {{ q }}
        </button>
      </div>
      <div v-if="!isFree && !activeKey" class="sc-no-key">
        <UiIcon name="AlertCircle" :size="14" />
        Add your {{ providerKeyName() }} API key in the bar above to start chatting.
      </div>
    </div>

    <template v-else>
      <div
        v-for="msg in store.messages"
        :key="msg.id"
        class="sc-msg"
        :class="{
          'sc-msg--user': msg.role === 'user',
          'sc-msg--assistant': msg.role === 'assistant' && !msg.error,
          'sc-msg--error': msg.error,
        }"
      >
        <div class="sc-bubble">
          <p v-if="msg.error" class="sc-bubble-text">
            <span class="sc-err-row"><UiIcon name="AlertCircle" :size="14" />{{ errorText(msg.content) }}</span>
          </p>
          <p v-else-if="msg.role === 'user'" class="sc-bubble-text">{{ msg.content }}</p>
          <div v-else class="sc-bubble-text sc-md" v-html="renderMarkdown(msg.content)" />
          <div v-if="msg.role === 'assistant'" class="sc-bubble-meta">
            <span v-if="msg.model && !msg.error" class="sc-meta-model" :style="{ color: modelColor(msg.model) }">{{ modelLabel(msg.model) }}</span>
            <span v-if="msg.durationMs" class="sc-meta-dur">{{ fmtDuration(msg.durationMs) }}</span>
            <span class="sc-meta-time">{{ fmtTime(msg.timestamp) }}</span>
            <UiButton v-if="!msg.error" variant="ghost" size="sm" @click="copyMessage(msg.id, msg.content)">{{ copiedId === msg.id ? 'Copied!' : 'Copy' }}</UiButton>
          </div>
        </div>
      </div>

      <div v-if="store.loading" class="sc-msg sc-msg--assistant">
        <div class="sc-bubble sc-bubble--typing">
          <div class="sc-typing"><span /><span /><span /></div>
        </div>
      </div>
    </template>
  </div>

  <!-- Input bar -->
  <div class="sc-input-bar">
    <textarea
      ref="inputEl"
      v-model="inputText"
      class="sc-input"
      placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
      rows="1"
      @keydown="onKeydown"
      @input="onInput"
    />
    <button class="sc-send-btn" :class="{ 'sc-send-btn--ready': canSend }" :disabled="!canSend && !store.loading" @click="send">
      <span :class="{ 'icon-spin': store.loading }">
        <UiIcon :name="store.loading ? 'Loader2' : 'ArrowUp'" :size="16" />
      </span>
    </button>
  </div>
</template>

<style scoped>
.sc-messages { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
.sc-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; padding: 40px 20px; }
.sc-empty-icon { width: 56px; height: 56px; border-radius: 50%; background: color-mix(in srgb, var(--color-accent) 12%, transparent); display: flex; align-items: center; justify-content: center; color: var(--color-accent); }
.sc-empty-title { font-size: 16px; font-weight: 600; color: var(--color-text); margin: 0; }
.sc-empty-sub { font-size: 13px; color: var(--color-text-muted); margin: 0; max-width: 320px; }
.sc-quick { display: flex; flex-direction: column; gap: 6px; width: 100%; max-width: 380px; margin-top: 8px; }
.sc-quick-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-muted); margin: 0; }
.sc-quick-btn { display: flex; align-items: center; gap: 7px; padding: 8px 12px; font-size: 13px; color: var(--color-text-secondary); background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast); text-align: left; font-family: inherit; }
.sc-quick-btn:hover { background: var(--color-surface-elevated); color: var(--color-text); border-color: var(--color-accent); }
.sc-quick-arrow { color: var(--color-accent); flex-shrink: 0; }
.sc-no-key { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--color-text-muted); }

.sc-msg { display: flex; }
.sc-msg--user { justify-content: flex-end; }
.sc-msg--assistant, .sc-msg--error { justify-content: flex-start; }
.sc-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: var(--radius);
  display: flex; flex-direction: column; gap: 6px;
}
.sc-msg--user .sc-bubble { background: var(--color-accent); color: #fff; border-radius: var(--radius) var(--radius) 2px var(--radius); }
.sc-msg--assistant .sc-bubble { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius) var(--radius) var(--radius) 2px; }
.sc-msg--error .sc-bubble { background: color-mix(in srgb, var(--color-danger) 8%, var(--color-surface)); border: 1px solid color-mix(in srgb, var(--color-danger) 25%, var(--color-border)); }
.sc-bubble--typing { min-width: 60px; }
.sc-bubble-text { font-size: 14px; line-height: var(--leading-lg); margin: 0; }
.sc-msg--user .sc-bubble-text { color: #fff; }
.sc-err-row { display: flex; align-items: center; gap: 6px; color: var(--color-danger); }
.sc-bubble-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.sc-meta-model { font-size: 10px; font-weight: 600; }
.sc-meta-dur, .sc-meta-time { font-size: 10px; color: var(--color-text-muted); font-family: var(--font-mono); }
.sc-md :deep(p) { margin: 0 0 8px; } .sc-md :deep(p:last-child) { margin-bottom: 0; }
.sc-md :deep(code) { background: var(--color-surface-elevated); border-radius: 3px; padding: 1px 5px; font-size: 12px; }
.sc-md :deep(pre) { background: var(--color-surface-elevated); border-radius: var(--radius-sm); padding: 10px 12px; overflow-x: auto; }
.sc-md :deep(ul), .sc-md :deep(ol) { padding-left: 20px; margin: 0 0 8px; }
.sc-typing { display: flex; gap: 4px; align-items: center; padding: 4px 0; }
.sc-typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--color-text-muted); animation: typing-bounce 1.2s ease-in-out infinite; }
.sc-typing span:nth-child(2) { animation-delay: 0.2s; }
.sc-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing-bounce { 0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)} }

.sc-input-bar { display: flex; align-items: flex-end; gap: 8px; padding: 10px 14px 12px; border-top: 1px solid var(--color-border); flex-shrink: 0; background: var(--color-surface); }
.sc-input {
  flex: 1; padding: 9px 12px; font-size: 14px; font-family: inherit;
  color: var(--color-text); background: var(--color-bg);
  border: 1px solid var(--color-border); border-radius: var(--radius-sm);
  outline: none; resize: none; line-height: 1.5; max-height: 180px; overflow-y: auto;
  transition: border-color var(--t-fast);
}
.sc-input:focus { border-color: var(--color-accent); }
.sc-input::placeholder { color: var(--color-text-muted); }
.sc-send-btn {
  width: 36px; height: 36px; border-radius: var(--radius-sm); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--color-surface-elevated); border: 1px solid var(--color-border);
  color: var(--color-text-muted); cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
}
.sc-send-btn--ready { background: var(--color-accent); border-color: var(--color-accent); color: #fff; }
.sc-send-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.icon-spin { animation: spin 1s linear infinite; display: flex; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
