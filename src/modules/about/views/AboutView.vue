<script setup lang="ts">
import { useLocale } from '@/core/i18n'
import { UiIcon } from '@/ui'

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

const MODULES = [
  { id: 'task-manager', label: 'Tasks',    desc: 'Priority tasks, keyboard nav, CSV/JSON export',           icon: 'CheckSquare' },
  { id: 'notes',        label: 'Notes',    desc: 'Markdown with live preview, daily journal, pin + export', icon: 'NotebookPen' },
  { id: 'kanban',       label: 'Board',    desc: 'Swimlane timeline, drag-and-drop, task import',            icon: 'LayoutGrid' },
  { id: 'ai-playground',label: 'Studio',   desc: 'Prompt Lab — Opus / Sonnet / Haiku, run history',         icon: 'Sparkles' },
  { id: 'snippets',     label: 'Snippets', desc: 'Code vault — syntax highlight, tags, search',              icon: 'Braces' },
  { id: 'habits',       label: 'Habits',   desc: 'Daily check-offs, streak tracking, heatmap',               icon: 'Flame' },
  { id: 'games',        label: 'Games',    desc: 'Minesweeper · Memory Cards · Snake',                       icon: 'Gamepad2' },
  { id: 'goals',        label: 'Goals',    desc: 'Goal tracking with milestones and progress',               icon: 'Target' },
  { id: 'learning',     label: 'Learning', desc: 'Study plans, session logs, streaks and progress rings',   icon: 'BookOpen' },
  { id: 'training',     label: 'Training', desc: 'Workout plans, session logs, streaks and distance',        icon: 'Dumbbell' },
]

const STATS = [
  { label: 'Modules',        value: '12' },
  { label: 'TypeScript',     value: '0 errors' },
  { label: 'Dependencies',   value: '0 extra' },
  { label: 'Bundle size',    value: '~380 KB' },
]

const APP_VERSION   = __APP_VERSION__
const GITHUB_URL    = 'https://github.com/MrNedNick/VibeOS'
const LIVE_SITE_URL = 'https://mrnednick.github.io/VibeOS'
</script>

<template>
  <div class="about">

    <!-- Hero ──────────────────────────────────────────────── -->
    <div class="about__hero">
      <div class="about__logo">
        <svg width="52" height="52" viewBox="0 0 32 32" fill="none">
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

    <!-- Meta row ────────────────────────────────────────────── -->
    <div class="about__meta">
      <span class="about__version-label">{{ i18n.t('about.version') }}</span>
      <span class="about__version-value">v{{ APP_VERSION }}</span>
      <span class="about__sep">·</span>
      <a :href="GITHUB_URL" class="about__link" target="_blank" rel="noopener noreferrer">
        GitHub ↗
      </a>
      <span class="about__sep">·</span>
      <a :href="LIVE_SITE_URL" class="about__link" target="_blank" rel="noopener noreferrer">
        {{ i18n.t('about.liveSite') }} ↗
      </a>
    </div>

    <!-- Quick stats ──────────────────────────────────────────── -->
    <div class="about__stats">
      <div v-for="s in STATS" :key="s.label" class="stat-chip">
        <span class="stat-chip__value">{{ s.value }}</span>
        <span class="stat-chip__label">{{ s.label }}</span>
      </div>
    </div>

    <!-- Modules ────────────────────────────────────────────── -->
    <section class="about__section">
      <h2 class="about__section-title">{{ i18n.t('about.modules') }}</h2>
      <div class="about__modules">
        <div v-for="mod in MODULES" :key="mod.id" class="mod-item">
          <span class="mod-item__icon"><UiIcon :name="mod.icon" :size="18" :stroke-width="1.6" /></span>
          <div class="mod-item__body">
            <span class="mod-item__name">{{ mod.label }}</span>
            <span class="mod-item__desc">{{ mod.desc }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Tech stack ────────────────────────────────────────── -->
    <section class="about__section">
      <h2 class="about__section-title">{{ i18n.t('about.stack') }}</h2>
      <div class="about__stack">
        <div v-for="item in STACK" :key="item.name" class="stack-item">
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
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Hero */
.about__hero {
  display: flex;
  align-items: center;
  gap: 18px;
}

.about__logo { flex-shrink: 0; }

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

/* Meta row */
.about__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  flex-wrap: wrap;
}

.about__version-label {
  font-weight: 600;
  color: var(--color-text-secondary);
}

.about__version-value {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-text-muted);
}

.about__sep { color: var(--color-text-muted); opacity: 0.4; }

.about__link {
  color: var(--color-accent);
  font-weight: 500;
  font-size: 14px;
  transition: opacity var(--t-fast);
}
.about__link:hover { opacity: 0.75; }

/* Stats chips */
.about__stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px 18px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  min-width: 80px;
}

.stat-chip__value {
  font-size: 18px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--color-accent);
  line-height: 1;
}

.stat-chip__label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  font-weight: 600;
}

/* Section */
.about__section { display: flex; flex-direction: column; gap: 10px; }

.about__section-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin: 0;
}

/* Modules list */
.about__modules {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}

.mod-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 16px;
  border-bottom: 1px solid var(--color-border);
  transition: background var(--t-fast);
}
.mod-item:last-child { border-bottom: none; }
.mod-item:hover { background: var(--color-surface-elevated); }

.mod-item__icon {
  color: var(--color-accent);
  width: 22px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mod-item__body {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
  flex-wrap: wrap;
}

.mod-item__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
}

.mod-item__desc {
  font-size: 13px;
  color: var(--color-text-muted);
  min-width: 0;
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

.stack-item__body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }

.stack-item__name { font-size: 14px; font-weight: 600; color: var(--color-text); }
.stack-item__desc { font-size: 12px; color: var(--color-text-muted); line-height: 1.4; }

@media (max-width: 767px) {
  .about__stack { grid-template-columns: 1fr; }
  .about__hero { flex-direction: column; align-items: flex-start; gap: 12px; }
  .about__stats { gap: 6px; }
  .stat-chip { min-width: 70px; padding: 10px 12px; }
}
</style>
