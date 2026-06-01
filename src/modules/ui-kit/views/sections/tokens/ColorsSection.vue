<script setup lang="ts">
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import TokenSwatch from '../../../components/TokenSwatch.vue'

interface Group { name: string; swatches: { role: string; cssVar: string }[] }

const groups: Group[] = [
  {
    name: 'Surfaces',
    swatches: [
      { role: 'Background',   cssVar: '--color-bg' },
      { role: 'Surface',      cssVar: '--color-surface' },
      { role: 'Elevated',     cssVar: '--color-surface-elevated' },
      { role: 'Surface 0',    cssVar: '--color-surface-0' },
      { role: 'Surface 1',    cssVar: '--color-surface-1' },
      { role: 'Surface 2',    cssVar: '--color-surface-2' },
      { role: 'Surface 3',    cssVar: '--color-surface-3' },
    ],
  },
  {
    name: 'Accent',
    swatches: [
      { role: 'Accent',       cssVar: '--color-accent' },
      { role: 'Accent hover', cssVar: '--color-accent-hover' },
      { role: 'Accent muted', cssVar: '--color-accent-muted' },
    ],
  },
  {
    name: 'Status',
    swatches: [
      { role: 'Success', cssVar: '--color-success' },
      { role: 'Danger',  cssVar: '--color-danger' },
      { role: 'Warning', cssVar: '--color-warning' },
      { role: 'Info',    cssVar: '--color-info' },
    ],
  },
  {
    name: 'Text',
    swatches: [
      { role: 'Text',          cssVar: '--color-text' },
      { role: 'Text secondary', cssVar: '--color-text-secondary' },
      { role: 'Text muted',    cssVar: '--color-text-muted' },
      { role: 'Text inverse',  cssVar: '--color-text-inverse' },
    ],
  },
  {
    name: 'Borders',
    swatches: [
      { role: 'Border',        cssVar: '--color-border' },
      { role: 'Border subtle', cssVar: '--color-border-subtle' },
    ],
  },
]
</script>

<template>
  <ShowcaseCard
    title="Colors"
    purpose="Role-based color tokens. Every theme (vibe-pak) overrides these on :root — switch the theme in the sidebar footer to see the whole catalogue recolour live."
    canon="src/assets/styles/main.css"
  >
    <template #demo>
      <div v-for="g in groups" :key="g.name" class="color-group">
        <h3 class="color-group__name">{{ g.name }}</h3>
        <div class="color-group__grid">
          <TokenSwatch
            v-for="s in g.swatches"
            :key="s.cssVar"
            :role="s.role"
            :css-var="s.cssVar"
          />
        </div>
      </div>
    </template>

    <template #extra>
      <h3 class="rule-title">Rules</h3>
      <ul class="rule-list">
        <li>Never hardcode hex — use <code>var(--color-accent)</code> etc.</li>
        <li>Alpha via <code>color-mix(in srgb, var(--color-accent) 12%, transparent)</code>, not <code>rgba()</code>.</li>
        <li>Hover tints add an accent tint over the surface, not a flat elevated colour.</li>
      </ul>
    </template>
  </ShowcaseCard>
</template>

<style scoped>
.color-group { margin-bottom: 24px; }
.color-group__name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 12px;
}
.color-group__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.rule-title {
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
.rule-list code {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--color-accent);
}
@media (max-width: 767px) {
  .color-group__grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
