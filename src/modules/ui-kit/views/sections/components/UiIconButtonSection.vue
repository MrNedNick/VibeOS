<script setup lang="ts">
import { ref } from 'vue'
import { UiIconButton } from '@/ui'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'
import PropTable, { type PropDef } from '../../../components/PropTable.vue'

const name = ref('X')
const size = ref<'sm' | 'md'>('md')
const variant = ref<'ghost' | 'danger' | 'subtle'>('ghost')
const loading = ref(false)
const disabled = ref(false)
const clicks = ref(0)

const rows: PropDef[] = [
  { prop: 'name',       type: 'string',                        purpose: 'Lucide icon name (required)' },
  { prop: 'aria-label', type: 'string',                        purpose: 'Required — accessible label (no visible text)' },
  { prop: 'size',       type: "'sm' | 'md'",                  purpose: 'Button size: 26px / 32px (default: md)' },
  { prop: 'variant',   type: "'ghost' | 'danger' | 'subtle'", purpose: 'Visual style (default: ghost)' },
  { prop: 'loading',    type: 'boolean',                       purpose: 'Shows spinner, disables clicks' },
  { prop: 'disabled',   type: 'boolean',                       purpose: 'Dims and blocks interaction' },
  { prop: 'type',       type: "'button' | 'submit' | 'reset'", purpose: 'Native button type (default: button)' },
]
</script>

<template>
  <ShowcaseCard
    title="UiIconButton"
    purpose="Icon-only button for close (×), add (+), toolbar, and action icons. Always requires aria-label — there is no visible text. Use UiButton for labelled actions."
    canon="src/ui/components/UiIconButton.vue"
  >
    <template #playground>
      <PgStage hint="An icon-only button. aria-label is always required." :readout="`clicks = ${clicks}`">
        <template #stage>
          <UiIconButton
            :name="name"
            :size="size"
            :variant="variant"
            :loading="loading"
            :disabled="disabled"
            ariaLabel="Playground icon button"
            @click="clicks++"
          />
        </template>
        <template #controls>
          <label class="ctl">Icon
            <select v-model="name" class="ctl__select">
              <option value="X">X</option>
              <option value="Plus">Plus</option>
              <option value="Pencil">Pencil</option>
              <option value="Trash2">Trash2</option>
              <option value="Settings">Settings</option>
            </select>
          </label>
          <label class="ctl">Size
            <select v-model="size" class="ctl__select">
              <option value="sm">sm</option>
              <option value="md">md</option>
            </select>
          </label>
          <label class="ctl">Variant
            <select v-model="variant" class="ctl__select">
              <option value="ghost">ghost</option>
              <option value="subtle">subtle</option>
              <option value="danger">danger</option>
            </select>
          </label>
          <label class="ctl ctl--check"><input type="checkbox" v-model="loading" /> loading</label>
          <label class="ctl ctl--check"><input type="checkbox" v-model="disabled" /> disabled</label>
        </template>
      </PgStage>
    </template>

    <template #demo>
      <div class="row">
        <div class="demo-group">
          <span class="demo-label">ghost</span>
          <UiIconButton name="X"      variant="ghost"  ariaLabel="Close" />
          <UiIconButton name="Plus"   variant="ghost"  ariaLabel="Add" />
          <UiIconButton name="Pencil" variant="ghost"  ariaLabel="Edit" />
        </div>
        <div class="demo-group">
          <span class="demo-label">subtle</span>
          <UiIconButton name="X"       variant="subtle" ariaLabel="Close" />
          <UiIconButton name="Settings" variant="subtle" ariaLabel="Settings" />
        </div>
        <div class="demo-group">
          <span class="demo-label">danger</span>
          <UiIconButton name="Trash2" variant="danger" ariaLabel="Delete" />
        </div>
        <div class="demo-group">
          <span class="demo-label">sm</span>
          <UiIconButton name="X"    size="sm" ariaLabel="Close small" />
          <UiIconButton name="Plus" size="sm" ariaLabel="Add small" />
        </div>
        <div class="demo-group">
          <span class="demo-label">states</span>
          <UiIconButton name="X" loading ariaLabel="Loading" />
          <UiIconButton name="X" disabled ariaLabel="Disabled" />
        </div>
      </div>
    </template>

    <template #props>
      <PropTable :rows="rows" note="aria-label is required — icon buttons have no visible text." />
    </template>
  </ShowcaseCard>
</template>

<style scoped>
.row { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }
.demo-group { display: flex; align-items: center; gap: 6px; }
.demo-label {
  font-size: var(--text-2xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: 42px;
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
