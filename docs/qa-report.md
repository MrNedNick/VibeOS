# VibeOS QA Report

**Date:** 2026-05-29  
**Version tested:** v0.5.5  
**Viewports tested:** Desktop 1280×800, Mobile 375×812  
**Themes tested:** Dark, Light, Synthwave, Brutalist  
**Locales tested:** English, Russian  

---

## Summary

| Category | Count |
|----------|-------|
| Modules tested | 18 |
| Bugs found | 8 |
| Critical | 0 |
| Medium | 4 |
| Low | 4 |

---

## Tested & Passing ✅

| Module | Desktop | Mobile | Notes |
|--------|---------|--------|-------|
| Dashboard | ✅ | ✅ | v0.5.5 features work: quick-add, habit streak, pinned notes |
| Tasks | ✅ | ✅ | Create, priority, due date, filter views, CSV export |
| Notes | ✅ | ✅ | Markdown preview, editor, pin, daily journal |
| Habits | ✅ | ✅ | Create, check-off, streak tracking, heatmap (Brutalist theme bug noted) |
| Goals | ✅ | ✅ | Create, milestones, toggle complete, progress tracking, notes |
| Kanban Board | ✅ | ✅ | Card creation, column selector, drag layout |
| Snippets | ✅ | ⚠️ | Mobile layout issue (see B8) |
| Games — Snake | ✅ | ✅ | Play, score tracking, skin system (Emerald/Crimson/Amethyst unlockable) |
| Games — Minesweeper | ✅ | ✅ | Lobby and launch verified |
| Games — Memory | ✅ | ✅ | Lobby verified |
| Games — Sudoku | ✅ | ✅ | Lobby verified |
| Learning | ✅ | ✅ | Module renders, study plan management |
| Training | ✅ | ✅ | Module renders |
| Calendar | ✅ | ✅ | Renders |
| Settings | ✅ | ✅ | Theme pak selection, locale toggle EN/RU |
| About | ✅ | ✅ | Version badge shows v0.5.5 (minor copy bug noted) |
| Docs | ✅ | ✅ | Navigation and content render |
| Command Palette ⌘K | ✅ | — | Open/close/search/navigate; keyword bug noted |
| Dark theme | ✅ | ✅ | All surfaces correct |
| Light theme | ✅ | ✅ | All surfaces correct |
| Synthwave theme | ✅ | ✅ | All surfaces correct |
| Brutalist theme | ✅ | ✅ | Works with visual bugs in Habits and Goals |
| Russian locale | ✅ | ✅ | All tested strings translated |
| Mobile bottom tab bar | — | ✅ | Dashboard / Tasks / Habits / Notes / More |
| Mobile More drawer | — | ⚠️ | Doesn't auto-close after nav (see B2) |
| 404 page | ✅ | ✅ | Custom error page renders |

---

## Bugs Found

### B1 — Command Palette: "theme" keyword returns no results
- **Severity:** Medium  
- **Module:** Command Palette  
- **Expected:** Typing "theme" surfaces all 4 theme-switching commands  
- **Actual:** "No results for 'theme'" — only exact names work (e.g. "dark", "light", "synthwave")  
- **Root cause:** Theme commands have no `keywords` alias containing "theme"  
- **Fix:** Add `keywords: ['theme', 'appearance', 'pak']` to the 4 theme commands in the palette command registry  

---

### B2 — Mobile More drawer doesn't auto-close after navigation
- **Severity:** Medium  
- **Module:** AppMoreDrawer (mobile layout)  
- **Expected:** Selecting a module from the More drawer navigates and closes the drawer  
- **Actual:** Drawer stays open; user must tap the backdrop to close it  
- **Root cause:** Navigation event not triggering drawer close  
- **Fix:** Watch route changes in the drawer component and close on navigation  

---

### B3 — Brutalist theme: heatmap cells all appear solid black
- **Severity:** Medium  
- **Module:** Habits / HabitHeatmap  
- **Expected:** Empty habit cells show a subtle light background; completed cells show accent  
- **Actual:** All cells render as solid black squares  
- **Root cause:** `.heatmap__cell { background: var(--color-border) }` — Brutalist sets `--color-border: #000000`  
- **Fix:** Add Brutalist override: `[data-theme='brutalist'] .heatmap__cell { background: var(--color-surface-elevated); }`  

---

### B4 — Brutalist theme: goals progress bar appears fully filled at 0%
- **Severity:** Medium  
- **Module:** Goals / goal-card  
- **Expected:** Progress bar track is subtle; fill advances as milestones complete  
- **Actual:** Track renders as a solid black full-width bar at 0% (visually indistinguishable from 100%)  
- **Root cause:** `.goal-card__bar` track background inherits `--color-border: #000000` in Brutalist  
- **Fix:** Add Brutalist override for the bar track background  

---

### B5 — About page: Sudoku missing from Games description
- **Severity:** Low  
- **Module:** About  
- **Expected:** "Minesweeper · Memory Cards · Snake · Sudoku"  
- **Actual:** "Minesweeper · Memory Cards · Snake"  
- **Fix:** Add "· Sudoku" to the Games module description in the About page  

---

### B6 — Notes list: item previews show raw markdown
- **Severity:** Low  
- **Module:** Notes  
- **Expected:** Preview line shows plain text (e.g. "My note content…")  
- **Actual:** Preview shows raw markdown symbols (e.g. "# Title", `**bold**`)  
- **Fix:** Strip markdown from the preview string in the note list component  

---

### B7 — Mobile dashboard: stat card labels truncate
- **Severity:** Low  
- **Module:** Dashboard (mobile)  
- **Expected:** Stat labels readable at 375px  
- **Actual:** Labels like "ACTIVE MODULES" clip to "ACTIVE MODU..."  
- **Fix:** Reduce font-size for stat labels at `sm` breakpoint or allow wrapping  

---

### B8 — Snippets mobile: list pane and editor both visible when snippet selected
- **Severity:** Low  
- **Module:** Snippets  
- **Expected:** On mobile, when a snippet is open, list hides (like Notes behaviour)  
- **Actual:** Both list panel and editor panel stack vertically, wasting space  
- **Fix:** Apply same `v-if="!selectedSnippet"` pattern used in Notes mobile layout  

---

## Prioritised Fix Order

| Priority | Bug | Effort |
|----------|-----|--------|
| 1 | B3 — Brutalist heatmap cells | Low (2 CSS lines) |
| 2 | B4 — Brutalist goals progress bar | Low (2 CSS lines) |
| 3 | B2 — More drawer auto-close | Low (1 watcher) |
| 4 | B1 — Palette "theme" keyword | Low (add keywords array) |
| 5 | B5 — About Games copy | Trivial |
| 6 | B6 — Notes raw markdown preview | Low |
| 7 | B8 — Snippets mobile layout | Medium |
| 8 | B7 — Stat label truncation | Low |

---

## Notes

- Snake skin system (task #10) is **already implemented** — Default/Emerald/Crimson/Amethyst skins present with unlock thresholds (5/15/25 score). Task should be marked completed.
- Analytics module correctly shows as locked (`S5` badge), expected behaviour.
- No TypeScript errors at time of testing.
- All localStorage keys follow the `platform:[module]:[entity]` convention.
