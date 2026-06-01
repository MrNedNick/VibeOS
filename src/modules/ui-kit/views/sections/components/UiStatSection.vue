<script setup lang="ts">
import { ref } from 'vue'
import { UiStat } from '@/ui'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const color = ref<'default' | 'accent' | 'success' | 'danger' | 'warning' | 'muted'>('accent')
const size = ref<'sm' | 'md' | 'lg'>('md')
const align = ref<'left' | 'center' | 'right'>('left')

const rows: PropDef[] = [
  { prop: 'value', type: 'string | number (required)', purpose: 'The headline metric' },
  { prop: 'label', type: 'string (required)', purpose: 'Caption below the value' },
  { prop: 'icon', type: 'string', purpose: 'Optional Lucide icon name' },
  { prop: 'mono', type: 'boolean', purpose: 'Render value in mono font' },
  { prop: 'color', type: "'default' | 'accent' | 'success' | 'danger' | 'warning' | 'muted'", purpose: 'Value colour (default: default)' },
  { prop: 'align', type: "'left' | 'center' | 'right'", purpose: 'Alignment (default: left)' },
  { prop: 'size', type: "'sm' | 'md' | 'lg'", purpose: 'Value size (default: md)' },
]
</script>

<template>
  <ShowcaseCard
    title="UiStat"
    purpose="A single value + label metric block. Use in dashboards and overview strips for at-a-glance numbers."
    canon="src/ui/components/UiStat.vue"
  >
    <template #playground>
      <PgStage>
        <template #stage>
          <UiStat :value="128" label="Tasks done" icon="Check" :color="color" :size="size" :align="align" />
        </template>
        <template #controls>
          <label class="ctl">Color
            <select v-model="color" class="ctl__select">
              <option>default</option><option>accent</option><option>success</option>
              <option>danger</option><option>warning</option><option>muted</option>
            </select>
          </label>
          <label class="ctl">Size
            <select v-model="size" class="ctl__select"><option>sm</option><option>md</option><option>lg</option></select>
          </label>
          <label class="ctl">Align
            <select v-model="align" class="ctl__select"><option>left</option><option>center</option><option>right</option></select>
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
