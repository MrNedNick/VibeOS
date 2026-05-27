export interface DocPage {
  slug: string
  label: string
  labelRu: string
  filePath: string
  description?: string
  descriptionRu?: string
}

export interface DocSection {
  id: string
  label: string
  labelRu: string
  pages: DocPage[]
}

export const DOC_REGISTRY: DocSection[] = [
  {
    id: 'platform',
    label: 'Platform',
    labelRu: 'Платформа',
    pages: [
      {
        slug: 'platform',
        label: 'Overview',
        labelRu: 'Обзор',
        filePath: '/docs/platform.md',
        description: 'Vision, goals, and platform summary',
        descriptionRu: 'Видение, цели и общая картина платформы',
      },
      {
        slug: 'architecture',
        label: 'Architecture',
        labelRu: 'Архитектура',
        filePath: '/docs/architecture.md',
        description: 'Folder structure, layers, and data flow',
        descriptionRu: 'Структура папок, слои и поток данных',
      },
      {
        slug: 'conventions',
        label: 'Conventions',
        labelRu: 'Соглашения',
        filePath: '/docs/conventions.md',
        description: 'Naming, file, and code conventions',
        descriptionRu: 'Правила именования, файлов и кода',
      },
      {
        slug: 'patterns',
        label: 'Patterns',
        labelRu: 'Паттерны',
        filePath: '/docs/patterns.md',
        description: 'Reusable code patterns and recipes',
        descriptionRu: 'Переиспользуемые паттерны и рецепты кода',
      },
      {
        slug: 'roadmap',
        label: 'Roadmap',
        labelRu: 'Дорожная карта',
        filePath: '/docs/roadmap.md',
        description: 'Priorities, ideas, and future plans',
        descriptionRu: 'Приоритеты, идеи и планы на будущее',
      },
    ],
  },
  {
    id: 'modules',
    label: 'Modules',
    labelRu: 'Модули',
    pages: [
      {
        slug: 'modules/task-manager',
        label: 'Task Manager',
        labelRu: 'Задачи',
        filePath: '/docs/modules/task-manager.md',
        description: 'Task management module documentation',
        descriptionRu: 'Документация модуля управления задачами',
      },
      {
        slug: 'modules/dashboard',
        label: 'Dashboard',
        labelRu: 'Главная',
        filePath: '/docs/modules/dashboard.md',
        description: 'Platform dashboard module documentation',
        descriptionRu: 'Документация модуля панели управления',
      },
      {
        slug: 'modules/docs',
        label: 'Documentation',
        labelRu: 'Документация',
        filePath: '/docs/modules/docs.md',
        description: 'Documentation viewer module documentation',
        descriptionRu: 'Документация модуля просмотра документов',
      },
      {
        slug: 'modules/notes',
        label: 'Notes',
        labelRu: 'Заметки',
        filePath: '/docs/modules/notes.md',
        description: 'Markdown notes module with live preview',
        descriptionRu: 'Модуль заметок с Markdown и живым просмотром',
      },
      {
        slug: 'modules/currency',
        label: 'Currency',
        labelRu: 'Валюта',
        filePath: '/docs/modules/currency.md',
        description: 'Live exchange rates module — spec and API design',
        descriptionRu: 'Модуль курсов валют — спецификация и API',
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
