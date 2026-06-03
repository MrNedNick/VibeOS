<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useLearningStore } from '../stores/learning.store'
import LearningPlanCard from '../components/LearningPlanCard.vue'
import SessionLogForm from '../components/SessionLogForm.vue'
import type { LearningCategory, LearningSession } from '../types'
import { todayStr } from '../types'
import { UiIcon, UiSectionLabel, UiFilterChips, UiButton, UiIconButton, UiInput, UiFab } from '@/ui'
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
const titleRef = ref<InstanceType<typeof UiInput>>()

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
      <UiButton @click="openForm">+ Add Plan</UiButton>
    </div>

    <!-- Create plan form -->
    <div v-if="showForm" class="learning__form" @keydown="onFormKeydown">
      <div class="learning__form-row">
        <!-- Emoji input — bespoke: 52px, center-aligned, emoji font size -->
        <input
          v-model="formEmoji"
          class="learning__input learning__input--emoji"
          maxlength="2"
          placeholder="📚"
        />
        <UiInput
          ref="titleRef"
          v-model="formTitle"
          placeholder="What do you want to learn?"
          :maxlength="80"
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
        <UiInput
          v-model="aiPrompt"
          placeholder="e.g. 'Learn Python in 8 weeks, 30 min/day'"
          @enter="generateWithAI"
          @keydown.escape="showAiInput = false"
        />
        <UiButton :disabled="aiGenerating || !aiPrompt.trim()" @click="generateWithAI">
          {{ aiGenerating ? '…' : 'Generate' }}
        </UiButton>
        <UiIconButton name="X" aria-label="Close AI input" @click="showAiInput = false" />
      </div>
      <p v-if="aiError" class="learning__ai-error">{{ aiError }}</p>

      <div class="learning__form-actions">
        <UiButton @click="submitForm">Add Plan</UiButton>
        <UiButton variant="ghost" @click="cancelForm">Cancel</UiButton>
        <UiButton
          v-if="!showAiInput"
          variant="ghost"
          size="sm"
          class="learning__ai-toggle"
          @click="showAiInput = true; aiError = null"
        >✦ Fill with AI</UiButton>
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
          <UiButton v-if="!item.logged" variant="outline" size="sm" @click="openLog(item.plan.id)">
            Log
          </UiButton>
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
      <UiButton variant="ghost" size="sm" @click="showCompleted = !showCompleted">
        Completed ({{ store.completedPlans.length }})
        <span class="learning__completed-arrow">{{ showCompleted ? '▲' : '▼' }}</span>
      </UiButton>
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
      <UiButton @click="openForm">
        <UiIcon name="Plus" :size="14" />
        Start a learning plan
      </UiButton>
    </div>

    <!-- Session log modal -->
    <SessionLogForm
      v-if="loggingPlan"
      :plan="loggingPlan"
      @submit="submitLog"
      @cancel="loggingPlanId = null"
    />

    <UiFab label="New plan" icon="BookOpen" @click="openForm" />
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

/* Emoji input — bespoke: 52px, center-aligned, emoji-size font */
.learning__input--emoji {
  width: 52px;
  text-align: center;
  font-size: 20px;
  flex-shrink: 0;
  padding: 6px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  outline: none;
  transition: border-color var(--t-fast);
}
.learning__input--emoji:focus { border-color: var(--color-accent); }

/* Number inputs — bespoke: type=number with specific sizing */
.learning__input--num {
  width: 76px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  font-size: var(--text-sm);
  color: var(--color-text);
  font-family: inherit;
  outline: none;
  transition: border-color var(--t-fast);
}
.learning__input--num:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 18%, transparent); }

/* AI toggle button — needs margin-left: auto to push to right of actions row */
.learning__ai-toggle { margin-left: auto; }

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

.learning__today-btn { /* shrink container used by UiButton */
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
.learning__completed-arrow { font-size: 10px; margin-left: 2px; }

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
  .learning { gap: 16px; }
  .learning__grid { grid-template-columns: 1fr; }
  .learning__form-meta { gap: 12px; }
  .learning__form-row { flex-direction: column; align-items: stretch; }
  .learning__title { font-size: var(--text-2xl, 22px); }
  .learning__today-list { overflow-x: auto; }
}
</style>
