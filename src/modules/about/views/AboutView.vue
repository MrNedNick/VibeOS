<script setup lang="ts">
import { useLocale } from '@/core/i18n'
import { UiIcon } from '@/ui'

const i18n = useLocale()

// ── Author ────────────────────────────────────────────────────────────
const AUTHOR = {
  name:       'Nikita N.',
  initials:   'NN',
  title:      'Frontend Developer',
  company:    'XOVI GmbH',
  location:   'Cologne, Germany',
  experience: '5+ years',
  bio:        'Frontend developer with 5+ years of experience building modern web applications. Specialising in Vue 3, React, and TypeScript. VibeOS is a personal life OS built to track goals, habits, learning, training — and actually get used every day.',
  languages:  ['English', 'Russian', 'Ukrainian', 'German', 'Bulgarian'],
}

const SOCIAL = [
  { label: 'LinkedIn', icon: 'Linkedin',  url: 'https://www.linkedin.com/in/mrnednick/' },
  { label: 'GitHub',   icon: 'Github',    url: 'https://github.com/MrNedNick' },
]

// ── Stack ─────────────────────────────────────────────────────────────
const STACK = [
  { name: 'Vue 3',       desc: 'Composition API + TypeScript',    icon: '⚡' },
  { name: 'React',       desc: 'Used in production at XOVI GmbH', icon: '⚛️' },
  { name: 'Vite 6',      desc: 'Build tool & dev server',         icon: '🔥' },
  { name: 'Pinia',       desc: 'State management',                icon: '🍍' },
  { name: 'Vue Router 4',desc: 'Client-side routing',             icon: '🗺' },
  { name: 'TypeScript',  desc: 'Strict mode, 0 errors',           icon: '🔷' },
  { name: 'Lucide',      desc: 'Icon system',                     icon: '✦' },
  { name: 'marked',      desc: 'Markdown rendering',              icon: '📝' },
]

// ── Modules ───────────────────────────────────────────────────────────
const MODULES = [
  { id: 'task-manager',  label: 'Tasks',     desc: 'Priority tasks, keyboard nav, Pomodoro focus timer',   icon: 'CheckSquare' },
  { id: 'notes',         label: 'Notes',     desc: 'Markdown + live preview, wiki backlinks, daily journal', icon: 'NotebookPen' },
  { id: 'kanban',        label: 'Board',     desc: 'Swimlane timeline, drag-and-drop, task import',         icon: 'LayoutGrid' },
  { id: 'goals',         label: 'Goals',     desc: 'Goal tracking with milestones, progress, target dates', icon: 'Target' },
  { id: 'habits',        label: 'Habits',    desc: 'Daily check-offs, streak tracking, GitHub heatmap',     icon: 'Flame' },
  { id: 'learning',      label: 'Learning',  desc: 'Study plans, session logs, streaks and progress rings', icon: 'BookOpen' },
  { id: 'training',      label: 'Training',  desc: 'Workout plans, session logs, streaks and distance',     icon: 'Dumbbell' },
  { id: 'ai-playground', label: 'Studio',    desc: 'AI chat — Free AI (no key) + Claude API, markdown',     icon: 'Sparkles' },
  { id: 'analytics',     label: 'Analytics', desc: 'Habit heatmap, task completion, learning + training charts', icon: 'BarChart2' },
  { id: 'calendar',      label: 'Calendar',  desc: 'Monthly view with 5 activity dot types, day detail',   icon: 'CalendarDays' },
  { id: 'docs',          label: 'Docs',      desc: 'Full-text search, collapsible sections, anchor links',  icon: 'FileText' },
  { id: 'games',         label: 'Games',     desc: 'Minesweeper · Memory · Snake · Sudoku (skins system)',  icon: 'Gamepad2' },
  { id: 'settings',      label: 'Settings',  desc: 'Themes, language, API keys, data export/import',        icon: 'Settings' },
]

// ── Stats ─────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Modules',       value: '13+' },
  { label: 'TypeScript',    value: '0 errors' },
  { label: 'Dependencies',  value: 'minimal' },
  { label: 'Bundle',        value: '~380 KB' },
]

const APP_VERSION   = __APP_VERSION__
const GITHUB_URL    = 'https://github.com/MrNedNick/VibeOS'
const LIVE_SITE_URL = 'https://mrnednick.github.io/VibeOS'
</script>

<template>
  <div class="about">

    <!-- ── Author card ──────────────────────────────────────────── -->
    <div class="about__author">
      <div class="about__avatar">{{ AUTHOR.initials }}</div>
      <div class="about__author-body">
        <div class="about__author-top">
          <h1 class="about__name">{{ AUTHOR.name }}</h1>
          <div class="about__social">
            <a
              v-for="s in SOCIAL"
              :key="s.label"
              :href="s.url"
              class="about__social-link"
              target="_blank"
              rel="noopener noreferrer"
              :title="s.label"
            >
              <UiIcon :name="s.icon" :size="16" />
              <span>{{ s.label }}</span>
            </a>
          </div>
        </div>
        <p class="about__author-meta">
          <span class="about__author-title">{{ AUTHOR.title }}</span>
          <span class="about__author-sep">·</span>
          <span>{{ AUTHOR.company }}</span>
          <span class="about__author-sep">·</span>
          <UiIcon name="MapPin" :size="12" class="about__author-pin" />
          <span>{{ AUTHOR.location }}</span>
        </p>
        <p class="about__bio">{{ AUTHOR.bio }}</p>
        <div class="about__tags">
          <span
            v-for="lang in AUTHOR.languages"
            :key="lang"
            class="about__tag"
          >{{ lang }}</span>
          <span class="about__tag about__tag--exp">{{ AUTHOR.experience }}</span>
        </div>
      </div>
    </div>

    <!-- ── Project header ───────────────────────────────────────── -->
    <div class="about__project">
      <div class="about__logo">
        <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="var(--color-accent)" />
          <path d="M10 23L14 9" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
          <path d="M18 23L22 9" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
        </svg>
      </div>
      <div>
        <h2 class="about__project-title">Vibe<span class="about__os">OS</span></h2>
        <p class="about__subtitle">{{ i18n.t('about.subtitle') }}</p>
      </div>
      <div class="about__project-links">
        <span class="about__version-chip">v{{ APP_VERSION }}</span>
        <a :href="GITHUB_URL" class="about__link" target="_blank" rel="noopener noreferrer">
          <UiIcon name="Github" :size="13" />
          GitHub
        </a>
        <a :href="LIVE_SITE_URL" class="about__link" target="_blank" rel="noopener noreferrer">
          <UiIcon name="ExternalLink" :size="13" />
          Live
        </a>
      </div>
    </div>

    <!-- ── Quick stats ───────────────────────────────────────────── -->
    <div class="about__stats">
      <div v-for="s in STATS" :key="s.label" class="stat-chip">
        <span class="stat-chip__value">{{ s.value }}</span>
        <span class="stat-chip__label">{{ s.label }}</span>
      </div>
    </div>

    <!-- ── Modules ───────────────────────────────────────────────── -->
    <section class="about__section">
      <h3 class="about__section-title">{{ i18n.t('about.modules') }}</h3>
      <div class="about__modules">
        <div v-for="mod in MODULES" :key="mod.id" class="mod-item">
          <span class="mod-item__icon"><UiIcon :name="mod.icon" :size="16" :stroke-width="1.6" /></span>
          <div class="mod-item__body">
            <span class="mod-item__name">{{ mod.label }}</span>
            <span class="mod-item__desc">{{ mod.desc }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Tech stack ────────────────────────────────────────────── -->
    <section class="about__section">
      <h3 class="about__section-title">{{ i18n.t('about.stack') }}</h3>
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
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── Author card ───────────────────────────────────────────────────── */
.about__author {
  display: flex;
  gap: 20px;
  padding: 22px 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.about__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-accent) 18%, var(--color-surface-elevated));
  border: 2px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  color: var(--color-accent);
  flex-shrink: 0;
  font-family: var(--font-mono);
  letter-spacing: -0.05em;
}

.about__author-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.about__author-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.about__name {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  line-height: 1.2;
}

.about__social {
  display: flex;
  gap: 6px;
}

.about__social-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  padding: 4px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-elevated);
  text-decoration: none;
  transition: color var(--t-fast), border-color var(--t-fast), background var(--t-fast);
}
.about__social-link:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: var(--color-accent-muted);
}

.about__author-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
  flex-wrap: wrap;
}

.about__author-title {
  font-weight: 600;
  color: var(--color-text);
}

.about__author-sep { color: var(--color-text-muted); opacity: 0.45; }

.about__author-pin {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.about__bio {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.65;
}

.about__tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.about__tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 20px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.about__tag--exp {
  background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  border-color: color-mix(in srgb, var(--color-accent) 30%, transparent);
  color: var(--color-accent);
}

/* ── Project header ────────────────────────────────────────────────── */
.about__project {
  display: flex;
  align-items: center;
  gap: 14px;
}

.about__logo { flex-shrink: 0; }

.about__project-title {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-text);
  margin: 0;
  line-height: 1;
}
.about__os { color: var(--color-accent); }

.about__subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
  margin: 5px 0 0;
  line-height: 1.4;
}

.about__project-links {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  flex-shrink: 0;
}

.about__version-chip {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 2px 8px;
  border-radius: 20px;
}

.about__link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-accent);
  font-weight: 500;
  font-size: 13px;
  text-decoration: none;
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  transition: background var(--t-fast);
}
.about__link:hover { background: var(--color-accent-muted); }

/* ── Stats chips ───────────────────────────────────────────────────── */
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
  font-size: 17px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--color-accent);
  line-height: 1;
}

.stat-chip__label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  font-weight: 600;
}

/* ── Section ───────────────────────────────────────────────────────── */
.about__section { display: flex; flex-direction: column; gap: 10px; }

.about__section-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--color-text-muted);
  margin: 0;
}

/* ── Modules list ──────────────────────────────────────────────────── */
.about__modules {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}

.mod-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-border);
  transition: background var(--t-fast);
}
.mod-item:last-child { border-bottom: none; }
.mod-item:hover { background: var(--color-surface-elevated); }

.mod-item__icon {
  color: var(--color-accent);
  width: 20px;
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
  font-size: 12px;
  color: var(--color-text-muted);
  min-width: 0;
}

/* ── Stack grid ────────────────────────────────────────────────────── */
.about__stack {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.stack-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  transition: border-color var(--t-fast);
}
.stack-item:hover { border-color: var(--color-accent); }

.stack-item__icon {
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
  width: 22px;
  text-align: center;
}

.stack-item__body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.stack-item__name { font-size: 14px; font-weight: 600; color: var(--color-text); }
.stack-item__desc { font-size: 12px; color: var(--color-text-muted); line-height: 1.4; }

/* ── Responsive ────────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .about__author { flex-direction: column; gap: 14px; }
  .about__avatar { width: 48px; height: 48px; font-size: 15px; }
  .about__author-top { flex-direction: column; align-items: flex-start; gap: 8px; }
  .about__project { flex-wrap: wrap; }
  .about__project-links { margin-left: 0; }
  .about__stack { grid-template-columns: 1fr; }
  .about__stats { gap: 6px; }
  .stat-chip { min-width: 70px; padding: 10px 12px; }
}
</style>
