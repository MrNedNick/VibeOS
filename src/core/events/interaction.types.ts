// ─── Interaction / behavioral event union ─────────────────────────────────
// Tracks how users navigate and use features — separate from PlatformEvent
// (which tracks data mutations). Buffer: 10,000 entries, localStorage-only.

export interface SessionStartEvent {
  type: 'session:start'
  sessionId: string
  timestamp: string
  referrer?: string
}

export interface SessionEndEvent {
  type: 'session:end'
  sessionId: string
  duration: number
  modulesVisited: string[]
  timestamp: string
}

export interface ModuleVisitedEvent {
  type: 'module:visited'
  module: string
  from?: string
  timestamp: string
  sessionId: string
}

export interface ModuleTimeSpentEvent {
  type: 'module:time-spent'
  module: string
  seconds: number
  sessionId: string
  timestamp: string
}

export interface FeatureUsedEvent {
  type: 'feature:used'
  module: string
  feature: string
  context?: Record<string, unknown>
  timestamp: string
}

export interface UiCommandPaletteEvent {
  type: 'ui:command-palette'
  query?: string
  resultCount: number
  selected?: string
  timestamp: string
}

export interface UiThemeSwitchedEvent {
  type: 'ui:theme-switched'
  from: string
  to: string
  timestamp: string
}

export interface UiFeedbackTriggeredEvent {
  type: 'ui:feedback-triggered'
  trigger: 'auto' | 'manual'
  timestamp: string
}

export interface UiFeedbackSubmittedEvent {
  type: 'ui:feedback-submitted'
  score: number
  hasComment: boolean
  timestamp: string
}

export interface UiFeedbackDismissedEvent {
  type: 'ui:feedback-dismissed'
  dismissCount: number
  timestamp: string
}

export interface UiAiInsightEvent {
  type: 'ui:ai-insight'
  module: string
  action: 'triggered' | 'dismissed'
  timestamp: string
}

export interface UiExportEvent {
  type: 'ui:export'
  format: 'json' | 'csv'
  module: string
  timestamp: string
}

export type InteractionEvent =
  | SessionStartEvent
  | SessionEndEvent
  | ModuleVisitedEvent
  | ModuleTimeSpentEvent
  | FeatureUsedEvent
  | UiCommandPaletteEvent
  | UiThemeSwitchedEvent
  | UiFeedbackTriggeredEvent
  | UiFeedbackSubmittedEvent
  | UiFeedbackDismissedEvent
  | UiAiInsightEvent
  | UiExportEvent

export type InteractionEventType = InteractionEvent['type']
