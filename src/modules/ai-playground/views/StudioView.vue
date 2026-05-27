<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStudioStore } from '../stores/studio.store'
import { STUDIO_MODELS } from '../types'
import { useLocale } from '@/core/i18n'

const store  = useStudioStore()
const i18n   = useLocale()

// Form state
const prompt        = ref('')
const system        = ref('')
const showSystem    = ref(false)
const showKey       = ref(false)
const showHistory   = ref(false)
const historyFilter = ref('')

// Derived
const canRun = computed(() => !!store.apiKey.trim() && !!prompt.value.trim() && !store.loading)

const filteredHistory = computed(() => {
  const q = historyFilter.value.toLowerCase()
  return q
    ? store.history.filter(r => r.prompt.toLowerCase().includes(q) || r.response.toLowerCase().includes(q))
    : store.history
})

// Format duration
function fmtDuration(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(i18n.localeCode, { hour: '2-digit', minute: '2-digit' })
}

// Copy to clipboard
const copied = ref(false)
async function copyResponse(): Promise<void> {
  if (!store.currentRun?.response) return
  await navigator.clipboard.writeText(store.currentRun.response)
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}

// Run
async function handleRun(): Promise<void> {
  await store.run(prompt.value, system.value)
}

// Keyboard shortcut — ⌘Enter / Ctrl+Enter
function onKeydown(e: KeyboardEvent): void {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault()
    if (canRun.value) handleRun()
  }
}

onMounted(()   => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

// Error messages
const errorMessage = computed(() => {
  if (!store.error) return null
  if (store.error === 'no_key')  return i18n.t('studio.errorNoKey')
  if (store.error === 'cors')    return i18n.t('studio.errorCors')
  return store.error
})

// Current model meta
const currentModel = computed(() =>
  STUDIO_MODELS.find(m => m.id === store.model) ?? STUDIO_MODELS[1]
)
</script>

<template>
  <div class="studio">

    <!-- Top bar ─────────────────────────────────────── -->
    <div class="studio__topbar">
      <div class="studio__model-row">
        <button
          v-for="m in STUDIO_MODELS"
          :key="m.id"
          class="studio__model-btn"
          :class="{ 'studio__model-btn--active': store.model === m.id }"
          :style="store.model === m.id ? { '--model-color': m.color } : {}"
          @click="store.model = m.id"
        >
          <span class="studio__model-label">{{ m.label }}</span>
          <span class="studio__model-desc">{{ m.desc }}</span>
        </button>
      </div>

      <div class="studio__key-row">
        <label class="studio__key-label">{{ i18n.t('studio.apiKeyLabel') }}</label>
        <div class="studio__key-input-wrap">
          <input
            v-model="store.apiKey"
            :type="showKey ? 'text' : 'password'"
            class="studio__key-input"
            :placeholder="i18n.t('studio.apiKeyPlaceholder')"
            autocomplete="off"
            spellcheck="false"
          />
          <button
            class="studio__key-toggle"
            :title="showKey ? i18n.t('studio.hideKey') : i18n.t('studio.showKey')"
            @click="showKey = !showKey"
          >{{ showKey ? '●' : '○' }}</button>
        </div>
        <span
          v-if="store.apiKey"
          class="studio__key-indicator studio__key-indicator--set"
        >{{ i18n.t('studio.keySet') }}</span>
        <span v-else class="studio__key-indicator">{{ i18n.t('studio.keyUnset') }}</span>
      </div>
    </div>

    <!-- Workspace ───────────────────────────────────── -->
    <div class="studio__workspace">

      <!-- Left: input ─────────────────────────────── -->
      <div class="studio__input-col">

        <!-- System prompt toggle -->
        <div class="studio__section-head" @click="showSystem = !showSystem">
          <span class="studio__section-title">{{ i18n.t('studio.systemPrompt') }}</span>
          <span class="studio__section-chevron">{{ showSystem ? '▾' : '▸' }}</span>
        </div>
        <textarea
          v-if="showSystem"
          v-model="system"
          class="studio__system-textarea"
          :placeholder="i18n.t('studio.systemPlaceholder')"
          rows="3"
        />

        <!-- User prompt -->
        <div class="studio__section-head" style="margin-top: 2px">
          <span class="studio__section-title">{{ i18n.t('studio.userPrompt') }}</span>
        </div>
        <textarea
          v-model="prompt"
          class="studio__prompt-textarea"
          :placeholder="i18n.t('studio.promptPlaceholder')"
        />

        <!-- Run button -->
        <button
          class="studio__run-btn"
          :class="{ 'studio__run-btn--loading': store.loading }"
          :disabled="!canRun"
          @click="handleRun"
        >
          <span v-if="store.loading" class="studio__run-spinner">⟳</span>
          <span v-else>{{ i18n.t('studio.runBtn') }}</span>
          <kbd class="studio__run-kbd">⌘↵</kbd>
        </button>

        <!-- Max tokens -->
        <div class="studio__tokens-row">
          <label class="studio__tokens-label">{{ i18n.t('studio.maxTokens') }}</label>
          <input
            v-model.number="store.maxTokens"
            type="number"
            class="studio__tokens-input"
            min="64"
            max="8192"
            step="256"
          />
        </div>

        <!-- History ────────────────────────────────── -->
        <div
          v-if="store.history.length > 0"
          class="studio__history"
        >
          <div class="studio__section-head" @click="showHistory = !showHistory">
            <span class="studio__section-title">{{ i18n.t('studio.history') }} ({{ store.history.length }})</span>
            <span class="studio__section-chevron">{{ showHistory ? '▾' : '▸' }}</span>
          </div>

          <template v-if="showHistory">
            <input
              v-model="historyFilter"
              class="studio__history-search"
              :placeholder="i18n.t('studio.historySearch')"
            />
            <ul class="studio__history-list">
              <li
                v-for="run in filteredHistory"
                :key="run.id"
                class="studio__history-item"
                :class="{ 'studio__history-item--active': store.currentRun?.id === run.id }"
                @click="store.loadRun(run)"
              >
                <span class="studio__history-prompt">{{ run.prompt.slice(0, 60) }}{{ run.prompt.length > 60 ? '…' : '' }}</span>
                <span class="studio__history-meta">{{ run.model.split('-')[1] }} · {{ fmtTime(run.timestamp) }}</span>
              </li>
            </ul>
            <button class="studio__history-clear" @click="store.clearHistory()">
              {{ i18n.t('studio.clearHistory') }}
            </button>
          </template>
        </div>

      </div>

      <!-- Right: output ───────────────────────────── -->
      <div class="studio__output-col">

        <!-- Error state -->
        <div v-if="errorMessage" class="studio__error">
          <p class="studio__error-icon">⚠</p>
          <p class="studio__error-msg">{{ errorMessage }}</p>
          <p v-if="store.error === 'cors'" class="studio__error-hint">{{ i18n.t('studio.errorCorsHint') }}</p>
        </div>

        <!-- Loading state -->
        <div v-else-if="store.loading" class="studio__loading">
          <span class="studio__loading-spinner">⟳</span>
          <p>{{ i18n.t('studio.running') }}</p>
          <p class="studio__loading-model">{{ currentModel.label }}</p>
        </div>

        <!-- Response -->
        <template v-else-if="store.currentRun">
          <div class="studio__response-meta">
            <span class="studio__response-model"
              :style="{ color: STUDIO_MODELS.find(m => m.id === store.currentRun!.model)?.color }"
            >{{ store.currentRun.model.split('-').slice(1, 3).join('-') }}</span>
            <span class="studio__response-tokens">{{ store.currentRun.inputTokens }} in / {{ store.currentRun.outputTokens }} out</span>
            <span class="studio__response-dur">{{ fmtDuration(store.currentRun.durationMs) }}</span>
            <button class="studio__copy-btn" @click="copyResponse">
              {{ copied ? i18n.t('studio.copied') : i18n.t('studio.copy') }}
            </button>
          </div>
          <div class="studio__response-body">{{ store.currentRun.response }}</div>
        </template>

        <!-- Empty state -->
        <div v-else class="studio__empty">
          <div class="studio__empty-icon">⚡</div>
          <p class="studio__empty-title">{{ i18n.t('studio.emptyTitle') }}</p>
          <p class="studio__empty-sub">{{ i18n.t('studio.emptySub') }}</p>
          <ul class="studio__empty-tips">
            <li>{{ i18n.t('studio.tip1') }}</li>
            <li>{{ i18n.t('studio.tip2') }}</li>
            <li>{{ i18n.t('studio.tip3') }}</li>
          </ul>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
.studio {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ── Top bar ─────────────────────────────────── */
.studio__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.studio__model-row {
  display: flex;
  gap: 4px;
}

.studio__model-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  transition: border-color var(--t-fast), background var(--t-fast);
  cursor: pointer;
  min-width: 70px;
}

.studio__model-btn:hover:not(.studio__model-btn--active) {
  background: var(--color-surface-elevated);
}

.studio__model-btn--active {
  border-color: var(--model-color, var(--color-accent));
  background: color-mix(in srgb, var(--model-color, var(--color-accent)) 10%, transparent);
}

.studio__model-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  .studio__model-btn--active & { color: var(--model-color, var(--color-accent)); }
}

.studio__model-btn--active .studio__model-label {
  color: var(--model-color, var(--color-accent));
}

.studio__model-desc {
  font-size: 11px;
  color: var(--color-text-muted);
}

/* Key input */
.studio__key-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.studio__key-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
  flex-shrink: 0;
}

.studio__key-input-wrap {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  overflow: hidden;
}

.studio__key-input {
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--color-text);
  background: transparent;
  border: none;
  outline: none;
  padding: 5px 10px;
  width: 200px;
}

.studio__key-toggle {
  padding: 5px 8px;
  font-size: 10px;
  color: var(--color-text-muted);
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  transition: color var(--t-fast);
}
.studio__key-toggle:hover { color: var(--color-accent); }

.studio__key-indicator {
  font-size: 12px;
  color: var(--color-text-muted);
}

.studio__key-indicator--set {
  color: var(--color-success);
}

/* ── Workspace ───────────────────────────────── */
.studio__workspace {
  display: grid;
  grid-template-columns: 320px 1fr;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* ── Input column ────────────────────────────── */
.studio__input-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  background: var(--color-surface);
}

.studio__section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  padding: 2px 0;
}

.studio__section-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.studio__section-chevron {
  font-size: 11px;
  color: var(--color-text-muted);
}

.studio__system-textarea {
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  resize: vertical;
  min-height: 64px;
  outline: none;
  line-height: 1.5;
  transition: border-color var(--t-fast);
}
.studio__system-textarea:focus { border-color: var(--color-accent); }

.studio__prompt-textarea {
  font-size: 14px;
  font-family: var(--font-sans);
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  resize: none;
  flex: 1;
  min-height: 140px;
  outline: none;
  line-height: 1.6;
  transition: border-color var(--t-fast);
}
.studio__prompt-textarea:focus { border-color: var(--color-accent); }

/* Run button */
.studio__run-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  transition: opacity var(--t-fast), transform var(--t-fast);
  width: 100%;
  cursor: pointer;
}
.studio__run-btn:hover:not(:disabled) { opacity: 0.88; }
.studio__run-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.studio__run-btn--loading { cursor: wait; }

.studio__run-spinner {
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.studio__run-kbd {
  font-size: 11px;
  background: rgba(255,255,255,0.15);
  padding: 1px 5px;
  border-radius: 3px;
  font-family: var(--font-mono);
  letter-spacing: 0;
}

/* Max tokens */
.studio__tokens-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.studio__tokens-label {
  font-size: 12px;
  color: var(--color-text-muted);
  flex: 1;
}

.studio__tokens-input {
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  width: 80px;
  outline: none;
  text-align: right;
}

/* History */
.studio__history {
  border-top: 1px solid var(--color-border);
  padding-top: 10px;
  margin-top: 4px;
}

.studio__history-search {
  font-size: 13px;
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 5px 8px;
  width: 100%;
  outline: none;
  margin: 6px 0 4px;
}

.studio__history-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 180px;
  overflow-y: auto;
}

.studio__history-item {
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;
  transition: background var(--t-fast);
}
.studio__history-item:hover { background: var(--color-surface-elevated); }
.studio__history-item--active { background: var(--color-accent-muted); }

.studio__history-prompt {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.studio__history-meta {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}

.studio__history-clear {
  margin-top: 6px;
  font-size: 11px;
  color: var(--color-text-muted);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  transition: color var(--t-fast), background var(--t-fast);
}
.studio__history-clear:hover {
  color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 8%, transparent);
}

/* ── Output column ───────────────────────────── */
.studio__output-col {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-bg);
}

/* Error */
.studio__error {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  text-align: center;
}

.studio__error-icon {
  font-size: 28px;
  color: var(--color-warning);
  margin: 0;
}

.studio__error-msg {
  font-size: 15px;
  color: var(--color-text);
  font-weight: 500;
  margin: 0;
  max-width: 400px;
}

.studio__error-hint {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  max-width: 420px;
  line-height: 1.5;
}

/* Loading */
.studio__loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--color-text-muted);
}

.studio__loading-spinner {
  font-size: 28px;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

.studio__loading p { margin: 0; font-size: 14px; }

.studio__loading-model {
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}

/* Response meta bar */
.studio__response-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  flex-shrink: 0;
}

.studio__response-model {
  font-size: 13px;
  font-family: var(--font-mono);
  font-weight: 600;
}

.studio__response-tokens {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  flex: 1;
}

.studio__response-dur {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}

.studio__copy-btn {
  font-size: 12px;
  color: var(--color-accent);
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-accent-muted);
  transition: background var(--t-fast);
}
.studio__copy-btn:hover { background: var(--color-accent-muted); }

/* Response body */
.studio__response-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--color-text);
  white-space: pre-wrap;
  word-break: break-word;
}

/* Empty state */
.studio__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px;
  text-align: center;
}

.studio__empty-icon {
  font-size: 36px;
  opacity: 0.4;
}

.studio__empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: 0;
}

.studio__empty-sub {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0;
  max-width: 360px;
}

.studio__empty-tips {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.studio__empty-tips li {
  font-size: 13px;
  color: var(--color-text-muted);
  padding-left: 16px;
  position: relative;
}
.studio__empty-tips li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--color-accent);
}

/* ── Responsive ──────────────────────────────── */
@media (max-width: 900px) {
  .studio__workspace { grid-template-columns: 280px 1fr; }
}

@media (max-width: 767px) {
  .studio__workspace { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
  .studio__input-col { border-right: none; border-bottom: 1px solid var(--color-border); overflow: visible; }
  .studio__prompt-textarea { min-height: 100px; }
  .studio__topbar { flex-direction: column; align-items: flex-start; gap: 12px; }
  .studio__key-input { width: 150px; }
}
</style>
