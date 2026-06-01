<script setup lang="ts">
import ShowcaseCard from '../../../components/ShowcaseCard.vue'

// VibeOS does not yet expose --sp-* tokens; spacing is applied as raw px on a
// 4px base grid (8px-multiples are the primary rhythm). This documents the
// de-facto scale so usage stays consistent until tokens are extracted.
const steps = [4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64]
const MAX = 64
function kind(px: number): 'primary' | 'helper' {
  return px % 8 === 0 ? 'primary' : 'helper'
}
</script>

<template>
  <ShowcaseCard
    title="Spacing"
    purpose="Layout rhythm on a 4px base grid. 8px-multiples carry the primary rhythm (gaps, section padding); 4px helpers handle tight inline spacing. Not yet tokenised — applied as raw px."
    canon="src/assets/styles/main.css"
  >
    <template #demo>
      <div class="scale">
        <div v-for="px in steps" :key="px" class="scale-row">
          <span class="scale-row__px">{{ px }}px</span>
          <span class="scale-row__badge" :class="`scale-row__badge--${kind(px)}`">
            {{ kind(px) === 'primary' ? 'PRIMARY 8' : 'HELPER 4' }}
          </span>
          <div class="scale-row__bar" :style="{ width: `${(px / MAX) * 100}%` }" />
        </div>
      </div>
    </template>

    <template #extra>
      <h3 class="block-title">Grid rule</h3>
      <ul class="rule-list">
        <li>Prefer 8px-multiples for gaps, card padding and section spacing.</li>
        <li>Use 4px helpers only for tight inline spacing (icon ↔ label, chip padding).</li>
        <li>Page content padding is <code>var(--content-padding)</code> (32px), max width <code>var(--content-max-width)</code>.</li>
      </ul>
    </template>
  </ShowcaseCard>
</template>

<style scoped>
.scale { display: flex; flex-direction: column; gap: 10px; }
.scale-row {
  display: grid;
  grid-template-columns: 48px 92px 1fr;
  align-items: center;
  gap: 12px;
}
.scale-row__px {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text);
  text-align: right;
}
.scale-row__badge {
  font-size: var(--text-2xs);
  font-weight: 600;
  letter-spacing: 0.04em;
  padding: 2px 6px;
  border-radius: var(--radius-xs);
  text-align: center;
}
.scale-row__badge--primary {
  background: color-mix(in srgb, var(--color-accent) 14%, transparent);
  color: var(--color-accent);
}
.scale-row__badge--helper {
  background: color-mix(in srgb, var(--color-text-muted) 14%, transparent);
  color: var(--color-text-muted);
}
.scale-row__bar {
  height: 14px;
  background: var(--color-accent);
  border-radius: var(--radius-xs);
  opacity: 0.85;
}
.block-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 10px;
}
.rule-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-sm);
}
.rule-list code { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--color-accent); }
</style>
