# Module: Documentation

**Route:** `/docs`, `/docs/:slug`  
**Status:** ✅ Active

---

## Purpose

An in-app documentation viewer. Read architecture decisions, conventions, patterns, and module guides without leaving the platform.

The documentation system is designed around a core principle: **docs live next to the code**. Markdown files in `docs/` are bundled at build time via Vite's glob import and rendered inside the app.

---

## How It Works

### Build-time loading
```typescript
// Vite loads all .md files as raw strings at build time
const DOC_FILES = import.meta.glob('/docs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>
```

This means docs are available instantly — no HTTP requests, no loading states.

### Routing
- `/docs` → index page with section grid
- `/docs/architecture` → renders `/docs/architecture.md`
- `/docs/modules/task-manager` → renders `/docs/modules/task-manager.md`

The slug from the URL maps directly to a file path via `docs-registry.ts`.

### Markdown rendering
Uses `marked` (v18) with GitHub Flavored Markdown enabled. Output is rendered via `v-html` with scoped `:deep()` styles for full typography control.

---

## Architecture

```
modules/docs/
├── index.ts                → route definitions
├── data/
│   └── docs-registry.ts   → DOC_REGISTRY (sections + page definitions)
├── composables/
│   └── useDocs.ts         → glob loading, route-to-content mapping
├── components/
│   └── DocsSidebar.vue    → section navigation
└── views/
    └── DocsView.vue       → layout + markdown renderer
```

### docs-registry.ts

Central map of all documentation pages. Each entry has:
- `slug` — URL path segment (`architecture`, `modules/task-manager`)
- `label` — display name in sidebar
- `filePath` — key in the glob map (`/docs/architecture.md`)

**When a new doc file is added**, add a corresponding entry to `docs-registry.ts`.

---

## Adding New Documentation

1. Create a markdown file in `docs/` or `docs/modules/`
2. Add an entry to `DOC_REGISTRY` in `src/modules/docs/data/docs-registry.ts`
3. The file is automatically available at `/docs/[slug]`

---

## Documentation Discipline

This platform follows an explicit documentation rule:

> **Whenever we work on a module and make decisions — including future plans, design directions, rejected approaches, or constraints — the relevant documentation file is updated in the same session.**

This means:
- If we decide to add localization to Task Manager → update `docs/modules/task-manager.md`
- If we change the folder structure convention → update `docs/conventions.md`
- If a new architectural pattern is established → update `docs/patterns.md`
- If a new module is planned → add a doc stub to `docs/modules/`

---

## Planned Improvements

- **Search** — full-text search across all docs
- **Last updated** — git-based timestamps per doc page
- **Collapsible sidebar sections** — for when doc count grows
- **Print / export** — export a doc as PDF

## Shipped Improvements

| Date | Feature | Details |
|------|---------|---------|
| 2026-05-26 | Anchor links on headings | Custom `marked` renderer adds `id` attribute + `.anchor-link` `#` element to every heading; appears on hover via CSS |
| 2026-05-26 | Copy button on code blocks | Injected via `watch(renderedHtml)` + `nextTick`; `data-copy-attached` attribute prevents duplicate injection; `navigator.clipboard.writeText` |

---

## Session Notes

### 2026-05-26 — Initial implementation
- Chose `marked` over `vue-markdown-it` — simpler API, no Vue wrapper dependency
- Chose `import.meta.glob` with `eager: true` — docs load instantly, no lazy-load complexity
- Docs registry is a separate data file (not auto-discovered) — explicit control over what's visible
- DocsView handles both index (`/docs`) and page (`/docs/:slug`) in one component — avoids nested router complexity
