<script setup lang="ts">
export interface FilterChipOption {
  value:   string
  label:   string
  /** Optional count badge shown inside the chip */
  count?:  number
  /** Optional icon name (Lucide) */
  icon?:   string
}

withDefaults(defineProps<{
  options:     FilterChipOption[]
  modelValue:  string
  /** Chip style — 'tabs' has a container track, 'pills' are standalone */
  variant?:   'tabs' | 'pills'
  size?:      'sm' | 'md'
}>(), {
  variant: 'tabs',
  size:    'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div
    class="ui-fc"
    :class="[`ui-fc--${variant}`, `ui-fc--${size}`]"
    role="tablist"
  >
    <button
      v-for="opt in options"
      :key="opt.value"
      class="ui-fc__chip"
      :class="{ 'ui-fc__chip--active': modelValue === opt.value }"
      role="tab"
      :aria-selected="modelValue === opt.value"
      @click="emit('update:modelValue', opt.value)"
    >
      <span v-if="opt.icon" class="ui-fc__chip-icon">{{ opt.icon }}</span>
      {{ opt.label }}
      <span v-if="opt.count !== undefined" class="ui-fc__chip-count">{{ opt.count }}</span>
    </button>
  </div>
</template>

<style scoped>
/* ── Tabs variant (chips on a track) ─────────────────────────────────── */
.ui-fc--tabs {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  width: fit-content;
  flex-wrap: wrap;
}

/* ── Pills variant (freestanding chips) ──────────────────────────────── */
.ui-fc--pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* ── Chip base ───────────────────────────────────────────────────────── */
.ui-fc__chip {
  display: flex;
  align-items: center;
  gap: 5px;
  border: none;
  cursor: pointer;
  font-family: var(--font-sans);
  font-weight: 500;
  white-space: nowrap;
  transition: background var(--t-fast), color var(--t-fast), box-shadow var(--t-fast), border-color var(--t-fast);
  line-height: 1;
}

/* Size variants */
.ui-fc--md .ui-fc__chip {
  padding: 5px 10px;
  font-size: var(--text-xs);
  border-radius: var(--radius-xs);
}

.ui-fc--sm .ui-fc__chip {
  padding: 3px 8px;
  font-size: var(--text-2xs);
  border-radius: 4px;
}

/* ── Tabs: inactive chip ──────────────────────────────────────────────── */
.ui-fc--tabs .ui-fc__chip {
  background: transparent;
  color: var(--color-text-secondary);
}
.ui-fc--tabs .ui-fc__chip:hover:not(.ui-fc__chip--active) {
  background: var(--color-surface);
  color: var(--color-text);
}
.ui-fc--tabs .ui-fc__chip--active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
}

/* ── Pills: inactive chip ────────────────────────────────────────────── */
.ui-fc--pills .ui-fc__chip {
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}
.ui-fc--pills .ui-fc__chip:hover:not(.ui-fc__chip--active) {
  border-color: var(--color-accent);
  color: var(--color-text);
}
.ui-fc--pills .ui-fc__chip--active {
  background: var(--color-accent-muted);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

/* ── Count badge ──────────────────────────────────────────────────────── */
.ui-fc__chip-count {
  font-size: 11px;
  font-family: var(--font-mono);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: 99px;
  padding: 0 5px;
  line-height: 16px;
  min-width: 18px;
  text-align: center;
  color: var(--color-text-muted);
}
.ui-fc__chip--active .ui-fc__chip-count {
  background: var(--color-accent-muted);
  border-color: transparent;
  color: var(--color-accent);
}

.ui-fc__chip-icon { font-size: 12px; }
</style>
