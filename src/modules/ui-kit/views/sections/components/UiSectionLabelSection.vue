<script setup lang="ts">
import { ref } from 'vue'
import { UiSectionLabel } from '@/ui'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const size = ref<'sm' | 'md'>('md')

const rows: PropDef[] = [
  { prop: 'as', type: 'string', purpose: 'Root element tag (default: p)' },
  { prop: 'size', type: "'sm' | 'md'", purpose: "11px or 12px (default: md)" },
  { prop: 'default slot', type: 'slot', purpose: 'The label text' },
]
</script>

<template>
  <ShowcaseCard
    title="UiSectionLabel"
    purpose="An uppercase, letter-spaced label that heads a section or group. Keeps section headers visually consistent across modules."
    canon="src/ui/components/UiSectionLabel.vue"
  >
    <template #playground>
      <PgStage>
        <template #stage>
          <UiSectionLabel :size="size">Recent activity</UiSectionLabel>
        </template>
        <template #controls>
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
