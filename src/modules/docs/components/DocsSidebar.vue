<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { DocSection } from '../data/docs-registry'

interface Props {
  sections: DocSection[]
  activeSlug: string
}

defineProps<Props>()
const router = useRouter()
</script>

<template>
  <nav class="docs-nav">
    <div v-for="section in sections" :key="section.id" class="docs-nav__section">
      <p class="docs-nav__label">{{ section.label }}</p>
      <button
        v-for="page in section.pages"
        :key="page.slug"
        class="docs-nav__item"
        :class="{ 'docs-nav__item--active': activeSlug === page.slug }"
        @click="router.push(`/docs/${page.slug}`)"
      >
        {{ page.label }}
      </button>
    </div>
  </nav>
</template>

<style scoped>
.docs-nav {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 8px;
  position: sticky;
  top: 0;
}

.docs-nav__section { display: flex; flex-direction: column; gap: 2px; }

.docs-nav__label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin: 0 0 4px 8px;
}

.docs-nav__item {
  display: block;
  width: 100%;
  padding: 6px 10px;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  transition: background var(--t-fast), color var(--t-fast);
}

.docs-nav__item:hover { background: var(--color-surface-elevated); color: var(--color-text); }

.docs-nav__item--active {
  background: var(--color-accent-muted);
  color: var(--color-accent);
}
</style>
