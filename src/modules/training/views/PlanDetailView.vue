<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTrainingStore } from '../stores/training.store'
import WorkoutLogForm from '../components/WorkoutLogForm.vue'
import type { WorkoutLog, ResourceType } from '../types'
import { FEELING_EMOJI, todayStr, RESOURCE_META, RESOURCE_TYPES } from '../types'
import { UiIcon, UiSectionLabel, UiStat } from '@/ui'
import { useHabitsStore } from '@/modules/habits/stores/habits.store'
import { useConfirm } from '@/core/composables/useConfirm'
import { useAiInsight } from '@/core/composables/useAiInsight'

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
const { result: aiAnalysis, loading: aiAnalyzing, run: runAiAnalysis, dismiss: dismissAiAnalysis } = useAiInsight()

function analyzeWorkout(data: Omit<WorkoutLog, 'id' | 'createdAt'>) {
  if (!plan.value) return
  const durationNote = data.actualDuration ? `${data.actualDuration} min` : 'unknown duration'
  const distNote = data.actualDistance ? `, ${data.actualDistance}km` : ''
  const feelNote = ['', 'terrible', 'bad', 'ok', 'good', 'great'][data.feeling] ?? 'ok'
  runAiAnalysis(`I just logged a ${plan.value.sportType} workout for "${plan.value.title}". Duration: ${durationNote}${distNote}. Feeling: ${feelNote}. ${data.notes ? 'Notes: ' + data.notes + '.' : ''} Streak: ${streak.value} days. What 2-3 specific things should I focus on to improve in my NEXT session? Be concise (3 sentences max).`)
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

// ── Resources ────────────────────────────────────────────────────────
const resources = computed(() => store.getPlanResources(planId.value))

const showAddResource = ref(false)
const newResUrl   = ref('')
const newResTitle = ref('')
const newResType  = ref<ResourceType>('article')

function submitResource() {
  if (!newResUrl.value.trim()) return
  store.addResource(planId.value, {
    url:   newResUrl.value.trim(),
    title: newResTitle.value.trim() || newResUrl.value.trim(),
    type:  newResType.value,
  })
  newResUrl.value = ''; newResTitle.value = ''; newResType.value = 'article'
  showAddResource.value = false
}

function safeDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', '') }
  catch { return url }
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
        <UiStat :value="'🔥 ' + streak" label="day streak" />
      </div>
      <div class="tdetail__stat">
        <UiStat :value="totalHours + 'h'" label="total time" />
      </div>
      <div v-if="totalKm > 0" class="tdetail__stat">
        <UiStat :value="totalKm + ' km'" label="total distance" />
      </div>
      <div class="tdetail__stat">
        <UiStat :value="sessionLogs.length" label="sessions" />
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
        <button v-if="aiAnalysis" class="tdetail__ai-dismiss" @click="dismissAiAnalysis">×</button>
      </div>
      <div v-if="aiAnalyzing" class="tdetail__ai-loading">
        <UiIcon name="Loader" :size="14" :stroke-width="2" class="tdetail__ai-spinner" />
        Analyzing your workout…
      </div>
      <p v-else class="tdetail__ai-text">{{ aiAnalysis }}</p>
    </div>

    <div class="tdetail__history">
      <UiSectionLabel class="tdetail__section-label">Workout history</UiSectionLabel>

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

    <!-- Resources -->
    <div class="tdetail__resources">
      <div class="tdetail__resources-header">
        <UiSectionLabel class="tdetail__section-label">Resources</UiSectionLabel>
        <button class="tdetail__resources-add-btn" @click="showAddResource = !showAddResource">
          <UiIcon :name="showAddResource ? 'X' : 'Plus'" :size="13" />
          {{ showAddResource ? 'Cancel' : 'Add resource' }}
        </button>
      </div>
      <div v-if="showAddResource" class="tdetail__res-form">
        <input v-model="newResUrl" class="tdetail__res-input" placeholder="https://..." @keydown.enter="submitResource" />
        <input v-model="newResTitle" class="tdetail__res-input" placeholder="Title (optional)" @keydown.enter="submitResource" />
        <div class="tdetail__res-form-row">
          <div class="tdetail__res-types">
            <button
              v-for="t in RESOURCE_TYPES" :key="t"
              class="tdetail__res-type"
              :class="{ 'tdetail__res-type--active': newResType === t }"
              :title="RESOURCE_META[t].label"
              @click="newResType = t"
            >{{ RESOURCE_META[t].icon }}</button>
          </div>
          <button class="tdetail__res-submit" :disabled="!newResUrl.trim()" @click="submitResource">Add</button>
        </div>
      </div>
      <div v-if="resources.length > 0" class="tdetail__res-list">
        <div
          v-for="res in resources" :key="res.id"
          class="tdetail__res-item"
          :class="{ 'tdetail__res-item--done': res.done }"
        >
          <span class="tdetail__res-icon">{{ RESOURCE_META[res.type].icon }}</span>
          <div class="tdetail__res-body">
            <a :href="res.url" class="tdetail__res-link" target="_blank" rel="noopener noreferrer">{{ res.title }}</a>
            <span class="tdetail__res-domain">{{ safeDomain(res.url) }}</span>
          </div>
          <button class="tdetail__res-done" :class="{ 'tdetail__res-done--active': res.done }" @click="store.toggleResourceDone(planId, res.id)">
            <UiIcon :name="res.done ? 'CheckCircle2' : 'Circle'" :size="15" :stroke-width="1.75" />
          </button>
          <button class="tdetail__res-del" title="Remove" @click="store.deleteResource(planId, res.id)">×</button>
        </div>
      </div>
      <p v-else-if="!showAddResource" class="tdetail__resources-empty">No resources yet — add videos, guides, or references for this plan.</p>
    </div>

    <!-- Linked habit -->
    <div class="tdetail__link-habit">
      <UiSectionLabel class="tdetail__section-label">Linked habit</UiSectionLabel>
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

.tdetail__section-label { margin-bottom: 12px; }

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

/* ── Resources ──────────────────────────────────────────────────── */
.tdetail__resources { display: flex; flex-direction: column; gap: 10px; padding: 16px 20px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
.tdetail__resources-header { display: flex; align-items: center; justify-content: space-between; }
.tdetail__resources-add-btn { display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: var(--color-accent); padding: 3px 10px; border: 1px solid var(--color-accent-muted); border-radius: var(--radius-sm); background: var(--color-accent-muted); cursor: pointer; transition: opacity var(--t-fast); }
.tdetail__resources-add-btn:hover { opacity: 0.8; }
.tdetail__res-form { display: flex; flex-direction: column; gap: 8px; padding: 12px; background: var(--color-surface-elevated); border: 1px solid var(--color-border); border-radius: var(--radius-sm); }
.tdetail__res-input { width: 100%; padding: 7px 10px; font-size: 13px; font-family: inherit; color: var(--color-text); background: var(--color-bg); border: 1px solid var(--color-border); border-radius: var(--radius-sm); outline: none; transition: border-color var(--t-fast); }
.tdetail__res-input:focus { border-color: var(--color-accent); }
.tdetail__res-input::placeholder { color: var(--color-text-muted); }
.tdetail__res-form-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.tdetail__res-types { display: flex; gap: 4px; }
.tdetail__res-type { font-size: 16px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-xs); border: 1px solid var(--color-border); background: var(--color-surface); cursor: pointer; opacity: 0.55; transition: opacity var(--t-fast), border-color var(--t-fast); }
.tdetail__res-type:hover { opacity: 0.85; }
.tdetail__res-type--active { opacity: 1; border-color: var(--color-accent); background: var(--color-accent-muted); }
.tdetail__res-submit { padding: 5px 14px; font-size: 12px; font-weight: 600; background: var(--color-accent); color: #fff; border-radius: var(--radius-sm); cursor: pointer; transition: opacity var(--t-fast); }
.tdetail__res-submit:hover { opacity: 0.88; }
.tdetail__res-submit:disabled { opacity: 0.4; cursor: not-allowed; }
.tdetail__res-list { display: flex; flex-direction: column; gap: 2px; }
.tdetail__res-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: var(--radius-sm); transition: background var(--t-fast); }
.tdetail__res-item:hover { background: var(--color-surface-elevated); }
.tdetail__res-item--done { opacity: 0.55; }
.tdetail__res-icon { font-size: 15px; flex-shrink: 0; width: 20px; text-align: center; }
.tdetail__res-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.tdetail__res-link { font-size: 13px; font-weight: 500; color: var(--color-accent); text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: opacity var(--t-fast); }
.tdetail__res-link:hover { opacity: 0.75; text-decoration: underline; }
.tdetail__res-domain { font-size: 11px; color: var(--color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tdetail__res-done { flex-shrink: 0; color: var(--color-text-muted); display: flex; align-items: center; transition: color var(--t-fast); }
.tdetail__res-done:hover, .tdetail__res-done--active { color: var(--color-accent); }
.tdetail__res-del { font-size: 16px; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; color: var(--color-text-muted); border-radius: var(--radius-xs); opacity: 0; transition: opacity var(--t-fast), color var(--t-fast); cursor: pointer; flex-shrink: 0; }
.tdetail__res-item:hover .tdetail__res-del { opacity: 1; }
.tdetail__res-del:hover { color: var(--color-danger); }
.tdetail__resources-empty { font-size: 13px; color: var(--color-text-muted); margin: 0; font-style: italic; }

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

.tdetail__link-habit .tdetail__section-label { margin-bottom: 0; }

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
