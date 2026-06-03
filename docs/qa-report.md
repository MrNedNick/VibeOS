# VibeOS QA Report

> **v1.5.2 — 2026-06-03.** Refreshed from the stale v0.5.5 report. A full live-review QA pass (S16 T7) is still pending — that pass will replace this document with a dated manual-testing matrix.

---

## Codebase state (v1.5.2)

| Metric | Value |
|--------|-------|
| Version | v1.5.2 |
| Shipped modules | 16 |
| Vibe-paks | 4 — Dark, Light, Brutalist, CRT Retro |
| Test count | 367 tests in 27 files |
| Coverage gate | v8 — stmt 35% / branch 22% / fn 40% / lines 35% |
| CI gate | type-check + tests + hex-guard must pass before deploy |

---

## Bugs from original v0.5.5 report — current status

| ID | Description | Status |
|----|-------------|--------|
| B1 | Command Palette: "theme" keyword returned no results | ✅ **Fixed** — `keywords: ['theme', 'appearance', 'pak', 'color', 'skin']` on theme commands |
| B2 | Mobile More drawer didn't auto-close after navigation | ✅ **Fixed** — `watch(route, () => { showMore.value = false })` in AppBottomTabs.vue |
| B3 | Brutalist theme: heatmap cells all solid black | ❓ **Needs re-test** — heatmap uses CSS vars; Brutalist sets `--color-border` to near-black |
| B4 | Brutalist theme: goals progress bar fully filled at 0% | ❓ **Needs re-test** — GoalCard now uses `UiProgressBar` from @/ui |
| B5 | About page: Sudoku missing from Games description | ✅ **Resolved** — About page rewritten in v0.7.0; all 4 games listed |
| B6 | Notes list: item previews show raw markdown | ❓ **Needs re-test** — excerpt logic updated in v0.6 session |
| B7 | Mobile dashboard: stat card labels truncate | ❓ **Needs re-test** — layout substantially changed since v0.5.5 |
| B8 | Snippets mobile layout | ✅ **N/A** — Snippets module removed in v0.5.9 |

---

## What changed since v0.5.5 (by sprint)

| Sprint | Key changes |
|--------|------------|
| S6 — AI Integration | AI in all major modules; Studio chat; Pollinations.ai free tier |
| S7 — Polish | Vitest, CI gate, Lighthouse 82, a11y 100 |
| S8 — Design System | @/ui component library; widget customiser; skeleton loaders |
| S9 — Full Redesign | Premium visual identity; Shadow/leading/motion tokens |
| S10 — Vibe-pak Consolidation | 6 paks → 4 (Synthwave removed, SoftGlass merged into Light) |
| S11 — Welcome (T1) | Copy + hex cleanup shipped (v1.5.1) |
| S12 — AI Depth | Habits insights, Notes summarise, Finance analysis |
| S14 — Quick Wins | Lazy routes, soft-delete tombstones, hex guard CI |
| S15 — Refactor | useSoftDeletable, useAiInsight; 5 god-components split |
| S16 — Test Coverage | 367 tests in 27 files; coverage gate |
| S17 — Component Unification | All modules on @/ui; ESLint enforcement |
| S18 — Analytics & Feedback | Interaction tracking, NPS modal, Usage tab, Privacy & Data settings |

---

## Known remaining issues / debt

| Item | Category | Severity |
|------|----------|----------|
| B3 Brutalist heatmap — re-test needed | Visual | Medium |
| B4 Brutalist goals bar — re-test needed | Visual | Medium |
| B6 Notes preview markdown — re-test needed | Visual | Low |
| B7 Mobile stat label truncation — re-test needed | Responsive | Low |
| `widgets.store` DEFAULT_CONFIGS mutation via Vue proxy | Bug | Low — affects tests, not prod UX |
| S16 T6 E2E smoke tests — not yet added | Test gap | Medium |
| S16 T7 Manual QA pass — not yet done | QA gap | High |
| S11 T2 Welcome page redesign (cascade demo) — pending | Feature | — |

---

## Next QA pass (S16 T7) — matrix to run

When the user does the manual QA pass, test this matrix:

- All 16 modules at `lg` (1280px) and `sm` (375px)
- 4 vibe-paks: Dark, Light, Brutalist, CRT Retro
- EN and RU locales
- Keyboard navigation (Tab, Enter, Esc, ⌘K)
- Focus rings visible at all interactive elements
- B3, B4, B6, B7 status confirmed
- Any new visual regressions since S15/S17 god-component decomposition

Replace this document with a fresh dated report after the pass.
