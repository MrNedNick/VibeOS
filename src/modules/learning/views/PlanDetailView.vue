<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLearningStore } from '../stores/learning.store'
import ProgressRing from '../components/ProgressRing.vue'
import SessionLogForm from '../components/SessionLogForm.vue'
import type { LearningSession, LearningPlan, ResourceType } from '../types'
import { estimateTargetDate, todayStr, RESOURCE_META, RESOURCE_TYPES } from '../types'
import { UiIcon, UiSectionLabel, UiProgressBar, UiStat, UiButton, UiIconButton, UiInput, UiSelect } from '@/ui'
import { usePlanDetailPage } from '@/core/composables/usePlanDetailPage'

const store = useLearningStore()

const {
  router, planId, plan,
  aiAnalysis, aiAnalyzing, runAiAnalysis, dismissAiAnalysis,
  askDelete, formatDate,
  linkedHabitId, saveHabitLink, habitOptions,
  resources, showAddResource, newResUrl, newResTitle, newResType, submitResource,
  safeDomain,
} = usePlanDetailPage<LearningPlan, ResourceType>({
  listRoute: '/learning',
  getPlanById: (id) => store.getPlanById(id),
  updatePlanLink: (id, habitId) => store.updatePlanLink(id, habitId),
  deletePlan: (id) => store.deletePlan(id),
  resourceStore: store,
  defaultResourceType: 'article',
  deleteConfirmBody: 'All session history will be permanently removed.',
})

const progress = computed(() => store.getProgress(planId.value))
const streak = computed(() => store.getStreak(planId.value))
const hoursLogged = computed(() => store.getHoursLogged(planId.value))
const sessions = computed(() => store.getPlanSessions(planId.value))
const loggedToday = computed(() => store.isLoggedToday(planId.value))

const targetDate = computed(() => plan.value ? estimateTargetDate(plan.value) : '')

// ── Session log modal ────────────────────────────────────────────────
const showLog = ref(false)

function analyzeSession(data: Omit<LearningSession, 'id'>) {
  if (!plan.value) return
  runAiAnalysis(`I just completed a ${data.actualMinutes}-min learning session for "${plan.value.title}". ${data.topic ? 'Topic: ' + data.topic + '.' : ''} ${data.notes ? 'Notes: ' + data.notes + '.' : ''} Current progress: ${progress.value}% of ${plan.value.targetHours}h goal. What 2-3 things should I focus on in my NEXT session? Be specific and brief (3 sentences max).`)
}

function submitLog(data: Omit<LearningSession, 'id'>) {
  store.logSession(data)
  showLog.value = false
  analyzeSession(data)
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
</script>

<template>
  <div v-if="plan" class="detail">

    <!-- Navigation -->
    <div class="detail__nav">
      <UiButton variant="ghost" size="sm" @click="router.push('/learning')">
        <UiIcon name="ArrowLeft" :size="14" :stroke-width="2" /> Learning
      </UiButton>
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
    <UiProgressBar :value="progress" :height="6" />

    <!-- Stats row -->
    <div class="detail__stats">
      <div class="detail__stat">
        <UiStat :value="'🔥 ' + streak" label="day streak" />
      </div>
      <div class="detail__stat">
        <UiStat :value="hoursLogged + 'h'" :label="'of ' + plan.targetHours + 'h'" />
      </div>
      <div class="detail__stat">
        <UiStat :value="sessions.filter(s => s.status === 'completed').length" label="sessions done" />
      </div>
      <div class="detail__stat">
        <UiStat :value="formatShortDate(targetDate)" label="est. finish" />
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
      <UiButton v-if="!loggedToday" @click="showLog = true">Log Session</UiButton>
    </div>

    <!-- AI analysis card -->
    <div v-if="aiAnalyzing || aiAnalysis" class="detail__ai-card">
      <div class="detail__ai-header">
        <span class="detail__ai-label">✦ AI Insight</span>
        <UiIconButton v-if="aiAnalysis" name="X" aria-label="Dismiss AI insight" size="sm" @click="dismissAiAnalysis" />
      </div>
      <div v-if="aiAnalyzing" class="detail__ai-loading">
        <UiIcon name="Loader" :size="14" :stroke-width="2" class="detail__ai-spinner" />
        Analyzing your session…
      </div>
      <p v-else class="detail__ai-text">{{ aiAnalysis }}</p>
    </div>

    <!-- Session history -->
    <div class="detail__history">
      <UiSectionLabel class="detail__section-label">Session history</UiSectionLabel>

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

    <!-- Resources -->
    <div class="detail__resources">
      <div class="detail__resources-header">
        <UiSectionLabel class="detail__section-label">Resources</UiSectionLabel>
        <UiButton variant="ghost" size="sm" @click="showAddResource = !showAddResource">
          <UiIcon :name="showAddResource ? 'X' : 'Plus'" :size="13" />
          {{ showAddResource ? 'Cancel' : 'Add resource' }}
        </UiButton>
      </div>

      <!-- Add form -->
      <div v-if="showAddResource" class="detail__res-form">
        <UiInput v-model="newResUrl" placeholder="https://..." @enter="submitResource" />
        <UiInput v-model="newResTitle" placeholder="Title (optional)" @enter="submitResource" />
        <div class="detail__res-form-row">
          <!-- Resource type — bespoke: emoji icon selector, not a standard button -->
          <div class="detail__res-types">
            <button
              v-for="t in RESOURCE_TYPES"
              :key="t"
              class="detail__res-type"
              :class="{ 'detail__res-type--active': newResType === t }"
              :title="RESOURCE_META[t].label"
              @click="newResType = t"
            >{{ RESOURCE_META[t].icon }}</button>
          </div>
          <UiButton size="sm" :disabled="!newResUrl.trim()" @click="submitResource">Add</UiButton>
        </div>
      </div>

      <!-- Resource list -->
      <div v-if="resources.length > 0" class="detail__res-list">
        <div
          v-for="res in resources"
          :key="res.id"
          class="detail__res-item"
          :class="{ 'detail__res-item--done': res.done }"
        >
          <span class="detail__res-icon">{{ RESOURCE_META[res.type].icon }}</span>
          <div class="detail__res-body">
            <a
              :href="res.url"
              class="detail__res-link"
              target="_blank"
              rel="noopener noreferrer"
              :title="res.url"
            >{{ res.title }}</a>
            <span class="detail__res-domain">{{ safeDomain(res.url) }}</span>
          </div>
          <button
            class="detail__res-done"
            :class="{ 'detail__res-done--active': res.done }"
            :title="res.done ? 'Mark as unread' : 'Mark as done'"
            @click="store.toggleResourceDone(planId, res.id)"
          >
            <UiIcon :name="res.done ? 'CheckCircle2' : 'Circle'" :size="15" :stroke-width="1.75" />
          </button>
          <UiIconButton name="X" aria-label="Remove resource" size="sm" @click="store.deleteResource(planId, res.id)" />
        </div>
      </div>

      <p v-else-if="!showAddResource" class="detail__resources-empty">
        No resources yet — add articles, videos, or books for this plan.
      </p>
    </div>

    <!-- Linked habit -->
    <div class="detail__link-habit">
      <UiSectionLabel class="detail__section-label">Linked habit</UiSectionLabel>
      <div class="detail__link-habit-row">
        <UiSelect v-model="linkedHabitId" :options="habitOptions" />
        <UiButton size="sm" :disabled="linkedHabitId === (plan.linkedHabitId ?? '')" @click="saveHabitLink">
          Save
        </UiButton>
      </div>
      <p v-if="plan.linkedHabitId" class="detail__habit-hint">
        ✓ Logging a session will auto-check this habit
      </p>
    </div>

    <!-- Danger zone -->
    <div class="detail__danger">
      <UiButton variant="danger" @click="askDelete">Delete plan</UiButton>
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
.detail__section-label { margin-bottom: 12px; }

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

/* ── Resources ──────────────────────────────────────────────────── */
.detail__resources {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.detail__resources-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail__resources-add-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-accent);
  padding: 3px 10px;
  border: 1px solid var(--color-accent-muted);
  border-radius: var(--radius-sm);
  background: var(--color-accent-muted);
  cursor: pointer;
  transition: opacity var(--t-fast);
}
.detail__resources-add-btn:hover { opacity: 0.8; }

.detail__res-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.detail__res-input {
  width: 100%;
  padding: 7px 10px;
  font-size: 13px;
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  transition: border-color var(--t-fast);
}
.detail__res-input:focus { border-color: var(--color-accent); }
.detail__res-input::placeholder { color: var(--color-text-muted); }

.detail__res-form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.detail__res-types {
  display: flex;
  gap: 4px;
}

.detail__res-type {
  font-size: 16px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-xs);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  opacity: 0.55;
  transition: opacity var(--t-fast), border-color var(--t-fast);
}
.detail__res-type:hover { opacity: 0.85; }
.detail__res-type--active {
  opacity: 1;
  border-color: var(--color-accent);
  background: var(--color-accent-muted);
}

.detail__res-submit {
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 600;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: opacity var(--t-fast);
}
.detail__res-submit:hover { opacity: 0.88; }
.detail__res-submit:disabled { opacity: 0.4; cursor: not-allowed; }

.detail__res-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail__res-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  transition: background var(--t-fast);
}
.detail__res-item:hover { background: var(--color-surface-elevated); }
.detail__res-item--done { opacity: 0.55; }

.detail__res-icon {
  font-size: 15px;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.detail__res-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.detail__res-link {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-accent);
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity var(--t-fast);
}
.detail__res-link:hover { opacity: 0.75; text-decoration: underline; }

.detail__res-domain {
  font-size: 11px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail__res-done {
  flex-shrink: 0;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  transition: color var(--t-fast);
}
.detail__res-done:hover { color: var(--color-accent); }
.detail__res-done--active { color: var(--color-accent); }

.detail__res-del {
  font-size: 16px;
  line-height: 1;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  border-radius: var(--radius-xs);
  opacity: 0;
  transition: opacity var(--t-fast), color var(--t-fast);
  cursor: pointer;
  flex-shrink: 0;
}
.detail__res-item:hover .detail__res-del { opacity: 1; }
.detail__res-del:hover { color: var(--color-danger); }

.detail__resources-empty {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  font-style: italic;
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

.detail__link-habit .detail__section-label { margin-bottom: 0; }

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
