<script setup lang="ts">
import { ref } from 'vue'
import { UiFilterChips, type FilterChipOption } from '@/ui'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const selected = ref('all')
const variant = ref<'tabs' | 'pills'>('tabs')
const size = ref<'sm' | 'md'>('md')

const options: FilterChipOption[] = [
  { value: 'all',     label: 'All',     count: 24 },
  { value: 'active',  label: 'Active',  count: 9 },
  { value: 'done',    label: 'Done',    count: 15 },
  { value: 'today',   label: 'Today',   icon: 'Calendar' },
]

const rows: PropDef[] = [
  { prop: 'v-model', type: 'string', purpose: 'Selected option value (single-select)' },
  { prop: 'options', type: 'FilterChipOption[]', purpose: '{ value, label, count?, icon? }' },
  { prop: 'variant', type: "'tabs' | 'pills'", purpose: 'Visual style (default: tabs)' },
  { prop: 'size', type: "'sm' | 'md'", purpose: 'Chip size (default: md)' },
]
</script>

<template>
  <ShowcaseCard
    title="UiFilterChips"
    purpose="A single-select chip/tab row for filtering lists. Optional per-chip count and leading icon. Used across Tasks, Analytics and Finance."
    canon="src/ui/components/UiFilterChips.vue"
  >
    <template #playground>
      <PgStage :readout="`modelValue = ${JSON.stringify(selected)}`">
        <template #stage>
          <UiFilterChips v-model="selected" :options="options" :variant="variant" :size="size" />
        </template>
        <template #controls>
          <label class="ctl">Variant
            <select v-model="variant" class="ctl__select"><option>tabs</option><option>pills</option></select>
          </label>
          <label class="ctl">Size
            <select v-model="size" class="ctl__select"><option>sm</option><option>md</option></select>
          </label>
        </template>
      </PgStage>
    </template>

    <template #props>
      <PropTable :rows="rows" />
    </template>
  </ShowcaseCard>
</template>

<style scoped>
.ctl { display: flex; flex-direction: column; gap: 4px; font-size: var(--text-xs); color: var(--color-text-secondary); }
.ctl__select {
  font-family: inherit; font-size: var(--text-xs);
  padding: 5px 8px; border-radius: var(--radius-sm);
  border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text);
}
</style>
