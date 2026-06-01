<script setup lang="ts">
// Reusable wrapper for every component/token page in /ui-kit.
// Slots render in fixed order: playground → demo → props → extra.
defineProps<{
  title: string
  purpose: string
  canon?: string
}>()
</script>

<template>
  <article class="showcase">
    <header class="showcase__header">
      <h1 class="showcase__title">{{ title }}</h1>
      <p class="showcase__purpose">{{ purpose }}</p>
      <code v-if="canon" class="showcase__canon">{{ canon }}</code>
    </header>

    <section v-if="$slots.playground" class="showcase__section">
      <h2 class="showcase__section-title">Playground</h2>
      <slot name="playground" />
    </section>

    <section v-if="$slots.demo" class="showcase__section">
      <h2 class="showcase__section-title">Examples</h2>
      <slot name="demo" />
    </section>

    <section v-if="$slots.props" class="showcase__section">
      <h2 class="showcase__section-title">Props</h2>
      <slot name="props" />
    </section>

    <section v-if="$slots.extra" class="showcase__section">
      <slot name="extra" />
    </section>
  </article>
</template>

<style scoped>
.showcase {
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 820px;
}

.showcase__header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
}

.showcase__title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  line-height: var(--leading-3xl);
}

.showcase__purpose {
  font-size: var(--text-md);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--leading-lg);
  max-width: 60ch;
}

.showcase__canon {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  padding: 4px 8px;
  border-radius: var(--radius-xs);
  align-self: flex-start;
}

.showcase__section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.showcase__section-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
}
</style>
