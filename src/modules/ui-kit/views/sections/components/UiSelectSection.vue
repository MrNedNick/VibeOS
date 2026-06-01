<script setup lang="ts">
import { ref } from 'vue'
import { UiSelect, UiField } from '@/ui'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const value = ref<string>('')
const size = ref<'sm' | 'md'>('md')
const disabled = ref(false)

const FRUIT_OPTIONS = [
  { value: 'apple',  label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date',   label: 'Date' },
]

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High' },
]

const fieldValue = ref<string>('medium')

const rows: PropDef[] = [
  { prop: 'v-model',     type: 'string | number',                purpose: 'Selected option value' },
  { prop: 'options',     type: 'SelectOption[]',                 purpose: 'Array of { value, label } pairs (required)' },
  { prop: 'placeholder', type: 'string',                         purpose: 'Unselected prompt text (adds disabled first option)' },
  { prop: 'size',        type: "'sm' | 'md'",                   purpose: 'Height: 28px / 40px (default: md)' },
  { prop: 'disabled',    type: 'boolean',                        purpose: 'Dims and blocks interaction' },
]
</script>

<template>
  <ShowcaseCard
    title="UiSelect"
    purpose="Token-styled native &lt;select&gt; with a custom chevron. Pairs with UiField for accessible labels and error states."
    canon="src/ui/components/UiSelect.vue"
  >
    <template #playground>
      <PgStage hint="Select an option to update the readout." :readout="`value = '${value || ''}'`">
        <template #stage>
          <div style="width: 200px;">
            <UiSelect
              v-model="value"
              :options="FRUIT_OPTIONS"
              :size="size"
              :disabled="disabled"
              placeholder="Pick a fruit…"
            />
          </div>
        </template>
        <template #controls>
          <label class="ctl">Size
            <select v-model="size" class="ctl__select">
              <option value="sm">sm</option>
              <option value="md">md</option>
            </select>
          </label>
          <label class="ctl ctl--check"><input type="checkbox" v-model="disabled" /> disabled</label>
        </template>
      </PgStage>
    </template>

    <template #demo>
      <div class="demo-row">
        <div class="demo-col">
          <span class="demo-label">Standalone</span>
          <UiSelect v-model="value" :options="FRUIT_OPTIONS" placeholder="Pick a fruit…" />
        </div>
        <div class="demo-col">
          <span class="demo-label">With UiField</span>
          <UiField label="Priority" field-id="priority-demo">
            <UiSelect v-model="fieldValue" :options="PRIORITY_OPTIONS" />
          </UiField>
        </div>
        <div class="demo-col">
          <span class="demo-label">sm size</span>
          <UiSelect v-model="value" :options="FRUIT_OPTIONS" size="sm" placeholder="Pick…" />
        </div>
      </div>
    </template>

    <template #props>
      <PropTable :rows="rows" note="SelectOption = { value: string | number; label: string }. Exported from @/ui." />
    </template>
  </ShowcaseCard>
</template>

<style scoped>
.demo-row { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; }
.demo-col { display: flex; flex-direction: column; gap: 6px; min-width: 160px; max-width: 220px; flex: 1; }
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
