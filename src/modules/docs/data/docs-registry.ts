export interface DocPage {
  slug: string
  label: string
  filePath: string
  description?: string
}

export interface DocSection {
  id: string
  label: string
  pages: DocPage[]
}

export const DOC_REGISTRY: DocSection[] = [
  {
    id: 'platform',
    label: 'Platform',
    pages: [
      {
        slug: 'platform',
        label: 'Overview',
        filePath: '/docs/platform.md',
        description: 'Vision, goals, and platform summary',
      },
      {
        slug: 'architecture',
        label: 'Architecture',
        filePath: '/docs/architecture.md',
        description: 'Folder structure, layers, and data flow',
      },
      {
        slug: 'conventions',
        label: 'Conventions',
        filePath: '/docs/conventions.md',
        description: 'Naming, file, and code conventions',
      },
      {
        slug: 'patterns',
        label: 'Patterns',
        filePath: '/docs/patterns.md',
        description: 'Reusable code patterns and recipes',
      },
      {
        slug: 'roadmap',
        label: 'Roadmap',
        filePath: '/docs/roadmap.md',
        description: 'Priorities, ideas, and future plans',
      },
    ],
  },
  {
    id: 'modules',
    label: 'Modules',
    pages: [
      {
        slug: 'modules/task-manager',
        label: 'Task Manager',
        filePath: '/docs/modules/task-manager.md',
        description: 'Task management module documentation',
      },
      {
        slug: 'modules/dashboard',
        label: 'Dashboard',
        filePath: '/docs/modules/dashboard.md',
        description: 'Platform dashboard module documentation',
      },
      {
        slug: 'modules/docs',
        label: 'Documentation',
        filePath: '/docs/modules/docs.md',
        description: 'Documentation viewer module documentation',
      },
      {
        slug: 'modules/notes',
        label: 'Notes',
        filePath: '/docs/modules/notes.md',
        description: 'Markdown notes module with live preview',
      },
      {
        slug: 'modules/currency',
        label: 'Currency',
        filePath: '/docs/modules/currency.md',
        description: 'Live exchange rates module — spec and API design',
      },
    ],
  },
]

export function findDocPage(slug: string): DocPage | null {
  for (const section of DOC_REGISTRY) {
    const page = section.pages.find(p => p.slug === slug)
    if (page) return page
  }
  return null
}

export const TOTAL_DOC_PAGES = DOC_REGISTRY.reduce((acc, s) => acc + s.pages.length, 0)
