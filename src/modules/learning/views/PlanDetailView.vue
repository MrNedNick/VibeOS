<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLearningStore } from '../stores/learning.store'
import ProgressRing from '../components/ProgressRing.vue'
import SessionLogForm from '../components/SessionLogForm.vue'
import type { LearningSession } from '../types'
import { estimateTargetDate, todayStr } from '../types'
import { UiIcon } from '@/ui'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { useConfirm } from '@/core/composables/useConfirm'

const route = useRoute()
const router = useRouter()
const store = useLearningStore()

const planId = computed(() => route.params.id as string)
const plan = computed(() => store.getPlanById(planId.value))

// Redirect if plan not found
if (!plan.value) {
  router.replace('/learning')
}

const progress = computed(() => store.getProgress(planId.value))
const streak = computed(() => store.getStreak(planId.value))
const hoursLogged = computed(() => store.getHoursLogged(planId.value))
const sessions = computed(() => store.getPlanSessions(planId.value))
const loggedToday = computed(() => store.isLoggedToday(planId.value))

const targetDate = computed(() => plan.value ? estimateTargetDate(plan.value) : '')

// ── Session log modal ────────────────────────────────────────────────
const showLog = ref(false)

// ── AI post-log analysis ─────────────────────────────────────────────
const aiAnalysis   = ref<string | null>(null)
const aiAnalyzing  = ref(false)

async function analyzeSession(data: Omit<LearningSession, 'id'>) {
  if (!plan.value) return
  aiAnalyzing.value = true
  const prompt = `I just completed a ${data.actualMinutes}-min learning session for "${plan.value.title}". ${data.topic ? 'Topic: ' + data.topic + '.' : ''} ${data.notes ? 'Notes: ' + data.notes + '.' : ''} Current progress: ${progress.value}% of ${plan.value.targetHours}h goal. What 2-3 things should I focus on in my NEXT session? Be specific and brief (3 sentences max).`
  try {
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], model: 'openai', private: true }),
    })
    if (res.ok) aiAnalysis.value = (await res.text()).trim()
  } catch { /* silent */ } finally { aiAnalyzing.value = false }
}

function submitLog(data: Omit<LearningSession, 'id'>) {
  store.logSession(data)
  showLog.value = false
  analyzeSession(data)
}

// ── Confirm delete ───────────────────────────────────────────────────
const { confirm } = useConfirm()

async function askDelete() {
  const ok = await confirm({
    title:        'Delete this plan?',
    body:         'All session history will be permanently removed.',
    danger:       true,
    confirmLabel: 'Delete plan',
  })
  if (ok) {
    store.deletePlan(planId.value)
    router.replace('/learning')
  }
}

// ── Formatting helpers ───────────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatShortDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

function ratingStars(r: number): string {
  return '★'.repeat(r) + '☆'.repeat(5 - r)
}

const today = todayStr()

// ── Linked habit ─────────────────────────────────────────────────────
const habitsStore = useHabitsStore()
const linkedHabitId = ref(plan.value?.linkedHabitId ?? '')

watch(() => plan.value?.linkedHabitId, (v) => { linkedHabitId.value = v ?? '' })

function saveHabitLink() {
  store.updatePlanLink(planId.value, linkedHabitId.value || undefined)
}
</script>

<template>
  <div v-if="plan" class="detail">

    <!-- Navigation -->
    <div class="detail__nav">
      <button class="detail__back" @click="router.push('/learning')">
        <UiIcon name="ArrowLeft" :size="14" :stroke-width="2" /> Learning
      </button>
    </div>

    <!-- Plan header -->
    <div class="detail__header">
      <span class="detail__emoji">{{ plan.coverEmoji }}</span>
      <div class="detail__heading">
        <h1 class="detail__title">{{ plan.title }}</h1>
        <p class="detail__meta">
          {{ plan.minutesPerSession }} min/day · {{ plan.daysPerWeek }}d/week · target {{ plan.targetHours }}h
        </p>
      </div>
      <ProgressRing :progress="progress" :size="64" :stroke-width="6" />
    </div>

    <!-- Progress bar -->
    <div class="detail__progress-bar">
      <div class="detail__progress-fill" :style="{ width: progress + '%' }" />
    </div>

    <!-- Stats row -->
    <div class="detail__stats">
      <div class="detail__stat">
        <span class="detail__stat-value">🔥 {{ streak }}</span>
        <span class="detail__stat-label">day streak</span>
      </div>
      <div class="detail__stat">
        <span class="detail__stat-value">{{ hoursLogged }}h</span>
        <span class="detail__stat-label">of {{ plan.targetHours }}h</span>
      </div>
      <div class="detail__stat">
        <span class="detail__stat-value">{{ sessions.filter(s => s.status === 'completed').length }}</span>
        <span class="detail__stat-label">sessions done</span>
      </div>
      <div class="detail__stat">
        <span class="detail__stat-value">{{ formatShortDate(targetDate) }}</span>
        <span class="detail__stat-label">est. finish</span>
      </div>
    </div>

    <!-- Today's session block -->
    <div class="detail__today">
      <div class="detail__today-info">
        <span class="detail__today-label">Today</span>
        <span v-if="loggedToday" class="detail__today-status detail__today-status--done">
          ✓ Done · {{ plan.minutesPerSession }} min planned
        </span>
        <span v-else class="detail__today-status">
          {{ plan.minutesPerSession }} min planned
        </span>
      </div>
      <button
        v-if="!loggedToday"
        class="detail__log-btn"
        @click="showLog = true"
      >
        Log Session
      </button>
    </div>

    <!-- AI analysis card -->
    <div v-if="aiAnalyzing || aiAnalysis" class="detail__ai-card">
      <div class="detail__ai-header">
        <span class="detail__ai-label">✦ AI Insight</span>
        <button v-if="aiAnalysis" class="detail__ai-dismiss" @click="aiAnalysis = null">×</button>
      </div>
      <div v-if="aiAnalyzing" class="detail__ai-loading">
        <UiIcon name="Loader" :size="14" :stroke-width="2" class="detail__ai-spinner" />
        Analyzing your session…
      </div>
      <p v-else class="detail__ai-text">{{ aiAnalysis }}</p>
    </div>

    <!-- Session history -->
    <div class="detail__history">
      <p class="detail__section-label">Session history</p>

      <div v-if="sessions.length > 0" class="detail__session-list">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="detail__session"
          :class="{
            'detail__session--done': session.status === 'completed',
            'detail__session--today': session.date === today,
          }"
        >
          <div class="detail__session-left">
            <span class="detail__session-date">{{ formatDate(session.date) }}</span>
            <span v-if="session.topic" class="detail__session-topic">{{ session.topic }}</span>
            <span v-if="session.notes" class="detail__session-notes">{{ session.notes }}</span>
          </div>
          <div class="detail__session-right">
            <span class="detail__session-time">{{ session.actualMinutes }} min</span>
            <span class="detail__session-stars">{{ ratingStars(session.rating) }}</span>
          </div>
        </div>
      </div>

      <p v-else class="detail__history-empty">
        No sessions logged yet. Start your first session above.
      </p>
    </div>

    <!-- Linked habit -->
    <div class="detail__link-habit">
      <p class="detail__section-label">Linked habit</p>
      <div class="detail__link-habit-row">
        <select v-model="linkedHabitId" class="detail__habit-select">
          <option value="">— none —</option>
          <option v-for="h in habitsStore.habits" :key="h.id" :value="h.id">{{ h.name }}</option>
        </select>
        <button
          class="detail__habit-save"
          :disabled="linkedHabitId === (plan.linkedHabitId ?? '')"
          @click="saveHabitLink"
        >Save</button>
      </div>
      <p v-if="plan.linkedHabitId" class="detail__habit-hint">
        ✓ Logging a session will auto-check this habit
      </p>
    </div>

    <!-- Danger zone -->
    <div class="detail__danger">
      <button class="detail__danger-btn" @click="askDelete">Delete plan</button>
    </div>

    <!-- Session log modal -->
    <SessionLogForm
      v-if="showLog"
      :plan="plan"
      @submit="submitLog"
      @cancel="showLog = false"
    />

  </div>
</template>

<style scoped>
.detail {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── Navigation ──────────────────────────────────────────────────── */
.detail__back {
  background: none;
  border: none;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  transition: color var(--t-fast);
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail__back:hover { color: var(--color-text-secondary); }

/* ── Header ──────────────────────────────────────────────────────── */
.detail__header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.detail__emoji { font-size: 40px; line-height: 1; flex-shrink: 0; }

.detail__heading {
  flex: 1;
  min-width: 0;
}

.detail__title {
  font-size: var(--text-3xl);
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.detail__meta {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 4px 0 0;
}

/* ── Progress bar ────────────────────────────────────────────────── */
.detail__progress-bar {
  height: 6px;
  background: var(--color-border);
  border-radius: 99px;
  overflow: hidden;
}

.detail__progress-fill {
  height: 100%;
  background: var(--color-accent);
  border-radius: 99px;
  transition: width 0.6s var(--ease);
}

/* ── Stats row ───────────────────────────────────────────────────── */
.detail__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.detail__stat {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail__stat-value {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text);
}

.detail__stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

/* ── Today block ─────────────────────────────────────────────────── */
.detail__today {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.detail__today-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.detail__today-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.detail__today-status {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.detail__today-status--done {
  color: var(--color-success);
}

.detail__log-btn {
  padding: 8px 20px;
  border-radius: var(--radius);
  background: var(--color-accent);
  color: #fff;
  border: none;
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background var(--t-fast);
  font-family: inherit;
  flex-shrink: 0;
}

.detail__log-btn:hover { background: var(--color-accent-hover); }

/* ── Section label ───────────────────────────────────────────────── */
.detail__section-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 12px;
}

/* ── Session history ─────────────────────────────────────────────── */
.detail__session-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail__session {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 12px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.detail__session--today {
  border-color: var(--color-accent-muted);
}

.detail__session-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.detail__session-date {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
}

.detail__session-topic {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}

.detail__session-notes {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

.detail__session-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  flex-shrink: 0;
}

.detail__session-time {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
}

.detail__session-stars {
  font-size: 11px;
  color: var(--color-warning);
  letter-spacing: 1px;
}

.detail__history-empty {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0;
}

/* ── Linked habit ────────────────────────────────────────────────── */
.detail__link-habit {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail__link-habit .detail__section-label { margin: 0; }

.detail__link-habit-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail__habit-select {
  flex: 1;
  font-size: var(--text-sm);
  font-family: inherit;
  padding: 6px 10px;
  border-radius: var(--radius);
  border: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
  color: var(--color-text);
  outline: none;
  cursor: pointer;
  max-width: 280px;
}

.detail__habit-select:focus { border-color: var(--color-accent); }

.detail__habit-save {
  padding: 6px 16px;
  border-radius: var(--radius);
  background: var(--color-accent);
  color: #fff;
  border: none;
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background var(--t-fast), opacity var(--t-fast);
  font-family: inherit;
  flex-shrink: 0;
}

.detail__habit-save:hover:not(:disabled) { background: var(--color-accent-hover); }
.detail__habit-save:disabled { opacity: 0.4; cursor: not-allowed; }

.detail__habit-hint {
  font-size: var(--text-xs);
  color: var(--color-success);
  margin: 0;
}

/* ── Danger zone ─────────────────────────────────────────────────── */
.detail__danger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

.detail__danger-btn {
  background: none;
  border: none;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  transition: color var(--t-fast);
  font-family: inherit;
}

.detail__danger-btn:hover { color: var(--color-danger); }

/* ── AI analysis card ────────────────────────────────────────────── */
.detail__ai-card {
  background: color-mix(in srgb, var(--color-accent) 6%, var(--color-surface));
  border: 1px solid color-mix(in srgb, var(--color-accent) 25%, var(--color-border));
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail__ai-header { display: flex; align-items: center; justify-content: space-between; }
.detail__ai-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-accent); }
.detail__ai-dismiss { background: none; border: none; color: var(--color-text-muted); cursor: pointer; font-size: 16px; line-height: 1; padding: 0 2px; }
.detail__ai-dismiss:hover { color: var(--color-text); }

@keyframes spin-ai { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.detail__ai-spinner { animation: spin-ai 1s linear infinite; }

.detail__ai-loading { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-muted); }
.detail__ai-text { font-size: var(--text-sm); line-height: 1.65; color: var(--color-text-secondary); margin: 0; }

/* ── Responsive ──────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .detail__stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .detail__title { font-size: var(--text-2xl, 22px); }

  .detail__today {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail__log-btn { align-self: stretch; text-align: center; }
}

@media (max-width: 400px) {
  .detail__stats {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
