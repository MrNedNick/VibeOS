# Module: Currency

**Status:** Planned  
**Route:** `/currency`  
**Priority:** Medium  
**API:** [Frankfurter](https://www.frankfurter.app/) — free, no API key, ECB data, no rate limits

---

## Purpose

A live exchange rate viewer. Select currency pairs, see up-to-date rates, save favorites. A compact widget on the Dashboard shows your top pairs at a glance without opening the full module.

---

## Data Model

```typescript
interface CurrencyPair {
  base: string      // 'USD'
  target: string    // 'EUR'
  rate: number      // 1.08
  updatedAt: string // ISO 8601
}

interface CurrencySettings {
  favorites: Array<{ base: string; target: string }>
  defaultBase: string   // default 'USD'
}
```

**Storage key:** `platform:currency:settings`

---

## API — Frankfurter (no key required)

```
# Latest rates from base currency
GET https://api.frankfurter.app/latest?from=USD&to=EUR,RUB,GBP,JPY

# Historical rates for sparkline
GET https://api.frankfurter.app/2024-01-01..2024-01-30?from=USD&to=EUR

# All supported currencies
GET https://api.frankfurter.app/currencies
```

Response shape:
```json
{
  "amount": 1.0,
  "base": "USD",
  "date": "2026-05-26",
  "rates": {
    "EUR": 0.9182,
    "RUB": 89.50,
    "GBP": 0.7891
  }
}
```

Supported currencies: ~33 major world currencies (ECB basket). For crypto, CoinGecko (no key) can be added later.

---

## Architecture

```
src/modules/currency/
  types/index.ts                — CurrencyPair, CurrencySettings
  stores/currency.store.ts      — Pinia store, favorites, cached rates
  composables/useCurrency.ts    — fetch logic, auto-refresh, rate helpers
  components/
    CurrencyPairRow.vue         — single pair: base → target, rate, change
    CurrencySelector.vue        — searchable dropdown to pick currencies
    CurrencySparkline.vue       — 7d rate history (simple SVG line)
    DashboardWidget.vue         — compact 3–5 pair widget for Dashboard
  views/CurrencyView.vue        — full module view
  index.ts                      — route definition
```

---

## Features

### Full module view (`/currency`)
- Add/remove currency pairs
- See live rate for each pair
- Up/down change indicator (vs previous close)
- Last-updated timestamp per pair
- Auto-refresh every 60 seconds
- Historical sparkline (7d by default, toggle 30d)

### Dashboard widget
- Shows 3–5 favorite pairs in a compact card
- Colored indicators: green = up, red = down vs yesterday
- Click to navigate to full Currency module
- Fetches on widget mount, no background polling

---

## Component Responsibilities

### `currency.store.ts`
- `settings: CurrencySettings` — favorites list, persisted via `useStorage`
- `rateCache: Record<string, { rates: Record<string, number>; date: string }>` — in-memory only
- `addFavorite(base, target)` / `removeFavorite(base, target)`
- `setRates(base, rates, date)` — updates cache

### `useCurrency.ts`
- `fetchRates(base, targets[])` — calls Frankfurter API via `useAsync`
- `getRate(base, target)` — reads from cache
- `autoRefresh(intervalMs)` — sets up interval, cleans up on unmount
- `allCurrencies` — loaded once on mount

### `CurrencyPairRow.vue`
```
┌─────────────────────────────────────────┐
│  USD → EUR       1.0823   ▲ +0.12%      │
│  [sparkline 7d]                          │
└─────────────────────────────────────────┘
```

### `DashboardWidget.vue` (mounted in DashboardView)
```
┌──────────────────┐
│ ◎ Currency       │
│ USD/EUR  1.0823  │
│ USD/RUB  89.50   │
│ USD/GBP  0.7891  │
└──────────────────┘
```

---

## Planned Improvements

- Currency converter (type an amount, see result live)
- Price alert: notify when pair crosses a threshold
- Crypto prices via CoinGecko (free, no key, 50 calls/min)
- Base currency quick-switch in toolbar

---

## Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-05-26 | Frankfurter API | Free, no key, ECB data, no rate limits, simple JSON |
| 2026-05-26 | No crypto initially | CoinGecko has different shape; add in v2 once core is working |
| 2026-05-26 | In-memory rate cache | Rates don't need to persist — always fresh on mount |
| 2026-05-26 | Dashboard widget separate component | Follows Notes/Docs pattern; widget is self-contained |
