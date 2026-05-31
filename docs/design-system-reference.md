# Design System Reference

> ⚠️ INTERNAL ONLY — do not share this URL publicly or commit it to any public-facing doc.

---

## Reference Implementation

When building the `/ui-kit` component library page and the Unified Component Architecture sprint,
use the following internal reference for structure, interaction patterns, and component organisation:

```
https://8b8d8a1d.xovi-ai.pages.dev/#catalog/colors
```

This shows a working example of:
- Color palette display with tokens
- Typography scale
- Component catalogue with live examples
- Elevation / shadow system
- Motion / animation examples
- Interactive component states

**What to adapt for VibeOS:**
- The catalogue structure and navigation sidebar pattern
- The "live example + code snippet + prop table" card layout per component
- The color token display format
- The elevation/shadow section
- The motion/animation preview pattern

**What NOT to copy directly:**
- The specific color values (VibeOS has its own design tokens)
- The component implementations (VibeOS components are Vue 3 Composition API)
- Any branding or product-specific content

---

## How to use this reference

1. Open the URL in Claude in Chrome before starting the `/ui-kit` sprint
2. Use Claude to analyse the structure: what sections exist, how components are organised, how the catalogue navigation works
3. Screenshot key pages to reference during implementation
4. Build VibeOS `/ui-kit` following the same structural patterns, adapted to Vue 3

---

## Session note

When implementing the component library sprint (S8), start with a dedicated session that:
1. Loads the reference URL
2. Captures the full structure
3. Produces a detailed implementation plan for VibeOS
4. Then implements section by section in subsequent sessions
