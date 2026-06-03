<script setup lang="ts">
import { ref } from 'vue'
import { UiFab } from '@/ui'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const icon = ref('Plus')
const label = ref('New item')
const disabled = ref(false)
const clicks = ref(0)

const rows: PropDef[] = [
  { prop: 'label',    type: 'string',  purpose: 'Required — aria-label for accessibility' },
  { prop: 'icon',     type: 'string',  purpose: 'Lucide icon name (default: Plus)' },
  { prop: 'disabled', type: 'boolean', purpose: 'Dims and blocks interaction' },
]
</script>

<template>
  <ShowcaseCard
    title="UiFab"
    purpose="Floating action button — mobile-only (hidden ≥768px). Fixed bottom-right, 56px circle. Use for the primary create action in a module. Desktop uses an inline UiButton in the view header instead."
    canon="src/ui/components/UiFab.vue"
  >
    <template #playground>
      <PgStage
        hint="Resize window below 768px to see the real FAB. Inline preview shown here for docs."
        :readout="`clicks = ${clicks}`"
      >
        <template #stage>
          <!-- Static preview (position:static overrides fixed) -->
          <UiFab
            :icon="icon"
            :label="label"
            :disabled="disabled"
            style="position: static; box-shadow: var(--shadow-3);"
            @click="clicks++"
          />
        </template>
        <template #controls>
          <label class="ctl">Icon
            <select v-model="icon" class="ctl__select">
              <option value="Plus">Plus</option>
              <option value="Pencil">Pencil</option>
              <option value="Target">Target</option>
              <option value="BookOpen">BookOpen</option>
              <option value="Dumbbell">Dumbbell</option>
            </select>
          </label>
          <label class="ctl ctl--check"><input type="checkbox" v-model="disabled" /> disabled</label>
        </template>
      </PgStage>
    </template>

    <template #demo>
      <div class="demo-note">
        <strong>Mobile-only:</strong> the real UiFab uses <code>position: fixed</code> and is hidden via CSS at ≥768px.
        Below are states shown as inline previews.
      </div>
      <div class="row">
        <div class="demo-group">
          <span class="demo-label">Plus (default)</span>
          <UiFab label="New item" style="position: static; box-shadow: var(--shadow-2);" />
        </div>
        <div class="demo-group">
          <span class="demo-label">Target icon</span>
          <UiFab icon="Target" label="New goal" style="position: static; box-shadow: var(--shadow-2);" />
        </div>
        <div class="demo-group">
          <span class="demo-label">disabled</span>
          <UiFab label="Disabled" disabled style="position: static; box-shadow: var(--shadow-2);" />
        </div>
      </div>
    </template>

    <template #props>
      <PropTable :rows="rows" note="UiFab is hidden at ≥768px via CSS media query. No JS needed." />
    </template>
  </ShowcaseCard>
</template>

<style scoped>
.row { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end; }
.demo-group { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.demo-label {
  font-size: var(--text-2xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.demo-note {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  margin-bottom: 16px;
  line-height: var(--leading-lg);
}
.demo-note code {
  font-family: monospace;
  font-size: var(--text-xs);
  background: var(--color-surface-elevated);
  padding: 1px 5px;
  border-radius: 3px;
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
