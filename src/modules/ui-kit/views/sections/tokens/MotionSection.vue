<script setup lang="ts">
import { ref } from 'vue'
import ShowcaseCard from '../../../components/ShowcaseCard.vue'
import PgStage from '../../../components/PgStage.vue'

const toggled = ref(false)

const easings = [
  { token: '--ease',        value: 'cubic-bezier(0.4, 0, 0.2, 1)',    use: 'Standard — most transitions' },
  { token: '--ease-out',    value: 'cubic-bezier(0, 0, 0.2, 1)',      use: 'Decelerate — entering elements' },
  { token: '--ease-smooth', value: 'cubic-bezier(0.25, 0.1, 0.25, 1)', use: 'Gentle ease in-out' },
  { token: '--ease-spring', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', use: 'Overshoot — playful pops' },
]
const durations = [
  { token: '--duration-fast', value: '120ms', use: 'Hover, small toggles' },
  { token: '--duration-base', value: '200ms', use: 'Default transitions' },
  { token: '--duration-slow', value: '300ms', use: 'Larger movements, modals' },
]
const shortcuts = [
  { token: '--t-fast', value: '120ms var(--ease)' },
  { token: '--t-slow', value: '300ms var(--ease)' },
]
</script>

<template>
  <ShowcaseCard
    title="Motion & Easing"
    purpose="Easing curves and duration tokens. Compose them as transition: <prop> var(--duration-base) var(--ease), or use the --t-* shortcuts that bundle both."
    canon="src/assets/styles/main.css"
  >
    <template #playground>
      <PgStage hint="The block slides with transition: transform var(--duration-slow) var(--ease-spring).">
        <template #stage>
          <div class="motion-track">
            <div class="motion-box" :class="{ 'motion-box--on': toggled }" />
          </div>
        </template>
        <template #controls>
          <button class="pg-btn" @click="toggled = !toggled">Toggle position</button>
        </template>
      </PgStage>
    </template>

    <template #extra>
      <h3 class="block-title">Easing</h3>
      <table class="motion-table">
        <thead><tr><th>Token</th><th>Value</th><th>Use</th></tr></thead>
        <tbody>
          <tr v-for="e in easings" :key="e.token">
            <td><code>{{ e.token }}</code></td>
            <td><code class="dim">{{ e.value }}</code></td>
            <td>{{ e.use }}</td>
          </tr>
        </tbody>
      </table>

      <h3 class="block-title">Duration</h3>
      <table class="motion-table">
        <thead><tr><th>Token</th><th>Value</th><th>Use</th></tr></thead>
        <tbody>
          <tr v-for="d in durations" :key="d.token">
            <td><code>{{ d.token }}</code></td>
            <td><code class="dim">{{ d.value }}</code></td>
            <td>{{ d.use }}</td>
          </tr>
        </tbody>
      </table>

      <h3 class="block-title">Shortcuts</h3>
      <table class="motion-table">
        <thead><tr><th>Token</th><th>Value</th></tr></thead>
        <tbody>
          <tr v-for="s in shortcuts" :key="s.token">
            <td><code>{{ s.token }}</code></td>
            <td><code class="dim">{{ s.value }}</code></td>
          </tr>
        </tbody>
      </table>
    </template>
  </ShowcaseCard>
</template>

<style scoped>
.motion-track { width: 100%; }
.motion-box {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  transition: transform var(--duration-slow) var(--ease-spring);
}
.motion-box--on { transform: translateX(180px); }
.pg-btn {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-accent);
  background: transparent;
  color: var(--color-accent);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  transition: background var(--t-fast);
}
.pg-btn:hover { background: color-mix(in srgb, var(--color-accent) 12%, transparent); }

.block-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 10px;
}
.motion-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
  font-size: var(--text-xs);
  margin-bottom: 24px;
}
.motion-table th {
  text-align: left;
  padding: 8px 12px;
  background: var(--color-surface-elevated);
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: var(--text-2xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
}
.motion-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border-subtle);
  color: var(--color-text-secondary);
}
.motion-table tbody tr:last-child td { border-bottom: none; }
.motion-table code { font-family: var(--font-mono); font-size: var(--text-2xs); color: var(--color-accent); }
.motion-table code.dim { color: var(--color-text); }
</style>
