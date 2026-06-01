<script setup lang="ts">
import { ref } from 'vue'
import { UiIcon } from '@/ui'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const name = ref('Sparkles')
const size = ref(28)
const strokeWidth = ref(1.75)

const common = ['Sparkles', 'Target', 'Dumbbell', 'BookOpen', 'BarChart2', 'Check', 'X', 'Plus', 'Settings', 'Search', 'Calendar', 'Trash2']

const rows: PropDef[] = [
  { prop: 'name', type: 'string (required)', purpose: 'Lucide icon name in PascalCase (e.g. "Sparkles")' },
  { prop: 'size', type: 'number', purpose: 'Pixel size (default: 16)' },
  { prop: 'strokeWidth', type: 'number', purpose: 'Stroke width (default: 1.75)' },
]
</script>

<template>
  <ShowcaseCard
    title="UiIcon"
    purpose="Renders any Lucide icon by name. Resolves the component at runtime, so the whole icon set is available — pass the PascalCase name."
    canon="src/ui/components/UiIcon.vue"
  >
    <template #playground>
      <PgStage hint="Type any Lucide name (PascalCase)." :readout="`<UiIcon name='${name}' :size='${size}' />`">
        <template #stage>
          <UiIcon :name="name" :size="size" :stroke-width="strokeWidth" />
        </template>
        <template #controls>
          <label class="ctl">Name <input v-model="name" class="ctl__input" /></label>
          <label class="ctl">Size <input type="number" v-model.number="size" class="ctl__input" min="12" max="96" /></label>
          <label class="ctl">Stroke <input type="number" step="0.25" v-model.number="strokeWidth" class="ctl__input" /></label>
        </template>
      </PgStage>
    </template>

    <template #demo>
      <div class="grid">
        <button v-for="n in common" :key="n" class="icon-cell" @click="name = n">
          <UiIcon :name="n" :size="22" />
          <span class="icon-cell__name">{{ n }}</span>
        </button>
      </div>
    </template>

    <template #props>
      <PropTable :rows="rows" />
    </template>
  </ShowcaseCard>
</template>

<style scoped>
.ctl { display: flex; flex-direction: column; gap: 4px; font-size: var(--text-xs); color: var(--color-text-secondary); }
.ctl__input {
  font-family: inherit; font-size: var(--text-xs);
  padding: 5px 8px; border-radius: var(--radius-sm);
  border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text);
}
.grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
.icon-cell {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 12px 6px; border-radius: var(--radius); cursor: pointer;
  background: var(--color-surface); border: 1px solid var(--color-border);
  color: var(--color-text); transition: border-color var(--t-fast), background var(--t-fast);
}
.icon-cell:hover { border-color: var(--color-accent); background: color-mix(in srgb, var(--color-accent) 8%, transparent); }
.icon-cell__name { font-size: var(--text-2xs); color: var(--color-text-muted); }
@media (max-width: 767px) { .grid { grid-template-columns: repeat(3, 1fr); } }
</style>
