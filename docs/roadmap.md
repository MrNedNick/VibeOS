# Roadmap

This document tracks what we're building, what's next, and the ideas backlog.

---

## App Planning Discipline

> **Rule (added 2026-05-26):** No app should be implemented without a written specification first.

Before starting any new app:

1. **Write the spec** — create `docs/modules/[name].md` with purpose, data model, component architecture, and open questions
2. **Define the data model** — TypeScript interfaces for the main entities
3. **Choose dependencies** — libraries, patterns, architectural decisions
4. **Add to dashboard** — update `MODULE_DETAILS` in `platform-notes.ts` with nextTasks and notes
5. **Only then implement** — following the established module pattern

This prevents scope creep and ensures every app has clear intent before code is written.

### Which app to build next?

**Notes chosen and built (2026-05-26).** Rationale: immediately useful, low dependency surface, established the fullbleed workspace layout pattern that Board will also use.

**Remaining candidates:**

| App | Reason to build next | Complexity |
|-----|---------------------|------------|
| Board | Visually impressive, reuses Notes workspace layout, natural Tasks complement | High |
| Studio | Most portfolio-visible, Claude API is relevant and modern | Medium |

> Next decision pending. Board is the current frontrunner.

---

## Now

Nothing currently in active sprint. VibeOS foundation (Dashboard, Docs, Tasks, Notes) is complete.

### Recently shipped (2026-05-26)

| Feature | Module | Details |
|---------|--------|---------|
| Module quick-launch button | Dashboard | `→` button on hover navigates directly to any available module |
| Copy button on code blocks | Docs | Appears on hover over `<pre>`, uses `navigator.clipboard` |
| Anchor links on headings | Docs | `#` link appears on hover, updates URL hash for deep-linking |
| Keyboard shortcuts | Notes | `⌘N` new note · `⌘F` focus search · `⌘⇧P` toggle preview mode |
| Inline task editing | Tasks | Double-click any active task text to edit in-place; `Enter` to save, `Esc` to cancel |

---

## Next

Prioritized features for the next development sessions:

### 1. Board app
- Visual board with columns (To Do / In Progress / Done)
- Card creation, editing, drag-and-drop reorder
- Persisted to localStorage via `useStorage`
- Follows Tasks patterns for types/store/composable
- Fullbleed workspace layout (same pattern as Notes)

### 2. Tasks — Product Identity
- Choose a standalone product name (not just "Tasks")
- Define visual identity: logo, accent color, typography personality
- Marketing-style positioning: what problem it solves, who it's for
- Treat it as a real product that could be extracted and sold

### 3. Localization infrastructure
- Add `vue-i18n` as the i18n solution
- Create a locale composable that wraps `useI18n`
- Implement English as default + Russian
- All apps must support locale strings — no hardcoded UI text

### 4. Notes app ✅ Done (2026-05-26)
- Markdown editor with live preview (split-pane) ✓
- Note list with titles, dates, search ✓
- Auto-save with 300ms debounce ✓
- Persisted to localStorage ✓
- Fullbleed workspace layout ✓

---

## ⚡ HIGH PRIORITY — Responsive design

> **Rule (added 2026-05-26):** Every new component and module must include responsive styles from day one. See `CLAUDE.md` for the full rule and checklist.
>
> **Priority level: HIGH** — Must be done before any new module development begins.

### Target devices

| Breakpoint | Device | Width | Owner priority |
|------------|--------|-------|---------------|
| `xl` | Mac Studio Display (27" 5K) | ≥ 1920px | Primary |
| `lg` | MacBook Pro 14"/16" (default) | 1280–1919px | Primary |
| `md` | iPad / small laptop | 768–1279px | Secondary |
| `sm` | Mobile (iPhone) | < 768px | Required |

### Phase 1 — Layout foundation *(HIGH — do before next feature sprint)*
- CSS breakpoint variables in `main.css`
- Sidebar: collapses to icon-only on `md`, becomes bottom tab bar on `sm`
- AppLayout: stacks vertically on `sm`
- Content padding scales: 32px → 20px → 14px

### Phase 2 — Per-module responsive *(per module, when built or polished)*
- Dashboard: stat cards 2×2 on `md`, 1-column on `sm`
- Notes: hide preview on `sm`, collapsible note list on `sm`
- Docs: sidebar becomes top dropdown on `sm`
- Tasks: already flexible, minor padding adjustments only

### Phase 3 — Mac Studio Display optimization *(later)*
- Content max-width increases to `1200px` for `xl`
- Wider sidebar option for large displays

---

## Later

- **Studio** — Claude API integration, prompt builder with streaming, response explorer
- **Component Playground** — Design system viewer with interactive component demos
- **Global keyboard shortcuts** — ⌘K command palette, app-level shortcuts
- **Drag-and-drop** — Board cards + Tasks reordering (use `@vueuse/core` or native HTML5 DnD)
- **Deploy to Vercel** — Public deployment with GitHub Actions CI
- **Error boundaries** — Global error handler, app-level fallbacks
- **Test suite** — Vitest + Vue Test Utils for unit/component tests
- **Theme per app** — Allow app-level accent color customization

---

## Currency module (planned)

**Route:** `/currency`  
**Status:** Planned  
**API:** [Frankfurter](https://www.frankfurter.app/) — completely free, no API key, ECB data, no rate limits

### Purpose
Live exchange rate viewer. Select currency pairs, see real-time rates, track favorites. Dashboard widget shows top pairs at a glance.

### Planned features
- Currency pair selector (from / to) with search
- Live rate display with last-updated timestamp
- Favorite pairs saved to localStorage
- Multi-pair view (watch several rates at once)
- Simple rate history sparkline (7d / 30d)
- Dashboard widget: top 3–5 favorite pairs

### Data model
```typescript
interface CurrencyPair {
  base: string      // 'USD'
  target: string    // 'EUR'
  rate: number
  updatedAt: string
}

interface CurrencyState {
  favorites: CurrencyPair[]
  lastFetch: Record<string, number>  // base → timestamp
}
```

### API endpoints (Frankfurter, no key needed)
```
GET https://api.frankfurter.app/latest?from=USD&to=EUR,RUB,GBP
GET https://api.frankfurter.app/2024-01-01..?from=USD&to=EUR   // history
GET https://api.frankfurter.app/currencies                       // all currencies
```

### Dashboard widget
Compact card on Dashboard showing 3–5 favorite pairs with colored up/down indicators. Updates on widget mount.

---

## Open API ideas backlog

Ideas for future modules using free/open APIs (no paid tier required):

| Idea | API | Key needed | Complexity |
|------|-----|-----------|------------|
| **Weather widget** | OpenWeatherMap free | Yes (free) | Low |
| **Crypto prices** | CoinGecko | No | Low |
| **GitHub stats** | GitHub REST API | No (public) | Medium |
| **Hacker News feed** | HN Algolia API | No | Low |
| **Dev jokes widget** | JokeAPI | No | Trivial |
| **NASA photo of the day** | NASA APOD | Yes (free) | Low |
| **IP / geo info** | ip-api.com | No | Low |
| **Random Wikipedia** | Wikipedia API | No | Low |
| **QR code generator** | goqr.me | No | Trivial |
| **Color palette** | TheColorAPI | No | Low |
| **Public holidays** | Nager.Date API | No | Low |
| **World time / timezone** | worldtimeapi.org | No | Low |

**Most immediately useful for developers:**
1. GitHub stats (commits, open PRs, stars on repos)
2. Hacker News top stories feed
3. Weather widget (location-based)
4. Crypto prices (BTC/ETH/SOL quick view)

---

## Ideas Backlog

### Tasks
- Due dates with calendar picker
- Priority levels (low / medium / high / urgent)
- Recurring tasks
- Subtasks / nested task trees
- Export to CSV / JSON
- Keyboard-first navigation

### VibeOS Platform
- Global search (⌘K) across all apps
- Activity log / history per app
- User profile (avatar, display name — even if mock)
- Platform analytics: which apps are used most

### Board (future)
- Swimlanes
- Labels and colors
- Assignees (even if mock)
- Sprint planning view
- Board import from Trello / Linear JSON

### Notes (future)
- Folder / notebook organization
- Links between notes (wiki-style)
- Code block syntax highlighting
- Export to PDF

---

## Technical Improvements

| Item | Priority | Notes |
|------|----------|-------|
| Add Vitest + Vue Test Utils | High | Start with composable unit tests |
| Error boundaries | High | Global + app-level fallback UI |
| localStorage migration strategy | Medium | Schema versioning for stored data |
| Loading skeletons | Medium | For any future async operations |
| Route-level code splitting audit | Low | Verify lazy loading works correctly |

---

## Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-05-26 | `marked` for markdown rendering | Simple API, no Vue wrapper needed, good TypeScript support |
| 2026-05-26 | Static data files for dashboard notes | Keeps content close to code, easy to migrate to API later |
| 2026-05-26 | Module `section` field in registry | Enables multi-section sidebar without breaking existing modules |
| 2026-05-26 | Dashboard at `/` (not `/dashboard`) | Home page should always be the platform overview |
| 2026-05-26 | Notes: textarea + marked, no editor lib | Zero bundle cost, full control, marked already installed |
| 2026-05-26 | Platform rebranded to VibeOS | Developer culture identity; `//` logo; Geist font |
| 2026-05-26 | Sidebar sections: System / Apps | Cleaner than Platform/Modules; matches VibeOS OS metaphor |
