// ─── Global platform notes ────────────────────────────────────────
// Весь текст ниже на русском языке для ежедневного использования.

export interface RoadmapItem {
  id: string
  label: string
  tag: 'feature' | 'design' | 'infra' | 'dx'
  priority: 'now' | 'next' | 'later'
}

export interface TechDebtItem {
  id: string
  label: string
  severity: 'high' | 'medium' | 'low'
}

export const TECH_DEBT: TechDebtItem[] = [
  { id: 'd1', label: 'Нет юнит и компонентных тестов — запланировано S7 (Vitest + CI gate)', severity: 'high' },
  { id: 'd3', label: 'Версионирование схемы localStorage добавлено, но хранилища не все подключены', severity: 'low' },
  { id: 'd5', label: 'Google Fonts загружается через @import (блокирует рендер)', severity: 'low' },
  { id: 'd6', label: 'S3 Supabase: весь код написан и задеплоен, но ждёт создания проекта пользователем', severity: 'medium' },
]

export const PLATFORM_STATUS = [
  { labelKey: 'platformHealth.architecture', status: 'good',    note: 'Слоистая, модульная — types → store → composable → components → view' },
  { labelKey: 'platformHealth.typescript',   status: 'good',    note: 'Строгий режим, 0 ошибок на каждом коммите' },
  { labelKey: 'platformHealth.build',        status: 'good',    note: 'Чистая production-сборка, деплой на mrnednick.github.io/VibeOS' },
  { labelKey: 'platformHealth.deployment',   status: 'good',    note: 'GitHub Actions → GitHub Pages, автодеплой на каждый пуш в main' },
  { labelKey: 'platformHealth.i18n',         status: 'good',    note: 'EN + RU, кастомный Pinia-стор, 90+ ключей' },
  { labelKey: 'platformHealth.tests',        status: 'missing', note: 'Vitest запланирован в S7 — goals store, learning, task filter' },
  { labelKey: 'platformHealth.backend',      status: 'wip',     note: 'Весь код Supabase написан — ждём создания проекта (нужны VITE_SUPABASE_URL + ANON_KEY)' },
  { labelKey: 'platformHealth.identity',     status: 'good',    note: 'S1 закрыт: лого, 6 vibe-пакетов, лендинг /welcome, Lucide иконки' },
] as const

// ─── Per-module detail data ───────────────────────────────────────

export interface NextTask {
  label: string
  priority: 'high' | 'medium' | 'low'
}

export interface ModuleDebt {
  label: string
  severity: 'high' | 'medium' | 'low'
}

export interface ShippedTask {
  label: string
  date: string   // 'YYYY-MM-DD'
}

export interface ModuleDetail {
  progress: number          // editorial: how feature-complete is this module (0–100)
  milestone: string         // one-line current state
  nextTasks: NextTask[]
  shippedTasks: ShippedTask[]
  improvements: string[]
  techDebt: ModuleDebt[]
  ideas: string[]
  notes?: string
}

export const MODULE_DETAILS: Record<string, ModuleDetail> = {
  dashboard: {
    progress: 90,
    milestone: 'S9 Phase 1–2 активны: Linear-стиль навигации, тени карточек, Raycast-поиск, токены типографики',
    shippedTasks: [
      { label: 'Полоса статистики жизни: привычки, цели, обучение, тренировки (кликабельны)', date: '2026-05-27' },
      { label: 'Динамическая версия через __APP_VERSION__', date: '2026-05-27' },
      { label: 'Виджет погоды (Open-Meteo, без ключа)', date: '2026-05-30' },
      { label: 'AI Digest — сводка дня из всех модулей на Pollinations.ai', date: '2026-05-30' },
      { label: 'Панель Целей и Привычек в sidebar модуль-листе', date: '2026-05-31' },
      { label: 'Виджет Finance — снапшот расходов с прогресс-баром бюджета', date: '2026-05-31' },
      { label: 'Панель Достижений (10 штук с прогресс-баром)', date: '2026-05-31' },
      { label: 'Виджет GitHub Activity (14-дневный граф, последние коммиты)', date: '2026-05-31' },
      { label: 'DashboardWidgetCustomizer — drag-to-reorder + eye toggle + reset', date: '2026-05-31' },
      { label: 'UiSkeleton на Weather, Digest, GitHub виджетах — нет layout shift', date: '2026-05-31' },
      { label: 'S9 Phase 1: box-shadow на карточках жизни, gap 24→20px', date: '2026-05-31' },
    ],
    nextTasks: [
      { label: 'S9 Phase 3: пройтись по модулям (Goals, Habits, Tasks, Notes) для визуального апгрейда', priority: 'high' },
      { label: 'S9 Phase 4: обновить vibe-paks под новые токены (shadow-0..4, surface-0..3)', priority: 'medium' },
      { label: 'S3: активировать Supabase после создания проекта (sync + auth)', priority: 'high' },
      { label: 'S7: добавить Vitest тесты (goals store, habits store, learning progress)', priority: 'medium' },
    ],
    improvements: [
      'Свёрнутый «фокус-режим» — только Today + хиты дня',
      'Живые часы в заголовке',
      'Пользовательский порядок секций в module-list',
    ],
    techDebt: [
      { label: 'MODULE_DETAILS в platform-notes актуализированы — но прогресс редакторский, не автоматический', severity: 'low' },
    ],
    ideas: [
      'Виджет Hacker News top-5',
      'Экспортируемый снимок состояния платформы',
      'Свёрнутый «фокус-режим»',
    ],
    notes: 'Главная страница. S9 делает её premium-look. S3 сделает данные постоянными.',
  },

  docs: {
    progress: 92,
    milestone: 'Полнотекстовый поиск с фрагментами, якоря на заголовки, подсветка синтаксиса',
    shippedTasks: [
      { label: 'Просмотр Markdown с подсветкой синтаксиса', date: '2026-05-26' },
      { label: 'Якорные ссылки на заголовки с хэш-переходом', date: '2026-05-26' },
      { label: 'Кнопка «Копировать» в блоках кода', date: '2026-05-26' },
      { label: 'Поиск по боковой панели + полнотекстовый с фрагментами', date: '2026-05-26' },
      { label: 'Сворачиваемые секции боковой панели', date: '2026-05-26' },
    ],
    nextTasks: [
      { label: 'Адаптив: боковая панель → выпадашка на mobile', priority: 'medium' },
      { label: 'Автоматическое оглавление из заголовков', priority: 'low' },
    ],
    improvements: [
      'Поиск по странице с подсветкой результатов',
      'Оглавление страницы (авто из заголовков)',
    ],
    techDebt: [],
    ideas: [
      'Переключатель тёмная/светлая тема для предпросмотра',
      'Экспорт всей документации как PDF',
    ],
    notes: 'Все .md-файлы собираются при сборке через Vite glob import.',
  },

  settings: {
    progress: 95,
    milestone: 'Видимость модулей, импорт данных, 6 vibe-пакетов — всё в Настройках',
    shippedTasks: [
      { label: 'Страница настроек /settings — Оформление / Данные / Клавиши / О приложении', date: '2026-05-27' },
      { label: 'Переключатель тем (6 vibe-пакетов) + мгновенный превью', date: '2026-05-27' },
      { label: 'Выбор языка: EN / RU', date: '2026-05-27' },
      { label: 'Экспорт / Импорт данных как JSON', date: '2026-05-27' },
      { label: 'Очистка всех данных с 5-секундным диалогом', date: '2026-05-27' },
      { label: 'API-ключи: Anthropic + дополнительные провайдеры', date: '2026-05-28' },
      { label: 'Видимость модулей — скрывать/показывать из sidebar', date: '2026-05-30' },
    ],
    nextTasks: [
      { label: 'Раздел Аккаунт (зависит от S3 Supabase)', priority: 'high' },
      { label: 'Настройки уведомлений', priority: 'medium' },
      { label: 'Сброс данных отдельного модуля', priority: 'low' },
    ],
    improvements: [
      'Собственный акцентный цвет для каждого модуля',
      'Редактор горячих клавиш',
    ],
    techDebt: [],
    ideas: [
      'Синхронизация настроек через Supabase',
      'Экспорт/импорт через QR-код',
    ],
    notes: 'Полностью функционально. Главный пробел — раздел Аккаунт (S3).',
  },

  about: {
    progress: 96,
    milestone: 'Личное bio, LinkedIn/GitHub, живые статы из store, стек технологий',
    shippedTasks: [
      { label: 'Страница /about с SVG-логотипом VibeOS', date: '2026-05-27' },
      { label: 'Сетка стека технологий + строка версии', date: '2026-05-27' },
      { label: 'Личная карточка: инициалы NN, LinkedIn/GitHub, bio, языки', date: '2026-05-29' },
      { label: 'Живые статы из store: кол-во модулей, привычек, задач, целей', date: '2026-05-31' },
    ],
    nextTasks: [
      { label: 'S9 Phase 3: визуальный апгрейд About page (портфолио-уровень)', priority: 'medium' },
      { label: 'Ссылка на резюме в PDF', priority: 'low' },
    ],
    improvements: [
      'Раздел «Сейчас / над чем работаю»',
    ],
    techDebt: [],
    ideas: [
      'Фото или аватар',
      'Краткая история проектов',
    ],
    notes: 'S9 Phase 3 превратит в настоящую portfolio page.',
  },

  'task-manager': {
    progress: 92,
    milestone: 'Pomodoro, тепловая карта активности, AI-приоритизация, linked goals, категории',
    shippedTasks: [
      { label: 'CRUD задач + приоритеты, дедлайны, категории жизни', date: '2026-05-26' },
      { label: 'Фильтры: Все / Активные / Выполненные / Сегодня + поиск', date: '2026-05-26' },
      { label: 'Экспорт CSV / JSON, клавиатурная навигация', date: '2026-05-26' },
      { label: 'Pomodoro Panel — SVG-кольцо, пресеты, выбор задачи фокуса', date: '2026-05-29' },
      { label: 'Тепловая карта активности (GitHub-стиль, 20 недель)', date: '2026-05-31' },
      { label: 'AI Focus — выбор 2–3 приоритетных задач через Pollinations.ai', date: '2026-05-31' },
      { label: 'Привязка к целям (linkedGoalId)', date: '2026-05-30' },
    ],
    nextTasks: [
      { label: 'S7: Vitest тест для task category filter', priority: 'medium' },
      { label: 'Перетаскивание для изменения порядка', priority: 'low' },
      { label: 'S9 Phase 3: визуальный апгрейд TaskManagerView', priority: 'medium' },
    ],
    improvements: [
      'Повторяющиеся задачи',
      'Подзадачи / иерархия',
      'Учёт затраченного времени',
    ],
    techDebt: [
      { label: 'Только сортировка по созданию — нет ручного упорядочивания', severity: 'medium' },
    ],
    ideas: [
      'Ввод на естественном языке (chrono-node)',
      'Карточки на Доске (одна сущность, два вида)',
    ],
    notes: 'Референсный модуль. Stride — кандидат на название.',
  },

  notes: {
    progress: 88,
    milestone: '[[Wiki-ссылки]], обратные ссылки, привязка к целям, расширенная колонка списка',
    shippedTasks: [
      { label: 'Рабочее пространство: список / редактор / превью', date: '2026-05-26' },
      { label: 'Markdown-превью, автосохранение 300 мс, горячие клавиши', date: '2026-05-26' },
      { label: '[[Wiki-ссылки]] — клик переходит или создаёт заметку', date: '2026-05-28' },
      { label: 'Панель обратных ссылок — список входящих ссылок', date: '2026-05-28' },
      { label: 'Кнопка «Сегодня» — ежедневный дневник', date: '2026-05-27' },
      { label: 'Привязка заметок к Целям (linkedGoalId)', date: '2026-05-31' },
    ],
    nextTasks: [
      { label: 'S9 Phase 3: визуальный апгрейд NotesView', priority: 'medium' },
      { label: 'Адаптив: свернуть список на mobile', priority: 'medium' },
    ],
    improvements: [
      'Шаблоны заметок: стендап, встреча, идея',
      'Система тегов',
    ],
    techDebt: [
      { label: 'Debounce-таймер на уровне модуля — не на уровне заметки', severity: 'low' },
    ],
    ideas: [
      'Полнотекстовый поиск с подсветкой',
      'Организация по папкам',
    ],
    notes: 'Inkwell — кандидат на название.',
  },

  kanban: {
    progress: 90,
    milestone: 'Timeline-дорожки, drag-and-drop, импорт задач, поиск + фильтр приоритетов',
    shippedTasks: [
      { label: '3-колоночный Kanban + drag-and-drop', date: '2026-05-27' },
      { label: 'Timeline-вид по датам (просрочено/сегодня/эта неделя…)', date: '2026-05-27' },
      { label: 'Дедлайны, приоритеты, импорт задач', date: '2026-05-27' },
      { label: 'Поиск + фильтр приоритетов по доске', date: '2026-05-31' },
    ],
    nextTasks: [
      { label: 'Перетаскивание внутри колонки', priority: 'medium' },
      { label: 'WIP-лимиты с визуальным предупреждением', priority: 'medium' },
      { label: 'S9 Phase 3: визуальный апгрейд BoardView', priority: 'low' },
    ],
    improvements: [
      'WIP-лимиты колонок',
      'Метки / цветные теги на карточках',
    ],
    techDebt: [
      { label: 'Нет drag-to-reorder внутри колонки', severity: 'low' },
    ],
    ideas: [
      'Импорт из Trello / Linear JSON',
      'Архивная колонка',
    ],
    notes: 'S4-дифференциатор реализован. Карточки хранятся отдельно — объединить с Tasks в будущем.',
  },

  'ai-playground': {
    progress: 90,
    milestone: 'Многоходовой чат, инъекция данных проекта, Free AI (Pollinations), Claude API',
    shippedTasks: [
      { label: 'Студия /ai — многоходовой чат с историей разговоров', date: '2026-05-29' },
      { label: 'Free AI (Pollinations.ai) без ключа + Claude API с ключом', date: '2026-05-29' },
      { label: 'Инъекция данных проекта (цели/задачи/привычки/обучение/тренировки)', date: '2026-05-29' },
      { label: 'Markdown-рендеринг ответов + копирование', date: '2026-05-29' },
      { label: 'Боковая история разговоров (макс. 50)', date: '2026-05-29' },
    ],
    nextTasks: [
      { label: 'Стриминг ответов с кнопкой отмены', priority: 'high' },
      { label: 'Параллельный запуск: один промпт → несколько моделей рядом', priority: 'medium' },
      { label: 'S6/10: Gemini Flash, GroqCloud, OpenRouter провайдеры', priority: 'medium' },
    ],
    improvements: [
      'Стриминг с частичным рендером',
      'Сравнение моделей рядом',
      'Трекер стоимости токенов',
    ],
    techDebt: [
      { label: 'Прямой вызов API из браузера — может блокироваться CORS', severity: 'medium' },
    ],
    ideas: [
      'Экспорт разговора как Markdown',
      'Публичная библиотека промптов (зависит от Supabase)',
    ],
    notes: 'Дифференциатор = параллельное сравнение моделей. Сейчас одна модель за раз.',
  },

  habits: {
    progress: 95,
    milestone: 'Полный depth pass: категории, серии, ретроактивные чекины, skip days, цели, drag-reorder',
    shippedTasks: [
      { label: 'CRUD привычек + тепловая карта + серии', date: '2026-05-27' },
      { label: 'Интеграция Цели/Обучение/Тренировки', date: '2026-05-29' },
      { label: 'Категории: здоровье/продуктивность/обучение/социальное/другое', date: '2026-05-31' },
      { label: 'Ретроактивные чекины — 14-дневная сетка', date: '2026-05-31' },
      { label: 'Skip days — не ломают серию', date: '2026-05-31' },
      { label: 'Milestone-баннер при достижении 7/14/30/60/100 дней', date: '2026-05-31' },
      { label: 'Quick-start шаблоны (5 пресетов)', date: '2026-05-31' },
      { label: 'At-risk фильтр (⚠️ N)', date: '2026-05-31' },
      { label: 'Недельная сводка (прогресс-бар сверху)', date: '2026-05-31' },
      { label: 'Drag-to-reorder привычек', date: '2026-05-31' },
      { label: 'Чекины с заметками на день', date: '2026-05-31' },
    ],
    nextTasks: [
      { label: 'S9 Phase 3: визуальный апгрейд HabitsView + HabitCard', priority: 'high' },
      { label: 'Push-уведомления (⚠️ streak at risk)', priority: 'medium' },
      { label: 'Emoji picker вместо текстового ввода', priority: 'low' },
    ],
    improvements: [
      'Push-уведомления в конце дня',
      'Emoji picker',
      'Mobile: 48px tap target для кнопки чекина',
    ],
    techDebt: [],
    ideas: [
      'Поделиться серией как изображением',
      'Еженедельная сводка-уведомление',
    ],
    notes: 'Feature-complete. S9 Phase 3 даст премиальный UI.',
  },

  games: {
    progress: 98,
    milestone: '4 игры с системами скинов: Snake (5 скинов), Memory (4 темы), Sudoku (3 темы), Minesweeper (4 скина)',
    shippedTasks: [
      { label: 'Snake — canvas, 5 unlock-скинов, стена-обёртка', date: '2026-05-27' },
      { label: 'Minesweeper — flood-fill, первый клик безопасен, 4 скина по времени', date: '2026-05-27' },
      { label: 'Memory — CSS 3D-переворот, 4 пула эмодзи по победам', date: '2026-05-31' },
      { label: 'Sudoku — 9×9 сетка, 3 цветовые темы по решённым паззлам', date: '2026-05-31' },
    ],
    nextTasks: [
      { label: 'Новая игра: Tetris', priority: 'low' },
      { label: 'Рекорды в виджете на Dashboard', priority: 'low' },
    ],
    improvements: [
      'Звуковые эффекты (Web Audio API)',
      'Ежедневный вызов с общим начальным числом',
    ],
    techDebt: [],
    ideas: [
      'Клон Wordle',
      'Понг против AI',
    ],
    notes: 'Все 4 оригинальные реализации. Minesweeper демонстрирует flood-fill алгоритм.',
  },

  goals: {
    progress: 93,
    milestone: 'Полный модуль: этапы, AI-планирование, привязка задач/заметок/привычек, фильтры категорий',
    shippedTasks: [
      { label: 'CRUD целей + этапы + прогресс + категории + статус', date: '2026-05-27' },
      { label: 'Интеграция Привычки → Цели (auto-increment milestone)', date: '2026-05-29' },
      { label: 'Связанные задачи в GoalDetailView', date: '2026-05-31' },
      { label: 'Связанные заметки (linkedGoalId на Note)', date: '2026-05-31' },
      { label: 'AI: предложить этапы одним кликом', date: '2026-05-30' },
      { label: 'Фильтр категорий в Goals list', date: '2026-05-30' },
    ],
    nextTasks: [
      { label: 'S9 Phase 3: визуальный апгрейд GoalCard + GoalDetailView', priority: 'high' },
      { label: 'Архивирование выполненных целей', priority: 'low' },
    ],
    improvements: [
      'Визуальное кольцо прогресса на GoalCard',
      'Дедлайны этапов',
    ],
    techDebt: [
      { label: 'Прогресс только из этапов — нет ручного переопределения', severity: 'low' },
    ],
    ideas: [
      'Шаблоны целей (напр. «Пробежать полумарафон»)',
      'Ретроспектива после завершения',
    ],
    notes: 'Центральный коннектор всех модулей жизни.',
  },

  learning: {
    progress: 92,
    milestone: 'Планы, сессии, ресурсы, AI-генерация плана, анализ сессии, привязка привычек и целей',
    shippedTasks: [
      { label: 'Планы + журнал сессий + кольца прогресса + серии', date: '2026-05-27' },
      { label: 'Библиотека ресурсов (статьи/видео/книги/курсы)', date: '2026-05-31' },
      { label: 'AI: «✦ Fill with AI» — генерация плана по теме', date: '2026-05-31' },
      { label: 'AI: анализ сессии с рекомендациями после логирования', date: '2026-05-31' },
      { label: 'Привязка к привычке (linkedLearningPlanId)', date: '2026-05-29' },
    ],
    nextTasks: [
      { label: 'S9 Phase 3: визуальный апгрейд LearningView + PlanDetailView', priority: 'medium' },
      { label: 'Таймер фокуса в журнале сессий', priority: 'low' },
    ],
    improvements: [
      'Напоминания интервального повторения',
      'Диаграмма недельных часов',
    ],
    techDebt: [],
    ideas: [
      'Импорт из Notion / Obsidian',
      'Публичная комната для учёбы (Supabase)',
    ],
    notes: 'Feature-complete v2. S9 Phase 3 — визуальный апгрейд.',
  },

  training: {
    progress: 92,
    milestone: 'Планы, тренировки, ресурсы, AI-анализ, привязка привычек и целей',
    shippedTasks: [
      { label: 'Планы + журнал тренировок + серии + дистанция км + эмодзи самочувствия', date: '2026-05-27' },
      { label: 'Библиотека ресурсов для плана', date: '2026-05-31' },
      { label: 'AI: «✦ Fill with AI» — генерация плана тренировок', date: '2026-05-31' },
      { label: 'AI: анализ тренировки с рекомендациями после логирования', date: '2026-05-31' },
      { label: 'Привязка к привычке (linkedTrainingPlanId)', date: '2026-05-29' },
    ],
    nextTasks: [
      { label: 'S9 Phase 3: визуальный апгрейд TrainingView + PlanDetailView', priority: 'medium' },
      { label: 'Список упражнений за сессию (подходы × повторения × вес)', priority: 'medium' },
    ],
    improvements: [
      'Диаграмма недельного объёма',
      'Отслеживание личных рекордов',
    ],
    techDebt: [],
    ideas: [
      'Интеграция со Strava',
      'Шаблоны планов тренировок',
    ],
    notes: 'Feature-complete v2. Мобильные чекины важны — PWA после S5.',
  },
}
