<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useStudioStore } from '../stores/studio.store'
import { STUDIO_MODELS, FREE_MODELS } from '../types'
import { UiIcon } from '@/ui'

const store = useStudioStore()

// ── Local state ────────────────────────────────────
const inputText  = ref('')
const showSystem = ref(false)
const showKey    = ref(false)
const messagesEl = ref<HTMLElement | null>(null)
const inputEl    = ref<HTMLTextAreaElement | null>(null)
const copiedId   = ref<string | null>(null)

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
  await store.sendMessage(content)
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
  <div class="studio">

    <!-- ── Top bar ──────────────────────────────────── -->
    <div class="studio__topbar">
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
            <p class="studio__bubble-text">
              <template v-if="msg.error">
                <span class="studio__err-row">
                  <UiIcon name="AlertCircle" :size="14" />
                  {{ errorText(msg.content) }}
                </span>
              </template>
              <template v-else>{{ msg.content }}</template>
            </p>

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

@media (max-width: 767px) {
  .studio__topbar      { padding: 8px 12px; }
  .studio__settings-bar { padding: 6px 12px; gap: 6px; }
  .studio__messages    { padding: 14px 12px; }
  .studio__input-bar   { padding: 10px 12px; }
  .studio__bubble      { max-width: 90%; }
  .studio__key-input   { width: 120px; }
  .studio__tab         { padding: 4px 8px; font-size: 12px; }
  .studio__tab-badge   { display: none; }
}
</style>
