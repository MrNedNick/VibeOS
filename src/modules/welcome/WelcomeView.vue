<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/stores/auth.store'
import { UiIcon, UiButton } from '@/ui'
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

// ── Live cascade demo (seeded fake data, fully self-contained) ────────
// The whole product story in one interaction: check a habit → its linked
// goal advances on its own. Nothing here touches real stores.
const RING_R = 22
const RING_C = 2 * Math.PI * RING_R

const checked = ref(false)
const pulse = ref(false)

const streak = computed(() => (checked.value ? 12 : 11))
const progress = computed(() => (checked.value ? 68 : 60))
const ringOffset = computed(() => RING_C * (1 - progress.value / 100))

function toggleHabit() {
  checked.value = !checked.value
  pulse.value = true
  window.setTimeout(() => (pulse.value = false), 900)
}

// ── Module showcase ──────────────────────────────────────────────────
const MODULES = [
  { icon: 'CheckSquare',  title: 'Tasks',     desc: 'Priorities, due dates, goal links.' },
  { icon: 'Flame',        title: 'Habits',    desc: 'Check-offs, streaks, year heatmap.' },
  { icon: 'Target',       title: 'Goals',     desc: 'Milestones and live progress.' },
  { icon: 'NotebookPen',  title: 'Notes',     desc: 'Markdown with [[backlinks]].' },
  { icon: 'Kanban',       title: 'Board',     desc: 'Kanban + timeline, drag & drop.' },
  { icon: 'BookOpen',     title: 'Learning',  desc: 'Plans, session logs, streaks.' },
  { icon: 'Dumbbell',     title: 'Training',  desc: 'Workouts, logs, volume.' },
  { icon: 'CalendarDays', title: 'Calendar',  desc: 'Everything on one grid.' },
  { icon: 'Zap',          title: 'Studio',    desc: 'Free AI chat — no key needed.' },
  { icon: 'BarChart2',    title: 'Analytics', desc: 'Unified stats across modules.' },
  { icon: 'Gamepad2',     title: 'Games',     desc: 'Snake, Sudoku, Tetris & more.' },
  { icon: 'FileText',     title: 'Docs',      desc: 'Architecture and module specs.' },
]

const STATS = [
  { value: '16',   label: 'modules' },
  { value: '0',    label: 'setup steps' },
  { value: '100%', label: 'local-first' },
  { value: '∞',    label: 'no subscription' },
]

const PILLARS = [
  {
    icon: 'Link2',
    title: 'Everything connected',
    desc: 'Log a workout, the habit checks off and the goal advances — automatically. No manual linking.',
  },
  {
    icon: 'Feather',
    title: 'Light by design',
    desc: 'No databases to configure, no templates to wrestle. Open it and use it.',
  },
  {
    icon: 'Sparkles',
    title: 'AI that knows your data',
    desc: 'Ask anything — your goals, habits and tasks are already loaded. Free, no key required.',
  },
]

const PAKS = [
  { id: 'dark',      name: 'Dark' },
  { id: 'light',     name: 'Light' },
  { id: 'brutalist', name: 'Brutalist' },
  { id: 'crt',       name: 'CRT Retro' },
]
</script>

<template>
  <div class="welcome">

    <!-- ── Nav ─────────────────────────────────────────────────── -->
    <header class="welcome__nav">
      <div class="welcome__brand">
        <svg class="welcome__mark" width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect width="32" height="32" rx="9" fill="var(--color-accent)" />
          <path d="M10.5 11.2 16 20.4M21.5 11.2 16 20.4" stroke="white" stroke-width="1.9" stroke-linecap="round" opacity="0.5"/>
          <circle cx="10.5" cy="10.5" r="2.3" fill="white"/>
          <circle cx="21.5" cy="10.5" r="2.3" fill="white"/>
          <circle cx="16" cy="21" r="3" fill="white"/>
        </svg>
        <span class="welcome__brand-text">Vibe<span>OS</span></span>
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
        <UiButton variant="ghost" size="sm" @click="goToLogin">Sign in</UiButton>
        <UiButton size="sm" @click="openApp">
          Open VibeOS
          <UiIcon name="ArrowRight" :size="14" :stroke-width="2" />
        </UiButton>
      </div>
    </header>

    <!-- ── Hero ────────────────────────────────────────────────── -->
    <section class="welcome__hero">
      <div class="welcome__hero-copy">
        <p class="welcome__eyebrow">A simpler Notion — for your life</p>
        <h1 class="welcome__headline">Log one thing.<br>Everything updates.</h1>
        <p class="welcome__sub">
          Habits, tasks, goals, learning — in one light, no-setup place.
          Check off a habit and your goal moves on its own.
        </p>
        <div class="welcome__hero-actions">
          <UiButton @click="openApp">
            Open VibeOS
            <UiIcon name="ArrowRight" :size="15" :stroke-width="2.2" />
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

      <!-- ⭐ Live interactive cascade — the key element -->
      <div class="welcome__demo" :class="{ 'welcome__demo--pulse': pulse }">
        <div class="welcome__demo-hint">
          <UiIcon name="MousePointerClick" :size="14" :stroke-width="1.75" />
          Go ahead — check it off
        </div>

        <button
          class="welcome__habit"
          :class="{ 'welcome__habit--done': checked }"
          type="button"
          :aria-pressed="checked"
          @click="toggleHabit"
        >
          <span class="welcome__check">
            <UiIcon v-if="checked" name="Check" :size="14" :stroke-width="3" />
          </span>
          <span class="welcome__habit-name">Morning run</span>
          <span class="welcome__streak">
            <UiIcon name="Flame" :size="13" :stroke-width="2" />
            {{ streak }}
          </span>
        </button>

        <div class="welcome__link">
          <span class="welcome__link-line" />
          <span class="welcome__link-tag">auto-linked</span>
          <span class="welcome__link-line" />
        </div>

        <div class="welcome__goal">
          <svg class="welcome__ring" width="60" height="60" viewBox="0 0 60 60" aria-hidden="true">
            <circle class="welcome__ring-track" cx="30" cy="30" :r="RING_R" />
            <circle
              class="welcome__ring-fill"
              cx="30" cy="30" :r="RING_R"
              :stroke-dasharray="RING_C"
              :stroke-dashoffset="ringOffset"
            />
          </svg>
          <div class="welcome__goal-body">
            <span class="welcome__goal-name">Run a half-marathon</span>
            <span class="welcome__goal-meta">
              Goal · {{ progress }}%
              <span class="welcome__goal-delta" :class="{ 'is-on': checked }">+8%</span>
            </span>
          </div>
          <UiIcon class="welcome__goal-icon" name="Target" :size="16" :stroke-width="1.75" />
        </div>
      </div>
    </section>

    <!-- ── Proof strip ─────────────────────────────────────────── -->
    <section class="welcome__stats">
      <div v-for="stat in STATS" :key="stat.label" class="welcome__stat">
        <span class="welcome__stat-value">{{ stat.value }}</span>
        <span class="welcome__stat-label">{{ stat.label }}</span>
      </div>
    </section>

    <!-- ── Pillars ─────────────────────────────────────────────── -->
    <section class="welcome__pillars">
      <div v-for="p in PILLARS" :key="p.title" class="welcome__pillar">
        <span class="welcome__pillar-icon">
          <UiIcon :name="p.icon" :size="19" :stroke-width="1.6" />
        </span>
        <h3>{{ p.title }}</h3>
        <p>{{ p.desc }}</p>
      </div>
    </section>

    <!-- ── Module grid ─────────────────────────────────────────── -->
    <section class="welcome__modules">
      <header class="welcome__modules-head">
        <h2>Everything you run your week on</h2>
        <p>Twelve of sixteen modules — all sharing one connected data model.</p>
      </header>
      <div class="welcome__grid">
        <button
          v-for="mod in MODULES"
          :key="mod.title"
          class="welcome__card"
          type="button"
          @click="openApp"
        >
          <span class="welcome__card-icon">
            <UiIcon :name="mod.icon" :size="17" :stroke-width="1.6" />
          </span>
          <span class="welcome__card-body">
            <span class="welcome__card-title">{{ mod.title }}</span>
            <span class="welcome__card-desc">{{ mod.desc }}</span>
          </span>
        </button>
      </div>
    </section>

    <!-- ── Vibe-paks ───────────────────────────────────────────── -->
    <section class="welcome__paks">
      <header class="welcome__modules-head">
        <h2>Four visual identities</h2>
        <p>Switch the whole feel of the app in one click.</p>
      </header>
      <div class="welcome__pak-grid">
        <div
          v-for="pak in PAKS"
          :key="pak.id"
          class="welcome__pak"
          :class="`welcome__pak--${pak.id}`"
        >
          <div class="welcome__pak-preview">
            <span class="welcome__pak-bar welcome__pak-bar--accent" />
            <span class="welcome__pak-bar" />
            <span class="welcome__pak-bar welcome__pak-bar--short" />
            <span class="welcome__pak-dot" />
          </div>
          <span class="welcome__pak-name">{{ pak.name }}</span>
        </div>
      </div>
    </section>

    <!-- ── Final CTA ───────────────────────────────────────────── -->
    <section class="welcome__final">
      <span class="welcome__final-icon">
        <UiIcon name="ShieldCheck" :size="22" :stroke-width="1.6" />
      </span>
      <h2>Your data stays in your browser. Always.</h2>
      <p>Local-first by default. Sign in only when you want it to sync across devices.</p>
      <UiButton @click="openApp">
        Open VibeOS
        <UiIcon name="ArrowRight" :size="15" :stroke-width="2.2" />
      </UiButton>
    </section>

    <!-- ── Footer ──────────────────────────────────────────────── -->
    <footer class="welcome__footer">
      <div class="welcome__stack">
        <span
          v-for="tech in ['Vue 3', 'TypeScript', 'Vite 6', 'Pinia', 'Supabase']"
          :key="tech"
          class="welcome__stack-pill"
        >{{ tech }}</span>
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
  padding: 16px clamp(20px, 5vw, 56px);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 10;
  background: color-mix(in srgb, var(--color-bg) 82%, transparent);
  backdrop-filter: blur(14px);
}
.welcome__brand { display: flex; align-items: center; gap: 9px; }
.welcome__mark { border-radius: 7px; }
.welcome__brand-text {
  font-size: 18px; font-weight: 700; letter-spacing: -0.02em;
}
.welcome__brand-text span { color: var(--color-accent); }

.welcome__nav-actions { display: flex; align-items: center; gap: 8px; }
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
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  align-items: center;
  gap: clamp(32px, 6vw, 80px);
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: clamp(56px, 9vw, 104px) clamp(20px, 5vw, 56px) clamp(48px, 7vw, 88px);
}

.welcome__eyebrow {
  font-size: 13px; font-weight: 600; letter-spacing: 0.01em;
  color: var(--color-accent); margin: 0 0 18px;
}
.welcome__headline {
  font-size: clamp(36px, 5.2vw, 60px);
  font-weight: 800; line-height: 1.04; letter-spacing: -0.04em;
  margin: 0 0 22px;
}
.welcome__sub {
  font-size: 17px; color: var(--color-text-secondary);
  line-height: 1.6; margin: 0 0 34px; max-width: 30em;
}
.welcome__hero-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.welcome__hero-github {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 15px; font-weight: 500; color: var(--color-text-secondary);
  text-decoration: none; padding: 8px 4px;
  transition: color var(--t-fast);
}
.welcome__hero-github:hover { color: var(--color-text); }

/* ── Live cascade demo ────────────────────────────────────────── */
.welcome__demo {
  position: relative;
  display: flex; flex-direction: column;
  padding: 22px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2);
  transition: box-shadow var(--t), border-color var(--t);
}
.welcome__demo--pulse {
  border-color: color-mix(in srgb, var(--color-accent) 55%, var(--color-border));
  box-shadow: var(--shadow-3),
              0 0 0 4px color-mix(in srgb, var(--color-accent) 14%, transparent);
}
.welcome__demo-hint {
  display: inline-flex; align-items: center; gap: 7px;
  align-self: flex-start;
  font-size: 12px; font-weight: 600; letter-spacing: 0.01em;
  color: var(--color-accent);
  background: var(--color-accent-muted);
  padding: 5px 11px; border-radius: 999px; margin-bottom: 18px;
}

.welcome__habit {
  display: flex; align-items: center; gap: 13px;
  width: 100%; text-align: left;
  padding: 14px 16px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: border-color var(--t-fast), background var(--t-fast);
}
.welcome__habit:hover { border-color: color-mix(in srgb, var(--color-accent) 45%, var(--color-border)); }
.welcome__habit--done {
  background: color-mix(in srgb, var(--color-success) 9%, var(--color-surface-elevated));
  border-color: color-mix(in srgb, var(--color-success) 40%, var(--color-border));
}
.welcome__check {
  flex-shrink: 0;
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid var(--color-text-muted);
  color: #fff;
  transition: background var(--t-fast), border-color var(--t-fast), transform var(--t-fast);
}
.welcome__habit--done .welcome__check {
  background: var(--color-success);
  border-color: var(--color-success);
  transform: scale(1.06);
}
.welcome__habit-name { flex: 1; font-size: 15px; font-weight: 600; }
.welcome__streak {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 13px; font-weight: 700;
  color: var(--color-warning);
  font-variant-numeric: tabular-nums;
}

.welcome__link {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 6px;
}
.welcome__link-line {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-border), transparent);
}
.welcome__link-tag {
  font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
  color: var(--color-text-muted);
  transition: color var(--t);
}
.welcome__demo--pulse .welcome__link-tag { color: var(--color-accent); }

.welcome__goal {
  display: flex; align-items: center; gap: 14px;
  padding: 16px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}
.welcome__ring { flex-shrink: 0; transform: rotate(-90deg); }
.welcome__ring-track {
  fill: none; stroke: var(--color-border); stroke-width: 5;
}
.welcome__ring-fill {
  fill: none; stroke: var(--color-accent); stroke-width: 5;
  stroke-linecap: round;
  transition: stroke-dashoffset 650ms var(--ease-out);
}
.welcome__goal-body { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.welcome__goal-name { font-size: 14px; font-weight: 700; }
.welcome__goal-meta {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}
.welcome__goal-delta {
  font-weight: 700; color: var(--color-success);
  opacity: 0; transform: translateY(3px);
  transition: opacity var(--t), transform var(--t);
}
.welcome__goal-delta.is-on { opacity: 1; transform: translateY(0); }
.welcome__goal-icon { color: var(--color-accent); flex-shrink: 0; }

/* ── Proof strip ──────────────────────────────────────────────── */
.welcome__stats {
  display: flex; justify-content: center;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}
.welcome__stat {
  flex: 1; max-width: 220px;
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  padding: 26px 16px;
  border-right: 1px solid var(--color-border);
}
.welcome__stat:last-child { border-right: none; }
.welcome__stat-value {
  font-size: 28px; font-weight: 800; letter-spacing: -0.03em;
  font-family: var(--font-mono);
}
.welcome__stat-label {
  font-size: 12px; color: var(--color-text-muted);
  text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600;
}

/* ── Pillars ──────────────────────────────────────────────────── */
.welcome__pillars {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--color-border);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}
.welcome__pillar {
  background: var(--color-bg);
  padding: clamp(28px, 4vw, 44px);
  display: flex; flex-direction: column; gap: 11px;
}
.welcome__pillar-icon {
  width: 40px; height: 40px; border-radius: var(--radius);
  display: flex; align-items: center; justify-content: center;
  background: var(--color-accent-muted); color: var(--color-accent);
  margin-bottom: 5px;
}
.welcome__pillar h3 { font-size: 16px; font-weight: 700; margin: 0; }
.welcome__pillar p {
  font-size: 14px; color: var(--color-text-secondary);
  line-height: 1.6; margin: 0;
}

/* ── Section heads ────────────────────────────────────────────── */
.welcome__modules-head { text-align: center; margin-bottom: 32px; }
.welcome__modules-head h2 {
  font-size: clamp(22px, 3.4vw, 30px); font-weight: 800;
  letter-spacing: -0.03em; margin: 0 0 8px;
}
.welcome__modules-head p { font-size: 15px; color: var(--color-text-secondary); margin: 0; }

/* ── Module grid ──────────────────────────────────────────────── */
.welcome__modules {
  padding: clamp(56px, 8vw, 88px) clamp(20px, 5vw, 56px);
  max-width: 1040px; margin: 0 auto; width: 100%;
}
.welcome__grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
}
.welcome__card {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer; text-align: left;
  transition: border-color var(--t-fast), transform var(--t-fast), box-shadow var(--t-fast);
}
.welcome__card:hover {
  border-color: color-mix(in srgb, var(--color-accent) 50%, var(--color-border));
  transform: translateY(-2px);
  box-shadow: var(--shadow-2);
}
.welcome__card-icon {
  width: 34px; height: 34px; border-radius: var(--radius); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--color-accent-muted);
  color: var(--color-accent);
}
.welcome__card-body { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.welcome__card-title { font-size: 14px; font-weight: 700; }
.welcome__card-desc { font-size: 12px; color: var(--color-text-secondary); line-height: 1.4; }

/* ── Vibe-paks ────────────────────────────────────────────────── */
.welcome__paks {
  padding: 0 clamp(20px, 5vw, 56px) clamp(56px, 8vw, 88px);
  max-width: 1040px; margin: 0 auto; width: 100%;
}
.welcome__pak-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
}
.welcome__pak {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: transform var(--t-fast), box-shadow var(--t-fast);
}
.welcome__pak:hover { transform: translateY(-2px); box-shadow: var(--shadow-2); }
.welcome__pak-preview {
  position: relative;
  height: 96px; padding: 16px;
  display: flex; flex-direction: column; gap: 7px; justify-content: center;
  background: var(--pak-bg);
}
.welcome__pak-bar {
  height: 7px; width: 70%; border-radius: 4px;
  background: var(--pak-surface);
}
.welcome__pak-bar--short { width: 45%; }
.welcome__pak-bar--accent { width: 55%; background: var(--pak-accent); }
.welcome__pak-dot {
  position: absolute; top: 14px; right: 14px;
  width: 14px; height: 14px; border-radius: 50%;
  background: var(--pak-accent);
}
.welcome__pak-name {
  display: block; padding: 11px 16px;
  font-size: 13px; font-weight: 600;
  background: var(--color-surface);
}
/* Representative pak swatches — intrinsically each pak's signature colors
   (cannot be theme vars: they must render regardless of the active theme). */
.welcome__pak--dark      { --pak-bg: #0b0f1a; --pak-surface: #1a2436; --pak-accent: #5c7cfa; }
.welcome__pak--light     { --pak-bg: #eef1f7; --pak-surface: #ffffff; --pak-accent: #2563eb; }
.welcome__pak--brutalist { --pak-bg: #f0ede8; --pak-surface: #d8d2c8; --pak-accent: #000000; }
.welcome__pak--crt       { --pak-bg: #091209; --pak-surface: #16321a; --pak-accent: #52c46a; }

/* ── Final CTA ────────────────────────────────────────────────── */
.welcome__final {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  gap: 14px;
  padding: clamp(56px, 9vw, 96px) clamp(20px, 5vw, 56px);
  border-top: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-accent) 4%, var(--color-bg));
}
.welcome__final-icon {
  width: 48px; height: 48px; border-radius: var(--radius-lg);
  display: flex; align-items: center; justify-content: center;
  background: var(--color-accent-muted); color: var(--color-accent);
  margin-bottom: 4px;
}
.welcome__final h2 {
  font-size: clamp(22px, 3.6vw, 32px); font-weight: 800;
  letter-spacing: -0.03em; margin: 0; max-width: 14em;
}
.welcome__final p {
  font-size: 15px; color: var(--color-text-secondary); margin: 0 0 10px; max-width: 32em;
}

/* ── Footer ───────────────────────────────────────────────────── */
.welcome__footer {
  border-top: 1px solid var(--color-border);
  padding: 26px clamp(20px, 5vw, 56px);
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; flex-wrap: wrap;
}
.welcome__stack { display: flex; gap: 8px; flex-wrap: wrap; }
.welcome__stack-pill {
  font-size: 11px; font-weight: 500; font-family: var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 3px 9px; border-radius: var(--radius-xs);
}
.welcome__footer-copy { font-size: 13px; color: var(--color-text-muted); margin: 0; }
.welcome__footer-copy a { color: var(--color-text-secondary); text-decoration: none; }
.welcome__footer-copy a:hover { color: var(--color-accent); }

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 919px) {
  .welcome__hero { grid-template-columns: 1fr; gap: 40px; }
  .welcome__demo { max-width: 440px; }
  .welcome__grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 767px) {
  .welcome__nav-link { display: none; }
  .welcome__sub { font-size: 15px; }
  .welcome__stats { flex-wrap: wrap; }
  .welcome__stat {
    flex: 1 1 50%; max-width: none;
    border-right: 1px solid var(--color-border);
    border-bottom: 1px solid var(--color-border);
  }
  .welcome__stat:nth-child(2n) { border-right: none; }
  .welcome__grid { grid-template-columns: repeat(2, 1fr); }
  .welcome__pak-grid { grid-template-columns: repeat(2, 1fr); }
  .welcome__pillars { grid-template-columns: 1fr; }
  .welcome__footer { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 400px) {
  .welcome__grid { grid-template-columns: 1fr; }
}
</style>
