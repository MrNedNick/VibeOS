# VibeOS /ui-kit — Implementation Plan

> Reference analysis completed: 2026-05-31  
> Reference site: `https://8b8d8a1d.xovi-ai.pages.dev/#catalog/colors` (XOVI AI Design System)  
> Analysis method: JS bundle extraction (site is a Svelte SPA — Claude in Chrome unavailable, bundle parsed directly)

---

## 1. Reference Site — Full Sidebar Navigation Structure

The reference site has **4 groups** in its sidebar, rendered as a left-rail catalog:

### Group: Tokens (design foundations)
| Key | Label |
|-----|-------|
| `playground` | Playground (OKLCH color tuner) |
| `colors` | Colors |
| `state-layers` | State Layers |
| `typography` | Typography |
| `spacing` | Spacing |
| `shape` | Shape |
| `elevation` | Elevation |
| `motion` | Motion |
| `floating` | Floating (positioning) |
| `fonts` | Fonts |
| `icons` | Icons |

### Group: Components (primitive UI)
| Key | Label |
|-----|-------|
| `switch` | Switch |
| `checkbox` | Checkbox |
| `radio` | Radio button |
| `icon-button` | Icon Button |
| `button` | Button |
| `divider` | Divider |
| `dialog` | Dialog |
| `snackbar` | Snackbar |
| `linear-progress` | Linear Progress |
| `circular-progress` | Circular Progress |
| `tooltip` | Tooltip |
| `menu-item` | Menu Item |
| `menu` | Menu |
| `side-sheet` | Side Sheet |
| `badge` | Badge |
| `chip` | Chip |
| `tab-bar` | Tab Bar |
| `nav-item` | Nav Item |
| `navigation-drawer` | Navigation Drawer |
| `list` | List + List Item |
| `text-field` | Text Field |
| `date-picker` | Date Picker |

### Group: Layout (app-specific composites — skip for VibeOS)
Product-specific components (Report Status Bar, Offering panels, Score cards etc.) — **not applicable** to VibeOS. The pattern they establish is what matters, not the components themselves.

### Group: Surfaces (full page views — skip for VibeOS)
Full-page surface components specific to XOVI product.

---

## 2. Component Card Pattern

Each section is an `<article class="showcase">` composed of exactly **4 slots** in this order:

```
┌─────────────────────────────────────────────────────┐
│  HEADER                                             │
│  h1: Component name (Headline Small type)           │
│  p:  Purpose — one-sentence "what + when to use"   │
│  p:  Canon: source file path / M3 spec URL          │
├─────────────────────────────────────────────────────┤
│  INTERACTIVE (optional)                             │
│  ┌──────────────────┐  ┌──────────────────────┐    │
│  │  pg-stage        │  │  pg-controls         │    │
│  │  (live rendered  │  │  checkbox toggles:   │    │
│  │   component)     │  │  disabled / error /  │    │
│  │                  │  │  icon / indeterminate │    │
│  └──────────────────┘  └──────────────────────┘    │
│  pg-readout: "selected = true" (live state text)   │
├─────────────────────────────────────────────────────┤
│  DEMO (optional)                                    │
│  Static examples — all visual variants side by side │
│  (filled / outlined / tonal / text variants etc.)   │
├─────────────────────────────────────────────────────┤
│  DETAILS — Props table                              │
│  h3: "Props"                                        │
│  hint: convention note                              │
│  ┌──────────┬────────────────┬────────────────┐    │
│  │ Prop     │ Type           │ Purpose        │    │
│  ├──────────┼────────────────┼────────────────┤    │
│  │ selected │ boolean        │ ...            │    │
│  │ disabled │ boolean        │ ...            │    │
│  │ onClick  │ () => void     │ ...            │    │
│  └──────────┴────────────────┴────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**Key design decisions from the reference:**
- Prop table columns are exactly **Prop | Type | Purpose** (not "Description" — "Purpose" is intentional)
- Prop names are `<code>` styled, types are `<code>` styled
- "Canon" reference in the header is a link to the source `.svelte` / `.vue` file path
- Interactive section uses native CSS pseudo-classes for hover/focus states — no JS needed for those
- Disabled / error / indeterminate states are controlled via prop toggles in `pg-controls`
- `pg-readout` shows live state as text (e.g. `selected = true`) for debugging clarity
- The reference enforces "all props required" (no defaults inside component) — VibeOS may keep defaults where sensible for DX

---

## 3. Token Display Formats

### Colors
- Groups (families): Primary, Secondary, Tertiary, Error, Background/Surface, Surface Containers (tonal), Outline/Shadow/Scrim, Inverse, Fixed
- Each group: group heading + grid of swatches
- Each swatch: rendered with actual CSS var as background + on-color as text
  - Shows: **role name** (large text) + `--css-var-name` (small code)
- No hex values shown — variables only (role-based system)

### Typography
- 15 roles in groups: Display, Headline, Title, Body, Label
- Each row renders text at actual scale
- Shows: **role name** + size/weight/tracking specs + utility class name as code

### Spacing
- Bar visualization per step
- Shows: **px value** (large) + `--sp-N` CSS variable + proportional bar

### Shape (border-radius)
- Visual rounded box per token
- Shows: **name** + px value + CSS variable

### Elevation
- Table: Level (0–5) | dp value | CSS variable | Typical use
- Each level rendered with actual box-shadow

### Motion
- Single canonical: 200ms Emphasized curve `cubic-bezier(0.2, 0, 0, 1)`
- Examples: Svelte `transition:slide` snippet + CSS `transition` snippet

---

## 4. Component States — How They're Shown

The reference pattern for interactive states:

| State | How shown |
|-------|-----------|
| Default | Always visible in pg-stage |
| Hover | Native CSS `:hover` — user hovers in browser |
| Focus | Native CSS `:focus-visible` — user tabs to it |
| Disabled | Toggle checkbox in pg-controls → `disabled` prop |
| Error | Toggle checkbox in pg-controls → `error` prop |
| Indeterminate | Toggle checkbox → `indeterminate` prop (Checkbox only) |
| Selected/Active | Toggle in pg-controls; state shown in pg-readout |
| Loading | Prop toggle where applicable |

**For VibeOS:** same pattern works. Vue 3 Composition API: bind boolean props to `ref()` in the page, render checkboxes to toggle them, show `{{ propName }} = {{ value }}` as readout.

---

## 5. Sections to Implement — Priority Order

### Priority 1 — Token pages (build these first, they're the foundation)

| Section | VibeOS token source | Notes |
|---------|--------------------|-|
| **Colors** | `--color-*` in `main.css` | Show all color roles per vibe-pak (6 paks) |
| **Typography** | `--text-*`, `--font-*` | Show 8-level scale with actual rendered text |
| **Spacing** | Not yet tokenized | Define `--sp-*` tokens first (S8 item 5) |
| **Shadows/Elevation** | `--shadow-sm/md/lg` → extend to 5 levels | Show per elevation level |
| **Shape/Radius** | `--radius-*` | Show visual rounded boxes |
| **Motion** | `--ease-*`, `--t-fast/t/t-slow` | Show animation previews |

### Priority 2 — Core UI Components

| Component | Status | Notes |
|-----------|--------|-------|
| **UiButton** | ✅ exists | Document variants: primary / secondary / ghost / danger |
| **UiInput / UiField** | ✅ exists | Document states: default / focus / error / disabled |
| **UiCard** | ✅ exists | Document slots and variant (bordered / elevated) |
| **UiSkeleton** | ✅ exists | Document props: width / height / rounded / shimmer |
| **UiBadge** | ✅ exists | Document color variants |
| **UiProgressBar** | ✅ exists | Document determinate / indeterminate |
| **UiProgressRing** | ✅ exists | Document props |
| **UiSectionLabel** | ✅ exists | Document props |
| **UiStat** | ✅ exists | Document props |
| **UiEmptyState** | ✅ exists | Document slots |
| **UiFilterChips** | ✅ exists | Document props and emits |
| **UiIcon** | ✅ exists | Document size variants, icon name search |
| **UiConfirmDialog** | ✅ exists | Document `useConfirm()` composable pattern |
| **UiModal** | ❌ not yet | Extract from module-level dialogs in S8 item 3 |

### Priority 3 — Components to extract in S8 item 3

These patterns appear across modules but aren't yet in `@/ui`:

| Pattern | Found in | Target component |
|---------|----------|-----------------|
| Stat card (icon + value + label) | Dashboard, Analytics | `UiStat` (already exists, verify props) |
| Category chip row | Tasks, Habits, Learning | `UiFilterChips` (already exists) |
| Section header with help toggle | Goals, Learning | `UiSectionLabel` (exists; may need expansion) |
| Form field wrapper | All forms | `UiField` (exists; verify) |
| List item row | Various | `UiListItem` (new) |
| Tab bar | Analytics, Settings | `UiTabBar` (new) |
| Toast / notification | Achievement, AI analysis | `UiToast` (new) |

---

## 6. VibeOS /ui-kit Page — Planned Structure

### Route
`/ui-kit` — accessible via Settings → Developer tab (hidden in production builds via `import.meta.env.PROD`)

### Layout
```
┌──────────────────────┬──────────────────────────────────────────┐
│  SIDEBAR (220px)     │  MAIN CONTENT                           │
│                      │                                          │
│  🎨 Tokens           │  <article class="showcase">              │
│    Colors            │    [Header]                              │
│    Typography        │    [Interactive]                         │
│    Spacing           │    [Demo]                                │
│    Shadows           │    [Details / Prop table]                │
│    Radius            │                                          │
│    Motion            │                                          │
│                      │                                          │
│  🧩 Components       │                                          │
│    UiButton          │                                          │
│    UiInput           │                                          │
│    UiCard            │                                          │
│    UiSkeleton        │                                          │
│    ... (all @/ui)    │                                          │
│                      │                                          │
│  📐 Patterns         │                                          │
│    EmptyState        │                                          │
│    ConfirmDialog     │                                          │
│    FilterChips       │                                          │
│    ProgressBar       │                                          │
│                      │                                          │
│  ─────────────────── │                                          │
│  Theme: [picker]     │                                          │
└──────────────────────┴──────────────────────────────────────────┘
```

### Sidebar groups for VibeOS

```
Tokens
  - Colors
  - Typography
  - Spacing
  - Shadows & Elevation
  - Border Radius
  - Motion & Easing

Components
  - UiButton
  - UiInput
  - UiField
  - UiCard
  - UiBadge
  - UiIcon
  - UiSkeleton
  - UiProgressBar
  - UiProgressRing
  - UiSectionLabel
  - UiStat
  - UiFilterChips

Patterns
  - UiEmptyState
  - UiConfirmDialog
  - UiModal (when built)
  - UiToast (when built)
  - UiListItem (when built)
  - UiTabBar (when built)
```

---

## 7. Technical Implementation Notes

### Theme Switcher
- Add a `data-theme` picker at the top of the sidebar (or floating in the header of /ui-kit)
- VibeOS already uses `[data-theme='X']` CSS selectors — all color tokens will update automatically
- Show all 6 vibe-paks: Default Dark, Synthwave, Ocean, Forest, Sunset, Mono (or current set)
- Implemented as a simple row of color dots that `document.documentElement.setAttribute('data-theme', pak)`
- The entire catalog updates live — no page reload needed

### Prop Table in Vue 3
```vue
<!-- Props are defined as a static array per component section -->
const props = [
  { prop: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", purpose: 'Visual style of the button' },
  { prop: 'disabled', type: 'boolean', purpose: 'Prevents interaction, dims to 38% opacity' },
  { prop: 'onClick', type: '() => void', purpose: 'Click / Space / Enter handler' },
]
```
- Rendered via `v-for` in a `<table>` — not hardcoded HTML
- Prop names and types wrapped in `<code>`
- Purpose column is plain text

### Interactive Demo Pattern
```vue
<!-- In each component section -->
<div class="pg-stage">
  <UiButton :variant="variant" :disabled="disabled" @click="() => {}">
    Click me
  </UiButton>
</div>
<div class="pg-controls">
  <label><input type="checkbox" v-model="disabled" /> disabled</label>
  <label><input type="checkbox" v-model="loading" /> loading</label>
</div>
<code class="pg-readout">variant = "{{ variant }}", disabled = {{ disabled }}</code>
```
- One `ref()` per toggleable prop
- The stage renders the actual `@/ui` component — not a mock
- This means the catalog is always in sync with real component behavior

### Code Snippet Block
- Show a short usage example per component
- Use `<pre><code>` with syntax highlighting (can use `highlight.js` already imported)
- Keep snippets minimal — just the most common use case

### Navigation
- Left sidebar uses `router-link` or `hash-based` scroll to section
- Sections are rendered all on one page (long scroll) or as separate routes (simpler)
- **Recommendation:** single long-scroll page per group (Tokens page, Components page) — avoids 30+ routes

### File structure
```
src/modules/ui-kit/
  views/
    UiKitView.vue           # root layout: sidebar + router-outlet
    sections/
      ColorsSection.vue
      TypographySection.vue
      SpacingSection.vue
      ShadowsSection.vue
      RadiusSection.vue
      MotionSection.vue
      UiButtonSection.vue
      UiInputSection.vue
      ... (one per component)
  components/
    ShowcaseCard.vue        # reusable article wrapper (header + slots for interactive/demo/details)
    PropTable.vue           # reusable table (receives props: PropDef[])
    PgStage.vue             # interactive demo stage wrapper
    TokenSwatch.vue         # color swatch card
```

### ShowcaseCard.vue props
```ts
interface ShowcaseCardProps {
  title: string
  purpose: string
  canon?: string            // source file path
}
// Slots: #interactive, #demo, #details
```

### PropTable.vue props
```ts
interface PropDef {
  prop: string
  type: string
  purpose: string
  required?: boolean        // default true (matches reference philosophy)
}
interface PropTableProps {
  props: PropDef[]
  note?: string             // hint text shown above table
}
```

---

## 8. Components to Document (Complete List)

Combines existing `@/ui` components + new ones from S8 item 3 audit:

### Existing @/ui (document as-is)
- `UiBadge` — color variants, size
- `UiButton` — variant, size, loading, disabled, icon slot
- `UiCard` — bordered / elevated variants, slots
- `UiConfirmDialog` — `useConfirm()` composable, async confirm pattern
- `UiEmptyState` — icon, title, description, action slot
- `UiField` — label, error, hint, slots
- `UiFilterChips` — options, modelValue, multi-select
- `UiIcon` — name (Lucide), size, color
- `UiInput` — type, placeholder, error, prefix/suffix
- `UiPlannedView` — (document or remove if not used)
- `UiProgressBar` — value, max, color variants
- `UiProgressRing` — value, max, size, stroke
- `UiSectionLabel` — label, icon
- `UiSkeleton` — width, height, rounded, variant (text / avatar / block)
- `UiStat` — label, value, icon, trend

### New components to build in S8 item 3
- `UiModal` — title, closeable, scrim, size variants
- `UiToast` — message, status (success/warning/error/info), duration
- `UiTabBar` — tabs[], modelValue, onChange
- `UiListItem` — leading (icon/avatar), label, sublabel, trailing slot
- `UiDivider` — horizontal / vertical, spacing

---

## 9. Implementation Sequence (Sessions)

| Session | Work |
|---------|------|
| **S8-A** (this doc) | Analysis + plan |
| **S8-B** | Tokens pages: Colors, Typography, Spacing, Shadows, Radius, Motion |
| **S8-C** | UiButton, UiInput, UiField, UiCard sections (with live interactive) |
| **S8-D** | UiBadge, UiIcon, UiSkeleton, UiProgressBar, UiProgressRing |
| **S8-E** | UiStat, UiSectionLabel, UiFilterChips, UiEmptyState |
| **S8-F** | Patterns: UiConfirmDialog, UiModal (if built), UiToast (if built) |
| **S8-G** | Theme switcher integration, polish, responsive check |

---

## 10. Design Decisions for VibeOS /ui-kit

| Decision | Choice | Reason |
|----------|--------|--------|
| Routing | Hash-based scroll within 3 routes (Tokens / Components / Patterns) | Avoids 30+ router entries; simpler; fast navigation |
| Prop table columns | Prop / Type / Purpose | Matches reference; "Purpose" is more useful than generic "Description" |
| Code snippets | Show, using `<pre><code>` | Essential for developer documentation |
| Interactive demo | Yes for all components | Core value of a live catalog |
| Theme switcher | Yes — vibe-pak selector | VibeOS's unique feature; shows all themes in one place |
| Production visibility | Hidden (`import.meta.env.PROD`) | Developer tool only |
| Canon reference | Points to `src/ui/components/ComponentName.vue` | Quick jump to source |
