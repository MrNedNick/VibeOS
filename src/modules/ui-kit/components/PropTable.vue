<script setup lang="ts">
export interface PropDef {
  prop: string
  type: string
  purpose: string
}

defineProps<{
  rows: PropDef[]
  note?: string
}>()
</script>

<template>
  <div class="prop-table-wrap">
    <p v-if="note" class="prop-table__note">{{ note }}</p>
    <table class="prop-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Purpose</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.prop">
          <td><code class="prop-table__prop">{{ r.prop }}</code></td>
          <td><code class="prop-table__type">{{ r.type }}</code></td>
          <td class="prop-table__purpose">{{ r.purpose }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.prop-table-wrap { display: flex; flex-direction: column; gap: 10px; }

.prop-table__note {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin: 0;
}

.prop-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
  font-size: var(--text-xs);
}

.prop-table th {
  text-align: left;
  padding: 9px 12px;
  background: var(--color-surface-elevated);
  color: var(--color-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: var(--text-2xs);
  border-bottom: 1px solid var(--color-border);
}

.prop-table td {
  padding: 9px 12px;
  border-bottom: 1px solid var(--color-border-subtle);
  vertical-align: top;
  color: var(--color-text-secondary);
}

.prop-table tbody tr:last-child td { border-bottom: none; }

.prop-table__prop {
  font-family: var(--font-mono);
  color: var(--color-accent);
  font-size: var(--text-2xs);
}

.prop-table__type {
  font-family: var(--font-mono);
  color: var(--color-text);
  font-size: var(--text-2xs);
  background: var(--color-surface-elevated);
  padding: 1px 5px;
  border-radius: var(--radius-xs);
}

.prop-table__purpose { line-height: var(--leading-sm); }
</style>
