<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrainingStore } from '../stores/training.store'
import WorkoutLogForm from '../components/WorkoutLogForm.vue'
import type { WorkoutLog } from '../types'
import { FEELING_EMOJI, todayStr } from '../types'
import { UiIcon } from '@/ui'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { useConfirm } from '@/core/composables/useConfirm'

const route = useRoute()
const router = useRouter()
const store = useTrainingStore()

const planId = computed(() => route.params.id as string)
const plan = computed(() => store.getPlanById(planId.value))

if (!plan.value) router.replace('/training')

const streak = computed(() => store.getStreak(planId.value))
const totalMinutes = computed(() => store.getTotalMinutes(planId.value))
const totalKm = computed(() => store.getTotalKm(planId.value))
const totalHours = computed(() => Math.round((totalMinutes.value / 60) * 10) / 10)
const sessionLogs = computed(() => store.getPlanLogs(planId.value))
const loggedToday = computed(() => store.isLoggedToday(planId.value))
const today = todayStr()

const showLog = ref(false)

// ── AI post-log analysis ─────────────────────────────────────────────
const aiAnalysis  = ref<string | null>(null)
const aiAnalyzing = ref(false)

async function analyzeWorkout(data: Omit<WorkoutLog, 'id' | 'createdAt'>) {
  if (!plan.value) return
  aiAnalyzing.value = true
  const durationNote = data.actualDuration ? `${data.actualDuration} min` : 'unknown duration'
  const distNote = data.actualDistance ? `, ${data.actualDistance}km` : ''
  const feelNote = ['', 'terrible', 'bad', 'ok', 'good', 'great'][data.feeling] ?? 'ok'
  const prompt = `I just logged a ${plan.value.sportType} workout for "${plan.value.title}". Duration: ${durationNote}${distNote}. Feeling: ${feelNote}. ${data.notes ? 'Notes: ' + data.notes + '.' : ''} Streak: ${streak.value} days. What 2-3 specific things should I focus on to improve in my NEXT session? Be concise (3 sentences max).`
  try {
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], model: 'openai', private: true }),
    })
    if (res.ok) aiAnalysis.value = (await res.text()).trim()
  } catch { /* silent */ } finally { aiAnalyzing.value = false }
}

function submitLog(data: Omit<WorkoutLog, 'id' | 'createdAt'>) {
  store.logWorkout(data)
  showLog.value = false
  analyzeWorkout(data)
}

const { confirm } = useConfirm()

async function askDelete() {
  const ok = await confirm({
    title:        'Delete this plan?',
    body:         'All workout history will be permanently removed.',
    danger:       true,
    confirmLabel: 'Delete plan',
  })
  if (ok) {
    store.deletePlan(planId.value)
    router.replace('/training')
  }
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

// ── Linked habit ─────────────────────────────────────────────────────
const habitsStore = useHabitsStore()
const linkedHabitId = ref(plan.value?.linkedHabitId ?? '')

watch(() => plan.value?.linkedHabitId, (v) => { linkedHabitId.value = v ?? '' })

function saveHabitLink() {
  store.updatePlanLink(planId.value, linkedHabitId.value || undefined)
}
</script>

<template>
  <div v-if="plan" class="tdetail">

    <div class="tdetail__nav">
      <button class="tdetail__back" @click="router.push('/training')">
        <UiIcon name="ArrowLeft" :size="14" :stroke-width="2" /> Training
      </button>
    </div>

    <div class="tdetail__header">
      <span class="tdetail__emoji">{{ plan.coverEmoji }}</span>
      <div class="tdetail__heading">
        <h1 class="tdetail__title">{{ plan.title }}</h1>
        <p class="tdetail__meta">{{ plan.sessionsPerWeek }}× / week</p>
      </div>
    </div>

    <div class="tdetail__stats">
      <div class="tdetail__stat">
        <span class="tdetail__stat-value">🔥 {{ streak }}</span>
        <span class="tdetail__stat-label">day streak</span>
      </div>
      <div class="tdetail__stat">
        <span class="tdetail__stat-value">{{ totalHours }}h</span>
        <span class="tdetail__stat-label">total time</span>
      </div>
      <div v-if="totalKm > 0" class="tdetail__stat">
        <span class="tdetail__stat-value">{{ totalKm }} km</span>
        <span class="tdetail__stat-label">total distance</span>
      </div>
      <div class="tdetail__stat">
        <span class="tdetail__stat-value">{{ sessionLogs.length }}</span>
        <span class="tdetail__stat-label">sessions</span>
      </div>
    </div>

    <div class="tdetail__today">
      <div class="tdetail__today-info">
        <span class="tdetail__today-label">Today</span>
        <span
          class="tdetail__today-status"
          :class="{ 'tdetail__today-status--done': loggedToday }"
        >{{ loggedToday ? '✓ Workout logged' : 'Ready to train' }}</span>
      </div>
      <button
        v-if="!loggedToday"
        class="tdetail__log-btn"
        @click="showLog = true"
      >Log Workout</button>
    </div>

    <!-- AI analysis card -->
    <div v-if="aiAnalyzing || aiAnalysis" class="tdetail__ai-card">
      <div class="tdetail__ai-header">
        <span class="tdetail__ai-label">✦ AI Insight</span>
        <button v-if="aiAnalysis" class="tdetail__ai-dismiss" @click="aiAnalysis = null">×</button>
      </div>
      <div v-if="aiAnalyzing" class="tdetail__ai-loading">
        <UiIcon name="Loader" :size="14" :stroke-width="2" class="tdetail__ai-spinner" />
        Analyzing your workout…
      </div>
      <p v-else class="tdetail__ai-text">{{ aiAnalysis }}</p>
    </div>

    <div class="tdetail__history">
      <p class="tdetail__section-label">Workout history</p>

      <div v-if="sessionLogs.length > 0" class="tdetail__log-list">
        <div
          v-for="log in sessionLogs"
          :key="log.id"
          class="tdetail__log"
          :class="{ 'tdetail__log--today': log.date === today }"
        >
          <div class="tdetail__log-left">
            <span class="tdetail__log-date">{{ formatDate(log.date) }}</span>
            <span v-if="log.notes" class="tdetail__log-notes">{{ log.notes }}</span>
          </div>
          <div class="tdetail__log-right">
            <span class="tdetail__log-feel">{{ FEELING_EMOJI[log.feeling] }}</span>
            <div class="tdetail__log-nums">
              <span v-if="log.actualDuration" class="tdetail__log-num">{{ log.actualDuration }}min</span>
              <span v-if="log.actualDistance" class="tdetail__log-num">{{ log.actualDistance }}km</span>
            </div>
          </div>
        </div>
      </div>

      <p v-else class="tdetail__empty">No workouts logged yet.</p>
    </div>

    <!-- Linked habit -->
    <div class="tdetail__link-habit">
      <p class="tdetail__section-label">Linked habit</p>
      <div class="tdetail__link-habit-row">
        <select v-model="linkedHabitId" class="tdetail__habit-select">
          <option value="">— none —</option>
          <option v-for="h in habitsStore.habits" :key="h.id" :value="h.id">{{ h.name }}</option>
        </select>
        <button
          class="tdetail__habit-save"
          :disabled="linkedHabitId === (plan.linkedHabitId ?? '')"
          @click="saveHabitLink"
        >Save</button>
      </div>
      <p v-if="plan.linkedHabitId" class="tdetail__habit-hint">
        ✓ Logging a workout will auto-check this habit
      </p>
    </div>

    <div class="tdetail__danger">
      <button class="tdetail__danger-btn" @click="askDelete">Delete plan</button>
    </div>

    <WorkoutLogForm
      v-if="showLog"
      :plan="plan"
      @submit="submitLog"
      @cancel="showLog = false"
    />

  </div>
</template>

<style scoped>
.tdetail {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tdetail__back {
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

.tdetail__back:hover { color: var(--color-text-secondary); }

.tdetail__header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tdetail__emoji { font-size: 40px; line-height: 1; flex-shrink: 0; }

.tdetail__title {
  font-size: var(--text-3xl);
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.tdetail__meta {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 4px 0 0;
}

.tdetail__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.tdetail__stat {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tdetail__stat-value { font-size: var(--text-lg); font-weight: 700; color: var(--color-text); }
.tdetail__stat-label { font-size: var(--text-xs); color: var(--color-text-muted); }

.tdetail__today {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.tdetail__today-info { display: flex; flex-direction: column; gap: 3px; }
.tdetail__today-label { font-size: var(--text-xs); font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.tdetail__today-status { font-size: var(--text-sm); color: var(--color-text-secondary); }
.tdetail__today-status--done { color: var(--color-success); }

.tdetail__log-btn {
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

.tdetail__log-btn:hover { background: var(--color-accent-hover); }

.tdetail__section-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 12px;
}

.tdetail__log-list { display: flex; flex-direction: column; gap: 8px; }

.tdetail__log {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.tdetail__log--today { border-color: var(--color-accent-muted); }

.tdetail__log-left { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.tdetail__log-date { font-size: var(--text-sm); font-weight: 500; color: var(--color-text); }
.tdetail__log-notes { font-size: var(--text-xs); color: var(--color-text-muted); font-style: italic; }

.tdetail__log-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.tdetail__log-feel { font-size: 20px; }
.tdetail__log-nums { display: flex; gap: 8px; }
.tdetail__log-num { font-size: var(--text-xs); font-weight: 600; color: var(--color-text-secondary); }

.tdetail__empty { font-size: var(--text-sm); color: var(--color-text-muted); margin: 0; }

/* ── Linked habit ────────────────────────────────────────────────── */
.tdetail__link-habit {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tdetail__link-habit .tdetail__section-label { margin: 0; }

.tdetail__link-habit-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tdetail__habit-select {
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

.tdetail__habit-select:focus { border-color: var(--color-accent); }

.tdetail__habit-save {
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

.tdetail__habit-save:hover:not(:disabled) { background: var(--color-accent-hover); }
.tdetail__habit-save:disabled { opacity: 0.4; cursor: not-allowed; }

.tdetail__habit-hint {
  font-size: var(--text-xs);
  color: var(--color-success);
  margin: 0;
}

.tdetail__danger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

.tdetail__danger-btn { background: none; border: none; font-size: var(--text-sm); color: var(--color-text-muted); cursor: pointer; padding: 0; transition: color var(--t-fast); font-family: inherit; }
.tdetail__danger-btn:hover { color: var(--color-danger); }

/* ── AI analysis card ────────────────────────────────────────────── */
.tdetail__ai-card { background: color-mix(in srgb, var(--color-accent) 6%, var(--color-surface)); border: 1px solid color-mix(in srgb, var(--color-accent) 25%, var(--color-border)); border-radius: var(--radius-lg); padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
.tdetail__ai-header { display: flex; align-items: center; justify-content: space-between; }
.tdetail__ai-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-accent); }
.tdetail__ai-dismiss { background: none; border: none; color: var(--color-text-muted); cursor: pointer; font-size: 16px; line-height: 1; padding: 0 2px; }
.tdetail__ai-dismiss:hover { color: var(--color-text); }
@keyframes spin-tai { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.tdetail__ai-spinner { animation: spin-tai 1s linear infinite; }
.tdetail__ai-loading { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-muted); }
.tdetail__ai-text { font-size: var(--text-sm); line-height: 1.65; color: var(--color-text-secondary); margin: 0; }

@media (max-width: 767px) {
  .tdetail__title { font-size: var(--text-2xl, 22px); }
  .tdetail__today { flex-direction: column; align-items: flex-start; }
  .tdetail__log-btn { align-self: stretch; text-align: center; }
}
</style>
