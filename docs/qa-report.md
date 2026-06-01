# VibeOS QA Report

> ⚠️ This report covers **v0.5.5 (2026-05-29)** — 5 sprints before the current v1.0.x codebase.
> Many bugs listed here are fixed; several modules listed as "planned" have shipped.
> A fresh QA pass is planned in **S16 T7**.

---

**Date:** 2026-05-29
**Version tested:** v0.5.5
**Viewports tested:** Desktop 1280×800, Mobile 375×812
**Themes tested:** Dark, Light, Synthwave, Brutalist

---

## What changed since this report (v0.5.5 → v1.0.14)

| Change | Status |
|--------|--------|
| Snippets module | Still present but unlisted from README; low daily-use value |
| Synthwave pak | **Removed** in S10 (merged into Light) |
| Goals, Learning, Training, Analytics | **Shipped** in S4–S5 — were "planned" in this report |
| Studio (AI chat) | **Shipped** in S6 |
| Command Palette "theme" keyword (B1) | **Fixed** — `keywords: ['theme', 'appearance', 'pak', 'color', 'skin']` present |
| More drawer auto-close (B2) | **Fixed** — `watch(route, () => { showMore.value = false })` |
| Brutalist heatmap cells (B3) | **Status unknown** — needs re-test in v1.x |
| Brutalist goals progress bar (B4) | **Status unknown** — needs re-test; goals now use UiProgressBar |
| About page Games copy (B5) | **Status unknown** |
| Notes raw markdown preview (B6) | **Status unknown** |
| Snippets mobile layout (B8) | Low priority — Snippets deprioritised |
| Stat label truncation (B7) | **Status unknown** |
| vibe-paks tested | Now 4 paks: **Dark, Light, Brutalist, CRT Retro** (Synthwave gone) |
| Modules count | Was 8; now **16 shipped modules** |
| Test coverage | Was 0; now **68 Vitest tests**, CI gate |

---

## Original report (v0.5.5)

### Summary

| Category | Count |
|----------|-------|
| Modules tested | 18 |
| Bugs found | 8 |
| Critical | 0 |
| Medium | 4 |
| Low | 4 |

### Bugs found (original)

#### B1 — Command Palette: "theme" keyword returns no results ✅ FIXED
- **Severity:** Medium
- Theme commands now have `keywords: ['theme', 'appearance', 'pak', 'color', 'skin']`

#### B2 — Mobile More drawer doesn't auto-close after navigation ✅ FIXED
- **Severity:** Medium
- `AppBottomTabs.vue` line 88: `watch(route, () => { showMore.value = false })`

#### B3 — Brutalist theme: heatmap cells all appear solid black ❓ NEEDS RE-TEST
- **Severity:** Medium
- `.heatmap__cell { background: var(--color-border) }` — Brutalist sets border to black
- **Proposed fix:** `[data-theme='brutalist'] .heatmap__cell { background: var(--color-surface-elevated); }`

#### B4 — Brutalist theme: goals progress bar appears fully filled at 0% ❓ NEEDS RE-TEST
- **Severity:** Medium
- GoalCard now uses `UiProgressBar` — may be resolved by the @/ui migration

#### B5 — About page: Sudoku missing from Games description ❓ NEEDS RE-TEST
- **Severity:** Low

#### B6 — Notes list: item previews show raw markdown ❓ NEEDS RE-TEST
- **Severity:** Low

#### B7 — Mobile dashboard: stat card labels truncate ❓ NEEDS RE-TEST
- **Severity:** Low

#### B8 — Snippets mobile layout ⏸ DEPRIORITISED
- **Severity:** Low
- Snippets is deprioritised; fix if Snippets gets a future sprint

---

## Next QA pass (S16 T7)

Matrix to re-run:
- All 16 modules at `lg` (1280px) and `sm` (375px)
- 4 vibe-paks: Dark, Light, Brutalist, CRT Retro
- EN and RU locales
- Confirm B3–B7 status and log any new bugs
- Write a fresh dated report replacing this one
