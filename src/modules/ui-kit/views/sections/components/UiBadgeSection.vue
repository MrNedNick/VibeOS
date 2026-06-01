<script setup lang="ts">
import { ref } from 'vue'
import { UiBadge } from '@/ui'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const variant = ref<'default' | 'accent' | 'success' | 'danger' | 'warning'>('accent')

const rows: PropDef[] = [
  { prop: 'variant', type: "'default' | 'accent' | 'success' | 'danger' | 'warning'", purpose: 'Colour scheme (default: default)' },
  { prop: 'default slot', type: 'slot', purpose: 'Badge label/content' },
]
</script>

<template>
  <ShowcaseCard
    title="UiBadge"
    purpose="A small inline status/label pill. Use for counts, statuses and tags — not for actions."
    canon="src/ui/components/UiBadge.vue"
  >
    <template #playground>
      <PgStage>
        <template #stage>
          <UiBadge :variant="variant">{{ variant }}</UiBadge>
        </template>
        <template #controls>
          <label class="ctl">Variant
            <select v-model="variant" class="ctl__select">
              <option>default</option><option>accent</option><option>success</option>
              <option>danger</option><option>warning</option>
            </select>
          </label>
        </template>
      </PgStage>
    </template>

    <template #demo>
      <div class="row">
        <UiBadge>default</UiBadge>
        <UiBadge variant="accent">accent</UiBadge>
        <UiBadge variant="success">success</UiBadge>
        <UiBadge variant="danger">danger</UiBadge>
        <UiBadge variant="warning">warning</UiBadge>
      </div>
    </template>

    <template #props>
      <PropTable :rows="rows" />
    </template>
  </ShowcaseCard>
</template>

<style scoped>
.row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.ctl { display: flex; flex-direction: column; gap: 4px; font-size: var(--text-xs); color: var(--color-text-secondary); }
.ctl__select {
  font-family: inherit; font-size: var(--text-xs);
  padding: 5px 8px; border-radius: var(--radius-sm);
  border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text);
}
</style>
