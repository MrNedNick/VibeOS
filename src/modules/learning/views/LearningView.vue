<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useLearningStore } from '../stores/learning.store'
import LearningPlanCard from '../components/LearningPlanCard.vue'
import SessionLogForm from '../components/SessionLogForm.vue'
import type { LearningCategory, LearningSession } from '../types'
import { todayStr } from '../types'
import { UiIcon, UiSectionLabel, UiFilterChips } from '@/ui'
import type { FilterChipOption } from '@/ui'
import { aiComplete } from '@/core/composables/useAI'

const store = useLearningStore()

// ── Create plan form ─────────────────────────────────────────────────
const showForm = ref(false)
const formTitle = ref('')
const formEmoji = ref('📚')
const formMinutes = ref(20)
const formHours = ref(10)
const formDays = ref<3 | 5 | 7>(5)
const titleRef = ref<HTMLInputElement>()

function openForm() {
  showForm.value = true
  nextTick(() => titleRef.value?.focus())
}

function cancelForm() {
  showForm.value = false
  formTitle.value = ''
  formEmoji.value = '📚'
  formMinutes.value = 20
  formHours.value = 10
  formDays.value = 5
}

function submitForm() {
  const title = formTitle.value.trim()
  if (!title) return
  store.createPlan({
    title,
    topic: title,
    category: 'other' as LearningCategory,
    coverEmoji: formEmoji.value.trim() || '📚',
    minutesPerSession: Math.max(1, formMinutes.value),
    targetHours: Math.max(1, formHours.value),
    daysPerWeek: formDays.value,
    startDate: todayStr(),
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

function submitLog(data: Omit<LearningSession, 'id'>) {
  store.logSession(data)
  loggingPlanId.value = null
}

// ── Active plans with today-logged status ────────────────────────────
const activePlansWithStatus = computed(() => {
  const today = todayStr()
  return store.activePlans.map(plan => ({
    plan,
    loggedToday: store.sessions.some(
      s => s.planId === plan.id && s.date === today && s.status === 'completed',
    ),
  }))
})

// ── Completed section toggle ─────────────────────────────────────────
const showCompleted = ref(false)

// ── Global keyboard shortcut: N = new plan ───────────────────────────
function onKeydown(e: KeyboardEvent) {
  if (showForm.value || loggingPlanId.value) return
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  if (e.key === 'n' || e.key === 'N') openForm()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

const todayLabel = computed(() =>
  new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }),
)

const FREQ_OPTIONS: FilterChipOption[] = [
  { value: '3', label: '3×/week' },
  { value: '5', label: 'Weekdays' },
  { value: '7', label: 'Daily' },
]

const formDaysStr = computed({
  get: () => String(formDays.value),
  set: (v: string) => { formDays.value = Number(v) as 3 | 5 | 7 },
})

// ── AI plan generator ────────────────────────────────────────────────
const aiPrompt      = ref('')
const aiGenerating  = ref(false)
const aiError       = ref<string | null>(null)
const showAiInput   = ref(false)

async function generateWithAI() {
  if (!aiPrompt.value.trim()) return
  aiGenerating.value = true
  aiError.value = null

  const prompt = `Create a structured learning plan for: "${aiPrompt.value}". Reply with ONLY a JSON object, no extra text: {"title":"short plan name","emoji":"single emoji","minutesPerSession":number 15-60,"targetHours":number 5-300,"daysPerWeek":3 or 5 or 7}`

  try {
    const text = await aiComplete(prompt)
    const match = text.match(/\{[\s\S]*?\}/)
    if (!match) { aiError.value = 'Could not parse AI response — try again'; return }
    const data = JSON.parse(match[0])
    if (data.title) formTitle.value = String(data.title)
    if (data.emoji) formEmoji.value = String(data.emoji).slice(0, 2)
    if (data.minutesPerSession) formMinutes.value = Math.max(5, Math.min(180, Number(data.minutesPerSession)))
    if (data.targetHours) formHours.value = Math.max(1, Math.min(500, Number(data.targetHours)))
    if ([3, 5, 7].includes(Number(data.daysPerWeek))) formDays.value = Number(data.daysPerWeek) as 3 | 5 | 7
    showAiInput.value = false
    aiPrompt.value = ''
    nextTick(() => titleRef.value?.focus())
  } catch {
    aiError.value = 'Failed to parse AI response'
  } finally {
    aiGenerating.value = false
  }
}
</script>

<template>
  <div class="learning">

    <!-- Header -->
    <div class="learning__header">
      <div>
        <h1 class="learning__title">Learning</h1>
        <p class="learning__date">{{ todayLabel }}</p>
      </div>
      <button class="learning__add-btn" @click="openForm">+ Add Plan</button>
    </div>

    <!-- Create plan form -->
    <div v-if="showForm" class="learning__form" @keydown="onFormKeydown">
      <div class="learning__form-row">
        <input
          v-model="formEmoji"
          class="learning__input learning__input--emoji"
          maxlength="2"
          placeholder="📚"
        />
        <input
          v-model="formTitle"
          ref="titleRef"
          class="learning__input learning__input--grow"
          placeholder="What do you want to learn?"
          maxlength="80"
        />
      </div>

      <div class="learning__form-meta">
        <label class="learning__form-field">
          <span class="learning__form-label">Min / day</span>
          <input
            v-model.number="formMinutes"
            type="number"
            min="5"
            max="180"
            class="learning__input learning__input--num"
          />
        </label>
        <label class="learning__form-field">
          <span class="learning__form-label">Target hours</span>
          <input
            v-model.number="formHours"
            type="number"
            min="1"
            max="500"
            class="learning__input learning__input--num"
          />
        </label>
        <div class="learning__form-field">
          <span class="learning__form-label">Frequency</span>
          <UiFilterChips v-model="formDaysStr" :options="FREQ_OPTIONS" size="sm" />
        </div>
      </div>

      <!-- AI assist -->
      <div v-if="showAiInput" class="learning__ai-row">
        <input
          v-model="aiPrompt"
          class="learning__input learning__input--grow"
          placeholder="e.g. 'Learn Python in 8 weeks, 30 min/day'"
          @keydown.enter.prevent="generateWithAI"
          @keydown.escape="showAiInput = false"
        />
        <button
          class="learning__btn learning__btn--ai"
          :disabled="aiGenerating || !aiPrompt.trim()"
          @click="generateWithAI"
        >{{ aiGenerating ? '…' : 'Generate' }}</button>
        <button class="learning__btn learning__btn--ghost" @click="showAiInput = false">✕</button>
      </div>
      <p v-if="aiError" class="learning__ai-error">{{ aiError }}</p>

      <div class="learning__form-actions">
        <button class="learning__btn learning__btn--primary" @click="submitForm">Add Plan</button>
        <button class="learning__btn learning__btn--ghost" @click="cancelForm">Cancel</button>
        <button
          v-if="!showAiInput"
          class="learning__btn learning__btn--ai-toggle"
          type="button"
          @click="showAiInput = true; aiError = null"
        >✦ Fill with AI</button>
      </div>
    </div>

    <!-- Today strip -->
    <div v-if="store.todayItems.length > 0" class="learning__today">
      <UiSectionLabel class="learning__section-label">Today</UiSectionLabel>
      <div class="learning__today-list">
        <div
          v-for="item in store.todayItems"
          :key="item.plan.id"
          class="learning__today-row"
          :class="{ 'learning__today-row--done': item.logged }"
        >
          <span class="learning__today-emoji">{{ item.plan.coverEmoji }}</span>
          <span class="learning__today-name">{{ item.plan.title }}</span>
          <span class="learning__today-time">{{ item.plan.minutesPerSession }} min</span>
          <button
            v-if="!item.logged"
            class="learning__today-btn"
            @click="openLog(item.plan.id)"
          >Log</button>
          <span v-else class="learning__today-check">✓</span>
        </div>
      </div>
    </div>

    <!-- Active plans grid -->
    <div v-if="activePlansWithStatus.length > 0" class="learning__grid">
      <LearningPlanCard
        v-for="item in activePlansWithStatus"
        :key="item.plan.id"
        :plan="item.plan"
        :logged-today="item.loggedToday"
        @log="openLog"
      />
    </div>

    <!-- Completed plans -->
    <div v-if="store.completedPlans.length > 0" class="learning__completed">
      <button class="learning__completed-toggle" @click="showCompleted = !showCompleted">
        Completed ({{ store.completedPlans.length }})
        <span class="learning__completed-arrow">{{ showCompleted ? '▲' : '▼' }}</span>
      </button>
      <div v-if="showCompleted" class="learning__completed-list">
        <div
          v-for="plan in store.completedPlans"
          :key="plan.id"
          class="learning__completed-item"
        >
          {{ plan.coverEmoji }} {{ plan.title }}
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="store.activePlans.length === 0 && !showForm" class="learning__empty">
      <div class="learning__empty-icon">
        <UiIcon name="BookOpen" :size="40" :stroke-width="1.4" />
      </div>
      <p class="learning__empty-title">Nothing to learn yet.</p>
      <p class="learning__empty-sub">
        Pick something you've always wanted to master. Build the plan. Show up every day — the hours compound.
      </p>
      <button class="learning__btn learning__btn--primary" @click="openForm">
        <UiIcon name="Plus" :size="14" />
        Start a learning plan
      </button>
    </div>

    <!-- Session log modal -->
    <SessionLogForm
      v-if="loggingPlan"
      :plan="loggingPlan"
      @submit="submitLog"
      @cancel="loggingPlanId = null"
    />

  </div>
</template>

<style scoped>
.learning {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* ── Header ─────────────────────────────────────────────────────── */
.learning__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.learning__title {
  font-size: var(--text-3xl);
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
}

.learning__date {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 4px 0 0;
}

.learning__add-btn {
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

.learning__add-btn:hover { background: var(--color-accent-hover); }

/* ── Create form ─────────────────────────────────────────────────── */
.learning__form {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.learning__form-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.learning__form-meta {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.learning__form-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.learning__form-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-weight: 500;
}

.learning__form-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.learning__ai-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.learning__ai-error {
  font-size: var(--text-xs);
  color: var(--color-danger);
  margin: 0;
}

.learning__input {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 9px 12px;
  font-size: var(--text-sm);
  color: var(--color-text);
  font-family: inherit;
  transition: border-color var(--t-fast);
}

.learning__input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.learning__input--emoji {
  width: 52px;
  text-align: center;
  font-size: 20px;
  flex-shrink: 0;
  padding: 9px 6px;
}

.learning__input--grow { flex: 1; min-width: 0; }
.learning__input--num { width: 76px; }

/* ── Buttons ─────────────────────────────────────────────────────── */
.learning__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: var(--radius);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--t-fast);
  border: 1px solid transparent;
  font-family: inherit;
}

.learning__btn--primary {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
}

.learning__btn--primary:hover { background: var(--color-accent-hover); }

.learning__btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

.learning__btn--ghost:hover { color: var(--color-text); }

.learning__btn--ai {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
  padding: 8px 14px;
}

.learning__btn--ai:hover:not(:disabled) { background: var(--color-accent-hover); }
.learning__btn--ai:disabled { opacity: 0.55; cursor: not-allowed; }

.learning__btn--ai-toggle {
  background: transparent;
  border-color: var(--color-accent);
  color: var(--color-accent);
  margin-left: auto;
  font-size: 12px;
  padding: 6px 12px;
}

.learning__btn--ai-toggle:hover { background: var(--color-accent-muted); }

/* ── Section label ───────────────────────────────────────────────── */
.learning__section-label { margin-bottom: 10px; }

/* ── Today strip ─────────────────────────────────────────────────── */
.learning__today-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.learning__today-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 10px 14px;
  transition: border-color var(--t-fast);
}

.learning__today-row--done {
  border-color: var(--color-success);
  opacity: 0.7;
}

.learning__today-emoji { font-size: 18px; flex-shrink: 0; }

.learning__today-name {
  flex: 1;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.learning__today-time {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.learning__today-btn {
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

.learning__today-btn:hover {
  background: var(--color-accent);
  color: #fff;
}

.learning__today-check {
  font-size: var(--text-sm);
  color: var(--color-success);
  font-weight: 600;
  flex-shrink: 0;
}

/* ── Plans grid ──────────────────────────────────────────────────── */
.learning__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

/* ── Completed section ───────────────────────────────────────────── */
.learning__completed-toggle {
  background: none;
  border: none;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color var(--t-fast);
  font-family: inherit;
}

.learning__completed-toggle:hover { color: var(--color-text-secondary); }
.learning__completed-arrow { font-size: 10px; }

.learning__completed-list {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.learning__completed-item {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  padding: 7px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

/* ── Empty state ─────────────────────────────────────────────────── */
.learning__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 64px 20px;
  text-align: center;
}

.learning__empty-icon { color: var(--color-accent); opacity: 0.5; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; }

.learning__empty-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin: 4px 0 0;
}

.learning__empty-sub {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: 0 0 10px;
  max-width: 340px;
}

/* ── Responsive ──────────────────────────────────────────────────── */
@media (max-width: 767px) {
  .learning { gap: 20px; }

  .learning__grid {
    grid-template-columns: 1fr;
  }

  .learning__form-meta {
    gap: 14px;
  }

  .learning__title { font-size: var(--text-2xl, 22px); }
}
</style>
