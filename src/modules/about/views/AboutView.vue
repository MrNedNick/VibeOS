<script setup lang="ts">
import { useLocale } from '@/core/i18n'

const i18n = useLocale()

const STACK = [
  { name: 'Vue 3',        desc: 'Composition API + TypeScript',    icon: '⚡' },
  { name: 'Vite 6',       desc: 'Build tool & dev server',         icon: '🔥' },
  { name: 'Pinia',        desc: 'State management',                icon: '🍍' },
  { name: 'Vue Router 4', desc: 'Client-side routing',             icon: '🗺' },
  { name: 'Lucide',       desc: 'Icon system',                     icon: '✦' },
  { name: 'highlight.js', desc: 'Syntax highlighting in Snippets', icon: '🎨' },
  { name: 'marked',       desc: 'Markdown rendering in Notes',     icon: '📝' },
]

const GITHUB_URL = 'https://github.com/MrNedNick/VibeOS'
</script>

<template>
  <div class="about">
    <!-- Hero -->
    <div class="about__hero">
      <div class="about__logo">
        <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="var(--color-accent)" />
          <path d="M10 23L14 9" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
          <path d="M18 23L22 9" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
        </svg>
      </div>
      <div>
        <h1 class="about__title">Vibe<span class="about__os">OS</span></h1>
        <p class="about__subtitle">{{ i18n.t('about.subtitle') }}</p>
      </div>
    </div>

    <div class="about__version">
      <span class="about__version-label">{{ i18n.t('about.version') }}</span>
      <span class="about__version-value">v0.1.0</span>
      <span class="about__version-dot">·</span>
      <a
        :href="GITHUB_URL"
        class="about__github"
        target="_blank"
        rel="noopener noreferrer"
      >{{ i18n.t('about.github') }} ↗</a>
    </div>

    <!-- Tech stack -->
    <section class="about__section">
      <h2 class="about__section-title">{{ i18n.t('about.stack') }}</h2>
      <div class="about__stack">
        <div
          v-for="item in STACK"
          :key="item.name"
          class="stack-item"
        >
          <span class="stack-item__icon">{{ item.icon }}</span>
          <div class="stack-item__body">
            <span class="stack-item__name">{{ item.name }}</span>
            <span class="stack-item__desc">{{ item.desc }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Hero */
.about__hero {
  display: flex;
  align-items: center;
  gap: 18px;
}

.about__logo {
  flex-shrink: 0;
}

.about__title {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-text);
  margin: 0;
  line-height: 1;
}

.about__os { color: var(--color-accent); }

.about__subtitle {
  font-size: 15px;
  color: var(--color-text-muted);
  margin: 6px 0 0;
  line-height: 1.5;
}

/* Version row */
.about__version {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.about__version-label {
  font-weight: 600;
  color: var(--color-text-secondary);
}

.about__version-value {
  font-family: var(--font-mono);
  font-size: 13px;
}

.about__version-dot { opacity: 0.4; }

.about__github {
  color: var(--color-accent);
  font-weight: 500;
  transition: opacity var(--t-fast);
}
.about__github:hover { opacity: 0.8; }

/* Section */
.about__section { display: flex; flex-direction: column; gap: 12px; }

.about__section-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin: 0;
}

/* Stack grid */
.about__stack {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.stack-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.stack-item__icon {
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.stack-item__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.stack-item__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.stack-item__desc {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.4;
}

@media (max-width: 767px) {
  .about__stack { grid-template-columns: 1fr; }
  .about__hero { flex-direction: column; align-items: flex-start; gap: 12px; }
}
</style>
