<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/stores/auth.store'
import { UiIcon, UiSectionLabel, UiButton } from '@/ui'
import { useTrack } from '@/core/composables/useTrack'

const router = useRouter()
const auth = useAuthStore()
const { track } = useTrack()
const APP_VERSION = __APP_VERSION__

function openApp() {
  track('cta:demo-entered')
  auth.loginDemo()
  router.push('/')
}

function goToLogin() {
  track('cta:sign-in-clicked')
  router.push('/login')
}

// ── Module showcase ──────────────────────────────────────────────────
const MODULES = [
  { icon: 'CheckSquare',    title: 'Tasks',      desc: 'Priorities, categories, due dates, and goal links.',        color: '#4f8ef7' },
  { icon: 'Flame',          title: 'Habits',     desc: 'Daily check-offs, streaks, and a year heatmap.',            color: '#f59e0b' },
  { icon: 'Target',         title: 'Goals',      desc: 'Life goals with milestones and progress tracking.',         color: '#10b981' },
  { icon: 'NotebookPen',    title: 'Notes',      desc: 'Markdown notes with [[backlinks]] and a daily journal.',    color: '#8b5cf6' },
  { icon: 'Kanban',         title: 'Board',      desc: 'Kanban + timeline views with drag-and-drop.',              color: '#06b6d4' },
  { icon: 'BookOpen',       title: 'Learning',   desc: 'Structured plans, session logs, and progress rings.',      color: '#6366f1' },
  { icon: 'Dumbbell',       title: 'Training',   desc: 'Workout plans, logs, streaks, and volume tracking.',       color: '#f97316' },
  { icon: 'CalendarDays',   title: 'Calendar',   desc: 'Unified view of tasks, habits, learning and training.',    color: '#14b8a6' },
  { icon: 'Gamepad2',       title: 'Games',      desc: 'Minesweeper, Memory, Snake, Sudoku — take a break.',      color: '#ec4899' },
  { icon: 'Zap',            title: 'Studio',     desc: 'Free AI chat (no key) or Claude API — multi-turn.',       color: '#a855f7' },
  { icon: 'BarChart2',      title: 'Analytics',  desc: 'Unified stats — habits, tasks, learning, training.',       color: '#3b82f6' },
  { icon: 'FileText',       title: 'Docs',       desc: 'Architecture decisions and module documentation.',         color: '#64748b' },
]

const STATS = [
  { value: '16',    label: 'modules' },
  { value: '0',     label: 'setup required' },
  { value: '100%',  label: 'local-first' },
  { value: '∞',     label: 'no subscription' },
]
</script>

<template>
  <div class="welcome">

    <!-- ── Nav ─────────────────────────────────────────────────── -->
    <header class="welcome__nav">
      <div class="welcome__logo">
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="#4f8ef7" />
          <path d="M10 23L14 9" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
          <path d="M18 23L22 9" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
        </svg>
        <span class="welcome__logo-text">Vibe<span>OS</span></span>
        <span class="welcome__logo-ver">v{{ APP_VERSION }}</span>
      </div>
      <div class="welcome__nav-actions">
        <a
          href="https://github.com/mrnednick/VibeOS"
          target="_blank"
          rel="noopener"
          class="welcome__nav-link"
        >
          <UiIcon name="Github" :size="15" :stroke-width="1.75" />
          GitHub
        </a>
        <UiButton variant="ghost" size="sm" @click="goToLogin()">Sign in</UiButton>
        <UiButton @click="openApp">
          Open VibeOS
          <UiIcon name="ArrowRight" :size="14" :stroke-width="2" />
        </UiButton>
      </div>
    </header>

    <!-- ── Hero ────────────────────────────────────────────────── -->
    <section class="welcome__hero">
      <div class="welcome__hero-inner">
        <p class="welcome__eyebrow">A simpler Notion — for your life</p>
        <h1 class="welcome__headline">
          Log one thing.<br>Everything updates.
        </h1>
        <p class="welcome__sub">
          Habits, tasks, goals, learning — in one light, no-setup place.<br>
          Check off a habit and your goal moves on its own.
        </p>
        <div class="welcome__hero-actions">
          <UiButton @click="openApp">
            Open VibeOS
            <UiIcon name="ArrowRight" :size="15" :stroke-width="2.2" />
          </UiButton>
          <UiButton variant="ghost" @click="goToLogin">
            Sign in
          </UiButton>
          <a
            href="https://github.com/mrnednick/VibeOS"
            target="_blank"
            rel="noopener"
            class="welcome__hero-github"
          >
            <UiIcon name="Github" :size="15" :stroke-width="1.75" />
            View on GitHub
          </a>
        </div>
      </div>
    </section>

    <!-- ── Stats row ───────────────────────────────────────────── -->
    <section class="welcome__stats">
      <div
        v-for="stat in STATS"
        :key="stat.label"
        class="welcome__stat"
      >
        <span class="welcome__stat-value">{{ stat.value }}</span>
        <span class="welcome__stat-label">{{ stat.label }}</span>
      </div>
    </section>

    <!-- ── Module grid ──────────────────────────────────────────── -->
    <section class="welcome__modules">
      <UiSectionLabel class="welcome__section-label">What's inside — 16 modules, 12 highlighted</UiSectionLabel>
      <div class="welcome__grid">
        <button
          v-for="mod in MODULES"
          :key="mod.title"
          class="welcome__card"
          :style="{ '--card-color': mod.color }"
          @click="router.push('/').catch(() => {})"
        >
          <div class="welcome__card-icon">
            <UiIcon :name="mod.icon" :size="18" :stroke-width="1.5" />
          </div>
          <div class="welcome__card-body">
            <span class="welcome__card-title">{{ mod.title }}</span>
            <p class="welcome__card-desc">{{ mod.desc }}</p>
          </div>
        </button>
      </div>
    </section>

    <!-- ── Pillars ───────────────────────────────────────────────── -->
    <section class="welcome__pillars">
      <div class="welcome__pillar">
        <UiIcon name="Link2" :size="20" :stroke-width="1.5" />
        <h3>Everything connected</h3>
        <p>Log a workout, the habit checks off and the goal advances — automatically. No manual linking.</p>
      </div>
      <div class="welcome__pillar">
        <UiIcon name="Feather" :size="20" :stroke-width="1.5" />
        <h3>Light by design</h3>
        <p>No databases to configure, no templates to wrestle. Open it and use it.</p>
      </div>
      <div class="welcome__pillar">
        <UiIcon name="Sparkles" :size="20" :stroke-width="1.5" />
        <h3>AI that knows your data</h3>
        <p>Ask anything — your goals, habits, and tasks are already loaded. Free, no key required.</p>
      </div>
    </section>

    <!-- ── Stack + footer ──────────────────────────────────────── -->
    <footer class="welcome__footer">
      <div class="welcome__stack">
        <span v-for="tech in ['Vue 3', 'TypeScript', 'Vite 6', 'Pinia', 'Lucide', 'Supabase (S3)']" :key="tech" class="welcome__stack-pill">{{ tech }}</span>
      </div>
      <p class="welcome__footer-copy">
        Built in the open ·
        <a href="https://github.com/mrnednick/VibeOS" target="_blank" rel="noopener">mrnednick/VibeOS</a>
        · v{{ APP_VERSION }}
      </p>
    </footer>

  </div>
</template>

<style scoped>
.welcome {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  color: var(--color-text);
  overflow-x: hidden;
}

/* ── Nav ─────────────────────────────────────────────────────── */
.welcome__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 48px;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
  background: color-mix(in srgb, var(--color-bg) 90%, transparent);
  backdrop-filter: blur(12px);
}

.welcome__logo {
  display: flex;
  align-items: center;
  gap: 10px;
}
.welcome__logo-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
}
.welcome__logo-text span { color: var(--color-accent); }
.welcome__logo-ver {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  padding: 1px 6px;
  border-radius: var(--radius-xs);
}

.welcome__nav-actions { display: flex; align-items: center; gap: 10px; }

.welcome__nav-link {
  display: flex; align-items: center; gap: 6px;
  font-size: 14px; font-weight: 500;
  color: var(--color-text-secondary);
  padding: 6px 12px; border-radius: var(--radius-sm); text-decoration: none;
  transition: color var(--t-fast), background var(--t-fast);
}
.welcome__nav-link:hover { color: var(--color-text); background: var(--color-surface-elevated); }

/* ── Hero ─────────────────────────────────────────────────────── */
.welcome__hero {
  display: flex; align-items: center; justify-content: center;
  padding: 100px 48px 72px;
  text-align: center;
}
.welcome__hero-inner { max-width: 680px; }

.welcome__eyebrow {
  font-size: 13px; font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--color-accent); margin: 0 0 20px;
}

.welcome__headline {
  font-size: clamp(36px, 6vw, 64px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.04em;
  color: var(--color-text);
  margin: 0 0 24px;
}

.welcome__sub {
  font-size: 17px;
  color: var(--color-text-secondary);
  line-height: 1.65;
  margin: 0 0 40px;
}

.welcome__hero-actions {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; flex-wrap: wrap;
}

.welcome__hero-github {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 15px; font-weight: 500; color: var(--color-text-secondary);
  border: 1px solid var(--color-border); padding: 12px 24px;
  border-radius: var(--radius-sm); text-decoration: none;
  transition: border-color var(--t-fast), color var(--t-fast), background var(--t-fast);
}
.welcome__hero-github:hover {
  border-color: var(--color-accent);
  color: var(--color-text);
  background: var(--color-surface-elevated);
}

/* ── Stats row ────────────────────────────────────────────────── */
.welcome__stats {
  display: flex;
  justify-content: center;
  gap: 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.welcome__stat {
  flex: 1;
  max-width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 28px 16px;
  border-right: 1px solid var(--color-border);
}
.welcome__stat:last-child { border-right: none; }

.welcome__stat-value {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-text);
  font-family: var(--font-mono);
}

.welcome__stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

/* ── Modules grid ─────────────────────────────────────────────── */
.welcome__modules {
  padding: 0 48px 72px;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

.welcome__section-label { margin-bottom: 20px; }

.welcome__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.welcome__card {
  display: flex; gap: 12px;
  padding: 18px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: border-color var(--t-fast), transform var(--t-fast), box-shadow var(--t-fast);
  text-align: left;
}
.welcome__card:hover {
  border-color: var(--card-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.welcome__card-icon {
  width: 36px; height: 36px; border-radius: 8px;
  background: color-mix(in srgb, var(--card-color) 12%, transparent);
  color: var(--card-color);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.welcome__card-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.welcome__card-title { font-size: 13px; font-weight: 700; color: var(--color-text); }
.welcome__card-desc { font-size: 12px; color: var(--color-text-secondary); line-height: 1.45; margin: 0; }

/* ── Pillars ──────────────────────────────────────────────────── */
.welcome__pillars {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-border);
  margin: 0 0 0;
}

.welcome__pillar {
  background: var(--color-bg);
  padding: 40px 40px;
  display: flex; flex-direction: column; gap: 12px;
  color: var(--color-text-muted);
}
.welcome__pillar h3 { font-size: 16px; font-weight: 700; color: var(--color-text); margin: 0; }
.welcome__pillar p  { font-size: 14px; color: var(--color-text-secondary); margin: 0; line-height: 1.6; }

/* ── Footer ───────────────────────────────────────────────────── */
.welcome__footer {
  border-top: 1px solid var(--color-border);
  padding: 28px 48px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; flex-wrap: wrap;
}

.welcome__stack { display: flex; gap: 8px; flex-wrap: wrap; }
.welcome__stack-pill {
  font-size: 11px; font-weight: 500; font-family: var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 3px 8px; border-radius: var(--radius-xs);
}

.welcome__footer-copy { font-size: 13px; color: var(--color-text-muted); margin: 0; }
.welcome__footer-copy a { color: var(--color-text-secondary); text-decoration: none; }
.welcome__footer-copy a:hover { color: var(--color-accent); }

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 1023px) {
  .welcome__grid  { grid-template-columns: repeat(3, 1fr); }
  .welcome__stats .welcome__stat { max-width: none; }
}

@media (max-width: 767px) {
  .welcome__nav     { padding: 14px 20px; }
  .welcome__nav-link { display: none; }
  .welcome__hero    { padding: 56px 20px 48px; }
  .welcome__headline { letter-spacing: -0.03em; }
  .welcome__sub     { font-size: 15px; }
  .welcome__hero-github { font-size: 14px; padding: 10px 18px; }
  .welcome__stats   { flex-wrap: wrap; }
  .welcome__stat    { flex: 1 1 calc(50% - 1px); border-right: none; border-bottom: 1px solid var(--color-border); }
  .welcome__modules { padding: 0 20px 48px; }
  .welcome__grid    { grid-template-columns: repeat(2, 1fr); }
  .welcome__pillars { grid-template-columns: 1fr; }
  .welcome__pillar  { padding: 28px 24px; }
  .welcome__footer  { padding: 20px; flex-direction: column; align-items: flex-start; }
}
</style>
