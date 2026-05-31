<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useStorage } from '@/core/composables/useStorage'
import { UiIcon, UiSkeleton } from '@/ui'

interface GitHubCommit { message: string; sha: string }
interface GitHubEvent {
  id: string
  type: string
  created_at: string
  repo: { name: string }
  payload: {
    commits?: GitHubCommit[]
    ref?: string
  }
}

interface CommitRow {
  sha: string
  message: string
  repo: string
  date: string
  branch: string
}

// ── State ──────────────────────────────────────────────────────────────
const username  = useStorage<string>('platform:dashboard:github-username', '')
const inputVal  = ref(username.value)
const commits   = ref<CommitRow[]>([])
const loading   = ref(false)
const error     = ref<string | null>(null)
const lastFetch = ref<string | null>(null)

// ── Activity graph — 14 days ───────────────────────────────────────────
const activityMap = computed(() => {
  const map: Record<string, number> = {}
  for (const c of commits.value) {
    const day = c.date.split('T')[0]
    map[day] = (map[day] ?? 0) + 1
  }
  return map
})

const activityDays = computed(() => {
  const days: { date: string; count: number }[] = []
  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const ds = d.toISOString().split('T')[0]
    days.push({ date: ds, count: activityMap.value[ds] ?? 0 })
  }
  return days
})

const maxActivity = computed(() =>
  Math.max(1, ...activityDays.value.map(d => d.count))
)

function activityColor(count: number): string {
  if (count === 0) return 'var(--color-surface-elevated)'
  const pct = count / maxActivity.value
  if (pct < 0.33) return 'color-mix(in srgb, var(--color-accent) 30%, transparent)'
  if (pct < 0.67) return 'color-mix(in srgb, var(--color-accent) 60%, transparent)'
  return 'var(--color-accent)'
}

// ── Fetch ──────────────────────────────────────────────────────────────
async function fetchActivity(): Promise<void> {
  if (!username.value.trim()) return
  loading.value = true
  error.value   = null
  try {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username.value.trim())}/events/public?per_page=100`,
      { headers: { Accept: 'application/vnd.github+json' } }
    )
    if (res.status === 404) { error.value = 'User not found'; return }
    if (res.status === 403) { error.value = 'Rate limited — try again later'; return }
    if (!res.ok) { error.value = `GitHub API error ${res.status}`; return }

    const events: GitHubEvent[] = await res.json()
    const rows: CommitRow[] = []
    for (const ev of events) {
      if (ev.type !== 'PushEvent') continue
      const branch = ev.payload.ref?.replace('refs/heads/', '') ?? ''
      for (const c of (ev.payload.commits ?? [])) {
        rows.push({
          sha:     c.sha.slice(0, 7),
          message: c.message.split('\n')[0].slice(0, 72),
          repo:    ev.repo.name,
          date:    ev.created_at,
          branch,
        })
      }
    }
    commits.value = rows.slice(0, 30)
    lastFetch.value = new Date().toISOString()
  } catch {
    error.value = 'Network error — could not reach GitHub'
  } finally {
    loading.value = false
  }
}

function saveUsername(): void {
  username.value = inputVal.value.trim()
  fetchActivity()
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffH = Math.round((now.getTime() - d.getTime()) / 3600000)
  if (diffH < 1) return 'just now'
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'yesterday'
  if (diffD < 7) return `${diffD}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

onMounted(() => {
  inputVal.value = username.value
  if (username.value) fetchActivity()
})
</script>

<template>
  <div class="gh-widget">
    <div class="gh-widget__header">
      <div class="gh-widget__title-row">
        <UiIcon name="Github" :size="15" class="gh-widget__icon" />
        <span class="gh-widget__title">GitHub Activity</span>
        <button
          v-if="username"
          class="gh-widget__refresh"
          :disabled="loading"
          title="Refresh"
          @click="fetchActivity"
        >
          <UiIcon :name="loading ? 'Loader2' : 'RefreshCw'" :size="12" :class="{ 'icon-spin': loading }" />
        </button>
      </div>

      <!-- Username input -->
      <form class="gh-widget__form" @submit.prevent="saveUsername">
        <input
          v-model="inputVal"
          class="gh-widget__input"
          placeholder="github username"
          autocomplete="off"
          spellcheck="false"
        />
        <button type="submit" class="gh-widget__go" :disabled="!inputVal.trim()">Go</button>
      </form>
    </div>

    <!-- Loading skeleton -->
    <template v-if="loading && !commits.length">
      <div class="gh-widget__skeleton-graph">
        <UiSkeleton v-for="n in 14" :key="n" width="100%" height="20px" rounded="sm" />
      </div>
      <div class="gh-widget__skeleton-rows">
        <div v-for="n in 5" :key="n" class="gh-widget__skeleton-row">
          <UiSkeleton width="44px" height="11px" rounded="full" />
          <UiSkeleton width="100%" height="11px" rounded="full" />
          <UiSkeleton width="38px" height="11px" rounded="full" />
        </div>
      </div>
    </template>

    <!-- Error state -->
    <p v-else-if="error" class="gh-widget__error">
      <UiIcon name="AlertCircle" :size="12" />
      {{ error }}
    </p>

    <!-- Empty / no user -->
    <p v-else-if="!username" class="gh-widget__hint">
      Enter your GitHub username to see recent activity
    </p>

    <template v-else-if="!loading || commits.length">
      <!-- Activity mini-graph -->
      <div class="gh-widget__graph">
        <div
          v-for="day in activityDays"
          :key="day.date"
          class="gh-widget__day"
          :style="{ background: activityColor(day.count) }"
          :title="`${day.date}: ${day.count} commit${day.count !== 1 ? 's' : ''}`"
        />
      </div>

      <!-- Recent commits list -->
      <div class="gh-widget__commits">
        <p v-if="!commits.length && !loading" class="gh-widget__hint">No recent push events found.</p>
        <div
          v-for="c in commits.slice(0, 8)"
          :key="c.sha"
          class="gh-widget__commit"
        >
          <code class="gh-widget__sha">{{ c.sha }}</code>
          <span class="gh-widget__msg">{{ c.message }}</span>
          <span class="gh-widget__date">{{ fmtDate(c.date) }}</span>
        </div>
      </div>

      <p v-if="lastFetch" class="gh-widget__last">
        Last updated {{ fmtDate(lastFetch) }} · {{ commits.length }} commits loaded
      </p>
    </template>
  </div>
</template>

<style scoped>
.gh-widget {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gh-widget__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.gh-widget__title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.gh-widget__icon { color: var(--color-text-secondary); }

.gh-widget__title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
}

.gh-widget__refresh {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color var(--t-fast);
}
.gh-widget__refresh:hover:not(:disabled) { color: var(--color-accent); }
.gh-widget__refresh:disabled { opacity: 0.5; cursor: not-allowed; }

.gh-widget__form {
  display: flex;
  gap: 4px;
}

.gh-widget__input {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xs);
  padding: 3px 8px;
  width: 130px;
  outline: none;
  transition: border-color var(--t-fast);
}
.gh-widget__input:focus { border-color: var(--color-accent); }
.gh-widget__input::placeholder { color: var(--color-text-muted); }

.gh-widget__go {
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-xs);
  background: var(--color-accent);
  color: #fff;
  cursor: pointer;
  transition: opacity var(--t-fast);
}
.gh-widget__go:hover:not(:disabled) { opacity: 0.88; }
.gh-widget__go:disabled { opacity: 0.4; cursor: not-allowed; }

.gh-widget__error {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--color-danger);
  margin: 0;
}

.gh-widget__hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}

/* Activity graph */
.gh-widget__graph {
  display: flex;
  gap: 3px;
}

.gh-widget__day {
  flex: 1;
  height: 20px;
  border-radius: 3px;
  transition: background var(--t-fast);
  cursor: default;
}

/* Commits list */
.gh-widget__commits {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.gh-widget__commit {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 12px;
  padding: 3px 0;
  border-bottom: 1px solid var(--color-border);
}
.gh-widget__commit:last-child { border-bottom: none; }

.gh-widget__sha {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--color-accent);
  flex-shrink: 0;
}

.gh-widget__msg {
  flex: 1;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gh-widget__date {
  font-size: 11px;
  color: var(--color-text-muted);
  flex-shrink: 0;
  font-family: var(--font-mono);
}

.gh-widget__last {
  font-size: 11px;
  color: var(--color-text-muted);
  margin: 0;
  text-align: right;
  font-family: var(--font-mono);
}

.icon-spin {
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Skeleton */
.gh-widget__skeleton-graph {
  display: flex;
  gap: 3px;
}

.gh-widget__skeleton-rows {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.gh-widget__skeleton-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
