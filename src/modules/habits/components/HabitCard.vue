<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import type { Habit } from '../types'
import { computeStreak, computeBestStreak, habitAge, HABIT_CATEGORY_META, todayStr } from '../types'
import { useLocale, pluralRu } from '@/core/i18n'
import HabitHeatmap from './HabitHeatmap.vue'
import HabitCardCalendar from './HabitCardCalendar.vue'
import HabitCardLinks from './HabitCardLinks.vue'
import { UiIcon } from '@/ui'
import { useHabitsStore } from '../stores/habits.store'
import { useConfirm } from '@/core/composables/useConfirm'

const props = defineProps<{
  habit: Habit
  doneToday: boolean
  gridYear?: number
  gridMonth?: number
}>()

const emit = defineEmits<{
  toggle: [id: string]
  delete: [id: string]
  update: [id: string, name: string]
}>()

const i18n = useLocale()

// ── Computed ──────────────────────────────────────────────────────────
const streak     = computed(() => computeStreak(props.habit.completedDates, props.habit.skippedDates))
const bestStreak = computed(() => computeBestStreak(props.habit.completedDates))
const age        = computed(() => habitAge(props.habit.createdAt))
const totalDays  = computed(() => props.habit.completedDates.filter(d => d <= todayStr()).length)
const categoryMeta = computed(() => props.habit.category ? HABIT_CATEGORY_META[props.habit.category] : null)

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

// ── Check-in note (today only) ────────────────────────────────────────
const showNoteInput = ref(false)
const noteText      = ref('')
const noteInputRef  = ref<HTMLInputElement>()
const today         = todayStr()

const todayNote = computed(() => props.habit.checkNotes?.[today] ?? '')

function onToggleClick() {
  emit('toggle', props.habit.id)
  // If marking done (currently not done), show note prompt
  if (!props.doneToday) {
    showNoteInput.value = true
    noteText.value = todayNote.value
    nextTick(() => noteInputRef.value?.focus())
    // Auto-dismiss after 6s if no input
    setTimeout(() => { if (!noteText.value.trim()) showNoteInput.value = false }, 6000)
  } else {
    showNoteInput.value = false
  }
}

function saveNote() {
  habitsStore.setCheckNote(props.habit.id, today, noteText.value)
  showNoteInput.value = false
}

function onNoteKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); saveNote() }
  if (e.key === 'Escape') { showNoteInput.value = false }
}

// ── At-risk: streak > 2 but not yet done today ────────────────────────
const isAtRisk = computed(() =>
  !props.doneToday && computeStreak(props.habit.completedDates) > 2,
)

// ── Retroactive past-days calendar ───────────────────────────────────
const showPastDays = ref(false)

// ── Inline edit (name) ────────────────────────────────────────────────
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

// ── Inline edit (purpose) ─────────────────────────────────────────────
const editingPurpose = ref(false)
const editPurpose    = ref('')
const editPurposeInput = ref<HTMLInputElement>()

async function startPurposeEdit() {
  editPurpose.value = props.habit.purpose ?? ''
  editingPurpose.value = true
  await nextTick()
  editPurposeInput.value?.select()
}

function savePurposeEdit() {
  habitsStore.updateHabit(props.habit.id, props.habit.name, props.habit.emoji, editPurpose.value)
  editingPurpose.value = false
}

function cancelPurposeEdit() {
  editingPurpose.value = false
}

function onPurposeKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') { e.preventDefault(); savePurposeEdit() }
  if (e.key === 'Escape') { e.preventDefault(); cancelPurposeEdit() }
}

// ── Confirm delete ────────────────────────────────────────────────────
const { confirm } = useConfirm()

async function askConfirm() {
  const ok = await confirm({
    title:        `Delete "${props.habit.name}"?`,
    body:         'All streak data and check-in history will be lost.',
    danger:       true,
    confirmLabel: 'Delete habit',
  })
  if (ok) emit('delete', props.habit.id)
}

const habitsStore = useHabitsStore()
</script>

<template>
  <div class="habit-card" :class="{ 'habit-card--done': doneToday }">

    <!-- ── Main body row (info left + heatmap right on desktop) ──── -->
    <div class="habit-card__body">

      <!-- Left: identity + stats + actions -->
      <div class="habit-card__left">
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

            <!-- Purpose (why) — inline editable -->
            <input
              v-if="editingPurpose"
              ref="editPurposeInput"
              v-model="editPurpose"
              class="habit-card__purpose-input"
              placeholder="Why are you building this habit?"
              maxlength="120"
              @keydown="onPurposeKeydown"
              @blur="savePurposeEdit"
            />
            <span
              v-else-if="habit.purpose"
              class="habit-card__purpose"
              title="Click to edit your why"
              @click="startPurposeEdit"
            >{{ habit.purpose }}</span>
            <span
              v-else
              class="habit-card__purpose habit-card__purpose--empty"
              title="Add your why"
              @click="startPurposeEdit"
            >+ Add why…</span>

            <div class="habit-card__meta">
              <span :class="['habit-card__streak', streak === 0 ? 'habit-card__streak--zero' : '']">
                {{ streakLabel }}
              </span>
              <!-- Best streak (shown only if better than current) -->
              <span
                v-if="bestStreak > streak && bestStreak > 0"
                class="habit-card__best"
                :title="`All-time best: ${bestStreak} days`"
              >Best {{ bestStreak }}</span>
              <span class="habit-card__total">{{ totalLabel }}</span>
              <!-- Age -->
              <span v-if="age >= 7" class="habit-card__age" title="Days since you created this habit">
                Day {{ age }}
              </span>
              <!-- Category badge -->
              <span
                v-if="categoryMeta"
                class="habit-card__cat-badge"
                :style="{ '--cat': categoryMeta.color }"
                :title="categoryMeta.label"
              >{{ categoryMeta.icon }}</span>
            </div>

            <!-- Check-in note input (appears after marking done today) -->
            <Transition name="note-in">
              <div v-if="showNoteInput" class="habit-card__note-wrap">
                <input
                  ref="noteInputRef"
                  v-model="noteText"
                  class="habit-card__note-input"
                  placeholder="Add a note… (optional, Enter to save)"
                  maxlength="120"
                  @keydown="onNoteKeydown"
                  @blur="saveNote"
                />
              </div>
            </Transition>
            <!-- Show saved today's note (when not in edit mode) -->
            <span
              v-if="!showNoteInput && todayNote"
              class="habit-card__today-note"
              :title="todayNote"
              @click="showNoteInput = true; noteText = todayNote; nextTick(() => noteInputRef?.focus())"
            >💬 {{ todayNote }}</span>
          </div>
        </div>

        <div class="habit-card__actions">
          <!-- At-risk badge -->
          <span
            v-if="isAtRisk"
            class="habit-card__at-risk"
            title="Streak at risk — check in today!"
          >⚠️</span>

          <!-- Past days toggle -->
          <button
            class="habit-card__past-btn"
            :class="{ 'habit-card__past-btn--active': showPastDays }"
            title="Edit past days"
            @click="showPastDays = !showPastDays"
          >
            <UiIcon name="CalendarDays" :size="14" :stroke-width="1.75" />
          </button>

          <button
            class="habit-card__toggle"
            :class="{ 'habit-card__toggle--done': doneToday }"
            :title="`${doneToday ? i18n.t('habits.toggleDoneTitle') : i18n.t('habits.toggleTodoTitle')} (${todayFormatted})`"
            @click="onToggleClick"
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
        </div>
      </div>

      <!-- Right: heatmap -->
      <div class="habit-card__heatmap">
        <HabitHeatmap :completed-dates="habit.completedDates" :weeks="16" />
      </div>

    </div>

    <!-- ── Past days calendar (retroactive check-ins) ──────────────── -->
    <Transition name="past-days">
      <HabitCardCalendar
        v-if="showPastDays"
        :habit="habit"
        :done-today="doneToday"
        :grid-year="gridYear"
        :grid-month="gridMonth"
        @toggle="emit('toggle', $event)"
      />
    </Transition>

    <!-- ── Connected to (full-width footer) ────────────────────────── -->
    <HabitCardLinks :habit="habit" />
  </div>
</template>

<style scoped>
.habit-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
  overflow: hidden;
  box-shadow: var(--shadow-1);
}

.habit-card--done {
  border-color: color-mix(in srgb, var(--color-accent) 40%, var(--color-border));
  box-shadow: var(--shadow-2);
}

/* ── Body row ───────────────────────────────────────────────── */
.habit-card__body {
  display: flex;
  flex-direction: column;
}

/* ── Left panel ─────────────────────────────────────────────── */
.habit-card__left {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px 16px;
}

.habit-card__identity {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  flex: 1;
}

.habit-card__emoji {
  font-size: 30px;
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

.habit-card__purpose {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.4;
  cursor: text;
  border-radius: var(--radius-xs);
  padding: 1px 3px;
  margin: -1px -3px;
  transition: background var(--t-fast), color var(--t-fast);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.habit-card__purpose:hover {
  background: var(--color-surface-elevated);
  color: var(--color-text-secondary);
}

.habit-card__purpose--empty {
  color: var(--color-text-muted);
  opacity: 0;
  font-style: italic;
  font-size: 11px;
  transition: opacity var(--t-fast), background var(--t-fast);
}
.habit-card:hover .habit-card__purpose--empty { opacity: 0.6; }
.habit-card__purpose--empty:hover { opacity: 1 !important; }

.habit-card__purpose-input {
  font-size: 12px;
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-xs);
  padding: 2px 6px;
  outline: none;
  width: 100%;
  font-family: inherit;
  font-style: italic;
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

.habit-card__best {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  opacity: 0.7;
}

.habit-card__age {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  opacity: 0.6;
}

.habit-card__cat-badge {
  font-size: 13px;
  line-height: 1;
  cursor: default;
  filter: drop-shadow(0 0 2px color-mix(in srgb, var(--cat, transparent) 40%, transparent));
}

/* Check-in note */
.habit-card__note-wrap {
  margin-top: 2px;
}

.habit-card__note-input {
  width: 100%;
  font-size: 12px;
  font-family: inherit;
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-xs);
  padding: 3px 8px;
  outline: none;
  font-style: italic;
}
.habit-card__note-input::placeholder { color: var(--color-text-muted); }

.habit-card__today-note {
  font-size: 11px;
  color: var(--color-text-muted);
  font-style: italic;
  cursor: text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  margin-top: 1px;
  transition: color var(--t-fast);
}
.habit-card__today-note:hover { color: var(--color-text-secondary); }

.note-in-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.note-in-leave-active { transition: opacity 0.1s ease; }
.note-in-enter-from   { opacity: 0; transform: translateY(-3px); }
.note-in-leave-to     { opacity: 0; }

/* Actions */
.habit-card__actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

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
  padding: 0 20px 14px;
  scrollbar-width: none;
}
.habit-card__heatmap::-webkit-scrollbar { display: none; }

/* ── At-risk badge ──────────────────────────────────────────────── */
.habit-card__at-risk {
  font-size: 15px;
  line-height: 1;
  animation: risk-pulse 2s ease-in-out infinite;
  cursor: default;
}

@keyframes risk-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.55; }
}

/* ── Past-days toggle button ────────────────────────────────────── */
.habit-card__past-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  opacity: 0;
  transition: opacity var(--t-fast), color var(--t-fast), border-color var(--t-fast), background var(--t-fast);
}
.habit-card:hover .habit-card__past-btn { opacity: 1; }
.habit-card__past-btn:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}
.habit-card__past-btn--active {
  opacity: 1 !important;
  color: var(--color-accent);
  border-color: var(--color-accent);
  background: var(--color-accent-muted);
}

/* Mobile: always show delete on touch + bump check target to 48px */
@media (max-width: 767px) {
  .habit-card__delete   { opacity: 0.5; }
  .habit-card__past-btn { opacity: 0.6; }
  .habit-card__heatmap  { padding: 0 16px 14px; }
  .habit-card__toggle   { width: 48px; height: 48px; }
}

@media (min-width: 900px) {
  /* On desktop: body switches to horizontal row */
  .habit-card__body {
    flex-direction: row;
    align-items: stretch;
  }

  /* Left panel — fixed width, vertical stack */
  .habit-card__left {
    flex: 0 0 300px;
    flex-direction: column;
    align-items: flex-start;
    padding: 22px 24px 20px;
    border-right: 1px solid var(--color-border);
    justify-content: space-between;
    gap: 14px;
  }

  .habit-card__identity {
    align-items: flex-start;
    flex: 1;
  }

  .habit-card__actions {
    align-self: flex-start;
  }

  /* Right panel — heatmap centered */
  .habit-card__heatmap {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px 24px;
  }

}

</style>
