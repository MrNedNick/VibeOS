<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGoalsStore } from '../stores/goals.store'
import { useTasksStore } from '@/modules/task-manager/stores/tasks.store'
import { useNotesStore } from '@/modules/notes/stores/notes.store'
import { deriveTitle } from '@/modules/notes/types'
import MilestoneList from '../components/MilestoneList.vue'
import { calcProgress, daysUntil, CATEGORY_LABEL } from '../types'
import { UiIcon, UiSectionLabel, UiProgressBar, UiButton, UiIconButton, UiInput, UiTextarea } from '@/ui'
import { useConfirm } from '@/core/composables/useConfirm'
import { aiComplete } from '@/core/composables/useAI'

const route = useRoute()
const router = useRouter()
const store = useGoalsStore()

const goalId = computed(() => route.params.id as string)
const goal = computed(() => store.getGoalById(goalId.value))

if (!goal.value) router.replace('/goals')

const progress = computed(() => goal.value ? calcProgress(goal.value) : 0)

const localNotes = ref(goal.value?.notes ?? '')
let notesTimer: ReturnType<typeof setTimeout> | null = null

watch(localNotes, (val) => {
  if (notesTimer) clearTimeout(notesTimer)
  notesTimer = setTimeout(() => { store.updateNotes(goalId.value, val) }, 600)
})

const dueDisplay = computed(() => {
  if (!goal.value?.targetDate) return null
  const days = daysUntil(goal.value.targetDate)
  if (days < 0) return { text: `${Math.abs(days)} days overdue`, overdue: true }
  if (days === 0) return { text: 'Due today', overdue: true }
  if (days === 1) return { text: 'Due tomorrow', overdue: false }
  return {
    text: `${days} days left · ${new Date(goal.value.targetDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
    overdue: false,
  }
})

const { confirm } = useConfirm()

// ── AI milestone suggestions ──────────────────────────────────────────
const suggestLoading = ref(false)
const suggestError   = ref<string | null>(null)
const suggestions    = ref<string[]>([])

async function suggestMilestones() {
  if (!goal.value) return
  suggestLoading.value = true
  suggestError.value   = null
  suggestions.value    = []

  const existing = goal.value.milestones.map(m => m.title)
  const existingNote = existing.length ? `Existing milestones: ${existing.join(', ')}. ` : ''
  const prompt = `I'm working on a goal: "${goal.value.title}" (category: ${goal.value.category}). ${existingNote}Suggest 5 specific, actionable milestones I can add. Reply ONLY with a bullet list, one per line, starting each with "- ".`

  try {
    const text = await aiComplete(prompt)
    suggestions.value = text
      .split('\n')
      .map(l => l.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '').trim())
      .filter(l => l.length > 3 && l.length < 150)
      .slice(0, 8)
    if (!suggestions.value.length) suggestError.value = 'No suggestions returned — try again'
  } catch {
    suggestError.value = 'Network error — check your connection'
  } finally {
    suggestLoading.value = false
  }
}

function addSuggestion(title: string) {
  store.addMilestone(goalId.value, title)
  suggestions.value = suggestions.value.filter(s => s !== title)
}

async function askComplete() {
  const ok = await confirm({
    title:        'Mark goal as complete?',
    body:         'This will archive the goal. You can view it in Completed.',
    confirmLabel: 'Complete goal',
  })
  if (ok) store.completeGoal(goalId.value)
}

async function askDelete() {
  const ok = await confirm({
    title:        `Delete "${goal.value?.title}"?`,
    body:         'All milestones and notes will be permanently removed.',
    danger:       true,
    confirmLabel: 'Delete goal',
  })
  if (ok) {
    store.deleteGoal(goalId.value)
    router.replace('/goals')
  }
}

// ── Linked notes ────────────────────────────────────────────────────
const notesStore = useNotesStore()
const linkedNotes = computed(() => notesStore.getNotesForGoal(goalId.value))

// ── Linked tasks ────────────────────────────────────────────────────
const tasksStore = useTasksStore()

const linkedTasks  = computed(() => tasksStore.tasks.filter(t => t.linkedGoalId === goalId.value))
const linkedActive = computed(() => linkedTasks.value.filter(t => !t.done))
const linkedDone   = computed(() => linkedTasks.value.filter(t => t.done))

const newTaskText  = ref('')
const taskInputRef = ref<InstanceType<typeof UiInput>>()
const showAddTask  = ref(false)

async function openAddTask() {
  showAddTask.value = true
  await nextTick()
  taskInputRef.value?.focus()
}

function submitTask() {
  const text = newTaskText.value.trim()
  if (!text) return
  tasksStore.addTask(text, 'none', undefined, 'goal', goalId.value)
  newTaskText.value = ''
}

function onTaskKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter')  { e.preventDefault(); submitTask() }
  if (e.key === 'Escape') { showAddTask.value = false }
}
</script>

<template>
  <div v-if="goal" class="gdetail">

    <div class="gdetail__nav">
      <UiButton variant="ghost" size="sm" @click="router.push('/goals')">
        <UiIcon name="ArrowLeft" :size="14" :stroke-width="2" />
        Goals
      </UiButton>
    </div>

    <div class="gdetail__header">
      <span class="gdetail__emoji">{{ goal.coverEmoji }}</span>
      <div class="gdetail__heading">
        <h1 class="gdetail__title">{{ goal.title }}</h1>
        <div class="gdetail__badges">
          <span class="gdetail__category">{{ CATEGORY_LABEL[goal.category] }}</span>
          <span
            v-if="dueDisplay"
            class="gdetail__due"
            :class="{ 'gdetail__due--overdue': dueDisplay.overdue }"
          >{{ dueDisplay.text }}</span>
          <span v-if="goal.status === 'completed'" class="gdetail__status-badge">✓ Completed</span>
        </div>
      </div>
      <span class="gdetail__pct">{{ progress }}%</span>
    </div>

    <UiProgressBar :value="progress" :height="6" />

    <!-- Milestones -->
    <div class="gdetail__section">
      <div class="gdetail__section-header">
        <UiSectionLabel>Milestones</UiSectionLabel>
        <UiButton variant="ghost" size="sm" :disabled="suggestLoading" @click="suggestMilestones">
          <span v-if="suggestLoading" class="gdetail__ai-spinner">◌</span>
          <span v-else>✦</span>
          {{ suggestLoading ? 'Thinking…' : 'Suggest' }}
        </UiButton>
      </div>
      <MilestoneList
        :milestones="goal.milestones"
        @toggle="store.toggleMilestone(goalId, $event)"
        @add="store.addMilestone(goalId, $event)"
        @delete="store.deleteMilestone(goalId, $event)"
      />
      <div v-if="suggestError" class="gdetail__suggest-error">{{ suggestError }}</div>
      <!-- AI suggestion chips — bespoke: dashed border, + prefix, multi-line layout -->
      <div v-if="suggestions.length > 0" class="gdetail__suggest-list">
        <button
          v-for="s in suggestions"
          :key="s"
          class="gdetail__suggest-chip"
          :title="'Add: ' + s"
          @click="addSuggestion(s)"
        >
          <span class="gdetail__suggest-plus">+</span>
          {{ s }}
        </button>
      </div>
    </div>

    <!-- Notes -->
    <div class="gdetail__section">
      <UiSectionLabel>Notes</UiSectionLabel>
      <UiTextarea
        v-model="localNotes"
        :rows="4"
        placeholder="Planning notes, context, ideas…"
      />
    </div>

    <!-- Linked tasks -->
    <div class="gdetail__tasks">
      <div class="gdetail__section-header">
        <UiSectionLabel>
          Tasks
          <span v-if="linkedTasks.length > 0" class="gdetail__tasks-count">
            {{ linkedActive.length }} active · {{ linkedDone.length }} done
          </span>
        </UiSectionLabel>
        <UiButton size="sm" @click="openAddTask">
          <UiIcon name="Plus" :size="13" />
          Add task
        </UiButton>
      </div>

      <Transition name="task-add">
        <div v-if="showAddTask" class="gdetail__task-input-row">
          <UiInput
            ref="taskInputRef"
            v-model="newTaskText"
            placeholder="Task description…"
            :maxlength="200"
            @keydown="onTaskKeydown"
          />
          <UiButton size="sm" :disabled="!newTaskText.trim()" @click="submitTask">Add</UiButton>
          <UiIconButton name="X" aria-label="Cancel add task" size="sm" @click="showAddTask = false" />
        </div>
      </Transition>

      <div v-if="linkedActive.length > 0" class="gdetail__task-list">
        <div
          v-for="task in linkedActive"
          :key="task.id"
          class="gdetail__task-row"
        >
          <!-- Circle check — bespoke: structural toggle, not a standard action button -->
          <button
            class="gdetail__task-check"
            title="Mark done"
            @click="tasksStore.toggleTask(task.id)"
          >
            <UiIcon name="Circle" :size="15" :stroke-width="1.75" />
          </button>
          <span class="gdetail__task-text">{{ task.text }}</span>
          <span v-if="task.dueDate" class="gdetail__task-due">{{ task.dueDate }}</span>
        </div>
      </div>

      <div v-if="linkedDone.length > 0" class="gdetail__task-done-row">
        <UiIcon name="CheckCircle2" :size="13" />
        {{ linkedDone.length }} completed task{{ linkedDone.length !== 1 ? 's' : '' }}
      </div>

      <p v-if="linkedTasks.length === 0 && !showAddTask" class="gdetail__tasks-empty">
        No tasks linked to this goal yet.
      </p>
    </div>

    <!-- Linked notes -->
    <div v-if="linkedNotes.length > 0" class="gdetail__notes-section">
      <div class="gdetail__section-header">
        <UiSectionLabel>
          Linked notes
          <span class="gdetail__tasks-count">{{ linkedNotes.length }}</span>
        </UiSectionLabel>
        <UiButton variant="ghost" size="sm" @click="router.push('/notes')">
          Open Notes →
        </UiButton>
      </div>
      <div class="gdetail__notes-list">
        <div
          v-for="note in linkedNotes"
          :key="note.id"
          class="gdetail__note-row"
          @click="router.push('/notes')"
        >
          <UiIcon name="FileText" :size="13" class="gdetail__note-icon" />
          <span class="gdetail__note-title">{{ deriveTitle(note.content) }}</span>
          <span class="gdetail__note-date">{{ new Date(note.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) }}</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="gdetail__actions">
      <!-- Complete button — bespoke: success color, not in UiButton variants -->
      <button v-if="goal.status === 'active'" class="gdetail__btn gdetail__btn--outline" @click="askComplete">
        Mark complete
      </button>
    </div>

    <!-- Danger zone -->
    <div class="gdetail__danger">
      <UiButton variant="danger" @click="askDelete">Delete goal</UiButton>
    </div>

  </div>
</template>

<style scoped>
.gdetail {
  max-width: var(--content-max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.gdetail__header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.gdetail__emoji { font-size: 44px; line-height: 1; flex-shrink: 0; margin-top: 2px; }
.gdetail__heading { flex: 1; min-width: 0; }

.gdetail__title {
  font-size: var(--text-3xl);
  font-weight: 700;
  margin: 0;
  color: var(--color-text);
  line-height: var(--leading-2xl);
}

.gdetail__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 6px;
}

.gdetail__category {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  padding: 2px 8px;
}

.gdetail__due { font-size: var(--text-sm); color: var(--color-text-secondary); }
.gdetail__due--overdue { color: var(--color-danger); }

.gdetail__status-badge {
  font-size: var(--text-xs);
  color: var(--color-success);
  background: var(--color-bg);
  border: 1px solid var(--color-success);
  border-radius: var(--radius-xs);
  padding: 2px 8px;
}

.gdetail__pct {
  font-size: var(--text-2xl, 22px);
  font-weight: 700;
  color: var(--color-accent);
  flex-shrink: 0;
}

.gdetail__section { display: flex; flex-direction: column; gap: 14px; }

.gdetail__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.gdetail__ai-spinner { display: inline-block; animation: spin-slow 1.2s linear infinite; }

.gdetail__suggest-error {
  font-size: var(--text-xs);
  color: var(--color-danger);
  padding: 4px 0;
}

/* AI suggestion chips — bespoke: dashed border, left-aligned text, + prefix icon */
.gdetail__suggest-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gdetail__suggest-chip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-surface);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: all var(--t-fast);
}
.gdetail__suggest-chip:hover {
  border-color: var(--color-accent);
  color: var(--color-text);
  background: var(--color-accent-muted);
}
.gdetail__suggest-plus {
  color: var(--color-accent);
  font-weight: 700;
  font-size: 14px;
  line-height: 1.2;
  flex-shrink: 0;
}

/* ── Linked tasks section ────────────────────────────────────────── */
.gdetail__tasks {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px 22px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-1);
}

.gdetail__tasks-count {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  margin-left: 6px;
}

.gdetail__task-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Task add transition */
.task-add-enter-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.task-add-leave-active { transition: opacity 0.1s ease; }
.task-add-enter-from   { opacity: 0; transform: translateY(-4px); }
.task-add-leave-to     { opacity: 0; }

.gdetail__task-list { display: flex; flex-direction: column; gap: 2px; }

.gdetail__task-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  transition: background var(--t-fast);
}
.gdetail__task-row:hover { background: var(--color-surface-elevated); }

/* Task circle check — bespoke: structural icon toggle */
.gdetail__task-check {
  flex-shrink: 0;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  transition: color var(--t-fast);
}
.gdetail__task-check:hover { color: var(--color-accent); }

.gdetail__task-text {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gdetail__task-due {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.gdetail__task-done-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--color-text-muted);
  padding: 4px 8px;
}

.gdetail__tasks-empty {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
  font-style: italic;
}

/* ── Linked notes ────────────────────────────────────────────────── */
.gdetail__notes-section {
  display: flex; flex-direction: column; gap: 12px;
  padding: 18px 22px; background: var(--color-surface-elevated);
  border: 1px solid var(--color-border); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-1);
}
.gdetail__notes-list { display: flex; flex-direction: column; gap: 2px; }
.gdetail__note-row {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 8px; border-radius: var(--radius-sm);
  cursor: pointer; transition: background var(--t-fast);
}
.gdetail__note-row:hover { background: var(--color-surface-elevated); }
.gdetail__note-icon { color: var(--color-text-muted); flex-shrink: 0; }
.gdetail__note-title {
  flex: 1; font-size: 13px; font-weight: 500; color: var(--color-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;
}
.gdetail__note-date { font-size: 11px; color: var(--color-text-muted); font-family: var(--font-mono); flex-shrink: 0; }

.gdetail__actions { display: flex; align-items: center; gap: 10px; }

/* Mark complete — bespoke: success color not in UiButton variants */
.gdetail__btn {
  padding: 8px 18px;
  border-radius: var(--radius);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all var(--t-fast);
  font-family: inherit;
}
.gdetail__btn--outline {
  background: transparent;
  border-color: var(--color-success);
  color: var(--color-success);
}
.gdetail__btn--outline:hover { background: var(--color-success); color: #fff; }

.gdetail__danger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
}

@media (max-width: 767px) {
  .gdetail__title { font-size: var(--text-2xl, 22px); }
  .gdetail__pct { font-size: var(--text-lg); }
}
</style>
