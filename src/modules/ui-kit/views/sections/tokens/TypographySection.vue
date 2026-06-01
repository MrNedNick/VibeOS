<script setup lang="ts">
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import TokenRow from '../../../components/TokenRow.vue'

const sizes = [
  { role: 'Page title',  cssVar: '--text-3xl',  px: '27px' },
  { role: 'Heading',     cssVar: '--text-2xl',  px: '24px' },
  { role: 'Sub-heading', cssVar: '--text-xl',   px: '20px' },
  { role: 'Body large',  cssVar: '--text-lg',   px: '18px' },
  { role: 'Body medium', cssVar: '--text-md',   px: '16px' },
  { role: 'Body',        cssVar: '--text-base', px: '15px' },
  { role: 'Small',       cssVar: '--text-sm',   px: '14px' },
  { role: 'X-small',     cssVar: '--text-xs',   px: '13px' },
  { role: 'Tiny',        cssVar: '--text-2xs',  px: '12px' },
]

const leadings = [
  '--leading-3xl', '--leading-2xl', '--leading-xl', '--leading-lg',
  '--leading-base', '--leading-sm', '--leading-xs', '--leading-2xs',
]
</script>

<template>
  <ShowcaseCard
    title="Typography"
    purpose="The type scale and line-height tokens. Use the size tokens for font-size and never a bare px; use the leading tokens for line-height and never a bare 1.5."
    canon="src/assets/styles/main.css"
  >
    <template #demo>
      <h3 class="block-title">Type scale</h3>
      <TokenRow
        v-for="s in sizes"
        :key="s.cssVar"
        :label="s.role"
        :meta="`${s.px} · var(${s.cssVar})`"
      >
        <span :style="{ fontSize: `var(${s.cssVar})` }">The quick brown fox</span>
      </TokenRow>
    </template>

    <template #extra>
      <h3 class="block-title">Font families</h3>
      <div class="fonts">
        <div class="font-card">
          <span class="font-card__sample" style="font-family: var(--font-sans)">Geist / Inter</span>
          <code class="font-card__var">--font-sans</code>
          <span class="font-card__use">UI + body — all default text</span>
        </div>
        <div class="font-card">
          <span class="font-card__sample" style="font-family: var(--font-mono)">JetBrains Mono</span>
          <code class="font-card__var">--font-mono</code>
          <span class="font-card__use">Code, dates, numeric readouts</span>
        </div>
      </div>

      <h3 class="block-title">Line-height tokens</h3>
      <div class="leading-chips">
        <code v-for="l in leadings" :key="l" class="leading-chip">{{ l }}</code>
      </div>
    </template>
  </ShowcaseCard>
</template>

<style scoped>
.block-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 8px;
}
.fonts { display: flex; gap: 14px; margin-bottom: 24px; flex-wrap: wrap; }
.font-card {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}
.font-card__sample { font-size: var(--text-xl); color: var(--color-text); }
.font-card__var { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--color-accent); }
.font-card__use { font-size: var(--text-xs); color: var(--color-text-muted); }
.leading-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.leading-chip {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--color-text-secondary);
  background: var(--color-surface-elevated);
  padding: 4px 8px;
  border-radius: var(--radius-xs);
}
</style>
