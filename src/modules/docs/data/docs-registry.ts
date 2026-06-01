import type { Component } from 'vue'

// ── UI Kit showcase sections (live component demos, rendered in <DocsView>) ──
// Tokens
import ColorsSection from '@/modules/ui-kit/views/sections/tokens/ColorsSection.vue'
import TypographySection from '@/modules/ui-kit/views/sections/tokens/TypographySection.vue'
import SpacingSection from '@/modules/ui-kit/views/sections/tokens/SpacingSection.vue'
import ShadowsSection from '@/modules/ui-kit/views/sections/tokens/ShadowsSection.vue'
import MotionSection from '@/modules/ui-kit/views/sections/tokens/MotionSection.vue'
// Components
import UiButtonSection from '@/modules/ui-kit/views/sections/components/UiButtonSection.vue'
import UiInputSection from '@/modules/ui-kit/views/sections/components/UiInputSection.vue'
import UiFieldSection from '@/modules/ui-kit/views/sections/components/UiFieldSection.vue'
import UiCardSection from '@/modules/ui-kit/views/sections/components/UiCardSection.vue'
import UiSkeletonSection from '@/modules/ui-kit/views/sections/components/UiSkeletonSection.vue'
import UiBadgeSection from '@/modules/ui-kit/views/sections/components/UiBadgeSection.vue'
import UiIconSection from '@/modules/ui-kit/views/sections/components/UiIconSection.vue'
import UiProgressBarSection from '@/modules/ui-kit/views/sections/components/UiProgressBarSection.vue'
import UiProgressRingSection from '@/modules/ui-kit/views/sections/components/UiProgressRingSection.vue'
import UiStatSection from '@/modules/ui-kit/views/sections/components/UiStatSection.vue'
import UiSectionLabelSection from '@/modules/ui-kit/views/sections/components/UiSectionLabelSection.vue'
import UiFilterChipsSection from '@/modules/ui-kit/views/sections/components/UiFilterChipsSection.vue'
// Patterns
import UiEmptyStateSection from '@/modules/ui-kit/views/sections/patterns/UiEmptyStateSection.vue'
import UiConfirmDialogSection from '@/modules/ui-kit/views/sections/patterns/UiConfirmDialogSection.vue'
import UiPlannedViewSection from '@/modules/ui-kit/views/sections/patterns/UiPlannedViewSection.vue'

export interface DocPage {
  slug: string
  label: string
  labelRu: string
  /** Markdown source path — for prose docs. Mutually exclusive with `component`. */
  filePath?: string
  /** Live Vue showcase — for UI Kit pages. Rendered instead of markdown. */
  component?: Component
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
  // ── UI Kit — live component catalogue (the single source of truth for
  // every reusable @/ui component, shown with all its states) ──────────────
  {
    id: 'ui-kit-tokens',
    label: 'Design Tokens',
    labelRu: 'Дизайн-токены',
    pages: [
      { slug: 'ui-kit/colors',     label: 'Colors',           labelRu: 'Цвета',       component: ColorsSection,     description: 'Theme color palette and roles',     descriptionRu: 'Палитра и роли цветов темы' },
      { slug: 'ui-kit/typography', label: 'Typography',       labelRu: 'Типографика', component: TypographySection, description: 'Font sizes, weights, line-heights',  descriptionRu: 'Размеры, начертания, интерлиньяж' },
      { slug: 'ui-kit/spacing',    label: 'Spacing',          labelRu: 'Отступы',     component: SpacingSection,    description: 'Spacing scale and radius tokens',    descriptionRu: 'Шкала отступов и радиусов' },
      { slug: 'ui-kit/shadows',    label: 'Shadows & Radius', labelRu: 'Тени',        component: ShadowsSection,    description: 'Elevation shadows and corner radii', descriptionRu: 'Тени и скругления' },
      { slug: 'ui-kit/motion',     label: 'Motion & Easing',  labelRu: 'Анимация',    component: MotionSection,     description: 'Durations and easing curves',        descriptionRu: 'Длительности и кривые анимации' },
    ],
  },
  {
    id: 'ui-kit-components',
    label: 'UI Components',
    labelRu: 'UI-компоненты',
    pages: [
      { slug: 'ui-kit/button',       label: 'UiButton',       labelRu: 'UiButton',       component: UiButtonSection,       description: 'Primary action element',        descriptionRu: 'Основной элемент действия' },
      { slug: 'ui-kit/input',        label: 'UiInput',        labelRu: 'UiInput',        component: UiInputSection,        description: 'Text input control',            descriptionRu: 'Текстовое поле ввода' },
      { slug: 'ui-kit/field',        label: 'UiField',        labelRu: 'UiField',        component: UiFieldSection,        description: 'Labelled form field wrapper',   descriptionRu: 'Обёртка поля формы с лейблом' },
      { slug: 'ui-kit/card',         label: 'UiCard',         labelRu: 'UiCard',         component: UiCardSection,         description: 'Surface container',             descriptionRu: 'Контейнер-поверхность' },
      { slug: 'ui-kit/skeleton',     label: 'UiSkeleton',     labelRu: 'UiSkeleton',     component: UiSkeletonSection,     description: 'Loading placeholder',           descriptionRu: 'Плейсхолдер загрузки' },
      { slug: 'ui-kit/badge',        label: 'UiBadge',        labelRu: 'UiBadge',        component: UiBadgeSection,        description: 'Status / count label',          descriptionRu: 'Метка статуса или счётчика' },
      { slug: 'ui-kit/icon',         label: 'UiIcon',         labelRu: 'UiIcon',         component: UiIconSection,         description: 'Lucide icon wrapper',           descriptionRu: 'Обёртка иконок Lucide' },
      { slug: 'ui-kit/progressbar',  label: 'UiProgressBar',  labelRu: 'UiProgressBar',  component: UiProgressBarSection,  description: 'Linear progress indicator',     descriptionRu: 'Линейный индикатор прогресса' },
      { slug: 'ui-kit/progressring', label: 'UiProgressRing', labelRu: 'UiProgressRing', component: UiProgressRingSection, description: 'Circular progress indicator',   descriptionRu: 'Круговой индикатор прогресса' },
      { slug: 'ui-kit/stat',         label: 'UiStat',         labelRu: 'UiStat',         component: UiStatSection,         description: 'Single metric display',         descriptionRu: 'Отображение метрики' },
      { slug: 'ui-kit/sectionlabel', label: 'UiSectionLabel', labelRu: 'UiSectionLabel', component: UiSectionLabelSection, description: 'Section heading label',         descriptionRu: 'Заголовок секции' },
      { slug: 'ui-kit/filterchips',  label: 'UiFilterChips',  labelRu: 'UiFilterChips',  component: UiFilterChipsSection,  description: 'Toggleable filter chips',       descriptionRu: 'Переключаемые чипсы-фильтры' },
    ],
  },
  {
    id: 'ui-kit-patterns',
    label: 'UI Patterns',
    labelRu: 'UI-паттерны',
    pages: [
      { slug: 'ui-kit/emptystate',    label: 'UiEmptyState',    labelRu: 'UiEmptyState',    component: UiEmptyStateSection,    description: 'Empty / zero-data state',  descriptionRu: 'Состояние без данных' },
      { slug: 'ui-kit/confirmdialog', label: 'UiConfirmDialog', labelRu: 'UiConfirmDialog', component: UiConfirmDialogSection, description: 'Confirmation modal',       descriptionRu: 'Модал подтверждения' },
      { slug: 'ui-kit/plannedview',   label: 'UiPlannedView',   labelRu: 'UiPlannedView',   component: UiPlannedViewSection,   description: 'Planned / coming-soon view', descriptionRu: 'Экран «в планах»' },
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
