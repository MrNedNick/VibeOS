# Snippets module

**Status:** Available (S4)  
**Route:** `/snippets`  
**Layout:** fullbleed (two-pane)

## Purpose

A personal code vault. Developers accumulate dozens of snippets they re-use — API boilerplate, regex patterns, config templates, utility functions. Snippets gives them a permanent home: searchable, tagged, and always one click to copy.

Differentiation from a generic note-taking app:
- First-class language selection with syntax highlighting
- Copy-to-clipboard as the primary CTA (not "edit")
- Tag-based organization
- Code-aware list preview (first line of code, not generic text)

## Data model

```ts
interface Snippet {
  id: string          // crypto.randomUUID()
  title: string       // user-defined name
  code: string        // raw code content
  language: string    // one of LANGUAGE_OPTIONS values
  tags: string[]      // lowercase, free-form
  createdAt: string   // ISO timestamp
  updatedAt: string   // ISO timestamp
}
```

Storage key: `platform:snippets:snippets` (via `useStorage`)

## Component architecture

```
SnippetsView (fullbleed)
├── SnippetList (260px left panel)
│   ├── header: count + new button
│   ├── search input
│   ├── language filter pills
│   └── SnippetListItem[] (title, lang badge, code preview)
└── SnippetDetail (right panel)
    ├── view mode: title, lang badge, tags, highlighted code, copy button
    └── edit mode: title input, lang select, tags editor, code textarea
```

## Supported languages

| Value | Label |
|-------|-------|
| `javascript` | JavaScript |
| `typescript` | TypeScript |
| `vue` | Vue |
| `python` | Python |
| `bash` | Shell |
| `css` | CSS |
| `html` | HTML |
| `json` | JSON |
| `sql` | SQL |
| `go` | Go |
| `rust` | Rust |
| `plaintext` | Plain text |

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘N` | New snippet |
| `⌘F` | Focus search |
| `⌘S` (edit mode) | Save snippet |
| `⌘C` (view mode) | Copy code |
| `Escape` (edit mode) | Cancel edit |

## Backlog / future ideas

- Variable placeholders `{{name}}` — fill-in-before-copy dialog
- Import from file
- Share as Gist
- Duplicate snippet
- Usage counter (how many times copied)
