<script setup lang="ts">
import { useUiStore } from '@/core/stores/ui.store'
import { useLocale } from '@/core/i18n'

const uiStore = useUiStore()
const i18n = useLocale()
</script>

<template>
  <div class="settings">
    <div class="settings__header">
      <h1 class="settings__title">{{ i18n.t('settings.title') }}</h1>
      <p class="settings__desc">{{ i18n.t('settings.desc') }}</p>
    </div>

    <!-- Appearance section — fully functional -->
    <section class="settings__section">
      <h2 class="settings__section-title">{{ i18n.t('settings.sectionAppearance') }}</h2>

      <!-- Theme -->
      <div class="settings__row">
        <div class="settings__row-label">
          <span class="settings__row-name">{{ i18n.t('settings.themeLabel') }}</span>
        </div>
        <div class="settings__theme-toggle">
          <button
            class="settings__theme-btn"
            :class="{ 'settings__theme-btn--active': uiStore.isDark }"
            @click="!uiStore.isDark && uiStore.toggleTheme()"
          >{{ i18n.t('settings.themeDark') }}</button>
          <button
            class="settings__theme-btn"
            :class="{ 'settings__theme-btn--active': !uiStore.isDark }"
            @click="uiStore.isDark && uiStore.toggleTheme()"
          >{{ i18n.t('settings.themeLight') }}</button>
        </div>
      </div>

      <!-- Language -->
      <div class="settings__row">
        <div class="settings__row-label">
          <span class="settings__row-name">{{ i18n.t('settings.langLabel') }}</span>
        </div>
        <div class="settings__theme-toggle">
          <button
            class="settings__theme-btn"
            :class="{ 'settings__theme-btn--active': i18n.locale === 'ru' }"
            @click="i18n.setLocale('ru')"
          >Русский</button>
          <button
            class="settings__theme-btn"
            :class="{ 'settings__theme-btn--active': i18n.locale === 'en' }"
            @click="i18n.setLocale('en')"
          >English</button>
        </div>
      </div>
    </section>

    <!-- Keyboard section — coming soon -->
    <section class="settings__section settings__section--soon">
      <h2 class="settings__section-title">
        {{ i18n.t('settings.sectionKeyboard') }}
        <span class="settings__soon-badge">{{ i18n.t('settings.comingSoon') }}</span>
      </h2>
      <p class="settings__soon-desc">Custom keybindings, global shortcuts and focus mode hotkeys.</p>
    </section>

    <!-- Data section — coming soon -->
    <section class="settings__section settings__section--soon">
      <h2 class="settings__section-title">
        {{ i18n.t('settings.sectionData') }}
        <span class="settings__soon-badge">{{ i18n.t('settings.comingSoon') }}</span>
      </h2>
      <p class="settings__soon-desc">Export your data, clear storage, and manage sync when Supabase is ready.</p>
    </section>

    <!-- Account section — coming soon -->
    <section class="settings__section settings__section--soon">
      <h2 class="settings__section-title">
        {{ i18n.t('settings.sectionAccount') }}
        <span class="settings__soon-badge">{{ i18n.t('settings.comingSoon') }}</span>
      </h2>
      <p class="settings__soon-desc">Sign in, profile, and cross-device sync.</p>
    </section>
  </div>
</template>

<style scoped>
.settings {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.settings__header {
  margin-bottom: 16px;
}

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

/* Sections */
.settings__section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings__section--soon {
  opacity: 0.6;
}

.settings__section-title {
  font-size: 14px;
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

/* Setting rows */
.settings__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 40px;
}

.settings__row-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
}

/* Theme / language toggle */
.settings__theme-toggle {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--color-surface-elevated);
  border-radius: var(--radius-sm);
}

.settings__theme-btn {
  padding: 5px 14px;
  border-radius: var(--radius-xs);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: background var(--t-fast), color var(--t-fast);
  cursor: pointer;
}
.settings__theme-btn:hover:not(.settings__theme-btn--active) {
  color: var(--color-text);
  background: var(--color-border);
}
.settings__theme-btn--active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
  cursor: default;
}

@media (max-width: 767px) {
  .settings { max-width: 100%; }
  .settings__section { padding: 16px 18px; }
  .settings__row { flex-direction: column; align-items: flex-start; gap: 10px; }
}
</style>
