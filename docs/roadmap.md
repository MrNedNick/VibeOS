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

## Medium priority

Features worth building after the "Next" sprint:

### Open API widgets *(medium — pick any one for a quick win)*

| Widget | API | Key | Effort |
|--------|-----|-----|--------|
| **Currency rates** | Frankfurter | No | Low — spec written |
| **GitHub stats** | GitHub REST | No (public) | Medium |
| **Hacker News feed** | HN Algolia | No | Low |
| **Weather** | OpenWeatherMap | Free key | Low |
| **Crypto prices** | CoinGecko | No | Low |
| **Dev jokes** | JokeAPI | No | Trivial |
| **NASA photo** | NASA APOD | Free key | Low |
| **World time** | worldtimeapi.org | No | Low |

Most immediately useful: Currency (already specced) → GitHub stats → HN feed → Weather.

---

## ⚡ HIGH PRIORITY — Design & visual identity

> **Added 2026-05-26.** The platform works well technically but needs a proper design pass before it looks like a real product.

### What needs to happen

**Logo & brand identity**
- The current `//` text logo is a placeholder — design a real logotype or icon mark
- Define a consistent brand personality: is VibeOS minimal/corporate or playful/hacker?
- Choose a secondary accent color (or stick to mono with single accent)

**Global UI polish**
- Sidebar: improve visual hierarchy, active state, icons (currently unicode glyphs)
- Header / app bar: more deliberate spacing and weight
- Typography: consider a proper heading/body size contrast rather than just bumping px
- Spacing: audit padding/gap values for consistency — many are one-off
- Module headers: each module's header area should feel intentional, not boilerplate

**Component library**
- Standardize button variants: primary / secondary / ghost / destructive
- Input fields: consistent height, border, focus ring across all modules
- Cards / panels: define a single card pattern instead of per-module one-offs
- Eventually extract to a `src/ui/` design system (some already there: `UiButton`)

**CSS architecture**
- All font-size values are still hardcoded in components — they should use `--text-*` scale variables from `main.css`
- Audit components to gradually replace hardcoded px with `--text-*` variables
- Add spacing scale variables: `--space-1` through `--space-8`

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

## Deployment — free hosting

> **Added 2026-05-26.** Target: live on the internet, zero cost, permanent URL.

### Options (all free, all good for a Vite SPA)

| Service | Notes | Custom domain | Verdict |
|---------|-------|---------------|---------|
| **GitHub Pages** | Free forever, deploys from `gh-pages` branch or `docs/` folder, GitHub Actions CI | Yes (free) | ✓ Best for open-source |
| **Vercel** | Instant deploy on every push, preview URLs per PR, generous free tier | Yes (free) | ✓ Best DX overall |
| **Netlify** | Similar to Vercel, slightly older | Yes (free) | Good fallback |
| **Cloudflare Pages** | Fast CDN, unlimited bandwidth | Yes (free) | Good if already using CF |

**Recommendation: Vercel** — zero config for Vite, preview deployments per PR, custom domain in 1 click, never need to think about it again.

### What to do
1. Push repo to GitHub (already planned)
2. Connect repo to Vercel (vercel.com → "New Project" → import GitHub repo)
3. Build command: `npm run build` / Output dir: `dist`
4. Done — every push to `main` auto-deploys

For GitHub Pages (alternative):
- Add `.github/workflows/deploy.yml` with `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4`
- Set `base: '/VibeOS/'` in `vite.config.ts` (important for sub-path routing)

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

## Games module

> **Added 2026-05-26.** A dedicated Games section inside VibeOS — classic games, beautifully implemented with consistent dark UI style.

Each game is its own sub-route under `/games/[name]` with a shared game launcher/lobby page at `/games`.

### Recommended games — ranked by fun-to-effort ratio

| Game | Why it's great | Tech needed | Effort |
|------|---------------|-------------|--------|
| **2048** | Smooth tile animations, satisfying merge physics, pure CSS grid | Vue + CSS transitions | Low |
| **Memory Cards** | Beautiful CSS flip animations, variable grid sizes, theme-able card backs | Vue + CSS 3D transforms | Low |
| **Minesweeper** | Tension + logic, right-click flagging, auto-reveal flood-fill | Vue + CSS grid | Low |
| **Snake** | Addictive, fits the dark terminal aesthetic perfectly | Canvas + `requestAnimationFrame` | Low-medium |
| **Wordle clone** | Instantly recognizable, keyboard input, green/yellow/grey tiles | Vue + word list JSON | Medium |
| **Tetris** | Most visually impressive, fits the VibeOS grid aesthetic | Canvas or CSS grid | Medium |
| **Pong** | Minimal and elegant, optionally vs AI | Canvas | Medium |

### Start with these 3 (best ROI)

1. **2048** — no canvas needed, pure CSS grid + transitions, will look beautiful in dark theme
2. **Memory Cards** — CSS 3D flip is visually stunning, dead simple logic
3. **Snake** — retro terminal aesthetic is perfect for VibeOS brand

### Shared architecture
- Route: `/games` → lobby page with game grid
- Each game: `/games/2048`, `/games/snake`, etc.
- Shared: `useGameLoop` composable for canvas games, `useHighScore` for localStorage persistence
- Each game should have: high score display, difficulty picker, keyboard shortcuts

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
