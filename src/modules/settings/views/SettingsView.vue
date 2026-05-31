<script setup lang="ts">
import { ref } from 'vue'
import { useUiStore } from '@/core/stores/ui.store'
import type { Theme } from '@/core/stores/ui.store'
import { useLocale } from '@/core/i18n'
import { useStorage } from '@/core/composables/useStorage'
import { useModuleVisibility } from '@/core/composables/useModuleVisibility'
import { PLATFORM_MODULES } from '@/core/registry/modules'

const uiStore = useUiStore()
const i18n    = useLocale()

// ── Vibe-paks ─────────────────────────────────────────────────────
interface VibePak {
  id: Theme
  nameKey: string
  swatches: string[]   // [bg, accent, text]
  label: string        // short descriptor
}

const VIBE_PAKS: VibePak[] = [
  {
    id:      'dark',
    nameKey: 'settings.themeDark',
    swatches: ['#0a0a0a', '#4f8ef7', '#f0f0f4'],
    label:   'Default',
  },
  {
    id:      'light',
    nameKey: 'settings.themeLight',
    swatches: ['#f0f0f5', '#2563eb', '#0d0d12'],
    label:   'Clean',
  },
  {
    id:      'brutalist',
    nameKey: 'settings.themeBrutalist',
    swatches: ['#f0ede8', '#000000', '#000000'],
    label:   'Stark',
  },
  {
    id:      'softglass',
    nameKey: 'settings.themeSoftglass',
    swatches: ['#eef1f7', '#4f7ef7', '#1a1d2e'],
    label:   'Frosted',
  },
  {
    id:      'crt',
    nameKey: 'settings.themeCrt',
    swatches: ['#030b03', '#00e040', '#b8ffc0'],
    label:   'Terminal',
  },
]

// ── Module visibility ─────────────────────────────────────────────
const { isVisible, toggleModule } = useModuleVisibility()

// Only life + work modules can be toggled (system modules are always visible)
const toggleableModules = PLATFORM_MODULES.filter(m => m.section !== 'system')

// ── API keys ──────────────────────────────────────────────────────
const anthropicKey  = useStorage<string>('platform:studio:apikey', '')
const showAnthropic = ref(false)

// ── Data section ──────────────────────────────────────────────────
const clearConfirm  = ref(false)
const importConfirm = ref(false)
const importPayload = ref<Record<string, unknown> | null>(null)
const fileInputRef  = ref<HTMLInputElement>()
let clearTimer: ReturnType<typeof setTimeout> | null = null

function exportData() {
  const snapshot: Record<string, unknown> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!
    try {
      snapshot[key] = JSON.parse(localStorage.getItem(key) ?? 'null')
    } catch {
      snapshot[key] = localStorage.getItem(key)
    }
  }
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), {
    href: url,
    download: `vibeos-backup-${new Date().toISOString().slice(0, 10)}.json`,
  })
  a.click()
  URL.revokeObjectURL(url)
}

function startClear() {
  clearConfirm.value = true
  clearTimer = setTimeout(() => { clearConfirm.value = false }, 5000)
}

function confirmClear() {
  if (clearTimer) clearTimeout(clearTimer)
  localStorage.clear()
  clearConfirm.value = false
  window.location.reload()
}

function cancelClear() {
  if (clearTimer) clearTimeout(clearTimer)
  clearConfirm.value = false
}

function triggerImport() {
  fileInputRef.value?.click()
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  ;(e.target as HTMLInputElement).value = ''    // reset so same file can re-trigger
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target?.result as string)
      if (typeof data !== 'object' || data === null) throw new Error('Not an object')
      importPayload.value = data as Record<string, unknown>
      importConfirm.value = true
    } catch {
      alert('Invalid backup file — expected a VibeOS JSON export.')
    }
  }
  reader.readAsText(file)
}

function confirmImport() {
  if (!importPayload.value) return
  for (const [key, value] of Object.entries(importPayload.value)) {
    if (value === null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
    }
  }
  importConfirm.value = false
  importPayload.value = null
  window.location.reload()
}

function cancelImport() {
  importConfirm.value = false
  importPayload.value = null
}

</script>

<template>
  <div class="settings">
    <div class="settings__header">
      <h1 class="settings__title">{{ i18n.t('settings.title') }}</h1>
      <p class="settings__desc">{{ i18n.t('settings.desc') }}</p>
    </div>

    <!-- ── Appearance ──────────────────────────────────── -->
    <section class="settings__section">
      <h2 class="settings__section-title">{{ i18n.t('settings.sectionAppearance') }}</h2>

      <!-- Vibe-paks -->
      <div class="settings__row settings__row--col">
        <div>
          <span class="settings__row-name">{{ i18n.t('settings.vibePaks') }}</span>
          <p class="settings__row-hint">{{ i18n.t('settings.vibePaksSub') }}</p>
        </div>
        <div class="pak-grid">
          <button
            v-for="pak in VIBE_PAKS"
            :key="pak.id"
            class="pak-card"
            :class="{ 'pak-card--active': uiStore.theme === pak.id }"
            @click="uiStore.setTheme(pak.id)"
          >
            <div class="pak-preview">
              <span
                v-for="(swatch, si) in pak.swatches"
                :key="si"
                class="pak-swatch"
                :style="{ background: swatch }"
              />
            </div>
            <span class="pak-name">{{ i18n.t(pak.nameKey) }}</span>
            <span class="pak-label">{{ pak.label }}</span>
            <span v-if="uiStore.theme === pak.id" class="pak-check">✓</span>
          </button>
        </div>
      </div>

      <div class="settings__row">
        <span class="settings__row-name">{{ i18n.t('settings.langLabel') }}</span>
        <div class="settings__toggle">
          <button
            class="settings__toggle-btn"
            :class="{ 'settings__toggle-btn--active': i18n.locale === 'ru' }"
            @click="i18n.setLocale('ru')"
          >Русский</button>
          <button
            class="settings__toggle-btn"
            :class="{ 'settings__toggle-btn--active': i18n.locale === 'en' }"
            @click="i18n.setLocale('en')"
          >English</button>
        </div>
      </div>
    </section>

    <!-- ── Modules ───────────────────────────────────────── -->
    <section class="settings__section">
      <h2 class="settings__section-title">Modules</h2>

      <p class="settings__row-hint" style="margin: 0 0 4px;">
        Toggle modules on or off in the sidebar. System modules are always shown.
      </p>

      <div
        v-for="mod in toggleableModules"
        :key="mod.id"
        class="settings__row settings__module-row"
      >
        <div class="settings__module-info">
          <span class="settings__row-name">{{ mod.label }}</span>
          <p class="settings__row-hint">{{ mod.description }}</p>
        </div>
        <button
          class="settings__vis-toggle"
          :class="{ 'settings__vis-toggle--on': isVisible(mod.id) }"
          :title="isVisible(mod.id) ? 'Click to hide' : 'Click to show'"
          @click="toggleModule(mod.id)"
        >
          <span class="settings__vis-knob" />
        </button>
      </div>
    </section>

    <!-- ── API Keys ──────────────────────────────────────── -->
    <section class="settings__section">
      <h2 class="settings__section-title">{{ i18n.t('settings.sectionApiKeys') }}</h2>

      <!-- Anthropic -->
      <div class="settings__row settings__row--col">
        <div>
          <span class="settings__row-name">{{ i18n.t('settings.anthropicKeyLabel') }}</span>
          <p class="settings__row-hint">{{ i18n.t('settings.anthropicKeyHint') }}</p>
        </div>
        <div class="settings__key-row">
          <input
            v-model="anthropicKey"
            :type="showAnthropic ? 'text' : 'password'"
            class="settings__key-input"
            placeholder="sk-ant-…"
            spellcheck="false"
            autocomplete="off"
          />
          <button class="settings__key-toggle" @click="showAnthropic = !showAnthropic">
            {{ showAnthropic ? i18n.t('settings.keyHide') : i18n.t('settings.keyShow') }}
          </button>
          <span class="settings__key-status" :class="{ 'settings__key-status--set': anthropicKey }">
            {{ anthropicKey ? i18n.t('settings.keySet') : i18n.t('settings.keyNotSet') }}
          </span>
        </div>
      </div>

    </section>

    <!-- ── Data ────────────────────────────────────────── -->
    <section class="settings__section">
      <h2 class="settings__section-title">{{ i18n.t('settings.sectionData') }}</h2>

      <!-- Export -->
      <div class="settings__row">
        <div>
          <span class="settings__row-name">{{ i18n.t('settings.exportLabel') }}</span>
          <p class="settings__row-hint">{{ i18n.t('settings.exportHint') }}</p>
        </div>
        <button class="settings__action-btn" @click="exportData">
          {{ i18n.t('settings.exportBtn') }}
        </button>
      </div>

      <!-- Import -->
      <div class="settings__row">
        <div>
          <span class="settings__row-name">{{ i18n.t('settings.importLabel') }}</span>
          <p class="settings__row-hint">{{ i18n.t('settings.importHint') }}</p>
        </div>
        <div class="settings__import-actions">
          <template v-if="!importConfirm">
            <button class="settings__action-btn" @click="triggerImport">
              {{ i18n.t('settings.importBtn') }}
            </button>
            <input
              ref="fileInputRef"
              type="file"
              accept=".json,application/json"
              class="settings__file-input"
              @change="onFileChange"
            />
          </template>
          <template v-else>
            <span class="settings__danger-confirm">{{ i18n.t('settings.importConfirm') }}</span>
            <button class="settings__danger-btn settings__danger-btn--confirm" @click="confirmImport">
              {{ i18n.t('settings.importYes') }}
            </button>
            <button class="settings__cancel-btn" @click="cancelImport">
              {{ i18n.t('settings.importNo') }}
            </button>
          </template>
        </div>
      </div>

      <!-- Clear -->
      <div class="settings__row settings__row--danger">
        <div>
          <span class="settings__row-name">{{ i18n.t('settings.clearLabel') }}</span>
          <p class="settings__row-hint">{{ i18n.t('settings.clearHint') }}</p>
        </div>
        <div class="settings__clear-actions">
          <template v-if="!clearConfirm">
            <button class="settings__danger-btn" @click="startClear">
              {{ i18n.t('settings.clearBtn') }}
            </button>
          </template>
          <template v-else>
            <span class="settings__danger-confirm">{{ i18n.t('settings.clearConfirm') }}</span>
            <button class="settings__danger-btn settings__danger-btn--confirm" @click="confirmClear">
              {{ i18n.t('settings.clearYes') }}
            </button>
            <button class="settings__cancel-btn" @click="cancelClear">
              {{ i18n.t('settings.clearNo') }}
            </button>
          </template>
        </div>
      </div>
    </section>

    <!-- ── Account ─────────────────────────────────────── -->
    <section class="settings__section settings__section--soon">
      <h2 class="settings__section-title">
        {{ i18n.t('settings.sectionAccount') }}
        <span class="settings__soon-badge">{{ i18n.t('settings.comingSoon') }}</span>
      </h2>
      <p class="settings__soon-desc">{{ i18n.t('settings.accountDesc') }}</p>
    </section>
  </div>
</template>

<style scoped>
.settings {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.settings__header { margin-bottom: 12px; }

.settings__title {
  font-size: 27px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.settings__desc {
  font-size: 15px;
  color: var(--color-text-muted);
  margin: 6px 0 0;
  line-height: 1.6;
}

/* Section */
.settings__section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.settings__section--soon { opacity: 0.55; }

.settings__section-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.settings__soon-badge {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  padding: 2px 7px;
  border-radius: 99px;
}

.settings__soon-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.5;
}

/* Row */
.settings__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 40px;
}

.settings__row--danger {
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
}

.settings__row-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
}

.settings__row-hint {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 3px 0 0;
  line-height: 1.4;
}

/* Toggle (theme/lang) */
.settings__toggle {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--color-surface-elevated);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.settings__toggle-btn {
  padding: 5px 14px;
  border-radius: var(--radius-xs);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: background var(--t-fast), color var(--t-fast);
  cursor: pointer;
}
.settings__toggle-btn:hover:not(.settings__toggle-btn--active) {
  color: var(--color-text);
  background: var(--color-border);
}
.settings__toggle-btn--active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
  cursor: default;
}

/* Action buttons */
.settings__action-btn {
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition: background var(--t-fast), color var(--t-fast);
}
.settings__action-btn:hover {
  background: var(--color-accent-muted);
  color: var(--color-accent);
  border-color: var(--color-accent-muted);
}

.settings__import-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.settings__file-input {
  display: none;
}

.settings__clear-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.settings__danger-confirm {
  font-size: 13px;
  color: var(--color-danger);
  font-weight: 500;
}

.settings__danger-btn {
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-danger) 25%, transparent);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition: background var(--t-fast);
}
.settings__danger-btn:hover,
.settings__danger-btn--confirm {
  background: color-mix(in srgb, var(--color-danger) 16%, transparent);
}

.settings__cancel-btn {
  padding: 7px 12px;
  font-size: 13px;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  transition: color var(--t-fast), background var(--t-fast);
}
.settings__cancel-btn:hover { color: var(--color-text); background: var(--color-surface-elevated); }

/* API Key rows */
.settings__row--col { flex-direction: column; align-items: flex-start; gap: 10px; }

.settings__key-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  flex-wrap: wrap;
}

.settings__key-input {
  flex: 1;
  min-width: 200px;
  padding: 7px 12px;
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--color-text);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  transition: border-color var(--t-fast);
}
.settings__key-input:focus { border-color: var(--color-accent); }
.settings__key-input::placeholder { color: var(--color-text-muted); }

.settings__key-toggle {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  transition: background var(--t-fast), color var(--t-fast);
}
.settings__key-toggle:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.settings__key-status {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  flex-shrink: 0;
}
.settings__key-status--set { color: var(--color-success); }

/* ── Vibe-pak picker ─────────────────────────────────────────── */
.pak-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  width: 100%;
}

.pak-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 10px 12px;
  border-radius: var(--radius);
  border: 2px solid var(--color-border);
  background: var(--color-surface-elevated);
  cursor: pointer;
  transition: border-color var(--t-fast), box-shadow var(--t-fast), transform var(--t-fast);
  min-width: 0;
  min-height: 0;
}
.pak-card:hover {
  border-color: var(--color-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
.pak-card--active {
  border-color: var(--color-accent);
  background: var(--color-accent-muted);
  box-shadow: var(--shadow);
}

.pak-preview {
  display: flex;
  gap: 4px;
  align-items: center;
}
.pak-swatch {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.2);
  flex-shrink: 0;
}

.pak-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
}
.pak-label {
  font-size: 10px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.pak-check {
  position: absolute;
  top: 6px;
  right: 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-accent);
}

/* ── Module visibility toggles ────────────────────────────────── */
.settings__module-row {
  min-height: 48px;
}

.settings__module-info { flex: 1; min-width: 0; }

.settings__vis-toggle {
  position: relative;
  width: 42px;
  height: 24px;
  border-radius: 99px;
  background: var(--color-border);
  border: none;
  cursor: pointer;
  transition: background var(--t-fast);
  flex-shrink: 0;
}

.settings__vis-toggle--on {
  background: var(--color-accent);
}

.settings__vis-knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,.25);
  transition: transform var(--t-fast);
  display: block;
}

.settings__vis-toggle--on .settings__vis-knob {
  transform: translateX(18px);
}

@media (max-width: 767px) {
  .settings { max-width: 100%; }
  .settings__section { padding: 16px 16px; }
  .settings__row { flex-direction: column; align-items: flex-start; gap: 10px; }
  .settings__module-row { flex-direction: row; align-items: center; }
  .settings__clear-actions { flex-wrap: wrap; }
  .settings__key-input { min-width: 0; }
  .pak-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
