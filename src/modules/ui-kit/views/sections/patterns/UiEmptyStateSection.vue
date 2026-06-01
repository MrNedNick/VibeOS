<script setup lang="ts">
import { ref } from 'vue'
import { UiEmptyState } from '@/ui'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const title = ref('No tasks yet')
const subtitle = ref('Create your first task to get started.')
const actionLabel = ref('Add task')
const actions = ref(0)

const rows: PropDef[] = [
  { prop: 'icon', type: 'string', purpose: "Lucide icon name (default: 'Inbox')" },
  { prop: 'emoji', type: 'string', purpose: 'Emoji shown instead of an icon' },
  { prop: 'title', type: 'string (required)', purpose: 'Headline message' },
  { prop: 'subtitle', type: 'string', purpose: 'Secondary explanatory line' },
  { prop: 'actionLabel', type: 'string', purpose: 'Button label — shown only when set' },
  { prop: '@action', type: '() => void', purpose: 'Emitted when the action button is clicked' },
]
</script>

<template>
  <ShowcaseCard
    title="UiEmptyState"
    purpose="The standard empty/zero-data placeholder. Always pair a friendly title with a clear next action where one exists."
    canon="src/ui/components/UiEmptyState.vue"
  >
    <template #playground>
      <PgStage :readout="`action fired ×${actions}`">
        <template #stage>
          <div class="stage-wrap">
            <UiEmptyState
              icon="Inbox"
              :title="title"
              :subtitle="subtitle"
              :action-label="actionLabel"
              @action="actions++"
            />
          </div>
        </template>
        <template #controls>
          <label class="ctl">Title <input v-model="title" class="ctl__input" /></label>
          <label class="ctl">Subtitle <input v-model="subtitle" class="ctl__input" /></label>
          <label class="ctl">Action <input v-model="actionLabel" class="ctl__input" placeholder="(empty = no button)" /></label>
        </template>
      </PgStage>
    </template>

    <template #props>
      <PropTable :rows="rows" />
    </template>
  </ShowcaseCard>
</template>

<style scoped>
.stage-wrap { width: 100%; }
.ctl { display: flex; flex-direction: column; gap: 4px; font-size: var(--text-xs); color: var(--color-text-secondary); }
.ctl__input {
  font-family: inherit; font-size: var(--text-xs);
  padding: 5px 8px; border-radius: var(--radius-sm);
  border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text);
}
</style>
