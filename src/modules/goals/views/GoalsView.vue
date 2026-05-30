<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useGoalsStore } from '../stores/goals.store'
import GoalCard from '../components/GoalCard.vue'
import type { GoalCategory } from '../types'
import { CATEGORY_EMOJI, CATEGORY_LABEL } from '../types'
import { UiIcon } from '@/ui'

const store = useGoalsStore()

// ── Create goal form ─────────────────────────────────────────────────
const showForm = ref(false)
const formTitle = ref('')
const formEmoji = ref('🎯')
const formCategory = ref<GoalCategory>('skill')
const formTargetDate = ref('')
const titleRef = ref<HTMLInputElement>()

const CATEGORIES: { val: GoalCategory; label: string }[] = [
  { val: 'career', label: '💼 Career' },
  { val: 'health', label: '🏃 Health' },
  { val: 'skill', label: '🎯 Skill' },
  { val: 'personal', label: '🌱 Personal' },
  { val: 'financial', label: '💰 Financial' },
  { val: 'project', label: '🚀 Project' },
  { val: 'other', label: '⭐ Other' },
]

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
const showCompleted = ref(false)
const activeCategory = ref<GoalCategory | 'all'>('all')

const activeCategoriesInUse = computed<GoalCategory[]>(() => {
  const cats = new Set(store.activeGoals.map(g => g.category))
  return Array.from(cats)
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
      <button class="goals__add-btn" @click="openForm">+ Add Goal</button>
    </div>

    <!-- Create goal form -->
    <div v-if="showForm" class="goals__form" @keydown="onFormKeydown">
      <div class="goals__form-row">
        <input
          v-model="formEmoji"
          class="goals__input goals__input--emoji"
          maxlength="2"
          placeholder="🎯"
        />
        <input
          v-model="formTitle"
          ref="titleRef"
          class="goals__input goals__input--grow"
          placeholder="What do you want to achieve?"
          maxlength="100"
        />
      </div>

      <div class="goals__form-meta">
        <div class="goals__form-field">
          <span class="goals__form-label">Category</span>
          <select v-model="formCategory" class="goals__input goals__input--select">
            <option v-for="c in CATEGORIES" :key="c.val" :value="c.val">{{ c.label }}</option>
          </select>
        </div>
        <div class="goals__form-field">
          <span class="goals__form-label">Target date <span class="goals__form-opt">optional</span></span>
          <input
            v-model="formTargetDate"
            type="date"
            class="goals__input goals__input--date"
          />
        </div>
      </div>

      <div class="goals__form-actions">
        <button class="goals__btn goals__btn--primary" @click="submitForm">Add Goal</button>
        <button class="goals__btn goals__btn--ghost" @click="cancelForm">Cancel</button>
      </div>
    </div>

    <!-- Category filter bar (shown when 2+ categories in use) -->
    <div v-if="activeCategoriesInUse.length > 1" class="goals__cats">
      <button
        class="goals__cat"
        :class="{ 'goals__cat--active': activeCategory === 'all' }"
        @click="activeCategory = 'all'"
      >All</button>
      <button
        v-for="cat in activeCategoriesInUse"
        :key="cat"
        class="goals__cat"
        :class="{ 'goals__cat--active': activeCategory === cat }"
        @click="activeCategory = cat"
      >{{ CATEGORY_EMOJI[cat] }} {{ CATEGORY_LABEL[cat] }}</button>
    </div>

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
      <button class="goals__completed-toggle" @click="showCompleted = !showCompleted">
        Completed ({{ store.completedGoals.length }})
        <span class="goals__completed-arrow">{{ showCompleted ? '▲' : '▼' }}</span>
      </button>
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
      <button class="goals__btn goals__btn--primary" @click="openForm">
        <UiIcon name="Plus" :size="14" />
        Add first goal
      </button>
    </div>

  </div>
</template>

<style scoped>
.goals {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.goals__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.goals__title { font-size: var(--text-3xl); font-weight: 700; margin: 0; color: var(--color-text); }
.goals__date { font-size: var(--text-sm); color: var(--color-text-muted); margin: 4px 0 0; }

.goals__add-btn {
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

.goals__add-btn:hover { background: var(--color-accent-hover); }

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

.goals__form-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.goals__form-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-weight: 500;
  display: flex;
  gap: 4px;
  align-items: center;
}

.goals__form-opt { font-weight: 400; }
.goals__form-actions { display: flex; gap: 10px; }

.goals__input {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 9px 12px;
  font-size: var(--text-sm);
  color: var(--color-text);
  font-family: inherit;
  transition: border-color var(--t-fast);
}

.goals__input:focus { outline: none; border-color: var(--color-accent); }
.goals__input--emoji { width: 52px; text-align: center; font-size: 20px; padding: 9px 6px; flex-shrink: 0; }
.goals__input--grow { flex: 1; min-width: 0; }
.goals__input--select { min-width: 160px; appearance: auto; }
.goals__input--date { width: 160px; }

.goals__btn {
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

.goals__btn--primary { background: var(--color-accent); color: #fff; border-color: var(--color-accent); }
.goals__btn--primary:hover { background: var(--color-accent-hover); }
.goals__btn--ghost { background: transparent; color: var(--color-text-secondary); border-color: var(--color-border); }
.goals__btn--ghost:hover { color: var(--color-text); }

/* Category filter */
.goals__cats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.goals__cat {
  padding: 5px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--t-fast);
}

.goals__cat:hover:not(.goals__cat--active) {
  background: var(--color-surface-elevated);
  color: var(--color-text);
}

.goals__cat--active {
  background: var(--color-accent-muted);
  border-color: var(--color-accent);
  color: var(--color-accent);
  font-weight: 500;
}

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
  gap: 16px;
}

/* Completed */
.goals__completed-toggle {
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

.goals__completed-toggle:hover { color: var(--color-text-secondary); }
.goals__completed-arrow { font-size: 10px; }

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
}
</style>
