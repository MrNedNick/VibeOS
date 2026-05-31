<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useTrainingStore } from '../stores/training.store'
import TrainingPlanCard from '../components/TrainingPlanCard.vue'
import WorkoutLogForm from '../components/WorkoutLogForm.vue'
import type { SportType, WorkoutLog } from '../types'
import { SPORT_EMOJI, FEELING_EMOJI, todayStr } from '../types'
import { UiIcon, UiSectionLabel, UiFilterChips } from '@/ui'
import type { FilterChipOption } from '@/ui'
import { aiComplete } from '@/core/composables/useAI'

const store = useTrainingStore()

// ── Create plan form ─────────────────────────────────────────────────
const showForm = ref(false)
const formTitle = ref('')
const formEmoji = ref('💪')
const formSport = ref<SportType>('strength')
const formSessions = ref(3)
const titleRef = ref<HTMLInputElement>()

const SPORT_OPTIONS: { val: SportType; label: string }[] = [
  { val: 'strength', label: '💪 Strength' },
  { val: 'running', label: '🏃 Running' },
  { val: 'cycling', label: '🚴 Cycling' },
  { val: 'swimming', label: '🏊 Swimming' },
  { val: 'yoga', label: '🧘 Yoga' },
  { val: 'hiit', label: '⚡ HIIT' },
  { val: 'walking', label: '🚶 Walking' },
  { val: 'other', label: '🏋️ Other' },
]

const FREQ_OPTIONS: FilterChipOption[] = [
  { value: '2', label: '2×/week' },
  { value: '3', label: '3×/week' },
  { value: '5', label: 'Weekdays' },
  { value: '7', label: 'Daily' },
]

const formSessionsStr = computed({
  get: () => String(formSessions.value),
  set: (v: string) => { formSessions.value = Number(v) },
})

function openForm() {
  showForm.value = true
  nextTick(() => titleRef.value?.focus())
}

function cancelForm() {
  showForm.value = false
  formTitle.value = ''
  formEmoji.value = '💪'
  formSport.value = 'strength'
  formSessions.value = 3
}

function submitForm() {
  const title = formTitle.value.trim()
  if (!title) return
  store.createPlan({
    title,
    sportType: formSport.value,
    sessionsPerWeek: formSessions.value,
    startDate: todayStr(),
    coverEmoji: formEmoji.value.trim() || SPORT_EMOJI[formSport.value],
  })
  cancelForm()
}

function onFormKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) submitForm()
  if (e.key === 'Escape') cancelForm()
}

// ── Session log modal ────────────────────────────────────────────────
const loggingPlanId = ref<string | null>(null)
const loggingPlan = computed(() =>
  loggingPlanId.value ? store.getPlanById(loggingPlanId.value) : undefined,
)

function openLog(planId: string) {
  loggingPlanId.value = planId
}

function submitLog(data: Omit<WorkoutLog, 'id' | 'createdAt'>) {
  store.logWorkout(data)
  loggingPlanId.value = null
}

// ── Plans with today status ──────────────────────────────────────────
const activePlansWithStatus = computed(() => {
  const today = todayStr()
  return store.activePlans.map(plan => ({
    plan,
    loggedToday: store.logs.some(l => l.planId === plan.id && l.date === today),
  }))
})

// ── AI plan generator ────────────────────────────────────────────────
const aiPrompt     = ref('')
const aiGenerating = ref(false)
const aiError      = ref<string | null>(null)
const showAiInput  = ref(false)

const VALID_SPORTS: SportType[] = ['running','strength','cycling','swimming','yoga','hiit','walking','other']

async function generateWithAI() {
  if (!aiPrompt.value.trim()) return
  aiGenerating.value = true
  aiError.value = null

  const prompt = `Create a training plan for: "${aiPrompt.value}". Reply with ONLY a JSON object, no extra text: {"title":"short plan name","emoji":"single emoji","sportType":"running or strength or cycling or swimming or yoga or hiit or walking or other","sessionsPerWeek":2 or 3 or 5 or 7}`

  try {
    const text = await aiComplete(prompt)
    const match = text.match(/\{[\s\S]*?\}/)
    if (!match) { aiError.value = 'Could not parse AI response — try again'; return }
    const data = JSON.parse(match[0])
    if (data.title) formTitle.value = String(data.title)
    if (data.emoji) formEmoji.value = String(data.emoji).slice(0, 2)
    if (data.sportType && VALID_SPORTS.includes(data.sportType)) formSport.value = data.sportType as SportType
    if ([2, 3, 5, 7].includes(Number(data.sessionsPerWeek))) formSessions.value = Number(data.sessionsPerWeek)
    showAiInput.value = false
    aiPrompt.value = ''
    nextTick(() => titleRef.value?.focus())
  } catch {
    aiError.value = 'Failed to parse AI response'
  } finally {
    aiGenerating.value = false
  }
}

// ── Keyboard shortcut ────────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if (showForm.value || loggingPlanId.value) return
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  if (e.key === 'n' || e.key === 'N') openForm()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

const todayLabel = computed(() =>
  new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
)
</script>

<template>
  <div class="training">

    <div class="training__header">
      <div>
        <h1 class="training__title">Training</h1>
        <p class="training__date">{{ todayLabel }}</p>
      </div>
      <button class="training__add-btn" @click="openForm">+ Add Plan</button>
    </div>

    <!-- Create plan form -->
    <div v-if="showForm" class="training__form" @keydown="onFormKeydown">
      <div class="training__form-row">
        <input
          v-model="formEmoji"
          class="training__input training__input--emoji"
          maxlength="2"
          placeholder="💪"
        />
        <input
          v-model="formTitle"
          ref="titleRef"
          class="training__input training__input--grow"
          placeholder="Plan name (e.g. Morning Strength)"
          maxlength="80"
        />
      </div>

      <div class="training__form-meta">
        <div class="training__form-field">
          <span class="training__form-label">Sport</span>
          <select v-model="formSport" class="training__input training__input--select">
            <option v-for="opt in SPORT_OPTIONS" :key="opt.val" :value="opt.val">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div class="training__form-field">
          <span class="training__form-label">Frequency</span>
          <UiFilterChips v-model="formSessionsStr" :options="FREQ_OPTIONS" size="sm" />
        </div>
      </div>

      <!-- AI assist -->
      <div v-if="showAiInput" class="training__ai-row">
        <input
          v-model="aiPrompt"
          class="training__input training__input--grow"
          placeholder="e.g. 'Run a 5K in 12 weeks, 3 days/week'"
          @keydown.enter.prevent="generateWithAI"
          @keydown.escape="showAiInput = false"
        />
        <button
          class="training__btn training__btn--ai"
          :disabled="aiGenerating || !aiPrompt.trim()"
          @click="generateWithAI"
        >{{ aiGenerating ? '…' : 'Generate' }}</button>
        <button class="training__btn training__btn--ghost" @click="showAiInput = false">✕</button>
      </div>
      <p v-if="aiError" class="training__ai-error">{{ aiError }}</p>

      <div class="training__form-actions">
        <button class="training__btn training__btn--primary" @click="submitForm">Add Plan</button>
        <button class="training__btn training__btn--ghost" @click="cancelForm">Cancel</button>
        <button
          v-if="!showAiInput"
          class="training__btn training__btn--ai-toggle"
          type="button"
          @click="showAiInput = true; aiError = null"
        >✦ Fill with AI</button>
      </div>
    </div>

    <!-- Today strip -->
    <div v-if="store.todayItems.length > 0" class="training__today">
      <UiSectionLabel class="training__section-label">Today</UiSectionLabel>
      <div class="training__today-list">
        <div
          v-for="item in store.todayItems"
          :key="item.plan.id"
          class="training__today-row"
          :class="{ 'training__today-row--done': item.logged }"
        >
          <span class="training__today-emoji">{{ item.plan.coverEmoji }}</span>
          <span class="training__today-name">{{ item.plan.title }}</span>
          <span class="training__today-freq">{{ item.plan.sessionsPerWeek }}×/wk</span>
          <button
            v-if="!item.logged"
            class="training__today-btn"
            @click="openLog(item.plan.id)"
          >Log</button>
          <span v-else class="training__today-check">✓</span>
        </div>
      </div>
    </div>

    <!-- Active plans grid -->
    <div v-if="activePlansWithStatus.length > 0" class="training__grid">
      <TrainingPlanCard
        v-for="item in activePlansWithStatus"
        :key="item.plan.id"
        :plan="item.plan"
        :logged-today="item.loggedToday"
        @log="openLog"
      />
    </div>

    <!-- Recent workouts -->
    <div v-if="store.recentLogs.length > 0" class="training__recent">
      <UiSectionLabel class="training__section-label">Recent workouts</UiSectionLabel>
      <div class="training__log-list">
        <div
          v-for="log in store.recentLogs"
          :key="log.id"
          class="training__log-row"
        >
          <span class="training__log-feel">{{ FEELING_EMOJI[log.feeling] }}</span>
          <div class="training__log-info">
            <span class="training__log-title">{{ log.title }}</span>
            <span class="training__log-date">{{ log.date }}</span>
          </div>
          <div class="training__log-stats">
            <span v-if="log.actualDuration" class="training__log-stat">{{ log.actualDuration }}min</span>
            <span v-if="log.actualDistance" class="training__log-stat">{{ log.actualDistance }}km</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="store.activePlans.length === 0 && !showForm" class="training__empty">
      <div class="training__empty-icon">
        <UiIcon name="Dumbbell" :size="40" :stroke-width="1.4" />
      </div>
      <p class="training__empty-title">Day one starts here.</p>
      <p class="training__empty-sub">
        Every athlete started with a blank plan. Set up your routine, log every session, and watch the consistency compound.
      </p>
      <button class="training__btn training__btn--primary" @click="openForm">
        <UiIcon name="Plus" :size="14" />
        Create training plan
      </button>
    </div>

    <!-- Log modal -->
    <WorkoutLogForm
      v-if="loggingPlan"
      :plan="loggingPlan"
      @submit="submitLog"
      @cancel="loggingPlanId = null"
    />

  </div>
</template>

<style scoped>
.training {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.training__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.training__title {
  font-size: var(--text-3xl);
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.training__date {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 4px 0 0;
}

.training__add-btn {
  padding: 8px 18px;
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--t-fast);
  font-family: inherit;
}

.training__add-btn:hover { background: var(--color-accent-hover); }

/* Form */
.training__form {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.training__form-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.training__form-meta {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.training__form-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.training__form-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-weight: 500;
}

.training__form-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }

.training__ai-row { display: flex; gap: 8px; align-items: center; }
.training__ai-error { font-size: var(--text-xs); color: var(--color-danger); margin: 0; }

.training__input {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 9px 12px;
  font-size: var(--text-sm);
  color: var(--color-text);
  font-family: inherit;
  transition: border-color var(--t-fast);
}

.training__input:focus { outline: none; border-color: var(--color-accent); }
.training__input--emoji { width: 52px; text-align: center; font-size: 20px; padding: 9px 6px; flex-shrink: 0; }
.training__input--grow { flex: 1; min-width: 0; }
.training__input--select { min-width: 160px; appearance: auto; }

.training__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: var(--radius);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all var(--t-fast);
  font-family: inherit;
}

.training__btn--primary { background: var(--color-accent); color: #fff; border-color: var(--color-accent); }
.training__btn--primary:hover { background: var(--color-accent-hover); }
.training__btn--ghost { background: transparent; color: var(--color-text-secondary); border-color: var(--color-border); }
.training__btn--ghost:hover { color: var(--color-text); }

.training__btn--ai { background: var(--color-accent); color: #fff; border-color: var(--color-accent); padding: 8px 14px; }
.training__btn--ai:hover:not(:disabled) { background: var(--color-accent-hover); }
.training__btn--ai:disabled { opacity: 0.55; cursor: not-allowed; }

.training__btn--ai-toggle { background: transparent; border-color: var(--color-accent); color: var(--color-accent); margin-left: auto; font-size: 12px; padding: 6px 12px; }
.training__btn--ai-toggle:hover { background: var(--color-accent-muted); }

/* Section label */
.training__section-label { margin-bottom: 10px; }

/* Today strip */
.training__today-list { display: flex; flex-direction: column; gap: 8px; }

.training__today-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 10px 14px;
  transition: border-color var(--t-fast);
}

.training__today-row--done { border-color: var(--color-success); opacity: 0.7; }
.training__today-emoji { font-size: 18px; flex-shrink: 0; }
.training__today-name { flex: 1; font-size: var(--text-sm); font-weight: 500; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.training__today-freq { font-size: var(--text-xs); color: var(--color-text-muted); flex-shrink: 0; }

.training__today-btn {
  padding: 4px 12px;
  border-radius: var(--radius);
  border: 1px solid var(--color-accent);
  background: transparent;
  color: var(--color-accent);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--t-fast);
  font-family: inherit;
  flex-shrink: 0;
}

.training__today-btn:hover { background: var(--color-accent); color: #fff; }
.training__today-check { font-size: var(--text-sm); color: var(--color-success); font-weight: 600; flex-shrink: 0; }

/* Grid */
.training__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

/* Recent logs */
.training__log-list { display: flex; flex-direction: column; gap: 8px; }

.training__log-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.training__log-feel { font-size: 20px; flex-shrink: 0; }

.training__log-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.training__log-title { font-size: var(--text-sm); font-weight: 500; color: var(--color-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.training__log-date { font-size: var(--text-xs); color: var(--color-text-muted); }

.training__log-stats { display: flex; gap: 8px; flex-shrink: 0; }
.training__log-stat { font-size: var(--text-xs); color: var(--color-text-secondary); }

/* Empty */
.training__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 64px 20px;
  text-align: center;
}

.training__empty-icon { color: var(--color-warning-dark, #f97316); opacity: 0.5; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; }
.training__empty-title { font-size: var(--text-lg); font-weight: 600; color: var(--color-text); margin: 4px 0 0; }
.training__empty-sub { font-size: var(--text-sm); color: var(--color-text-muted); margin: 0 0 10px; max-width: 340px; }

@media (max-width: 767px) {
  .training { gap: 20px; }
  .training__grid { grid-template-columns: 1fr; }
  .training__form-meta { gap: 14px; }
  .training__title { font-size: var(--text-2xl, 22px); }
}
</style>
