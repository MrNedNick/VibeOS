<script setup lang="ts">
import { useRouter } from 'vue-router'
import { UiIcon } from '@/ui'

const router = useRouter()

const highlights = [
  {
    icon: 'CheckSquare',
    title: 'Tasks',
    desc: 'Priorities, deadlines, categories, and goal links — all in one list.',
    available: true,
  },
  {
    icon: 'Flame',
    title: 'Habits',
    desc: 'Daily check-offs, streaks, and a heatmap to keep consistency visible.',
    available: true,
  },
  {
    icon: 'NotebookPen',
    title: 'Notes',
    desc: 'Markdown notes with wiki backlinks and a daily journal button.',
    available: true,
  },
  {
    icon: 'Kanban',
    title: 'Board',
    desc: 'Kanban and timeline views — same tasks, different perspective.',
    available: true,
  },
  {
    icon: 'Target',
    title: 'Goals',
    desc: 'Life goals with milestones, progress tracking, and linked tasks.',
    available: false,
    sprint: 'S4',
  },
  {
    icon: 'BookOpen',
    title: 'Learning',
    desc: 'Structured learning plans with daily sessions and progress charts.',
    available: false,
    sprint: 'S5',
  },
]

const stack = ['Vue 3', 'TypeScript', 'Vite', 'Pinia', 'Supabase (S3)']
</script>

<template>
  <div class="welcome">

    <!-- Nav -->
    <header class="welcome__nav">
      <div class="welcome__logo">
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="8" fill="var(--color-accent)" />
          <path d="M10 23L14 9" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
          <path d="M18 23L22 9" stroke="white" stroke-width="2.8" stroke-linecap="round"/>
        </svg>
        <span class="welcome__logo-text">Vibe<span>OS</span></span>
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
        <button class="welcome__nav-cta" @click="router.push('/')">
          Open App
          <UiIcon name="ArrowRight" :size="14" :stroke-width="2" />
        </button>
      </div>
    </header>

    <!-- Hero -->
    <section class="welcome__hero">
      <div class="welcome__hero-inner">
        <p class="welcome__eyebrow">Personal Life OS</p>
        <h1 class="welcome__headline">
          An operating system<br>for one person — you.
        </h1>
        <p class="welcome__sub">
          Tasks, goals, habits, notes, learning, and training.
          One system. Your data. Your rules.
        </p>
        <div class="welcome__hero-actions">
          <button class="welcome__btn-primary" @click="router.push('/')">
            Open VibeOS
            <UiIcon name="ArrowRight" :size="15" :stroke-width="2" />
          </button>
          <a
            href="https://github.com/mrnednick/VibeOS"
            target="_blank"
            rel="noopener"
            class="welcome__btn-ghost"
          >
            <UiIcon name="Github" :size="15" :stroke-width="1.75" />
            View source
          </a>
        </div>
      </div>
    </section>

    <!-- Modules grid -->
    <section class="welcome__modules">
      <p class="welcome__section-label">What's inside</p>
      <div class="welcome__grid">
        <div
          v-for="mod in highlights"
          :key="mod.title"
          class="welcome__card"
          :class="{ 'welcome__card--planned': !mod.available }"
        >
          <div class="welcome__card-icon">
            <UiIcon :name="mod.icon" :size="20" :stroke-width="1.5" />
          </div>
          <div class="welcome__card-body">
            <div class="welcome__card-header">
              <span class="welcome__card-title">{{ mod.title }}</span>
              <span v-if="!mod.available" class="welcome__card-badge">{{ mod.sprint }}</span>
            </div>
            <p class="welcome__card-desc">{{ mod.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="welcome__footer">
      <div class="welcome__stack">
        <span v-for="tech in stack" :key="tech" class="welcome__stack-pill">{{ tech }}</span>
      </div>
      <p class="welcome__footer-copy">
        Built in the open ·
        <a href="https://github.com/mrnednick/VibeOS" target="_blank" rel="noopener">
          mrnednick/VibeOS
        </a>
      </p>
    </footer>

  </div>
</template>

<style scoped>
.welcome {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  color: var(--color-text);
}

/* Nav */
.welcome__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 40px;
  border-bottom: 1px solid var(--color-border);
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

.welcome__logo-text span {
  color: var(--color-accent);
}

.welcome__nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.welcome__nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: color var(--t-fast), background var(--t-fast);
}
.welcome__nav-link:hover {
  color: var(--color-text);
  background: var(--color-surface-elevated);
}

.welcome__nav-cta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: var(--color-accent);
  padding: 7px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--t-fast);
}
.welcome__nav-cta:hover { background: var(--color-accent-hover); }

/* Hero */
.welcome__hero {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 40px 60px;
}

.welcome__hero-inner {
  max-width: 640px;
  text-align: center;
}

.welcome__eyebrow {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-accent);
  margin: 0 0 20px;
}

.welcome__headline {
  font-size: clamp(32px, 5vw, 54px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--color-text);
  margin: 0 0 20px;
}

.welcome__sub {
  font-size: 17px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 36px;
}

.welcome__hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.welcome__btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  background: var(--color-accent);
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--t-fast);
}
.welcome__btn-primary:hover { background: var(--color-accent-hover); }

.welcome__btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--color-border);
  padding: 11px 22px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  cursor: pointer;
  transition: border-color var(--t-fast), color var(--t-fast), background var(--t-fast);
}
.welcome__btn-ghost:hover {
  border-color: var(--color-accent);
  color: var(--color-text);
  background: var(--color-surface-elevated);
}

/* Modules grid */
.welcome__modules {
  padding: 0 40px 60px;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
}

.welcome__section-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin: 0 0 20px;
}

.welcome__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.welcome__card {
  display: flex;
  gap: 14px;
  padding: 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  transition: border-color var(--t-fast);
}

.welcome__card:hover { border-color: var(--color-accent); }
.welcome__card--planned { opacity: 0.65; }

.welcome__card-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--color-accent-muted);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.welcome__card-body { flex: 1; min-width: 0; }

.welcome__card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.welcome__card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}

.welcome__card-badge {
  font-size: 10px;
  font-weight: 700;
  font-family: var(--font-mono);
  background: var(--color-surface-elevated);
  color: var(--color-text-muted);
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  letter-spacing: 0.04em;
}

.welcome__card-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
}

/* Footer */
.welcome__footer {
  border-top: 1px solid var(--color-border);
  padding: 24px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.welcome__stack {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.welcome__stack-pill {
  font-size: 12px;
  font-weight: 500;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 3px 8px;
  border-radius: var(--radius-xs);
}

.welcome__footer-copy {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}

.welcome__footer-copy a {
  color: var(--color-text-secondary);
  text-decoration: none;
}
.welcome__footer-copy a:hover { color: var(--color-accent); }

/* Responsive */
@media (max-width: 1024px) {
  .welcome__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 767px) {
  .welcome__nav { padding: 14px 20px; }
  .welcome__nav-link { display: none; }
  .welcome__hero { padding: 48px 20px 40px; }
  .welcome__modules { padding: 0 20px 40px; }
  .welcome__grid { grid-template-columns: 1fr; }
  .welcome__footer { padding: 20px; flex-direction: column; align-items: flex-start; }
}
</style>
