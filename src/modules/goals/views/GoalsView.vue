<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useGoalsStore } from '../stores/goals.store'
import GoalCard from '../components/GoalCard.vue'
import type { GoalCategory } from '../types'
import { CATEGORY_EMOJI, CATEGORY_LABEL } from '../types'
import { UiIcon, UiFilterChips, UiButton, UiInput, UiSelect, UiField, UiFab } from '@/ui'
import type { FilterChipOption, SelectOption } from '@/ui'

const store = useGoalsStore()

// ── Create goal form ─────────────────────────────────────────────────
const showForm     = ref(false)
const formTitle    = ref('')
const formEmoji    = ref('🎯')
const formCategory = ref<GoalCategory>('skill')
const formTargetDate = ref('')
const titleRef = ref<InstanceType<typeof UiInput>>()

const CATEGORIES = (Object.keys(CATEGORY_EMOJI) as GoalCategory[]).map(val => ({
  val,
  label: `${CATEGORY_EMOJI[val]} ${CATEGORY_LABEL[val]}`,
}))

const categorySelectOptions = computed<SelectOption[]>(() =>
  CATEGORIES.map(c => ({ value: c.val, label: c.label }))
)

function openForm() {
  showForm.value = true
  nextTick(() => titleRef.value?.focus())
}

function cancelForm() {
  showForm.value = false
  formTitle.value = ''
  formEmoji.value = '🎯'
  formCategory.value = 'skill'
  formTargetDate.value = ''
}

function submitForm() {
  const title = formTitle.value.trim()
  if (!title) return
  store.createGoal({
    title,
    category: formCategory.value,
    coverEmoji: formEmoji.value.trim() || CATEGORY_EMOJI[formCategory.value],
    targetDate: formTargetDate.value || undefined,
  })
  cancelForm()
}

function onFormKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) submitForm()
  if (e.key === 'Escape') cancelForm()
}

// ── Filter ───────────────────────────────────────────────────────────
const showCompleted    = ref(false)
const activeCategory   = ref<GoalCategory | 'all'>('all')

const activeCategoriesInUse = computed<GoalCategory[]>(() => {
  const cats = new Set(store.activeGoals.map(g => g.category))
  return Array.from(cats)
})

const categoryOptions = computed<FilterChipOption[]>(() => [
  { value: 'all', label: 'All' },
  ...activeCategoriesInUse.value.map(cat => ({
    value: cat,
    label: `${CATEGORY_EMOJI[cat]} ${CATEGORY_LABEL[cat]}`,
  })),
])

const activeCategoryStr = computed({
  get: () => activeCategory.value as string,
  set: (v: string) => { activeCategory.value = v as GoalCategory | 'all' },
})

const filteredActiveGoals = computed(() => {
  if (activeCategory.value === 'all') return store.activeGoals
  return store.activeGoals.filter(g => g.category === activeCategory.value)
})

// ── Keyboard shortcut ────────────────────────────────────────────────
function onKeydown(e: KeyboardEvent) {
  if (showForm.value) return
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
  <div class="goals">

    <div class="goals__header">
      <div>
        <h1 class="goals__title">Goals</h1>
        <p class="goals__date">{{ todayLabel }}</p>
      </div>
      <UiButton @click="openForm">+ Add Goal</UiButton>
    </div>

    <!-- Create goal form -->
    <div v-if="showForm" class="goals__form" @keydown="onFormKeydown">
      <div class="goals__form-row">
        <!-- Emoji input — bespoke: 44px wide, center-aligned, 22px emoji font -->
        <input
          v-model="formEmoji"
          class="goals__input goals__input--emoji"
          maxlength="2"
          placeholder="🎯"
        />
        <UiInput
          ref="titleRef"
          v-model="formTitle"
          placeholder="What do you want to achieve?"
          :maxlength="100"
        />
      </div>

      <div class="goals__form-meta">
        <UiField label="Category" field-id="goal-cat">
          <UiSelect v-model="formCategory" :options="categorySelectOptions" />
        </UiField>
        <UiField label="Target date" hint="optional" field-id="goal-date">
          <UiInput v-model="formTargetDate" type="date" />
        </UiField>
      </div>

      <div class="goals__form-actions">
        <UiButton @click="submitForm">Add Goal</UiButton>
        <UiButton variant="ghost" @click="cancelForm">Cancel</UiButton>
      </div>
    </div>

    <!-- Category filter bar -->
    <UiFilterChips
      v-if="activeCategoriesInUse.length > 1"
      v-model="activeCategoryStr"
      :options="categoryOptions"
      variant="pills"
    />

    <!-- Active goals grid -->
    <div v-if="filteredActiveGoals.length > 0" class="goals__grid">
      <GoalCard
        v-for="goal in filteredActiveGoals"
        :key="goal.id"
        :goal="goal"
      />
    </div>
    <div v-else-if="store.activeGoals.length > 0 && filteredActiveGoals.length === 0" class="goals__cat-empty">
      No goals in this category.
    </div>

    <!-- Completed goals -->
    <div v-if="store.completedGoals.length > 0" class="goals__completed">
      <UiButton variant="ghost" size="sm" @click="showCompleted = !showCompleted">
        Completed ({{ store.completedGoals.length }})
        <span class="goals__completed-arrow">{{ showCompleted ? '▲' : '▼' }}</span>
      </UiButton>
      <div v-if="showCompleted" class="goals__completed-list">
        <GoalCard
          v-for="goal in store.completedGoals"
          :key="goal.id"
          :goal="goal"
        />
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="store.activeGoals.length === 0 && !showForm" class="goals__empty">
      <div class="goals__empty-icon">
        <UiIcon name="Target" :size="40" :stroke-width="1.4" />
      </div>
      <p class="goals__empty-title">No active goals yet.</p>
      <p class="goals__empty-sub">
        Set the north star. What do you want to achieve this year? Break it into milestones and make it real.
      </p>
      <UiButton @click="openForm">
        <UiIcon name="Plus" :size="14" />
        Add first goal
      </UiButton>
    </div>

    <UiFab label="New goal" icon="Target" @click="openForm" />
  </div>
</template>

<style scoped>
.goals {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.goals__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.goals__title { font-size: var(--text-3xl); font-weight: 700; margin: 0; color: var(--color-text); }
.goals__date { font-size: var(--text-sm); color: var(--color-text-muted); margin: 4px 0 0; }

/* Form */
.goals__form {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.goals__form-row { display: flex; gap: 10px; align-items: center; }
.goals__form-meta { display: flex; gap: 20px; align-items: flex-end; flex-wrap: wrap; }

.goals__form-actions { display: flex; gap: 10px; }

/* Emoji input — bespoke: 44px wide, emoji-size font, center-aligned */
.goals__input--emoji {
  width: 52px;
  flex-shrink: 0;
  text-align: center;
  font-size: 20px;
  padding: 6px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  outline: none;
  transition: border-color var(--t-fast);
}
.goals__input--emoji:focus { border-color: var(--color-accent); }

.goals__cat-empty {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  padding: 24px 0;
  text-align: center;
}

/* Grid */
.goals__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 18px;
}

/* Completed */
.goals__completed-arrow { font-size: 10px; margin-left: 4px; }

.goals__completed-list {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

/* Empty */
.goals__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 64px 20px;
  text-align: center;
}

.goals__empty-icon { color: var(--color-accent); opacity: 0.5; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; }
.goals__empty-title { font-size: var(--text-lg); font-weight: 600; color: var(--color-text); margin: 4px 0 0; }
.goals__empty-sub { font-size: var(--text-sm); color: var(--color-text-muted); margin: 0 0 10px; max-width: 360px; }

@media (max-width: 767px) {
  .goals { gap: 20px; }
  .goals__grid, .goals__completed-list { grid-template-columns: 1fr; }
  .goals__title { font-size: var(--text-2xl, 22px); }

  .goals__form { padding: 16px; gap: 12px; }
  .goals__form-row { flex-direction: row; gap: 8px; }
  .goals__form-meta { flex-direction: column; gap: 10px; align-items: stretch; }
  .goals__form-actions { flex-wrap: wrap; gap: 8px; }
  .goals__form-actions > * { flex: 1; min-width: 120px; }
}
</style>
