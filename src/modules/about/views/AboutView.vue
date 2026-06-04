<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '@/core/i18n'
import { UiIcon } from '@/ui'
import { PLATFORM_MODULES } from '@/core/registry/modules'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { useTasksStore } from '@/modules/task-manager/stores/tasks.store'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { useTrack } from '@/core/composables/useTrack'

const i18n        = useLocale()
const habitsStore = useHabitsStore()
const tasksStore  = useTasksStore()
const goalsStore  = useGoalsStore()
const { track } = useTrack()

const APP_VERSION   = __APP_VERSION__
const GITHUB_URL    = 'https://github.com/MrNedNick/VibeOS'
const LIVE_SITE_URL = 'https://mrnednick.github.io/VibeOS'

const SOCIAL = [
  { label: 'LinkedIn', icon: 'Linkedin', url: 'https://www.linkedin.com/in/mrnednick/' },
  { label: 'GitHub',   icon: 'Github',   url: 'https://github.com/MrNedNick' },
]

const SKILLS = [
  {
    title: 'Frontend Systems',
    icon:  'Layers',
    items: ['Vue 3 Composition API', 'React hooks & context', 'Custom design systems', 'CSS architecture'],
  },
  {
    title: 'TypeScript',
    icon:  'Code2',
    items: ['Strict mode, 0 errors', 'Complex generics & utility types', 'Runtime-safe patterns', 'Full-stack TS'],
  },
  {
    title: 'Product Thinking',
    icon:  'Target',
    items: ['Build for real daily use', 'Ship fast, iterate publicly', 'UX-first architecture decisions', 'Performance by default'],
  },
  {
    title: 'Backend & Data',
    icon:  'Database',
    items: ['Supabase + Postgres + RLS', 'REST & GraphQL APIs', 'LocalStorage-first offline apps', 'Auth flows & security'],
  },
]

const VIBEOS_DECISIONS = [
  { label: 'State management',  value: 'Pinia (no Vuex)',       desc: 'Simpler, composable, TypeScript-native' },
  { label: 'Styles',            value: 'Zero CSS frameworks',   desc: 'Design tokens + scoped component CSS; @/ui single source of truth (S17)' },
  { label: 'AI',                value: 'Pollinations.ai first', desc: 'Free tier, no key — works for every visitor' },
  { label: 'Data',              value: 'localStorage-first',    desc: 'Works offline, Supabase sync on auth' },
  { label: 'Testing',           value: 'Vitest + happy-dom',    desc: '274 tests, CI gate — deploy blocked on failure' },
]

const LANGUAGES = [
  { name: 'Ukrainian', level: 'Native'   },
  { name: 'Russian',   level: 'Native'   },
  { name: 'English',   level: 'B2'       },
  { name: 'German',    level: 'B1'       },
  { name: 'Bulgarian', level: 'Heritage' },
]

const MODULE_DESCS: Record<string, string> = {
  'task-manager':  'Priority tasks, AI focus, Pomodoro, heatmap',
  'notes':         'Markdown editor, wiki backlinks, goal linking',
  'kanban':        'Swimlane + Timeline, drag-and-drop',
  'goals':         'Milestones, AI suggestions, linked tasks & notes',
  'habits':        'Streaks, retroactive check-ins, skip days, milestones',
  'learning':      'Study plans, session logs, AI analysis',
  'training':      'Workout plans, logs, AI coaching',
  'finance':       'Expenses, budgets, charts, multi-currency',
  'ai-playground': 'Free AI + Claude API, markdown rendering',
  'analytics':     'Habit heatmap, task & learning trends',
  'calendar':      'Monthly view, 5 activity dot types',
  'docs':          'Full-text search, anchor links',
  'games':         'Minesweeper · Memory · Snake · Sudoku + skins',
  'settings':      '6 vibe-paks, module visibility, data export',
}

const MODULES = computed(() =>
  PLATFORM_MODULES
    .filter(m => m.status === 'available')
    .map(m => ({ id: m.id, label: m.label, desc: MODULE_DESCS[m.id] ?? m.label, icon: m.icon }))
)

const STATS = computed(() => [
  { label: 'Modules',        value: `${MODULES.value.length}` },
  { label: 'TypeScript',     value: '0 errors' },
  { label: 'Habits tracked', value: `${habitsStore.habits.length}` },
  { label: 'Tasks done',     value: `${tasksStore.tasks.filter(t => t.done).length}` },
  { label: 'Active goals',   value: `${goalsStore.activeGoals.length}` },
  { label: 'Version',        value: `v${APP_VERSION}` },
])
</script>

<template>
  <div class="about">

    <!-- ── Hero ───────────────────────────────────────────────────── -->
    <div class="about__hero">
      <div class="about__avatar">NN</div>
      <div class="about__hero-body">
        <div class="about__hero-top">
          <div>
            <h1 class="about__name">Nikita Nedyalkov</h1>
            <p class="about__title-line">
              <span class="about__title">App Developer</span>
              <span class="about__sep">·</span>
              <span class="about__exp">6+ years</span>
            </p>
          </div>
          <div class="about__ctas">
            <a
              v-for="s in SOCIAL"
              :key="s.label"
              :href="s.url"
              class="about__cta"
              target="_blank"
              rel="noopener noreferrer"
              @click="track('link:external', { label: s.label })"
            >
              <UiIcon :name="s.icon" :size="15" />
              {{ s.label }}
            </a>
          </div>
        </div>
        <p class="about__bio">
          App developer with 6+ years building end-to-end digital products —
          from UI to backend architecture. Specialising in Vue 3, React, and TypeScript.
          VibeOS is a simpler Notion for your life — habits, tasks, goals, learning in one place where everything is connected. Log one thing, and the rest updates on its own.
        </p>
        <p class="about__ethos">
          <span class="about__ethos-mark">✦</span>
          I ship because a live product teaches you what no design doc ever will.
        </p>
      </div>
    </div>

    <!-- ── What I'm good at ───────────────────────────────────────── -->
    <section class="about__section">
      <h2 class="about__section-title">What I'm good at</h2>
      <div class="about__skills">
        <div v-for="skill in SKILLS" :key="skill.title" class="skill-card">
          <div class="skill-card__head">
            <span class="skill-card__icon">
              <UiIcon :name="skill.icon" :size="16" :stroke-width="1.75" />
            </span>
            <span class="skill-card__title">{{ skill.title }}</span>
          </div>
          <ul class="skill-card__list">
            <li v-for="item in skill.items" :key="item" class="skill-card__item">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ── VibeOS — this is what I built ──────────────────────────── -->
    <section class="about__section">
      <div class="about__project-head">
        <div class="about__logo">
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="9" fill="var(--color-accent)" />
            <path d="M10.5 11.2 16 20.4M21.5 11.2 16 20.4" stroke="white" stroke-width="1.9" stroke-linecap="round" opacity="0.5"/>
            <circle cx="10.5" cy="10.5" r="2.3" fill="white"/>
            <circle cx="21.5" cy="10.5" r="2.3" fill="white"/>
            <circle cx="16" cy="21" r="3" fill="white"/>
          </svg>
        </div>
        <div>
          <h2 class="about__project-title">Vibe<span class="about__os">OS</span></h2>
          <p class="about__project-sub">{{ i18n.t('about.subtitle') }}</p>
        </div>
        <div class="about__project-links">
          <span class="about__version-chip">v{{ APP_VERSION }}</span>
          <a :href="GITHUB_URL" class="about__proj-link" target="_blank" rel="noopener noreferrer" @click="track('link:external', { label: 'GitHub' })">
            <UiIcon name="Github" :size="13" /> GitHub
          </a>
          <a :href="LIVE_SITE_URL" class="about__proj-link" target="_blank" rel="noopener noreferrer" @click="track('link:external', { label: 'Live' })">
            <UiIcon name="ExternalLink" :size="13" /> Live
          </a>
        </div>
      </div>

      <!-- Live stats -->
      <div class="about__stats">
        <div v-for="s in STATS" :key="s.label" class="stat-chip">
          <span class="stat-chip__value">{{ s.value }}</span>
          <span class="stat-chip__label">{{ s.label }}</span>
        </div>
      </div>

      <!-- Key decisions -->
      <div class="about__decisions">
        <div v-for="d in VIBEOS_DECISIONS" :key="d.label" class="decision-row">
          <span class="decision-row__label">{{ d.label }}</span>
          <span class="decision-row__value">{{ d.value }}</span>
          <span class="decision-row__desc">{{ d.desc }}</span>
        </div>
      </div>
    </section>

    <!-- ── Modules ────────────────────────────────────────────────── -->
    <section class="about__section">
      <h2 class="about__section-title">{{ i18n.t('about.modules') }}</h2>
      <div class="about__modules">
        <div v-for="mod in MODULES" :key="mod.id" class="mod-item">
          <span class="mod-item__icon">
            <UiIcon :name="mod.icon" :size="15" :stroke-width="1.6" />
          </span>
          <div class="mod-item__body">
            <span class="mod-item__name">{{ mod.label }}</span>
            <span class="mod-item__desc">{{ mod.desc }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Languages ──────────────────────────────────────────────── -->
    <section class="about__section about__section--row">
      <h2 class="about__section-title">Languages</h2>
      <div class="about__langs">
        <div v-for="lang in LANGUAGES" :key="lang.name" class="lang-chip">
          <span class="lang-chip__name">{{ lang.name }}</span>
          <span class="lang-chip__level">{{ lang.level }}</span>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.about {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* ── Hero ─────────────────────────────────────────────────────────────── */
.about__hero {
  display: flex;
  gap: 22px;
  padding: 26px 28px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-1);
}

.about__avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-accent) 18%, var(--color-surface-elevated));
  border: 2px solid color-mix(in srgb, var(--color-accent) 35%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 800;
  color: var(--color-accent);
  flex-shrink: 0;
  font-family: var(--font-mono);
  letter-spacing: -0.05em;
  margin-top: 2px;
}

.about__hero-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.about__hero-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.about__name {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  line-height: var(--leading-2xl);
}

.about__title-line {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: var(--text-sm);
  margin: 3px 0 0;
}

.about__title { font-weight: 600; color: var(--color-text-secondary); }
.about__sep   { color: var(--color-text-muted); opacity: 0.4; }
.about__exp   { color: var(--color-text-muted); }

.about__ctas {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.about__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-elevated);
  text-decoration: none;
  transition: color var(--t-fast), border-color var(--t-fast), background var(--t-fast);
}
.about__cta:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: var(--color-accent-muted);
}

.about__bio {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--leading-lg);
}

.about__ethos {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-style: italic;
  margin: 0;
  line-height: var(--leading-base);
}

.about__ethos-mark {
  color: var(--color-accent);
  font-style: normal;
  font-size: 12px;
  flex-shrink: 0;
  margin-top: 1px;
}

/* ── Section ──────────────────────────────────────────────────────────── */
.about__section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.about__section--row {
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}

.about__section-title {
  font-size: var(--text-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin: 0;
}

/* ── Skills ──────────────────────────────────────────────────────────── */
.about__skills {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.skill-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: var(--shadow-1);
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
}

.skill-card:hover {
  border-color: color-mix(in srgb, var(--color-accent) 40%, var(--color-border));
  box-shadow: var(--shadow-2);
}

.skill-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-card__icon {
  color: var(--color-accent);
  display: flex;
  align-items: center;
}

.skill-card__title {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text);
}

.skill-card__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.skill-card__item {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  line-height: var(--leading-sm);
  display: flex;
  align-items: center;
  gap: 6px;
}

.skill-card__item::before {
  content: '';
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--color-accent);
  opacity: 0.5;
  flex-shrink: 0;
}

/* ── Project section ─────────────────────────────────────────────────── */
.about__project-head {
  display: flex;
  align-items: center;
  gap: 14px;
}

.about__logo { flex-shrink: 0; }

.about__project-title {
  font-size: var(--text-2xl);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-text);
  margin: 0;
  line-height: 1;
}
.about__os { color: var(--color-accent); }

.about__project-sub {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin: 5px 0 0;
  line-height: var(--leading-xs);
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

.about__proj-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-accent);
  font-weight: 500;
  font-size: var(--text-xs);
  text-decoration: none;
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  transition: background var(--t-fast);
}
.about__proj-link:hover { background: var(--color-accent-muted); }

/* ── Stats ───────────────────────────────────────────────────────────── */
.about__stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 13px 18px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  min-width: 80px;
  box-shadow: var(--shadow-1);
  transition: border-color var(--t-fast);
}
.stat-chip:hover { border-color: color-mix(in srgb, var(--color-accent) 50%, var(--color-border)); }

.stat-chip__value {
  font-size: 18px;
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

/* ── Key decisions ───────────────────────────────────────────────────── */
.about__decisions {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-1);
}

.decision-row {
  display: grid;
  grid-template-columns: 150px 170px 1fr;
  align-items: center;
  gap: 12px;
  padding: 11px 18px;
  border-bottom: 1px solid var(--color-border);
  transition: background var(--t-fast);
}
.decision-row:last-child { border-bottom: none; }
.decision-row:hover { background: var(--color-surface-elevated); }

.decision-row__label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-weight: 500;
}

.decision-row__value {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--color-text);
  font-family: var(--font-mono);
}

.decision-row__desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/* ── Modules ─────────────────────────────────────────────────────────── */
.about__modules {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-1);
}

.mod-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 18px;
  border-bottom: 1px solid var(--color-border);
  transition: background var(--t-fast);
}
.mod-item:last-child { border-bottom: none; }
.mod-item:hover { background: color-mix(in srgb, var(--color-accent) 4%, var(--color-surface-elevated)); }

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
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
}

.mod-item__desc {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  min-width: 0;
}

/* ── Languages ───────────────────────────────────────────────────────── */
.about__langs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.lang-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-1);
  transition: border-color var(--t-fast);
}
.lang-chip:hover { border-color: color-mix(in srgb, var(--color-accent) 40%, var(--color-border)); }

.lang-chip__name {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text);
}

.lang-chip__level {
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

/* ── Responsive ──────────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .about                 { gap: 24px; }
  .about__hero           { flex-direction: column; gap: 14px; padding: 20px; }
  .about__avatar         { width: 50px; height: 50px; font-size: 15px; }
  .about__hero-top       { flex-direction: column; align-items: flex-start; gap: 10px; }
  .about__skills         { grid-template-columns: 1fr; }
  .about__project-head   { flex-wrap: wrap; }
  .about__project-links  { margin-left: 0; }
  .about__stats          { gap: 6px; }
  .stat-chip             { min-width: 70px; padding: 10px 12px; }
  .decision-row          { grid-template-columns: 1fr; gap: 2px; }
  .decision-row__value   { order: -1; }
  .about__section--row   { flex-direction: column; align-items: flex-start; }
}
</style>
