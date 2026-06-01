<script setup lang="ts">
import ShowcaseCard from '../../../components/ShowcaseCard.vue'

const levels = [
  { n: 0, use: 'Flush / pressed state' },
  { n: 1, use: 'Resting cards (UiCard raised)' },
  { n: 2, use: 'Hover / lifted cards' },
  { n: 3, use: 'Panels, popovers' },
  { n: 4, use: 'Modals, drawers' },
]
const radii = [
  { name: 'xs',  cssVar: '--radius-xs' },
  { name: 'sm',  cssVar: '--radius-sm' },
  { name: 'base', cssVar: '--radius' },
  { name: 'lg',  cssVar: '--radius-lg' },
  { name: 'xl',  cssVar: '--radius-xl' },
]
</script>

<template>
  <ShowcaseCard
    title="Shadows & Radius"
    purpose="Elevation tokens --shadow-0..4 and corner-radius tokens. Each vibe-pak redefines them to match its mood (flat offsets for Brutalist, accent glow for CRT), so switch themes to compare."
    canon="src/assets/styles/main.css"
  >
    <template #demo>
      <h3 class="block-title">Elevation</h3>
      <div class="elev-grid">
        <div v-for="l in levels" :key="l.n" class="elev-card" :style="{ boxShadow: `var(--shadow-${l.n})` }">
          <span class="elev-card__level">Level {{ l.n }}</span>
          <code class="elev-card__var">--shadow-{{ l.n }}</code>
          <span class="elev-card__use">{{ l.use }}</span>
        </div>
      </div>
    </template>

    <template #extra>
      <h3 class="block-title">Border radius</h3>
      <div class="radius-grid">
        <div v-for="r in radii" :key="r.cssVar" class="radius-card">
          <div class="radius-box" :style="{ borderRadius: `var(${r.cssVar})` }" />
          <span class="radius-card__name">{{ r.name }}</span>
          <code class="radius-card__var">{{ r.cssVar }}</code>
        </div>
      </div>
    </template>
  </ShowcaseCard>
</template>

<style scoped>
.block-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 14px;
}
.elev-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}
.elev-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  border-radius: var(--radius);
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
}
.elev-card__level { font-size: var(--text-sm); font-weight: 600; color: var(--color-text); }
.elev-card__var { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--color-accent); }
.elev-card__use { font-size: var(--text-xs); color: var(--color-text-muted); }

.radius-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}
.radius-card { display: flex; flex-direction: column; gap: 6px; align-items: center; text-align: center; }
.radius-box {
  width: 100%;
  height: 56px;
  background: color-mix(in srgb, var(--color-accent) 22%, var(--color-surface));
  border: 1px solid var(--color-accent);
}
.radius-card__name { font-size: var(--text-xs); font-weight: 600; color: var(--color-text); }
.radius-card__var { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--color-text-muted); }

@media (max-width: 767px) {
  .elev-grid { grid-template-columns: repeat(2, 1fr); }
  .radius-grid { grid-template-columns: repeat(3, 1fr); }
}
</style>
