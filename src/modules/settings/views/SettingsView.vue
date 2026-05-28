<script setup lang="ts">
import { ref } from 'vue'
import { useUiStore } from '@/core/stores/ui.store'
import { useLocale } from '@/core/i18n'
import { useStorage } from '@/core/composables/useStorage'

const uiStore = useUiStore()
const i18n    = useLocale()

// ── API keys ──────────────────────────────────────────────────────
const anthropicKey    = useStorage<string>('platform:studio:apikey', '')
const openWeatherKey  = useStorage<string>('platform:settings:openweather-key', '')
const showAnthropic   = ref(false)
const showOpenWeather = ref(false)

// ── Data section ──────────────────────────────────────────────────
const clearConfirm = ref(false)
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

      <div class="settings__row">
        <span class="settings__row-name">{{ i18n.t('settings.themeLabel') }}</span>
        <div class="settings__toggle">
          <button
            class="settings__toggle-btn"
            :class="{ 'settings__toggle-btn--active': uiStore.isDark }"
            @click="!uiStore.isDark && uiStore.toggleTheme()"
          >{{ i18n.t('settings.themeDark') }}</button>
          <button
            class="settings__toggle-btn"
            :class="{ 'settings__toggle-btn--active': !uiStore.isDark }"
            @click="uiStore.isDark && uiStore.toggleTheme()"
          >{{ i18n.t('settings.themeLight') }}</button>
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

      <!-- OpenWeather -->
      <div class="settings__row settings__row--col">
        <div>
          <span class="settings__row-name">{{ i18n.t('settings.openWeatherKeyLabel') }}</span>
          <p class="settings__row-hint">{{ i18n.t('settings.openWeatherKeyHint') }}</p>
        </div>
        <div class="settings__key-row">
          <input
            v-model="openWeatherKey"
            :type="showOpenWeather ? 'text' : 'password'"
            class="settings__key-input"
            placeholder="abc123…"
            spellcheck="false"
            autocomplete="off"
          />
          <button class="settings__key-toggle" @click="showOpenWeather = !showOpenWeather">
            {{ showOpenWeather ? i18n.t('settings.keyHide') : i18n.t('settings.keyShow') }}
          </button>
          <span class="settings__key-status" :class="{ 'settings__key-status--set': openWeatherKey }">
            {{ openWeatherKey ? i18n.t('settings.keySet') : i18n.t('settings.keyNotSet') }}
          </span>
        </div>
      </div>
    </section>

    <!-- ── Data ────────────────────────────────────────── -->
    <section class="settings__section">
      <h2 class="settings__section-title">{{ i18n.t('settings.sectionData') }}</h2>

      <div class="settings__row">
        <div>
          <span class="settings__row-name">{{ i18n.t('settings.exportLabel') }}</span>
          <p class="settings__row-hint">{{ i18n.t('settings.exportHint') }}</p>
        </div>
        <button class="settings__action-btn" @click="exportData">
          {{ i18n.t('settings.exportBtn') }}
        </button>
      </div>

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

@media (max-width: 767px) {
  .settings { max-width: 100%; }
  .settings__section { padding: 16px 16px; }
  .settings__row { flex-direction: column; align-items: flex-start; gap: 10px; }
  .settings__clear-actions { flex-wrap: wrap; }
  .settings__key-input { min-width: 0; }
}
</style>
