# Component Refactor Guide

> For use in Phase 3 refactor sessions. Read this before starting any module refactor.

---

## Context

VibeOS is at v0.8.3. Phase 1 of S8 (Design System) is complete — 6 new `@/ui` components were built.
The goal of Phase 3 is to replace one-off module styles with these shared components.

**Project location:** `/Users/test/Documents/Work/AIProjects/VibeOS`

---

## The rule

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

### FilterChipOption type
```ts
import type { FilterChipOption } from '@/ui'
// { value: string; label: string; count?: number; icon?: string }
```

---

## How to refactor a module (step by step)

### Before starting
```bash
cd /Users/test/Documents/Work/AIProjects/VibeOS
npm run type-check   # must be clean before you touch anything
```

### Pattern: Section label
```vue
<!-- BEFORE -->
<p class="goals__section-label">Active Goals</p>
<style scoped>
.goals__section-label {
  font-size: 12px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--color-text-muted);
}
</style>

<!-- AFTER -->
<UiSectionLabel>Active Goals</UiSectionLabel>
<!-- delete the .goals__section-label CSS rule -->
```

### Pattern: Progress bar
```vue
<!-- BEFORE -->
<div class="gdetail__progress-bar">
  <div class="gdetail__progress-fill" :style="{ width: pct + '%' }" />
</div>
<style scoped>
.gdetail__progress-bar  { height: 4px; background: var(--color-surface-elevated); border-radius: 99px; overflow: hidden; }
.gdetail__progress-fill { height: 100%; background: var(--color-accent); border-radius: 99px; transition: width 0.4s; }
</style>

<!-- AFTER -->
<UiProgressBar :value="pct" />
<!-- delete both CSS rules -->
```

### Pattern: Stat display
```vue
<!-- BEFORE -->
<div class="detail__stat">
  <span class="detail__stat-value">{{ count }}</span>
  <span class="detail__stat-label">Tasks</span>
</div>

<!-- AFTER -->
<UiStat :value="count" label="Tasks" />
```

### Pattern: Filter chips
```vue
<!-- BEFORE -->
<div class="learning__chips">
  <button
    v-for="tab in TABS" :key="tab.value"
    class="learning__chip"
    :class="{ 'learning__chip--active': activeTab === tab.value }"
    @click="activeTab = tab.value"
  >{{ tab.label }}</button>
</div>

<!-- AFTER -->
<UiFilterChips
  v-model="activeTab"
  :options="TABS"
/>
<!-- where TABS = [{ value: 'all', label: 'All' }, ...] -->
```

### Pattern: Card container
```vue
<!-- BEFORE -->
<div class="goal-card">...</div>
<style scoped>
.goal-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
}
</style>

<!-- AFTER -->
<UiCard>...</UiCard>
<!-- or with props: <UiCard padding="lg" hoverable> -->
```

### Pattern: Form field
```vue
<!-- BEFORE -->
<div class="goals__form-field">
  <label class="goals__form-label">Title</label>
  <input v-model="title" class="..." />
  <span class="goals__form-hint">Required</span>
</div>

<!-- AFTER -->
<UiField label="Title" hint="Required" field-id="goal-title">
  <input id="goal-title" v-model="title" class="..." />
</UiField>
```

---

## After each module

```bash
npm run type-check   # must pass with 0 errors
```

If clean → commit + bump patch version + push.

```bash
git add -p   # stage only changed files
# commit message: "refactor(goals): replace one-off styles with @/ui components"
```

---

## What NOT to touch

- Never refactor the module's business logic
- Never change component props or emits
- Never change animations (only migrate if identical to @/ui pattern)
- If a style is unique to that module and doesn't match any @/ui pattern — leave it alone
- Don't refactor components that are working fine if the change is cosmetic only

---

## Module-specific notes

### Goals (`src/modules/goals/`)
Targets: `GoalsView.vue`, `GoalCard.vue`, `GoalDetailView.vue`
- `.goals__section-label` → `UiSectionLabel`
- `.gdetail__progress-bar` + `.gdetail__progress-fill` → `UiProgressBar`
- `.gdetail__stat-*` → `UiStat`
- Category filter row → `UiFilterChips variant="pills"`
- `GoalCard` card wrapper → `UiCard hoverable`

### Learning (`src/modules/learning/`)
Targets: `LearningView.vue`, `PlanDetailView.vue`
- `.learning__section-label` → `UiSectionLabel`
- `.detail__progress-bar` / `.detail__progress-fill` → `UiProgressBar`
- `.detail__stat-*` → `UiStat`
- `.learning__chips` → `UiFilterChips`
- Form fields in plan creation → `UiField`

### Training (`src/modules/training/`)
Same targets as Learning — nearly identical structure.

### Finance (`src/modules/finance/`)
Targets: `FinanceView.vue`
- Section labels → `UiSectionLabel`
- Budget progress bars → `UiProgressBar` (with dynamic `color` prop based on percentage)
- Summary stats → `UiStat`
- Tab filters (Overview / Transactions / Budgets) → `UiFilterChips variant="tabs"`

### Analytics (`src/modules/analytics/`)
Targets: `AnalyticsView.vue`
- Section labels → `UiSectionLabel`
- Period picker chips → `UiFilterChips`
- Stats row → `UiStat`

### Tasks (`src/modules/task-manager/`)
Targets: `TaskManagerView.vue`, `TaskFilters.vue`
- `.task-filters` tab row → `UiFilterChips variant="tabs"`
- Section labels → `UiSectionLabel`
- Week stat pill → `UiStat size="sm"`

### Habits (`src/modules/habits/`)
Targets: `HabitsView.vue`, `HabitCard.vue` (large — be careful)
- Filter chips → `UiFilterChips variant="pills"`
- Section labels → `UiSectionLabel`
- **HabitCard is ~1000 lines — only migrate the patterns, don't restructure**

### Dashboard (`src/modules/dashboard/`)
Targets: `DashboardView.vue`, `AllTasksPanel.vue`, `DashboardTodayPanel.vue`, `GoalsPanel.vue`, `HabitsPanel.vue`
- Section labels in panels → `UiSectionLabel`
- Stats → `UiStat`
- **Don't touch widget layout or life-stats strip**

### Notes + Board + Calendar
Light refactor — mainly section labels and empty states.

### Settings + About + Studio
Light refactor — section labels, stat display on About page.
