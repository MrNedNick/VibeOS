# Component Refactor Guide

> **Updated for v1.0.14 (2026-06-01).**
> Original guide was written for v0.8.3 (S8 Phase 3). S8 Phase 3 is now complete.
> This guide is retained as a reference for S15 (Refactor & De-dup sprint) patterns.

---

## Current status

**S8 Phase 3 (CSS → @/ui migration) is complete as of v1.0.14.**

All original targets from Phase 3 are migrated:
- Section labels → `UiSectionLabel` ✅
- Progress bars → `UiProgressBar` ✅ (except AchievementsPanel — gradient, no @/ui equivalent)
- Stats → `UiStat` ✅
- Filter chips → `UiFilterChips` ✅
- Form fields → `UiField` ✅
- Card wrappers → `UiCard` ✅

Remaining custom CSS (`__section-label`, `__progress-fill`) exists only where the style is unique to the module (e.g. the AchievementsPanel gradient bar) — these are intentionally kept.

---

## The rule (unchanged)

**Never change behavior — only move styles into `@/ui` components.**

If a component did X before, it must do X after. No new features, no layout changes, no behavior changes.

---

## Available @/ui components (import from `@/ui`)

| Component | Replaces | Props |
|-----------|---------|-------|
| `UiSectionLabel` | Any uppercase section heading | `size="sm\|md"`, `as="p\|h2"` |
| `UiProgressBar` | Horizontal fill bars | `value` (0–100), `color="accent\|success\|danger\|warning"`, `height`, `showLabel` |
| `UiStat` | Large number + small label | `value`, `label`, `icon?`, `color?`, `mono?`, `size="sm\|md\|lg"`, `align` |
| `UiFilterChips` | Tab/chip filter rows | `options` (FilterChipOption[]), `v-model`, `variant="tabs\|pills"`, `size` |
| `UiCard` | Surface card containers | `padding="none\|sm\|md\|lg"`, `hoverable?`, `clickable?`, `surface="base\|raised"`, `as?` |
| `UiField` | Form field label+input+error | `label?`, `hint?`, `error?`, `required?`, `fieldId?` |
| `UiSkeleton` | Loading placeholders | `width`, `height`, `rounded`, `inline` |
| `UiEmptyState` | Empty list/view states | `icon`, `title`, `subtitle?`, slot: `action` |
| `UiButton` | Buttons | `variant="primary\|ghost\|danger\|outline"`, `size`, `loading` |
| `UiBadge` | Status tags | `color`, `size` |
| `UiProgressRing` | Circular progress | `value`, `size`, `label?` |
| `UiModal` | Modal dialog | `open`, `title?`, size, @close |
| `UiConfirmDialog` | Confirm prompts | `open`, `title`, `message`, @confirm, @cancel |
| `UiPlannedView` | "Coming soon" placeholder | `icon`, `title`, `subtitle?` |
| `UiIcon` | Icons from lucide-vue-next | `name`, `size?`, `stroke-width?` |

All components are exported from `src/ui/index.ts` — import with `import { ... } from '@/ui'`.

### FilterChipOption type
```ts
import type { FilterChipOption } from '@/ui'
// { value: string; label: string; count?: number; icon?: string }
```

---

## Patterns reference

### Section label
```vue
<!-- BEFORE -->
<p class="goals__section-label">Active Goals</p>
<style scoped>
.goals__section-label { font-size: 12px; font-weight: 700; text-transform: uppercase; ... }
</style>

<!-- AFTER -->
<UiSectionLabel>Active Goals</UiSectionLabel>
<!-- delete .goals__section-label CSS -->
```

If the label needs a spacing override, keep only that rule:
```vue
<UiSectionLabel class="goals__section-label">Active Goals</UiSectionLabel>
<style scoped>
.goals__section-label { margin-bottom: 20px; }  /* spacing only, font/color owned by UiSectionLabel */
</style>
```

### Progress bar
```vue
<!-- BEFORE -->
<div class="gdetail__progress-bar">
  <div class="gdetail__progress-fill" :style="{ width: pct + '%' }" />
</div>

<!-- AFTER -->
<UiProgressBar :value="pct" />
<!-- delete both CSS rules -->
```

Do NOT migrate gradient progress bars (no @/ui equivalent — leave them as-is).

### Stat display
```vue
<!-- BEFORE -->
<div class="detail__stat">
  <span class="detail__stat-value">{{ count }}</span>
  <span class="detail__stat-label">Tasks</span>
</div>

<!-- AFTER -->
<UiStat :value="count" label="Tasks" />
```

### Filter chips
```vue
<!-- BEFORE -->
<div class="learning__chips">
  <button v-for="tab in TABS" :key="tab.value" @click="activeTab = tab.value">{{ tab.label }}</button>
</div>

<!-- AFTER -->
<UiFilterChips v-model="activeTab" :options="TABS" />
<!-- where TABS = [{ value: 'all', label: 'All' }, ...] -->
```

---

## What NOT to touch

- Never refactor module business logic
- Never change component props or emits
- Never migrate animations unless identical to @/ui pattern
- Gradient progress bars (AchievementsPanel) — no @/ui equivalent
- If a style is unique to that module — leave it alone

---

## After each module

```bash
npm run type-check   # must pass with 0 errors
npm test             # 68 tests must stay green
```

If clean → commit + bump patch version + push.

---

## S15 — What's next (Refactor & De-dup)

CSS migration (S8 Phase 3) is done. S15 addresses deeper duplication:

1. **T1 — `useSoftDeletable`** — soft-delete tombstone pattern duplicated in 7 stores
2. **T2 — `useAiInsight`** — AI fire-and-forget pattern duplicated in 8 views
3. **T3 — (done)** — @/ui CSS migration ✅
4. **T4 — God-components** — split BoardView(1345), FinanceView(1341), StudioView(1285), HabitCard(1116), AnalyticsView(1091)
5. **T5 — Learning/Training** — collapse nearly-identical plan module structure

See `docs/roadmap.md` § S15 for full task specs.
