# VibeOS — Strategy & Vision

> Written 2026-05-27 after a deep audit of the project. This is the north star — positioning, architecture, per-module direction, sprint plan. Update when major decisions change.

---

## 1. Diagnosis (current state)

Architecture is clean: layered, modular, typed, patterns hold. But as a product and as a portfolio piece, VibeOS does not yet "hook" a visitor:

1. No narrative. "Your engineering workspace" is generic.
2. The "OS" metaphor is unused. It's a sidebar + router-view, not an OS.
3. Modules are CRUD demos competing with industry leaders.
4. No landing — first impression is a dev-facing dashboard.
5. No identity. `//` logo and `#4f8ef7` accent are placeholders.
6. No backend / auth / sync — all state lost on cache clear.

---

## 2. Positioning

### Direction (chosen)
**Personal OS for the vibe-coding era + aesthetic vibe-paks.** A public personal setup, switchable between distinct visual moods (Terminal Dark, Brutalist, Soft Glass, CRT Retro). Each module is a tool the author actually uses; the OS shell ties them together with one keyboard.

### Tagline candidates
- "An operating system for one person — you."
- "All your tools. One keyboard. Zero ads."
- "Boot up your day."
- "Personal OS for the vibe-coding era."

### Why this wins
- Explains why these specific modules (they're the author's tools).
- Vibe-paks give a viral visual hook for Twitter/X.
- Doesn't require building a real SaaS with billing.

---

## 3. Architecture decisions

### 3.1 Storage — versioning + adapters
```
core/storage/
  adapters/{localStorage,indexedDB,remote}.ts
  schema/{registry,migrate}.ts
  sync/conflict.ts
```
`useStorage(key, default, { version, migrations })` runs migrations on read. Backend optional via Supabase.

### 3.2 Backend — Supabase (not custom Node)
- Postgres + GitHub OAuth + Storage + Realtime — free tier.
- Offline-first: localStorage by default; login triggers initial pull + ongoing sync.
- Sync status indicator in header (Synced / Offline / Conflict).
- Demonstrates "real database integration" without weeks of work.

### 3.3 Cross-module event bus
```ts
type Event =
  | { type: 'task.created'; payload: Task }
  | { type: 'note.opened';  payload: { id: string } }
  | { type: 'game.won';     payload: { game: string; score: number } }
```
Unlocks: Recent Activity feed, Analytics module, achievements, notifications-as-history.

### 3.4 Settings module — critical gap
Tabs: Appearance · Account · Keys · Data · Shortcuts · About. Unblocks vibe-pak picker, Studio (API key), Currency (base currency).

### 3.5 Command Palette (⌘K) — highest single-feature ROI
Module-registered commands, fuzzy search overlay. Bound globally. Instantly makes the app feel like a real product (Linear/Vercel/GitHub level).

### 3.6 Future: tabs or window manager
Open modules as tabs in the shell (with `<KeepAlive>`) so state survives navigation. Optional "stage view" with draggable windows for screenshots.

---

## 4. Visual identity

### Logo
Replace `//` with a blinking block cursor `▮` — claims "OS" identity, unused by competitors. Or a custom V/OS mark.

### Vibe-paks (themes)
Each pack is a complete CSS variable override:
1. **Terminal Dark** — current (#0a0a0a + #4f8ef7).
2. **Brutalist** — white bg, black 2px borders, mono everywhere, no shadows.
3. **Soft Glass** — backdrop-filter blur, pastels, soft shadows.
4. **CRT Retro** — green phosphor #39ff14, scanlines, flicker.

### Typography
Geist is fine for body but borrowed. Consider Berkeley Mono / Departure Mono / Commit Mono for headings to gain character.

### Icons
Switch to Lucide via `lucide-vue-next`. One dep, system-wide coherence upgrade.

---

## 5. Per-module direction

### Dashboard — make it feel alive
Replace dev stats with: clock+date+weather, Today's top 3 tasks, last 5 events, activity heatmap, optional quote/joke widget. Keep platform metrics in a "Platform" tab.

### Tasks — real product (codename Stride / Crisp / Loop)
- **Today view** (filter by `due == today`).
- **Focus mode** — fullscreen + Pomodoro timer.
- **Streaks** — ≥1 done/day grows the counter; heatmap.
- **Natural-language input** via chrono-node.
- Final name + brand identity.

### Notes — codename Inkwell / Glyph / Slate
- **[[wiki backlinks]]** — Obsidian's flagship feature in one day of work.
- **Daily journal** — "Today" button creates/opens a date-titled note.
- Templates, snippets vault (subtype).

### Board — not another Trello
- **Time-based swimlanes** (rows = days/sprints, columns = statuses) — hybrid Kanban + calendar.
- **Cards == Tasks** (one entity, two views).
- Drag-and-drop with subtle inertia.

### Studio — Prompt Lab (not a ChatGPT clone)
- Run one prompt across Opus/Sonnet/Haiku in parallel, diff responses.
- Temperature/max_tokens sliders, prompt versioning, saved prompts library, token/cost tracker.
- Positions the author as an AI engineer, not "wrapped ChatGPT".

### Games
- Achievements via event bus.
- High scores on Dashboard.
- Optional CRT vibe-pak skin.
- After 2048: Memory, Snake; later Tetris or Minesweeper (more visual than Wordle).

### Currency
Demote to a Dashboard widget + details page, not a standalone module.

### New modules to consider
- **Snippets** — code vault with highlight.js (already in deps).
- **Habits** — daily check-offs + heatmap.
- **Read later / Bookmarks** — mini-Pocket.
- **About / Profile** — `/about` route with bio + links (portfolio anchor — currently missing).
- **Now playing** — Spotify integration (personal touch).

---

## 6. Portfolio polish

- **Landing page at `/welcome`** separate from OS shell.
- **README** with demo GIF, "Why VibeOS", stack badges, Lighthouse score.
- **Vitest + 5–10 tests + CI gate** — closes biggest credibility gap.
- **Preview deploys per PR** (Vercel free).
- **Bundle size budget / badge.**
- **Error boundaries + real 404 page.**
- **Copy personality** — empty states, tooltips, loading skeletons, 404 voice.

---

## 7. Sprint plan

| Sprint | Goal | Duration |
|--------|------|----------|
| 1. Identity | Landing, logo, 2 vibe-paks, README + GIF, new tagline | 1–2 weeks |
| 2. Wow-features | Command Palette, Settings, Recent Activity, vibe-pak picker | 1–2 weeks |
| 3. Backend & Auth | Supabase, schema migrations, sync, GitHub OAuth | 2 weeks |
| 4. Module depth | Tasks Today/Focus/Streaks, Notes backlinks/journal, Board, Studio Lab | rolling |
| 5. Polish | Tests, error boundaries, Lighthouse, a11y audit | rolling |

---

## 8. Open questions

- Final product name for Tasks?
- Final product name for Notes?
- Custom domain vibeos.dev / vibeos.app — buy now or after design pass?
- Whether to keep modules truly independent or let Tasks ↔ Board share one store.
- Vibe-pak count for v1 — ship with 2 (Terminal + Brutalist) or wait for all 4?
