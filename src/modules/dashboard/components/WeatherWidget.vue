<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '@/core/composables/useStorage'
import { UiIcon } from '@/ui'

interface WeatherData {
  city:        string
  country:     string
  temp:        number
  feelsLike:   number
  humidity:    number
  windSpeed:   number
  description: string
  iconCode:    string
  fetchedAt:   string
}

// ── State ──────────────────────────────────────────────────────────────
const apiKey     = useStorage<string>('platform:settings:openweather-key', '')
const cityInput  = useStorage<string>('platform:dashboard:weather-city', '')
const inputVal   = ref(cityInput.value)
const weather    = ref<WeatherData | null>(null)
const loading    = ref(false)
const error      = ref<string | null>(null)
const editing    = ref(false)
const router     = useRouter()

// ── Weather icon mapping (uses OpenWeatherMap icon codes → lucide) ─────
const ICON_MAP: Record<string, string> = {
  '01': 'Sun',
  '02': 'CloudSun',
  '03': 'Cloud',
  '04': 'Cloud',
  '09': 'CloudDrizzle',
  '10': 'CloudRain',
  '11': 'CloudLightning',
  '13': 'Snowflake',
  '50': 'Wind',
}

const weatherIcon = computed(() => {
  if (!weather.value) return 'Cloud'
  const code = weather.value.iconCode.slice(0, 2)
  return ICON_MAP[code] ?? 'Cloud'
})

const isNight = computed(() =>
  weather.value?.iconCode?.endsWith('n') ?? false
)

// ── Relative last-fetched time ─────────────────────────────────────────
const lastFetchedLabel = computed(() => {
  if (!weather.value) return ''
  const diff = Date.now() - new Date(weather.value.fetchedAt).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins === 1) return '1m ago'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ago`
})

// ── Fetch ──────────────────────────────────────────────────────────────
async function fetchWeather(city: string): Promise<void> {
  if (!apiKey.value) {
    error.value = 'no-key'
    return
  }
  if (!city.trim()) return

  loading.value = true
  error.value   = null

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.trim())}&appid=${apiKey.value}&units=metric`
    const res = await fetch(url)

    if (res.status === 401) { error.value = 'Invalid API key'; loading.value = false; return }
    if (res.status === 404) { error.value = `City "${city}" not found`; loading.value = false; return }
    if (!res.ok)            { error.value = `Weather API error ${res.status}`; loading.value = false; return }

    const data = await res.json()

    weather.value = {
      city:        data.name,
      country:     data.sys.country,
      temp:        Math.round(data.main.temp),
      feelsLike:   Math.round(data.main.feels_like),
      humidity:    data.main.humidity,
      windSpeed:   Math.round(data.wind.speed),
      description: data.weather[0].description,
      iconCode:    data.weather[0].icon,
      fetchedAt:   new Date().toISOString(),
    }
  } catch {
    error.value = 'Network error — check your connection'
  } finally {
    loading.value = false
  }
}

function submit() {
  if (!inputVal.value.trim()) return
  cityInput.value = inputVal.value.trim()
  editing.value   = false
  fetchWeather(cityInput.value)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') submit()
  if (e.key === 'Escape') { editing.value = false; inputVal.value = cityInput.value }
}

function refresh() {
  if (cityInput.value) fetchWeather(cityInput.value)
}

// ── Auto-refresh every 30 minutes ─────────────────────────────────────
let intervalId = 0
onMounted(() => {
  if (cityInput.value) fetchWeather(cityInput.value)
  intervalId = setInterval(refresh, 30 * 60 * 1000) as unknown as number
})
onUnmounted(() => clearInterval(intervalId))
</script>

<template>
  <div class="weather">
    <!-- Header -->
    <div class="weather__header">
      <div class="weather__title-row">
        <UiIcon name="Cloud" :size="13" :stroke-width="2" class="weather__header-icon" />
        <span class="weather__title">Weather</span>
      </div>
      <div class="weather__header-actions">
        <button
          v-if="cityInput && !editing"
          class="weather__icon-btn"
          title="Change city"
          @click="editing = true; inputVal = cityInput"
        >
          <UiIcon name="MapPin" :size="13" :stroke-width="2" />
        </button>
        <button
          v-if="cityInput && !editing"
          class="weather__icon-btn"
          title="Refresh"
          @click="refresh"
        >
          <UiIcon name="RefreshCw" :size="13" :stroke-width="2" />
        </button>
      </div>
    </div>

    <!-- No API key -->
    <div v-if="error === 'no-key'" class="weather__empty">
      <p class="weather__empty-text">Add your OpenWeatherMap key in Settings to see weather.</p>
      <button class="weather__link-btn" @click="router.push('/settings')">
        <UiIcon name="Settings" :size="12" />
        Open Settings
      </button>
    </div>

    <!-- No city yet -->
    <div v-else-if="!cityInput || editing" class="weather__setup">
      <input
        v-model="inputVal"
        class="weather__city-input"
        placeholder="Enter city (e.g. Cologne)"
        @keydown="onKeydown"
        autofocus
      />
      <button class="weather__submit-btn" @click="submit">
        <UiIcon name="ArrowRight" :size="14" />
      </button>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="weather__loading">
      <UiIcon name="Loader" :size="20" :stroke-width="1.5" class="weather__spinner" />
      <span>Loading…</span>
    </div>

    <!-- Error (non-key) -->
    <div v-else-if="error" class="weather__error">
      <UiIcon name="AlertCircle" :size="14" />
      <span>{{ error }}</span>
      <button class="weather__retry" @click="refresh">Retry</button>
    </div>

    <!-- Weather data -->
    <div v-else-if="weather" class="weather__body">
      <!-- Main temp row -->
      <div class="weather__main">
        <div class="weather__icon-wrap" :class="{ 'weather__icon-wrap--night': isNight }">
          <UiIcon :name="weatherIcon" :size="28" :stroke-width="1.4" />
        </div>
        <div class="weather__temp-block">
          <span class="weather__temp">{{ weather.temp }}°C</span>
          <span class="weather__desc">{{ weather.description }}</span>
        </div>
        <div class="weather__location">
          <UiIcon name="MapPin" :size="12" :stroke-width="2" />
          <span>{{ weather.city }}, {{ weather.country }}</span>
        </div>
      </div>

      <!-- Detail row -->
      <div class="weather__details">
        <div class="weather__detail">
          <UiIcon name="Thermometer" :size="12" :stroke-width="2" />
          <span>Feels {{ weather.feelsLike }}°</span>
        </div>
        <div class="weather__detail">
          <UiIcon name="Droplets" :size="12" :stroke-width="2" />
          <span>{{ weather.humidity }}%</span>
        </div>
        <div class="weather__detail">
          <UiIcon name="Wind" :size="12" :stroke-width="2" />
          <span>{{ weather.windSpeed }} m/s</span>
        </div>
        <div class="weather__detail weather__detail--muted">
          <UiIcon name="Clock" :size="11" :stroke-width="2" />
          <span>{{ lastFetchedLabel }}</span>
        </div>
      </div>
    </div>

    <!-- No data yet but city set -->
    <div v-else class="weather__loading">
      <span class="weather__empty-text">No data yet — click refresh.</span>
    </div>
  </div>
</template>

<style scoped>
.weather {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 80px;
}

/* Header */
.weather__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.weather__title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.weather__header-icon { color: var(--color-text-muted); }

.weather__title {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.weather__header-actions {
  display: flex;
  gap: 4px;
}

.weather__icon-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  border-radius: var(--radius-xs);
  background: none;
  border: none;
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast);
}
.weather__icon-btn:hover { background: var(--color-surface-elevated); color: var(--color-text); }

/* Empty / setup states */
.weather__empty {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 6px 0;
}

.weather__empty-text {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin: 0;
}

.weather__link-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-accent);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: opacity var(--t-fast);
}
.weather__link-btn:hover { opacity: 0.75; }

.weather__setup {
  display: flex;
  gap: 6px;
  align-items: center;
}

.weather__city-input {
  flex: 1;
  padding: 7px 11px;
  font-size: 13px;
  font-family: var(--font-sans);
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  transition: border-color var(--t-fast);
}
.weather__city-input:focus { border-color: var(--color-accent); }
.weather__city-input::placeholder { color: var(--color-text-muted); }

.weather__submit-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent);
  color: #fff;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity var(--t-fast);
}
.weather__submit-btn:hover { opacity: 0.85; }

/* Loading */
.weather__loading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-muted);
  padding: 6px 0;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
.weather__spinner { animation: spin 1s linear infinite; }

/* Error */
.weather__error {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: var(--color-error, #ef4444);
  padding: 4px 0;
}

.weather__retry {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-accent);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

/* Weather body */
.weather__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.weather__main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.weather__icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.weather__icon-wrap--night {
  background: color-mix(in srgb, #6366f1 12%, transparent);
  color: #6366f1;
}

.weather__temp-block {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.weather__temp {
  font-size: 26px;
  font-weight: 800;
  font-family: var(--font-mono);
  letter-spacing: -0.03em;
  color: var(--color-text);
  line-height: 1;
}

.weather__desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  text-transform: capitalize;
}

.weather__location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-muted);
  flex-shrink: 0;
  text-align: right;
}

/* Details row */
.weather__details {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 6px;
  border-top: 1px solid var(--color-border);
}

.weather__detail {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.weather__detail--muted { color: var(--color-text-muted); margin-left: auto; }

@media (max-width: 767px) {
  .weather__location { display: none; }
  .weather__detail--muted { margin-left: 0; }
}
</style>
