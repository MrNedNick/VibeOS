<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useHabitsStore } from '../stores/habits.store'
import { useGoalsStore } from '@/modules/goals/stores/goals.store'
import { useLocale } from '@/core/i18n'
import { useAiInsight } from '@/core/composables/useAiInsight'
import HabitCard from '../components/HabitCard.vue'
import HabitEmojiPicker from '../components/HabitEmojiPicker.vue'
import { HABIT_CATEGORIES, HABIT_CATEGORY_META, computeStreak, computeBestStreak, todayStr } from '../types'
import type { HabitCategory } from '../types'
import { UiButton, UiIconButton, UiSelect, UiProgressBar, UiFab } from '@/ui'
import type { SelectOption } from '@/ui'

const HABIT_TEMPLATES: { name: string; emoji: string; purpose: string; category: HabitCategory }[] = [
  { name: 'Exercise', emoji: '💪', purpose: 'Stay active and energized', category: 'health' },
  { name: 'Read 15 min', emoji: '📖', purpose: 'Learn something new every day', category: 'learning' },
  { name: 'Drink 2L water', emoji: '💧', purpose: 'Stay hydrated', category: 'health' },
  { name: 'Meditate', emoji: '🧘', purpose: 'Clear my mind and reduce stress', category: 'health' },
  { name: 'No social media', emoji: '📵', purpose: 'Protect focus and mental health', category: 'productivity' },
]

const store = useHabitsStore()
const goalsStore = useGoalsStore()
const i18n = useLocale()

// ── Creation form ─────────────────────────────────────────────────────
const showForm    = ref(false)
const newName     = ref('')
const newEmoji    = ref('')
const newPurpose  = ref('')
const newCategory = ref<HabitCategory | undefined>(undefined)
const newGoalId   = ref('')
const nameInputRef = ref<HTMLInputElement>()

const goalOptions = computed<SelectOption[]>(() => [
  { value: '', label: '🎯 No goal' },
  ...goalsStore.activeGoals.map(g => ({ value: g.id, label: `${g.coverEmoji} ${g.title}` })),
])

// ── At-risk + weekly summary ──────────────────────────────────────────
const today = todayStr()

const atRiskHabits = computed(() =>
  store.habits.filter(h => {
    const s = computeStreak(h.completedDates, h.skippedDates)
    return s > 2 && !h.completedDates.includes(today)
  }),
)

const weeklySummary = computed(() => {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  if (!store.habits.length) return null
  const totalSlots = store.habits.length * 7
  const doneDays = days.reduce((acc, day) => {
    const done = store.habits.filter(h => h.completedDates.includes(day)).length
    return acc + done
  }, 0)
  const pct = Math.round((doneDays / totalSlots) * 100)
  const bestStreak = Math.max(...store.habits.map(h => computeStreak(h.completedDates, h.skippedDates)), 0)
  return { pct, doneDays, totalSlots, bestStreak }
})

const weeklyBarColor = computed((): 'success' | 'accent' | 'warning' => {
  if (!weeklySummary.value) return 'accent'
  const p = weeklySummary.value.pct
  return p >= 80 ? 'success' : p >= 50 ? 'accent' : 'warning'
})

// ── Category filter ───────────────────────────────────────────────────
type FilterMode = HabitCategory | 'all' | 'at-risk'
const activeCategory = ref<FilterMode>('all')

const categoriesInUse = computed<HabitCategory[]>(() => {
  const cats = new Set(store.habits.map(h => h.category).filter(Boolean) as HabitCategory[])
  return Array.from(cats)
})

const filteredHabits = computed(() => {
  if (activeCategory.value === 'at-risk') return atRiskHabits.value
  if (activeCategory.value === 'all') return store.habits
  return store.habits.filter(h => h.category === activeCategory.value)
})

// ── AI pattern insights (S12 T1) ──────────────────────────────────────
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const { result: aiInsight, loading: aiLoading, run: runInsight, dismiss: dismissInsight } = useAiInsight()

function last14Dates(): string[] {
  const out: string[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    out.push(d.toISOString().split('T')[0])
  }
  return out
}

function buildHabitsPrompt(): string {
  const dates = last14Dates()
  const lines = store.habits.map(h => {
    const cat   = h.category ? HABIT_CATEGORY_META[h.category].label : 'Uncategorised'
    const cur   = computeStreak(h.completedDates, h.skippedDates)
    const best  = computeBestStreak(h.completedDates)
    const doneSet = new Set(h.completedDates)
    const missedByDay: Record<string, number> = {}
    const totalByDay: Record<string, number> = {}
    for (const ds of dates) {
      const wd = WEEKDAYS[new Date(ds + 'T00:00:00').getDay()]
      totalByDay[wd] = (totalByDay[wd] ?? 0) + 1
      if (!doneSet.has(ds)) missedByDay[wd] = (missedByDay[wd] ?? 0) + 1
    }
    const missedDays = Object.keys(missedByDay)
      .filter(wd => missedByDay[wd] === totalByDay[wd])
      .join(', ') || 'none'
    const last14 = dates.map(ds => (doneSet.has(ds) ? '✓' : '·')).join('')
    return `- "${h.name}" [${cat}] · current streak ${cur}d, best ${best}d · last 14 days: ${last14} · always missed on: ${missedDays}`
  }).join('\n')

  return [
    'You are analysing a user\'s habit tracking data. Below are their habits with the last 14 days of check-ins (✓ = done, · = missed), current and best streaks, category, and weekdays they always miss.',
    '',
    lines,
    '',
    'Give 2-3 short insight bullets (one line each, start each with "- "). Only observations grounded strictly in the data above — point out consistently missed weekdays, strong categories, or habits done together. No generic advice, no preamble.',
  ].join('\n')
}

function askInsights(): void {
  if (!store.habits.length) return
  runInsight(buildHabitsPrompt())
}

// ── Milestone banner ──────────────────────────────────────────────────
const milestone = computed(() => store.milestoneHabit)

watch(milestone, (val) => {
  if (val) setTimeout(() => store.dismissMilestone(), 5000)
})

// ── Today label ───────────────────────────────────────────────────────
const todayLabel = computed(() =>
  new Date().toLocaleDateString(i18n.localeCode, {
    weekday: 'long', day: 'numeric', month: 'long',
  })
)

function openForm() {
  showForm.value = true
  newName.value = ''
  newEmoji.value = ''
  newPurpose.value = ''
  newCategory.value = undefined
  newGoalId.value = ''
  setTimeout(() => nameInputRef.value?.focus(), 50)
}

function submitForm() {
  if (!newName.value.trim()) return
  store.createHabit(newName.value, newEmoji.value, newPurpose.value || undefined, newCategory.value)
  if (newGoalId.value) {
    const created = store.habits[store.habits.length - 1]
    if (created) store.updateHabitLink(created.id, { linkedGoalId: newGoalId.value })
  }
  showForm.value = false
}

function cancelForm() { showForm.value = false }

function onFormKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') submitForm()
  if (e.key === 'Escape') cancelForm()
}

function onKeydown(e: KeyboardEvent) {
  if (showForm.value) return
  if (e.target instanceof HTMLInputElement) return
  if (e.key === 'n' || e.key === 'N') openForm()
}

// ── Drag-to-reorder ───────────────────────────────────────────────────
const draggingId = ref<string | null>(null)
const dragOverId = ref<string | null>(null)

function onDragStart(e: DragEvent, id: string) {
  draggingId.value = id
  if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', id) }
}
function onDragEnd() { draggingId.value = null; dragOverId.value = null }
function onDragOver(e: DragEvent, id: string) {
  e.preventDefault()
  if (draggingId.value && draggingId.value !== id) dragOverId.value = id
}
function onDrop(id: string) {
  if (draggingId.value && draggingId.value !== id) store.reorderHabits(draggingId.value, id)
  draggingId.value = null; dragOverId.value = null
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="habits">

    <!-- Milestone celebration banner -->
    <Transition name="milestone">
      <div v-if="milestone" class="habits__milestone" @click="store.dismissMilestone()">
        <span class="habits__milestone-emoji">{{ milestone.emoji }}</span>
        <div class="habits__milestone-text">
          <strong>{{ milestone.streak }}-day streak!</strong>
          <span>{{ milestone.name }} — keep it up 🎉</span>
        </div>
        <UiIconButton name="X" aria-label="Dismiss" size="sm" @click.stop="store.dismissMilestone()" />
      </div>
    </Transition>

    <div class="habits__header">
      <div>
        <h1 class="habits__title">{{ i18n.t('habits.title') }}</h1>
        <p class="habits__date">{{ todayLabel }}</p>
      </div>
      <div class="habits__header-actions">
        <UiButton
          v-if="store.habits.length > 0"
          variant="ghost"
          size="sm"
          :disabled="aiLoading"
          :title="aiLoading ? 'Thinking…' : 'AI: find patterns in your check-ins'"
          @click="askInsights"
        >{{ aiLoading ? '✦ …' : '✦ Patterns' }}</UiButton>
        <UiButton :title="i18n.t('habits.addBtn') + ' (N)'" @click="openForm">
          {{ i18n.t('habits.addBtn') }}
        </UiButton>
      </div>
    </div>

    <!-- AI pattern insights card -->
    <Transition name="ai-fade">
      <div v-if="aiInsight" class="habits__ai-card">
        <div class="habits__ai-head">
          <span class="habits__ai-label">✦ Pattern insights</span>
          <UiIconButton name="X" aria-label="Dismiss AI insights" size="sm" @click="dismissInsight" />
        </div>
        <p class="habits__ai-text">{{ aiInsight }}</p>
      </div>
    </Transition>

    <!-- New habit form -->
    <div v-if="showForm" class="habits__form" @keydown="onFormKeydown">
      <!-- Emoji picker replaces text input -->
      <HabitEmojiPicker v-model="newEmoji" class="habits__form-emoji" />
      <input
        v-model="newName"
        ref="nameInputRef"
        class="habits__form-name"
        :placeholder="i18n.t('habits.namePlaceholder')"
        maxlength="60"
      />
      <input
        v-model="newPurpose"
        class="habits__form-purpose"
        placeholder="Why? (optional)"
        maxlength="120"
      />
      <!-- Category chips — bespoke: per-category color via --cat CSS var, toggle-to-deselect -->
      <div class="habits__form-cats">
        <span class="habits__form-cat-label">Category:</span>
        <button
          v-for="cat in HABIT_CATEGORIES"
          :key="cat"
          class="habits__form-cat"
          :class="{ 'habits__form-cat--active': newCategory === cat }"
          :style="newCategory === cat ? { '--cat': HABIT_CATEGORY_META[cat].color } : {}"
          @click="newCategory = newCategory === cat ? undefined : cat"
        >
          {{ HABIT_CATEGORY_META[cat].icon }} {{ HABIT_CATEGORY_META[cat].label }}
        </button>
      </div>
      <!-- Goal link -->
      <div v-if="goalsStore.activeGoals.length" class="habits__form-goal-wrap">
        <UiSelect
          v-model="newGoalId"
          size="sm"
          :options="goalOptions"
          title="Link this habit to a goal (optional)"
        />
      </div>
      <div class="habits__form-actions">
        <UiButton size="sm" @click="submitForm">{{ i18n.t('habits.formSave') }}</UiButton>
        <UiButton variant="ghost" size="sm" @click="cancelForm">{{ i18n.t('habits.formCancel') }}</UiButton>
      </div>
    </div>

    <!-- Weekly summary card -->
    <div v-if="store.habits.length > 0 && weeklySummary" class="habits__weekly">
      <div class="habits__weekly-stat">
        <span class="habits__weekly-value">{{ weeklySummary.pct }}%</span>
        <span class="habits__weekly-label">last 7 days</span>
      </div>
      <div class="habits__weekly-bar-wrap">
        <UiProgressBar :value="weeklySummary.pct" :height="6" :color="weeklyBarColor" />
      </div>
      <div class="habits__weekly-right">
        <span class="habits__weekly-done">{{ weeklySummary.doneDays }}/{{ weeklySummary.totalSlots }} check-ins</span>
        <span v-if="weeklySummary.bestStreak > 0" class="habits__weekly-streak">🔥 Best streak: {{ weeklySummary.bestStreak }}</span>
      </div>
    </div>

    <!-- Category filter chips — bespoke: per-category color + at-risk special chip -->
    <div v-if="categoriesInUse.length > 1 || atRiskHabits.length > 0" class="habits__cats">
      <button
        class="habits__cat"
        :class="{ 'habits__cat--active': activeCategory === 'all' }"
        @click="activeCategory = 'all'"
      >All</button>
      <button
        v-if="atRiskHabits.length > 0"
        class="habits__cat habits__cat--risk"
        :class="{ 'habits__cat--active': activeCategory === 'at-risk' }"
        @click="activeCategory = activeCategory === 'at-risk' ? 'all' : 'at-risk'"
      >⚠️ At risk ({{ atRiskHabits.length }})</button>
      <button
        v-for="cat in categoriesInUse"
        :key="cat"
        class="habits__cat"
        :class="{ 'habits__cat--active': activeCategory === cat }"
        :style="activeCategory === cat ? { '--cat': HABIT_CATEGORY_META[cat].color } : {}"
        @click="activeCategory = activeCategory === cat ? 'all' : cat"
      >
        {{ HABIT_CATEGORY_META[cat].icon }} {{ HABIT_CATEGORY_META[cat].label }}
      </button>
    </div>

    <!-- Habit cards -->
    <div v-if="filteredHabits.length > 0" class="habits__grid">
      <div
        v-for="habit in filteredHabits"
        :key="habit.id"
        class="habits__drag-row"
        :class="{
          'habits__drag-row--dragging': draggingId === habit.id,
          'habits__drag-row--over':    dragOverId === habit.id,
        }"
        draggable="true"
        @dragstart="onDragStart($event, habit.id)"
        @dragend="onDragEnd"
        @dragover="onDragOver($event, habit.id)"
        @drop.prevent="onDrop(habit.id)"
      >
        <span class="habits__drag-handle" title="Drag to reorder">⠿</span>
        <HabitCard
          :habit="habit"
          :done-today="store.isCompletedToday(habit.id)"
          class="habits__card-inner"
          @toggle="store.toggleToday"
          @delete="store.deleteHabit"
          @update="store.updateHabit"
        />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!showForm" class="habits__empty">
      <div class="habits__empty-icon">📋</div>
      <p class="habits__empty-title">{{ i18n.t('habits.emptyTitle') }}</p>
      <p class="habits__empty-sub">{{ i18n.t('habits.emptySub') }}</p>
      <UiButton class="habits__empty-cta" @click="openForm">{{ i18n.t('habits.emptyBtn') }}</UiButton>

      <div class="habits__templates">
        <p class="habits__templates-label">Or start with a template:</p>
        <div class="habits__templates-grid">
          <UiButton
            v-for="t in HABIT_TEMPLATES"
            :key="t.name"
            variant="ghost"
            @click="store.createHabit(t.name, t.emoji, t.purpose, t.category)"
          >
            <span class="habits__template-emoji">{{ t.emoji }}</span>
            <span class="habits__template-name">{{ t.name }}</span>
          </UiButton>
        </div>
      </div>
    </div>
    <UiFab label="New habit" icon="CheckSquare" @click="openForm" />
  </div>
</template>

<style scoped>
.habits {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Milestone banner */
.habits__milestone {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: linear-gradient(135deg,
    color-mix(in srgb, var(--color-accent) 15%, var(--color-surface)),
    color-mix(in srgb, var(--color-warning) 10%, var(--color-surface))
  );
  border: 1px solid color-mix(in srgb, var(--color-accent) 35%, var(--color-border));
  border-radius: var(--radius-lg);
  cursor: pointer;
}

.habits__milestone-emoji { font-size: 32px; flex-shrink: 0; line-height: 1; }
.habits__milestone-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.habits__milestone-text strong { font-size: 16px; font-weight: 700; color: var(--color-text); }
.habits__milestone-text span { font-size: 13px; color: var(--color-text-secondary); }

.milestone-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.milestone-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.milestone-enter-from   { opacity: 0; transform: translateY(-12px) scale(0.97); }
.milestone-leave-to     { opacity: 0; transform: translateY(-8px); }

.habits__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.habits__title { font-size: 27px; font-weight: 700; color: var(--color-text); margin: 0; }
.habits__date { font-size: 14px; color: var(--color-text-muted); margin: 4px 0 0; }
.habits__header-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

/* AI pattern insights card */
.habits__ai-card {
  background: color-mix(in srgb, var(--color-accent) 6%, var(--color-surface));
  border: 1px solid color-mix(in srgb, var(--color-accent) 25%, var(--color-border));
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: var(--shadow-1);
}
.habits__ai-head { display: flex; align-items: center; justify-content: space-between; }
.habits__ai-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-accent); }
.habits__ai-text { font-size: var(--text-sm); line-height: var(--leading-lg); color: var(--color-text-secondary); margin: 0; white-space: pre-line; }

.ai-fade-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.ai-fade-leave-active { transition: opacity 0.2s ease; }
.ai-fade-enter-from   { opacity: 0; transform: translateY(-8px); }
.ai-fade-leave-to     { opacity: 0; }

/* New habit form */
.habits__form {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  grid-template-rows: auto auto auto;
  align-items: center;
  gap: 8px 10px;
  padding: 14px 18px;
  background: var(--color-surface);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-lg);
}

.habits__form-emoji   { grid-row: 1; grid-column: 1; }
.habits__form-name    { grid-row: 1; grid-column: 2; }
.habits__form-purpose { grid-row: 2; grid-column: 2 / 5; }
.habits__form-cats    { grid-row: 3; grid-column: 1 / 4; }
.habits__form-goal-wrap { grid-row: 1; grid-column: 3; }
.habits__form-actions { grid-row: 1; grid-column: 4; display: flex; gap: 6px; flex-shrink: 0; }

/* Emoji picker wrapper in form grid */
.habits__form-emoji { display: flex; align-items: center; }

/* Bespoke inline name + purpose inputs — borderless, integrated into form grid */
.habits__form-name {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text);
  background: transparent;
  border: none;
  outline: none;
}
.habits__form-name::placeholder { color: var(--color-text-muted); }

.habits__form-purpose {
  font-size: 13px;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  outline: none;
  font-family: inherit;
}
.habits__form-purpose::placeholder { color: var(--color-text-muted); font-style: italic; }

.habits__form-cats {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.habits__form-cat-label { font-size: 11px; color: var(--color-text-muted); margin-right: 2px; }

/* Category chips — bespoke: per-category --cat CSS var, toggle-to-deselect */
.habits__form-cat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--t-fast);
}
.habits__form-cat:hover:not(.habits__form-cat--active) {
  background: var(--color-surface-elevated);
  color: var(--color-text-secondary);
}
.habits__form-cat--active {
  background: color-mix(in srgb, var(--cat, var(--color-accent)) 12%, transparent);
  border-color: color-mix(in srgb, var(--cat, var(--color-accent)) 40%, transparent);
  color: var(--cat, var(--color-accent));
}

/* Weekly summary */
.habits__weekly {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-1);
}

.habits__weekly-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 44px;
}

.habits__weekly-value {
  font-size: 20px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--color-text);
  line-height: 1;
}

.habits__weekly-label {
  font-size: 10px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 2px;
}

.habits__weekly-bar-wrap { flex: 1; }

.habits__weekly-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
}

.habits__weekly-done { font-size: 12px; font-family: var(--font-mono); color: var(--color-text-muted); }
.habits__weekly-streak { font-size: 12px; font-weight: 600; color: var(--color-warning); }

/* Category filter chips — bespoke: per-category --cat CSS var + at-risk special */
.habits__cats {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.habits__cat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--t-fast);
}
.habits__cat:hover:not(.habits__cat--active) {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}
.habits__cat--active {
  background: color-mix(in srgb, var(--cat, var(--color-accent)) 12%, transparent);
  border-color: color-mix(in srgb, var(--cat, var(--color-accent)) 40%, transparent);
  color: var(--cat, var(--color-accent));
}
.habits__cat--risk { border-color: color-mix(in srgb, var(--color-warning) 35%, var(--color-border)); }
.habits__cat--risk.habits__cat--active {
  background: color-mix(in srgb, var(--color-warning) 12%, transparent);
  border-color: var(--color-warning);
  color: var(--color-warning);
}

/* Grid + drag-to-reorder */
.habits__grid { display: flex; flex-direction: column; gap: 12px; }

.habits__drag-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  border-radius: var(--radius-lg);
  transition: opacity var(--t-fast), box-shadow var(--t-fast);
}
.habits__drag-row--dragging { opacity: 0.45; }
.habits__drag-row--over { box-shadow: 0 -3px 0 var(--color-accent); border-radius: 0; }

.habits__drag-handle {
  cursor: grab;
  color: var(--color-text-muted);
  font-size: 16px;
  line-height: 1;
  padding: 22px 2px 0;
  opacity: 0;
  transition: opacity var(--t-fast);
  user-select: none;
  flex-shrink: 0;
}
.habits__drag-row:hover .habits__drag-handle { opacity: 0.5; }
.habits__drag-handle:active { cursor: grabbing; opacity: 1; }

.habits__card-inner { flex: 1; min-width: 0; }

/* Empty state */
.habits__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 64px 0;
  text-align: center;
}

.habits__empty-icon { font-size: 40px; line-height: 1; }
.habits__empty-title { font-size: 19px; font-weight: 600; color: var(--color-text-secondary); margin: 0; }
.habits__empty-sub { font-size: 15px; color: var(--color-text-muted); margin: 0; max-width: 380px; line-height: var(--leading-lg); }
.habits__empty-cta { margin-top: 6px; }

.habits__templates { margin-top: 8px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.habits__templates-label { font-size: 13px; color: var(--color-text-muted); margin: 0; }
.habits__templates-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 480px;
}

.habits__template-emoji { font-size: 16px; line-height: 1; }
.habits__template-name { font-size: 13px; font-weight: 500; color: var(--color-text-secondary); }

@media (max-width: 767px) {
  .habits__header { flex-direction: column; gap: 12px; }
  .habits__form {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto auto auto;
  }
  .habits__form-emoji   { grid-row: 1; grid-column: 1; }
  .habits__form-name    { grid-row: 1; grid-column: 2; }
  .habits__form-purpose { grid-row: 2; grid-column: 1 / 3; }
  .habits__form-cats    { grid-row: 3; grid-column: 1 / 3; }
  .habits__form-goal-wrap { grid-row: 4; grid-column: 1 / 3; }
  .habits__form-actions { grid-row: 1; grid-column: 3; display: none; }
}
</style>
