# Notes Module

**Status:** Available (v1.0)  
**Route:** `/notes`  
**Storage key:** `platform:notes:notes`

---

## Purpose

A distraction-free markdown note-taking workspace. Notes are plain text with Markdown support, rendered live in a split preview. The module is designed for developer notes, ideas, code snippets, and personal reference material.

---

## Data Model

```typescript
interface Note {
  id: string          // crypto.randomUUID()
  title: string       // derived from content, not stored separately
  content: string     // raw markdown
  createdAt: string   // ISO 8601
  updatedAt: string   // ISO 8601, updated on every auto-save
}
```

**Title extraction rules (in priority order):**
1. First `# Heading` line (strip the `# ` prefix)
2. First non-empty line (truncated to 80 chars)
3. Fallback: `"Untitled"`

Title is derived at read time — not stored in the model.

---

## Architecture

### Directory layout

```
src/modules/notes/
  types/index.ts          — Note interface + RawNote (stored shape)
  stores/notes.store.ts   — Pinia store, localStorage persistence
  composables/useNotes.ts — editor state, debounced save, mode switching
  components/
    NoteList.vue          — scrollable note list with search
    NoteListItem.vue      — single row: title, date, excerpt
    NoteEditor.vue        — textarea with Tab-key support
    NotePreview.vue       — marked HTML render
  views/NotesView.vue     — three-column workspace (list | editor | preview)
  index.ts                — route definitions
```

### Layout

Three-pane workspace, fullbleed (no outer padding):

```
┌──────────────────┬──────────────────────┬─────────────────────┐
│  Note List       │  Editor              │  Preview            │
│  (240px)         │  (flex 1)            │  (flex 1)           │
│  - search        │  - plain textarea    │  - rendered HTML    │
│  - new note btn  │  - tab → 2 spaces    │  - same styles as   │
│  - note rows     │                      │    docs module      │
└──────────────────┴──────────────────────┴─────────────────────┘
```

Mode selector (top bar): **Edit** · **Split** · **Preview**

- `edit` — only editor pane visible
- `split` — editor + preview side by side
- `preview` — only preview pane visible

---

## Component Responsibilities

### `notes.store.ts`
- `notes: Note[]` — reactive array, persisted via `useStorage`
- `createNote()` — inserts new empty note at top, returns id
- `updateContent(id, content)` — updates content + updatedAt
- `deleteNote(id)` — removes from array
- Computed: `sortedNotes` — sorted by updatedAt descending

### `useNotes.ts` composable
- `selectedId: Ref<string | null>` — currently open note
- `mode: Ref<'edit' | 'split' | 'preview'>` — editor display mode
- `searchQuery: Ref<string>` — list filter
- `filteredNotes` — computed from store.sortedNotes + searchQuery
- `selectedNote` — computed: the full Note object
- `debouncedSave(content)` — calls `store.updateContent` after 300ms
- `selectNote(id)` — sets selectedId
- `newNote()` — calls store.createNote(), selects the new note

### `NoteEditor.vue`
- Props: `modelValue: string`
- Emits: `update:modelValue`
- Tab key: inserts 2 spaces at cursor position (no `nextTick` workaround needed with direct DOM manipulation)

### `NotePreview.vue`
- Props: `content: string`
- Renders via `marked.parse()`, same `:deep()` typography as DocsView

---

## Editor Modes

| Mode | List visible | Editor visible | Preview visible |
|------|-------------|----------------|-----------------|
| edit | ✓ | ✓ | — |
| split | ✓ | ✓ | ✓ |
| preview | ✓ | — | ✓ |

Default mode: `split`

---

## Persistence

```typescript
// Storage key
storageKey('notes', 'notes')  // → "platform:notes:notes"

// Store ID
defineStore('notes:notes', ...)
```

---

## Keyboard Shortcuts (v1)

| Key | Action |
|-----|--------|
| Tab | Insert 2 spaces at cursor |

Planned (future): `⌘N` new note, `⌘F` focus search, `⌘⇧P` toggle preview.

---

## Known Limitations (v1)

- No folder/notebook organization
- No inter-note linking
- No export (PDF, markdown file)
- No code syntax highlighting in preview
- Title is re-derived on every render (acceptable for v1 list sizes)

---

## Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-05-26 | No rich-text editor library | `marked` already installed; textarea gives full control; no bundle bloat |
| 2026-05-26 | Title derived from content | Avoids title/content sync bugs; single source of truth |
| 2026-05-26 | `meta.fullbleed: true` on route | Notes needs full viewport height; outer layout padding would clip the editor |
| 2026-05-26 | 300ms debounce on save | Fast enough to feel instant; avoids per-keystroke localStorage writes |
| 2026-05-26 | Default mode: split | Most useful out of the box; shows markdown is rendering immediately |
