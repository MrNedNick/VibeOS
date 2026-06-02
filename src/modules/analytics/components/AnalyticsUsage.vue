<script setup lang="ts">
import { computed } from 'vue'
import { useInteractionBus } from '@/core/stores/interaction.store'
import { useFeedbackStore } from '@/core/stores/feedback.store'

const props = defineProps<{ period: number }>()

const bus           = useInteractionBus()
const feedbackStore = useFeedbackStore()

// ── Module visit counts ───────────────────────────────────────────────
const moduleCounts = computed(() => {
  const raw = bus.countByModule(props.period)
  return Object.entries(raw)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
})

const moduleMax = computed(() =>
  moduleCounts.value.reduce((m, [, v]) => Math.max(m, v), 0) || 1
)

// ── Feature use (top 10) ─────────────────────────────────────────────
const featureCounts = computed(() => {
  const raw = bus.countByFeature(props.period)
  return Object.entries(raw)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
})

const featureMax = computed(() =>
  featureCounts.value.reduce((m, [, v]) => Math.max(m, v), 0) || 1
)

// ── Session history ───────────────────────────────────────────────────
const sessions = computed(() => bus.sessionHistory(props.period))

const avgDuration = computed((): string => {
  const withDuration = sessions.value.filter(s => s.duration != null)
  if (!withDuration.length) return '—'
  const avg = withDuration.reduce((sum, s) => sum + (s.duration ?? 0), 0) / withDuration.length
  return `${Math.round(avg / 60)}m`
})

const longestSession = computed((): string => {
  const max = sessions.value.reduce((m, s) => Math.max(m, s.duration ?? 0), 0)
  return max === 0 ? '—' : `${Math.round(max / 60)}m`
})

// ── App streak (consecutive days) ────────────────────────────────────
const appStreak = computed((): number => {
  const activeDays = feedbackStore.activeDays
  if (!activeDays.length) return 0
  const sorted = [...activeDays].sort().reverse()
  const today = new Date().toISOString().slice(0, 10)
  let streak = 0
  let cursor = today
  for (const day of sorted) {
    if (day === cursor) { streak++; const d = new Date(cursor); d.setDate(d.getDate() - 1); cursor = d.toISOString().slice(0, 10) }
    else if (day < cursor) break
  }
  return streak
})

function formatFeatureKey(key: string): string {
  return key.replace(/:/g, ' › ')
}
</script>

<template>
  <div class="au">
    <!-- Empty state when no data -->
    <div v-if="!moduleCounts.length && !featureCounts.length" class="au-empty">
      <p class="au-empty-text">No usage data yet. Navigate around and use features to start tracking.</p>
    </div>

    <template v-else>
      <!-- Top row: session stats + streak -->
      <section class="au-row au-stats">
        <div class="au-stat-card">
          <div class="au-stat-value">{{ sessions.length }}</div>
          <div class="au-stat-label">Sessions</div>
          <div class="au-stat-sub">last {{ period }}d</div>
        </div>
        <div class="au-stat-card">
          <div class="au-stat-value">{{ avgDuration }}</div>
          <div class="au-stat-label">Avg session</div>
        </div>
        <div class="au-stat-card">
          <div class="au-stat-value">{{ longestSession }}</div>
          <div class="au-stat-label">Longest session</div>
        </div>
        <div class="au-stat-card au-stat-card--accent">
          <div class="au-stat-value">{{ appStreak }}</div>
          <div class="au-stat-label">Day streak</div>
          <div class="au-stat-sub">consecutive days opened</div>
        </div>
      </section>

      <!-- Module usage bars -->
      <section v-if="moduleCounts.length" class="au-section">
        <h2 class="au-section-title">Module usage</h2>
        <p class="au-section-sub">Visits in the last {{ period }} days</p>
        <div class="au-bars">
          <div
            v-for="[mod, count] in moduleCounts"
            :key="mod"
            class="au-bar-row"
          >
            <span class="au-bar-label">{{ mod }}</span>
            <div class="au-bar-track">
              <div
                class="au-bar-fill"
                :style="{ width: `${(count / moduleMax) * 100}%` }"
              />
            </div>
            <span class="au-bar-count">{{ count }}</span>
          </div>
        </div>
      </section>

      <!-- Feature use (top 10) -->
      <section v-if="featureCounts.length" class="au-section">
        <h2 class="au-section-title">Top features</h2>
        <p class="au-section-sub">Most used features in the last {{ period }} days</p>
        <div class="au-bars">
          <div
            v-for="[key, count] in featureCounts"
            :key="key"
            class="au-bar-row"
          >
            <span class="au-bar-label au-bar-label--feature">{{ formatFeatureKey(key) }}</span>
            <div class="au-bar-track">
              <div
                class="au-bar-fill au-bar-fill--feature"
                :style="{ width: `${(count / featureMax) * 100}%` }"
              />
            </div>
            <span class="au-bar-count">{{ count }}</span>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.au { display: flex; flex-direction: column; gap: 28px; }

.au-empty { padding: 40px 0; text-align: center; }
.au-empty-text { font-size: 14px; color: var(--color-text-muted); max-width: 380px; margin: 0 auto; }

/* Stats row */
.au-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.au-stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-shadow: var(--shadow-1);
  transition: box-shadow var(--t-fast);
}
.au-stat-card:hover { box-shadow: var(--shadow-2); }
.au-stat-card--accent { border-color: color-mix(in srgb, var(--color-accent) 30%, transparent); }
.au-stat-value { font-size: 26px; font-weight: 700; font-family: var(--font-mono); color: var(--color-text); }
.au-stat-card--accent .au-stat-value { color: var(--color-accent); }
.au-stat-label { font-size: 12px; font-weight: 600; color: var(--color-text-secondary); }
.au-stat-sub   { font-size: 11px; color: var(--color-text-muted); }

/* Section */
.au-section { display: flex; flex-direction: column; gap: 12px; }
.au-section-title { font-size: 15px; font-weight: 700; color: var(--color-text); margin: 0; }
.au-section-sub   { font-size: 12px; color: var(--color-text-muted); margin: 0; }

/* Bar rows */
.au-bars { display: flex; flex-direction: column; gap: 8px; }

.au-bar-row {
  display: grid;
  grid-template-columns: 120px 1fr 36px;
  align-items: center;
  gap: 10px;
}
.au-bar-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.au-bar-label--feature { font-family: var(--font-mono); font-size: 11px; }

.au-bar-track {
  height: 8px;
  border-radius: 4px;
  background: var(--color-surface-2);
  overflow: hidden;
}
.au-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: var(--color-accent);
  opacity: 0.75;
  transition: width 0.4s var(--ease-smooth);
}
.au-bar-fill--feature { background: color-mix(in srgb, var(--color-accent) 60%, #a78bfa); opacity: 0.8; }

.au-bar-count { font-size: 12px; font-weight: 600; color: var(--color-text-muted); font-family: var(--font-mono); text-align: right; }

@media (max-width: 600px) {
  .au-stats { grid-template-columns: repeat(2, 1fr); }
  .au-bar-row { grid-template-columns: 90px 1fr 30px; }
}
</style>
