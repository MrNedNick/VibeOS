<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
  isDay:       boolean
  weatherCode: number
  fetchedAt:   string
}

// ── State ──────────────────────────────────────────────────────────────
const cityInput = useStorage<string>('platform:dashboard:weather-city', '')
const inputVal  = ref(cityInput.value)
const weather   = ref<WeatherData | null>(null)
const loading   = ref(false)
const error     = ref<string | null>(null)
const editing   = ref(false)

// ── Weather icon mapping (wttr.in weatherCode → Lucide) ───────────────
// wttr.in weather condition codes (WMO Weather interpretation codes)
function weatherIcon(code: number, isDay: boolean): string {
  if (code === 0)             return isDay ? 'Sun' : 'Moon'
  if (code <= 2)              return isDay ? 'CloudSun' : 'Cloud'
  if (code <= 3)              return 'Cloud'
  if (code <= 48)             return 'CloudFog'
  if (code <= 57)             return 'CloudDrizzle'
  if (code <= 67)             return 'CloudRain'
  if (code <= 77)             return 'Snowflake'
  if (code <= 82)             return 'CloudRain'
  if (code <= 86)             return 'Snowflake'
  if (code <= 99)             return 'CloudLightning'
  return 'Cloud'
}

const currentIcon = computed(() =>
  weather.value ? weatherIcon(weather.value.weatherCode, weather.value.isDay) : 'Cloud'
)

// ── Relative last-fetched time ─────────────────────────────────────────
const lastFetchedLabel = computed(() => {
  if (!weather.value) return ''
  const diff = Date.now() - new Date(weather.value.fetchedAt).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)   return 'just now'
  if (mins === 1) return '1m ago'
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ago`
})

// ── wttr.in fetch ──────────────────────────────────────────────────────
// Uses the open-meteo-based JSON API — no key, no account needed
async function fetchWeather(city: string): Promise<void> {
  if (!city.trim()) return

  loading.value = true
  error.value   = null

  try {
    // Step 1: geocode city via Open-Meteo geocoding (free, no key)
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city.trim())}&count=1&language=en&format=json`
    const geoRes = await fetch(geoUrl)
    if (!geoRes.ok) { error.value = 'Geocoding failed — check your connection'; loading.value = false; return }

    const geoData = await geoRes.json()
    if (!geoData.results?.length) { error.value = `City "${city}" not found`; loading.value = false; return }

    const loc = geoData.results[0]
    const { latitude, longitude, name, country } = loc

    // Step 2: fetch weather from Open-Meteo (free, no key)
    const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day&wind_speed_unit=ms&timezone=auto`
    const wRes = await fetch(wUrl)
    if (!wRes.ok) { error.value = `Weather API error ${wRes.status}`; loading.value = false; return }

    const wData = await wRes.json()
    const c = wData.current

    // WMO weather description mapping
    const desc = wmoDescription(c.weather_code)

    weather.value = {
      city:        name,
      country:     country ?? '',
      temp:        Math.round(c.temperature_2m),
      feelsLike:   Math.round(c.apparent_temperature),
      humidity:    c.relative_humidity_2m,
      windSpeed:   Math.round(c.wind_speed_10m),
      description: desc,
      isDay:       !!c.is_day,
      weatherCode: c.weather_code,
      fetchedAt:   new Date().toISOString(),
    }
  } catch {
    error.value = 'Network error — check your connection'
  } finally {
    loading.value = false
  }
}

function wmoDescription(code: number): string {
  const WMO: Record<number, string> = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Icy fog',
    51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
    56: 'Light freezing drizzle', 57: 'Freezing drizzle',
    61: 'Slight rain', 63: 'Rain', 65: 'Heavy rain',
    66: 'Freezing rain', 67: 'Heavy freezing rain',
    71: 'Slight snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
    80: 'Slight showers', 81: 'Showers', 82: 'Heavy showers',
    85: 'Slight snow showers', 86: 'Snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail',
  }
  return WMO[code] ?? 'Unknown'
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

    <!-- No city yet / city edit mode -->
    <div v-if="!cityInput || editing" class="weather__setup">
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

    <!-- Error -->
    <div v-else-if="error" class="weather__error">
      <UiIcon name="AlertCircle" :size="14" />
      <span>{{ error }}</span>
      <button class="weather__retry" @click="refresh">Retry</button>
    </div>

    <!-- Weather data -->
    <div v-else-if="weather" class="weather__body">
      <!-- Main temp row -->
      <div class="weather__main">
        <div class="weather__icon-wrap" :class="{ 'weather__icon-wrap--night': !weather.isDay }">
          <UiIcon :name="currentIcon" :size="28" :stroke-width="1.4" />
        </div>
        <div class="weather__temp-block">
          <span class="weather__temp">{{ weather.temp }}°C</span>
          <span class="weather__desc">{{ weather.description }}</span>
        </div>
        <div class="weather__location">
          <UiIcon name="MapPin" :size="12" :stroke-width="2" />
          <span>{{ weather.city }}<template v-if="weather.country">, {{ weather.country }}</template></span>
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

    <!-- City set but no data yet -->
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

/* Setup */
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
.weather__empty-text { font-size: 13px; color: var(--color-text-muted); }

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
  color: #ef4444;
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
