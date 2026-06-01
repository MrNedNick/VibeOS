<script setup lang="ts">
import { ref } from 'vue'
import { UiTextarea, UiField } from '@/ui'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const value = ref('')
const rows = ref(4)
const resize = ref<'none' | 'vertical' | 'both'>('vertical')
const disabled = ref(false)

const fieldValue = ref('')

const propRows: PropDef[] = [
  { prop: 'v-model',     type: 'string',                         purpose: 'Bound text value (required)' },
  { prop: 'placeholder', type: 'string',                         purpose: 'Placeholder text' },
  { prop: 'rows',        type: 'number',                         purpose: 'Visible row count (default: 4)' },
  { prop: 'resize',      type: "'none' | 'vertical' | 'both'",  purpose: 'Resize handle (default: vertical)' },
  { prop: 'maxlength',   type: 'number',                         purpose: 'Max character count' },
  { prop: 'disabled',    type: 'boolean',                        purpose: 'Dims and blocks interaction' },
]
</script>

<template>
  <ShowcaseCard
    title="UiTextarea"
    purpose="Multi-line text input in design tokens. Standalone component (not a prop on UiInput — see conventions.md). Pairs with UiField for labels and errors."
    canon="src/ui/components/UiTextarea.vue"
  >
    <template #playground>
      <PgStage hint="Type into the textarea. Adjust rows and resize via controls." :readout="`chars = ${value.length}`">
        <template #stage>
          <UiTextarea
            v-model="value"
            :rows="rows"
            :resize="resize"
            :disabled="disabled"
            placeholder="Type something…"
          />
        </template>
        <template #controls>
          <label class="ctl">Rows
            <select v-model.number="rows" class="ctl__select">
              <option :value="2">2</option>
              <option :value="4">4</option>
              <option :value="6">6</option>
            </select>
          </label>
          <label class="ctl">Resize
            <select v-model="resize" class="ctl__select">
              <option value="none">none</option>
              <option value="vertical">vertical</option>
              <option value="both">both</option>
            </select>
          </label>
          <label class="ctl ctl--check"><input type="checkbox" v-model="disabled" /> disabled</label>
        </template>
      </PgStage>
    </template>

    <template #demo>
      <div class="demo-col">
        <span class="demo-label">With UiField</span>
        <UiField label="Notes" hint="Add any additional context" field-id="textarea-demo">
          <UiTextarea v-model="fieldValue" :rows="3" placeholder="Write your notes here…" />
        </UiField>
      </div>
    </template>

    <template #props>
      <PropTable :rows="propRows" note="Decision: UiTextarea is a separate component, not a prop on UiInput. See conventions.md §UiTextarea." />
    </template>
  </ShowcaseCard>
</template>

<style scoped>
.demo-col { display: flex; flex-direction: column; gap: 6px; max-width: 400px; }
.demo-label {
  font-size: var(--text-2xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.ctl {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}
.ctl--check { flex-direction: row; align-items: center; gap: 6px; }
.ctl__select {
  font-family: inherit;
  font-size: var(--text-xs);
  padding: 5px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
}
</style>
