# Changelog

Notable changes, newest first. Sprint-level detail lives in
[`docs/roadmap.md`](docs/roadmap.md); this file is the short version.

## v2.11.2 — 2026-09-05

- **Offline queue no longer clobbers a newer edit on reconnect.** Coming back
  online now merges the remote state into local state by `updatedAt` first and
  drains the write queue afterwards, so a queued push carries the merged value
  instead of the stale pre-merge one. Covered by
  `src/__tests__/offlineQueueReconnect.test.ts`.

## v2.11.0 — 2026-09-04

- **Real offline app shell** via `vite-plugin-pwa`: JS, CSS, HTML and icons are
  precached, client-side routes resolve offline through an `index.html`
  navigation fallback, and outdated caches are cleaned up so a reload always
  lands on the latest deploy. Open tabs poll for an update hourly.
- Supabase calls are deliberately *not* cached — they stay live-network-only,
  and writes made offline continue to go through the existing write queue.

## v2.10.3 — 2026-08-05

- Fixed a lint error that had been failing the CI lint step for several pushes
  and therefore blocking the Pages deploy (`v-if` used together with `v-for` in
  the Tetris confetti burst). Rendering is unchanged.

## v2.10.2 — 2026-08-03

- **Learning and Training now share their skeleton.** A `usePlanModule`
  composable holds the common store shape (sync wiring, plan CRUD, soft delete
  with cascade, resources, CSV export) and `usePlanDetailPage` holds the common
  screen logic. The genuinely different parts — workout minutes and distance
  versus study progress and hours — stayed separate on purpose.

## v2.10.0 — 2026-06-13

- Dashboard shows overdue tasks above today's.
- Search in Task Manager, in Finance transactions and on the Kanban board.
- CSV export for Finance.
- A `system` theme option that follows the operating system.
- Autosave indicator in Notes, month navigation in the Habits grid, a sync
  indicator in the header, and a seven-day activity strip in Training.

## v2.9.0 — 2026-06-13

- Game lobby shows per-game stats; Finance and the dashboard widget show a
  month-over-month trend; Training shows a weekly summary.
- Goals can be sorted; Habits export to CSV; Studio lets you copy a message.
- Web app manifest added.

## v2.8.0 — 2026-06-13

- Studio: context-aware quick actions on the empty state, model descriptions,
  an estimated token counter, and a mobile sidebar that actually collapses.
- CSV export for Learning and Training.

## v2.7.17 – v2.7.23 — 2026-06-11

- Sign-up chip no longer appears for real accounts: the session check now runs
  before any local demo state is honoured.
- Sign out moved next to the account identity in Settings.
- Tetris game-over overlay redesigned, with a CSS-only celebration on a record.
- Test coverage extended across Studio panes, Finance overview and the
  remaining large components; smoke end-to-end scenarios rewritten.

## v2.7.12 – v2.7.16 — 2026-06-11

- **Demo data can no longer leak into a real account**: demo state is purged on
  login, registration and session restore, and cleared on logout.
- **Real-time echo loop fixed**: identical payloads are never re-pushed and
  no-op merges never notify the sync bus.
- **Merge correctness**: every mutating store action stamps `updatedAt`, budgets
  merge by category, Learning and Training were wired to sync (they never had
  been), and deletions use tombstones instead of removing rows.
- All three `v-html` sites are sanitised with DOMPurify.
- Core documents refreshed to match reality; the sync invariants are written
  down in [`docs/architecture.md`](docs/architecture.md).

## v2.7.5 — 2026-06-08

- Analytics events and feedback entries sync to Supabase; demo and signed-out
  visitors are unaffected.

## v2.4 – v2.7.0 — 2026-06-04 … 2026-06-11

- Welcome screen redesign with a live cascade demo and a new logo.
- Avatar upload, email change, password reset; Finance and board sync.
- Tetris skins, mobile QA fixes, profile and UX polish.

## v2.0 – v2.3 — earlier

- Supabase backend went live: authentication, JSONB state sync, an offline
  write queue and real-time updates.
- Design system consolidated into `src/ui`; demo-mode seeding; additional
  Studio providers.

Versions before v2.0 are covered in [`docs/roadmap.md`](docs/roadmap.md).
