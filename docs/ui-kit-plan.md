# VibeOS /ui-kit — Implementation Plan

> Reference analysis completed: 2026-05-31  
> Reference site: `https://8b8d8a1d.xovi-ai.pages.dev/#catalog/colors` (XOVI AI Design System)  
> Analysis method: visual inspection in the browser (every section browsed and screenshotted) plus JS bundle extraction for the navigation structure

---

## 1. Reference Site — Full Sidebar Navigation (Confirmed Visually)

The sidebar has a header "Xovi AI — Catalog" + "← Back to app" link, then **4 collapsible groups**:

### Group: Tokens
| Sidebar label | Route key |
|--------------|-----------|
| Playground | `playground` |
| Colors | `colors` |
| State Layers | `state-layers` |
| Typography | `typography` |
| Spacing | `spacing` |
| Shape | `shape` |
| Elevation | `elevation` |
| Motion | `motion` |
| Floating | `floating` |
| Fonts | `fonts` |
| Icons | `icons` |

### Group: Components
| Sidebar label | Route key |
|--------------|-----------|
| Switch | `switch` |
| Checkbox | `checkbox` |
| Radio button | `radio` |
| Icon Button | `icon-button` |
| Button | `button` |
| Divider | `divider` |
| Dialog | `dialog` |
| Snackbar | `snackbar` |
| Linear Progress | `linear-progress` |
| Circular Progress | `circular-progress` |
| Tooltip | `tooltip` |
| Menu Item | `menu-item` |
| Menu | `menu` |
| Side Sheet | `side-sheet` |
| Badge | `badge` |
| Chip | `chip` |
| Tab Bar | `tab-bar` |
| Nav Item | `nav-item` |
| Navigation Drawer | `navigation-drawer` |
| List + List Item | `list` |
| Text Field | `text-field` |
| Date Picker | `date-picker` |

### Group: Layout (product-specific — for reference only, not to copy)
Pre-First-Run Banner · Report Status Bar · Report History Bar · Report In-Progress Bar · Report Configurator Bar · Upsell Dialog · Section Header · Help Inline Message · Offering Readiness Panel · Offering Section Card · Offering Field Error Block · Offering Field Row · Score · Score Gauge · Score Card · Attribute Accordion · Attribute Rule Card · Value Label · Temporary Chip

### Group: Surfaces (product-specific — skip)
Full-page surfaces (Edit Offering, etc.)

---

## 2. Component Card Pattern (Confirmed Visually)

Each component page is a single scrolling `<article class="showcase">`. Sections appear in this fixed order:

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                         │
│  h1: Component Name  (Headline Small typography)                │
│  p:  Purpose — one-sentence "what it is + when to use it"       │
│  CANON: src/lib/components/primitives/Switch.svelte             │
│          · https://m3.material.io/components/switch/overview    │
├─────────────────────────────────────────────────────────────────┤
│  PLAYGROUND  (interactive, always present for UI components)    │
│  ┌─────────────────────────────┐  ┌──────────────────────────┐  │
│  │  Live component render      │  │  pg-controls             │  │
│  │  (updates in real time)     │  │  (inputs/radios/checks)  │  │
│  └─────────────────────────────┘  └──────────────────────────┘  │
│  pg-readout: "selected = false" / "clicks = 0" / "last = —"    │
│  Note: instruction text above the stage explains what to do     │
├─────────────────────────────────────────────────────────────────┤
│  DEMO  (optional — static examples)                             │
│  Named sub-sections (h3), each showing a specific variant:      │
│  e.g. "Filled with icons", "Error state", "Disabled"           │
│  e.g. "Assist chips", "Filter chip group", "Input chips"        │
├─────────────────────────────────────────────────────────────────┤
│  PROPS                                                          │
│  h3: "Props"                                                    │
│  p: "All props are required — no defaults inside the component  │
│      (per layout-rhythm.design-policy.md R10)"                  │
│  ┌──────────────────┬───────────────────┬──────────────────┐   │
│  │ PROP             │ TYPE              │ PURPOSE          │   │
│  ├──────────────────┼───────────────────┼──────────────────┤   │
│  │ selected         │ boolean           │ ON/OFF value...  │   │
│  │ disabled         │ boolean           │ Blocks click...  │   │
│  │ onToggle         │ () => void        │ Called on click  │   │
│  │ ariaLabel        │ string            │ Accessible name  │   │
│  └──────────────────┴───────────────────┴──────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  ADDITIONAL SECTIONS (optional, component-specific)             │
│  · Spacing — exact padding/gap values with M3 spec reference    │
│  · Accessibility — role, aria-*, focus-trap, ESC, scroll lock   │
│  · Usage — "Use when" / "Do not use when" bullet lists          │
│  · Skipped from M3 — intentional omissions with reason          │
└─────────────────────────────────────────────────────────────────┘
```

### Interactive Playground Controls — 3 patterns observed:

**Simple (Switch, Checkbox):**
- Checkboxes only: `☑ icon`, `☐ disabled`
- Readout: `selected = false`

**Rich controls (Button):**
- Text input: LABEL ("Continue")
- Text input: ICON OPTIONAL (e.g. "check, arrow-forward")
- Radio group: VARIANT (filled / tonal / outlined / text)
- Radio group: TONE (default / error / danger / warning / info / success)
- Radio group: SHAPE (round / square)
- Radio group: SIZE (xs 32px / s 40px / m 48px)
- Checkbox: disabled
- Readout: `clicks = 0`

**Two-column complex (Dialog):**
- Left column: TITLE (toggle + text input), BODY CONTENT (textarea), show divider (checkbox), WIDTH (radio: s 320 / m 480 / l 720 / custom px)
- Right column: PRIMARY ACTION (present toggle + label + variant radios), SECONDARY ACTION (same)
- "Open dialog" button → opens actual dialog overlay
- Readout: `last = —` (shows which action was clicked)

### "Skipped from M3" section — key pattern to adopt in VibeOS:
- Text Field skips: Prefix/suffix text, Multi-line textarea, Character counter, Size variants
- Dialog skips: Hero icon prop, Fixed text content prop, Full-screen variant, Separate scroll regions
- Documents WHY each was skipped — invaluable for team communication

---

## 3. Token Display Formats (Confirmed Visually)

### Colors section
- **Layout:** groups as h3 headings → grid of 4 swatches per row
- **Groups:** Primary · Secondary · Tertiary · Error · Background/Surface · Surface Containers (tonal hierarchy) · Outline/Shadow/Scrim · Inverse · Fixed (persist across light/dark)
- **Each swatch:** colored box (background = CSS var, text = on-color CSS var)
  - Role name in large bold (e.g. "Primary Container")
  - CSS var in code style (e.g. `--md-sys-color-primary-container`)
  - No hex values — role-based only

### State Layers section
- Shows 3 opacity swatches per color role: **08%** · **10%** · **16%**
- Greyed boxes because opacity overlays look muted
- Grouped by role: Primary, On Primary, Primary Container, On Primary Container, etc.

### Typography section
- **Two-column row layout** (not a grid)
- Left: **Role name** (bold) + specs on next line: `57px / 64px / -0.25px / Regular (400)` + `.typescale-display-large` utility class in code style
- Right: actual text rendered at that exact scale ("The quick brown fox...")
- 15 roles total in 5 groups: Display (3) · Headline (3) · Title (3) · Body (3) · Label (3)

### Spacing section
- **Horizontal bar chart** for each step
- Row format: `4px  --sp-4  HELPER 4PX  [short bar]`
- Row format: `8px  --sp-8  PRIMARY 8PX [longer bar]`
- 12 steps: 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64
- "PRIMARY 8PX" badge on 8px-multiples, "HELPER 4PX" badge on 4px helpers
- **Grid rule** section below: bullet points explaining when to use primary vs helper grid

### Shape section
- **Grid of visual cards** (2 rows × 5 columns)
- Each card: colored rounded square visually demonstrating the radius + Name below + px value + CSS var
- 10 levels: None(0) · Extra-small(4) · Small(8) · Medium(12) · Large(16) · Large-increased(20) · Extra-large(28) · Extra-large-increased(32) · Extra-extra-large(48) · Full(1000px — capsule)
- **Usage table** below: CORNER | PX | WHERE TO USE

### Elevation section
- **6 visual cards** (Level 0–5) in a responsive grid, each rendered with actual `box-shadow`
- Each card: "Level N" label + "Ndp" + CSS var (`--md-sys-elevation-level-N`)
- **Guidance** section: bullet points (Tonal first / Few levels / Resting 0-3 / Interaction 4-5)
- **Component defaults table**: LEVEL | DP | TYPICAL USE

### Motion section
- **Playground:** clickable "Toggle position" button — small blue square slides using the canonical transition
- Instruction: "The block uses `transition: transform var(--md-sys-motion-standard)` — same timing as any component using the shortcut"
- **Easing curve visualization:** SVG bezier curve graph showing `cubic-bezier(0.2, 0, 0, 1)` shape
- Description: "Emphasized (M3) — decelerates smoothly near the end, subtle initial slowness"
- **Tokens table**: TOKEN | CSS VARIABLE | VALUE | JS EXPORT (SRC/LIB/MOTION.TS)
  - Duration short-4 → `--md-sys-motion-duration-short4` → `200ms` → `motionDurationShort4`
  - Easing emphasized → `--md-sys-motion-easing-emphasized` → `cubic-bezier(0.2, 0, 0, 1)` → `easingEmphasized`
  - Standard (composite) → `--md-sys-motion-standard` → `200ms cubic-bezier(0.2, 0, 0, 1)` → use both above

### Fonts section
- **Typefaces** section: 2 cards side by side — BRAND card + PLAIN card
  - Brand: "Roboto" large, `--md-ref-typeface-brand`, "Used by Display/Headline/Title Large — expressive roles"
  - Plain: "Roboto" large, `--md-ref-typeface-plain`, "Used by Title Medium/Small, Body, Label — UI roles"
- **Weights** section: 3 rows (Regular 400 / Medium 500 / Bold/SemiBold 600) each with CSS var + sample text
- **Tracking primitives**: None + Small with CSS vars
- Note: Bold aliases SemiBold (600), not 700

### Icons section
- **Playground**: NAME input + SIZE (PX) input → live icon renders + code snippet `<Icon name="check" size={24} />`
- **Search bar**: searches 16,143 icons by name or alias
- **Category filter chips**: All · Actions · Activities · Android · Audio & Video · Business · Communicate · Hardware · Home · Household · Images · Maps · Privacy · Social · Text · Transit · Travel · UI Actions
- **Icon grid**: shows 200 at a time, "Show 200 more" link, names below each icon

---

## 4. Component States — How They're Shown (Confirmed Visually)

| State | How shown in reference |
|-------|----------------------|
| **Default** | Always in pg-stage |
| **Hover** | User hovers in pg-stage (native CSS `:hover`) |
| **Focus** | User tabs to element (`:focus-visible`) |
| **Click/Press** | User clicks (state layer visible) |
| **Disabled** | Toggle in pg-controls → prop → CSS `:disabled` / 38% opacity |
| **Error** | Toggle checkbox in pg-controls → `error` prop → red border/label |
| **Selected/Active** | Toggle checkbox → `selected` prop → secondary-container fill |
| **Indeterminate** | Toggle checkbox → `indeterminate` prop (Checkbox only) |
| **Loading** | Separate Playground control where applicable |

**Key insight:** The live stage in the playground IS the component — not a mock. Hover/focus work because the real component is rendered. Only toggleable props need explicit controls.

---

## 5. Chip Component Deep-Dive (most relevant for VibeOS UiFilterChips)

**One primitive, 4 behaviors via props:**
- **Assist chips** (action prompts) — icon + label, not selectable, triggers action
- **Filter chips** (multi-select) — `selected` prop, checkmark appears when selected
- **Input chips** (removable) — `closable` prop adds X trailing button, fires close event
- **Suggestion chips** — text only, triggers action like Assist

**Demo section shows all 4 side-by-side:**
- Assist: "Add to calendar", "Set reminder", "Share" (with leading icons)
- Filter: "New" · "✓ Popular" · "On sale" · "Free shipping"
- Input: "React ×" · "TypeScript ×" · "Svelte ×" (removable)
- Suggestion: "Sounds good" · "Tell me more" · "Maybe later"
- Disabled: greyed chips, both deselected and selected states

---

## 6. VibeOS /ui-kit Page — Planned Structure

### Route
`/ui-kit` — accessible via Settings → Developer tab (hidden in production via `import.meta.env.PROD`)

### Layout
```
┌──────────────────────┬──────────────────────────────────────────┐
│  SIDEBAR (220px)     │  MAIN CONTENT (scrollable)              │
│  fixed left          │                                          │
│  ─────────────────── │  <article class="showcase">              │
│  🎨 Tokens           │    [Header]                              │
│    Colors            │    [Playground]                          │
│    Typography        │    [Demo]                                │
│    Spacing           │    [Props table]                         │
│    Shadows           │    [Additional sections]                 │
│    Radius            │                                          │
│    Motion            │                                          │
│  ─────────────────── │                                          │
│  🧩 Components       │                                          │
│    UiButton          │                                          │
│    UiInput           │                                          │
│    ... (all @/ui)    │                                          │
│  ─────────────────── │                                          │
│  📐 Patterns         │                                          │
│    EmptyState        │                                          │
│    ConfirmDialog     │                                          │
│    FilterChips       │                                          │
│  ─────────────────── │                                          │
│  Theme: [pak picker] │                                          │
└──────────────────────┴──────────────────────────────────────────┘
```

### Sidebar groups for VibeOS
```
Tokens
  Colors
  Typography
  Spacing
  Shadows & Elevation
  Border Radius
  Motion & Easing

Components
  UiButton
  UiInput
  UiField
  UiCard
  UiBadge
  UiIcon
  UiSkeleton
  UiProgressBar
  UiProgressRing
  UiSectionLabel
  UiStat
  UiFilterChips

Patterns
  UiEmptyState
  UiConfirmDialog
  UiModal (when built)
  UiToast (when built)
  UiListItem (when built)
  UiTabBar (when built)
```

---

## 7. Sections to Implement — Priority Order

### Priority 1 — Token pages (foundation)

| Section | VibeOS source | Display format |
|---------|--------------|----------------|
| **Colors** | `--color-*` in `main.css` + 6 vibe-paks | Swatch grid: role name + CSS var, rendered with actual colors |
| **Typography** | `--text-*`, `--font-*` | Two-col rows: specs left, rendered text right |
| **Spacing** | Define `--sp-*` tokens (S8 item 5) | Bar chart: px + var + type badge + proportional bar |
| **Shadows** | `--shadow-sm/md/lg` → extend to 5 levels | Visual cards: Level 0-5 with actual shadows |
| **Border Radius** | `--radius-*` | Grid cards: rounded box + name + px + var |
| **Motion** | `--ease-*`, `--t-fast/t/t-slow` | Animated demo block + bezier curve + tokens table |

### Priority 2 — Core Components

| Component | Status | Key props to document |
|-----------|--------|----------------------|
| **UiButton** | ✅ exists | variant, size, loading, disabled, icon |
| **UiInput** | ✅ exists | type, placeholder, error, leadingIcon, trailingIcon, helperText |
| **UiField** | ✅ exists | label, error, hint |
| **UiCard** | ✅ exists | bordered/elevated variant, slots |
| **UiSkeleton** | ✅ exists | width, height, rounded, variant (text/avatar/block) |
| **UiBadge** | ✅ exists | color variants, size |
| **UiProgressBar** | ✅ exists | value, max, color |
| **UiProgressRing** | ✅ exists | value, max, size |
| **UiSectionLabel** | ✅ exists | label, icon |
| **UiStat** | ✅ exists | label, value, icon, trend |
| **UiFilterChips** | ✅ exists | options, modelValue, multi |
| **UiIcon** | ✅ exists | name (Lucide), size |

### Priority 3 — Patterns (documented with composable API)

| Component | Status | Notes |
|-----------|--------|-------|
| **UiEmptyState** | ✅ exists | icon, title, description, action slot |
| **UiConfirmDialog** | ✅ exists | document `useConfirm()` composable pattern |
| **UiModal** | ❌ build in S8.3 | title, closeable, scrim, size |
| **UiToast** | ❌ build in S8.3 | message, status, duration, `useToast()` |
| **UiTabBar** | ❌ build in S8.3 | tabs[], modelValue |
| **UiListItem** | ❌ build in S8.3 | leading icon/avatar, label, sublabel, trailing |

---

## 8. Technical Implementation Notes

### Theme Switcher
The reference site does **not** have a classic theme switcher — it's a single M3 Blue Light theme. **VibeOS has this as a differentiator.**

Implementation:
```vue
<!-- In /ui-kit sidebar footer -->
<div class="theme-picker">
  <button
    v-for="pak in vibePaks"
    :key="pak.id"
    :style="{ background: pak.accentColor }"
    :class="{ active: currentTheme === pak.id }"
    @click="document.documentElement.setAttribute('data-theme', pak.id)"
    :title="pak.name"
  />
</div>
```
- All CSS vars update instantly — entire catalog reflects the chosen vibe-pak
- No page reload needed (CSS custom properties on `:root` cascade immediately)

### ShowcaseCard.vue — Reusable wrapper
```ts
// Props
interface ShowcaseCardProps {
  title: string
  purpose: string
  canon?: string   // e.g. "src/ui/components/UiButton.vue"
}
// Slots: #playground, #demo, #props, #extra (for Accessibility / Usage / Skipped)
```

### PropTable.vue — Reusable prop table
```ts
interface PropDef {
  prop: string
  type: string         // rendered as <code>
  purpose: string      // plain text
}
// Prop: props: PropDef[]
// Prop: note?: string   // hint text above table
```

### PgStage.vue — Interactive demo wrapper
```vue
<template>
  <div class="playground">
    <p class="pg-hint">{{ hint }}</p>
    <div class="pg-body">
      <div class="pg-stage">
        <slot name="stage" />       <!-- the live component -->
      </div>
      <div class="pg-controls">
        <slot name="controls" />    <!-- checkboxes, radios, inputs -->
      </div>
    </div>
    <code class="pg-readout" v-if="readout">{{ readout }}</code>
  </div>
</template>
```

### Prop table in Vue 3
```vue
<!-- Per component section — define as static const, not hardcoded HTML -->
<script setup>
const props: PropDef[] = [
  { prop: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", purpose: 'Visual style' },
  { prop: 'disabled', type: 'boolean', purpose: 'Prevents interaction, dims to 38% opacity' },
  { prop: 'onClick', type: '() => void', purpose: 'Click / Space / Enter handler' },
]
</script>
<template>
  <PropTable :props="props" note="All props required unless marked optional" />
</template>
```

### Motion demo pattern (adapted for Vue)
```vue
<script setup>
import { ref } from 'vue'
const toggled = ref(false)
</script>
<template>
  <div class="pg-stage">
    <div class="motion-box" :class="{ toggled }" />
    <button @click="toggled = !toggled">Toggle position</button>
  </div>
</template>
<style scoped>
.motion-box {
  transition: transform var(--t); /* uses VibeOS motion token */
}
.motion-box.toggled { transform: translateX(200px); }
</style>
```

### File structure
```
src/modules/ui-kit/
  views/
    UiKitView.vue            # root: sidebar + main
    sections/tokens/
      ColorsSection.vue
      TypographySection.vue
      SpacingSection.vue
      ShadowsSection.vue
      RadiusSection.vue
      MotionSection.vue
    sections/components/
      UiButtonSection.vue
      UiInputSection.vue
      UiCardSection.vue
      UiSkeletonSection.vue
      ... (one per component)
    sections/patterns/
      UiEmptyStateSection.vue
      UiConfirmDialogSection.vue
      ...
  components/
    ShowcaseCard.vue         # article wrapper with slots
    PropTable.vue            # receives PropDef[]
    PgStage.vue              # playground wrapper
    TokenSwatch.vue          # color swatch: role + CSS var
    TokenRow.vue             # typography / spacing row
```

---

## 9. Components to Document (Complete List)

### Existing @/ui — document as-is
`UiBadge` · `UiButton` · `UiCard` · `UiConfirmDialog` · `UiEmptyState` · `UiField` · `UiFilterChips` · `UiIcon` · `UiInput` · `UiProgressBar` · `UiProgressRing` · `UiSectionLabel` · `UiSkeleton` · `UiStat` · `UiPlannedView`

### New components to extract in S8 item 3
| Pattern | Found in | Target |
|---------|----------|--------|
| Modal overlay | All dialogs | `UiModal` |
| Toast notification | AchievementToast, AI analysis | `UiToast` |
| Horizontal tab bar | Analytics, Settings | `UiTabBar` |
| List row (icon+label+meta) | Various | `UiListItem` |
| Horizontal rule | Various | `UiDivider` |

---

## 10. Implementation Sequence

| Session | Work | Prerequisite |
|---------|------|-------------|
| **S8-A** (this doc) | Analysis + plan | — |
| **S8-B** | Token pages: Colors, Typography, Spacing | S8 item 5 (token extension) |
| **S8-C** | Token pages: Shadows, Radius, Motion + theme switcher | S8-B |
| **S8-D** | UiButton, UiInput, UiField sections | S8 item 3 |
| **S8-E** | UiCard, UiSkeleton, UiBadge, UiIcon | S8 item 3 |
| **S8-F** | UiProgressBar, UiProgressRing, UiStat, UiSectionLabel, UiFilterChips | S8 item 3 |
| **S8-G** | Patterns: UiEmptyState, UiConfirmDialog, new components | S8 item 3 |
| **S8-H** | Polish: responsive, search, theme switcher, accessibility | All above |

---

## 11. Design Decisions for VibeOS /ui-kit

| Decision | Choice | Reason |
|----------|--------|--------|
| Card sections | Header → Playground → Demo → Props → Extra | Exact reference pattern, confirmed visually |
| Prop table columns | Prop / Type / Purpose | "Purpose" (not "Description") — what the reference uses |
| "Skipped from VibeOS defaults" section | Add this to components where applicable | Honest documentation; prevents "why doesn't X work?" |
| "Accessibility" section | Add to Modal, Dialog, Tooltip, Snackbar | Critical for quality; reference does this for every complex component |
| Code snippets | Show minimal `<template>` usage example per component | Dev reference value |
| Interactive demo | Yes — renders actual `@/ui` component | Auto-syncs with implementation |
| Theme switcher | Vibe-pak picker in sidebar footer | VibeOS differentiator; shows all 6 themes live |
| Production visibility | Hidden (`import.meta.env.PROD`) | Dev tool only |
| Routing | Hash-based scroll on 3 routes (Tokens / Components / Patterns) | Avoids 30+ router entries |
| Canon reference | `src/ui/components/ComponentName.vue` | Quick jump to source |
| Motion tokens table | TOKEN / CSS VARIABLE / VALUE columns | Reference uses 4 cols; JS Export not needed for Vue project |
