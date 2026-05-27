<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import type { Habit } from '../types'
import { computeStreak, todayStr } from '../types'
import { useLocale, pluralRu } from '@/core/i18n'
import HabitHeatmap from './HabitHeatmap.vue'

const props = defineProps<{
  habit: Habit
  doneToday: boolean
}>()

const emit = defineEmits<{
  toggle: [id: string]
  delete: [id: string]
  update: [id: string, name: string]
}>()

const i18n = useLocale()

// ── Computed ──────────────────────────────────────────────────────────
const streak = computed(() => computeStreak(props.habit.completedDates))
const totalDays = computed(() => props.habit.completedDates.filter(d => d <= todayStr()).length)

const streakLabel = computed(() => {
  const n = streak.value
  if (n === 0) return i18n.t('habits.streakNone')
  if (i18n.locale === 'ru') return `🔥 ${pluralRu(n, 'день', 'дня', 'дней')}`
  return `🔥 ${n} day${n === 1 ? '' : 's'}`
})

const totalLabel = computed(() =>
  i18n.t('habits.total', { n: totalDays.value })
)

const todayFormatted = computed(() =>
  new Date().toLocaleDateString(i18n.localeCode, { weekday: 'short', day: 'numeric', month: 'short' })
)

// ── Inline edit ───────────────────────────────────────────────────────
const editing = ref(false)
const editName = ref('')
const editInput = ref<HTMLInputElement>()

async function startEdit() {
  editName.value = props.habit.name
  editing.value = true
  await nextTick()
  editInput.value?.select()
}

function saveEdit() {
  if (editName.value.trim()) {
    emit('update', props.habit.id, editName.value.trim())
  }
  editing.value = false
}

function cancelEdit() {
  editing.value = false
}

function onEditKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); saveEdit() }
  if (e.key === 'Escape') { e.preventDefault(); cancelEdit() }
}

// ── Confirm delete ────────────────────────────────────────────────────
const confirming = ref(false)
let confirmTimer: ReturnType<typeof setTimeout> | null = null

function askConfirm() {
  confirming.value = true
  confirmTimer = setTimeout(() => { confirming.value = false }, 4000)
}

function confirmDelete() {
  if (confirmTimer) clearTimeout(confirmTimer)
  confirming.value = false
  emit('delete', props.habit.id)
}

function cancelConfirm() {
  if (confirmTimer) clearTimeout(confirmTimer)
  confirming.value = false
}
</script>

<template>
  <div class="habit-card" :class="{ 'habit-card--done': doneToday }">
    <div class="habit-card__top">
      <div class="habit-card__identity">
        <span class="habit-card__emoji">{{ habit.emoji }}</span>

        <div class="habit-card__info">
          <!-- Edit mode -->
          <input
            v-if="editing"
            ref="editInput"
            v-model="editName"
            class="habit-card__edit-input"
            :placeholder="i18n.t('habits.editPlaceholder')"
            maxlength="60"
            @keydown="onEditKeydown"
            @blur="saveEdit"
          />
          <!-- Display mode -->
          <span
            v-else
            class="habit-card__name"
            :title="i18n.t('habits.editPlaceholder')"
            @click="startEdit"
          >{{ habit.name }}</span>

          <div class="habit-card__meta">
            <span :class="['habit-card__streak', streak === 0 ? 'habit-card__streak--zero' : '']">
              {{ streakLabel }}
            </span>
            <span class="habit-card__total">{{ totalLabel }}</span>
          </div>
        </div>
      </div>

      <div class="habit-card__actions">
        <!-- Confirm delete state -->
        <template v-if="confirming">
          <span class="habit-card__confirm-label">{{ i18n.t('habits.deleteConfirm') }}</span>
          <button class="habit-card__confirm-yes" @click="confirmDelete">
            {{ i18n.t('habits.deleteYes') }}
          </button>
          <button class="habit-card__confirm-no" @click="cancelConfirm">
            {{ i18n.t('habits.deleteNo') }}
          </button>
        </template>

        <!-- Normal state -->
        <template v-else>
          <button
            class="habit-card__toggle"
            :class="{ 'habit-card__toggle--done': doneToday }"
            :title="`${doneToday ? i18n.t('habits.toggleDoneTitle') : i18n.t('habits.toggleTodoTitle')} (${todayFormatted})`"
            @click="emit('toggle', habit.id)"
          >
            <svg v-if="doneToday" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3.5 9.5l3.5 3.5 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
          <button
            class="habit-card__delete"
            :title="i18n.t('habits.deleteConfirm')"
            @click="askConfirm"
          >×</button>
        </template>
      </div>
    </div>

    <div class="habit-card__heatmap">
      <HabitHeatmap :completed-dates="habit.completedDates" :weeks="16" />
    </div>
  </div>
</template>

<style scoped>
.habit-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 18px 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: border-color var(--t-fast);
}

.habit-card--done {
  border-color: color-mix(in srgb, var(--color-accent) 40%, var(--color-border));
}

.habit-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.habit-card__identity {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex: 1;
}

.habit-card__emoji {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
  user-select: none;
}

.habit-card__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}

.habit-card__name {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: text;
  border-radius: var(--radius-xs);
  padding: 1px 3px;
  margin: -1px -3px;
  transition: background var(--t-fast);
}
.habit-card__name:hover {
  background: var(--color-surface-elevated);
}

.habit-card__edit-input {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
  background: var(--color-surface-elevated);
  border: 1.5px solid var(--color-accent);
  border-radius: var(--radius-xs);
  padding: 2px 6px;
  outline: none;
  width: 100%;
  font-family: inherit;
}

.habit-card__meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.habit-card__streak {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.habit-card__streak--zero {
  color: var(--color-text-muted);
  font-weight: 400;
}

.habit-card__total {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}

/* Actions */
.habit-card__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* Confirm delete inline */
.habit-card__confirm-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.habit-card__confirm-yes {
  padding: 4px 10px;
  border-radius: var(--radius-xs);
  font-size: 12px;
  font-weight: 600;
  background: var(--color-danger);
  color: #fff;
  cursor: pointer;
  transition: opacity var(--t-fast);
}
.habit-card__confirm-yes:hover { opacity: 0.85; }

.habit-card__confirm-no {
  padding: 4px 10px;
  border-radius: var(--radius-xs);
  font-size: 12px;
  font-weight: 500;
  border: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background var(--t-fast);
}
.habit-card__confirm-no:hover { background: var(--color-border); }

/* Toggle button */
.habit-card__toggle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--color-border);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--t-fast);
  background: var(--color-surface-elevated);
}

.habit-card__toggle:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: var(--color-accent-muted);
}

.habit-card__toggle--done {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.habit-card__toggle--done:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
  color: #fff;
}

/* Delete button */
.habit-card__delete {
  font-size: 18px;
  line-height: 1;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  opacity: 0;
  transition: opacity var(--t-fast), color var(--t-fast), background var(--t-fast);
  cursor: pointer;
}

.habit-card:hover .habit-card__delete { opacity: 1; }
.habit-card__delete:hover {
  color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 12%, transparent);
}

.habit-card__heatmap {
  overflow-x: auto;
  padding-bottom: 2px;
}
</style>
