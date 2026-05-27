// ─── Platform event union ─────────────────────────────────────────
// Every cross-module event is a discriminated union member here.
// Add new event types as new modules are wired in.

export interface TaskCreatedEvent {
  type: 'task:created'
  taskId: string
  label: string
  timestamp: string
}

export interface TaskCompletedEvent {
  type: 'task:completed'
  taskId: string
  label: string
  timestamp: string
}

export interface TaskDeletedEvent {
  type: 'task:deleted'
  taskId: string
  label: string
  timestamp: string
}

export interface HabitCheckedEvent {
  type: 'habit:checked'
  habitId: string
  habitName: string
  timestamp: string
}

export interface HabitUncheckedEvent {
  type: 'habit:unchecked'
  habitId: string
  habitName: string
  timestamp: string
}

export interface NoteCreatedEvent {
  type: 'note:created'
  noteId: string
  title: string
  timestamp: string
}

export interface NoteDeletedEvent {
  type: 'note:deleted'
  noteId: string
  title: string
  timestamp: string
}

export interface SnippetCreatedEvent {
  type: 'snippet:created'
  snippetId: string
  title: string
  language: string
  timestamp: string
}

export interface CardCreatedEvent {
  type: 'card:created'
  cardId: string
  title: string
  columnId: string
  timestamp: string
}

export interface CardMovedEvent {
  type: 'card:moved'
  cardId: string
  title: string
  toColumnId: string
  timestamp: string
}

export interface StudioRunEvent {
  type: 'studio:run'
  model: string
  inputTokens: number
  outputTokens: number
  timestamp: string
}

export interface GameScoreEvent {
  type: 'game:score'
  game: string
  score: number
  timestamp: string
}

export interface LearningSessionCompletedEvent {
  type: 'learning:session:completed'
  planId: string
  planTitle: string
  minutes: number
  timestamp: string
}

export interface LearningPlanCreatedEvent {
  type: 'learning:plan:created'
  planId: string
  title: string
  timestamp: string
}

export interface LearningPlanCompletedEvent {
  type: 'learning:plan:completed'
  planId: string
  title: string
  timestamp: string
}

export interface TrainingWorkoutLoggedEvent {
  type: 'training:workout:logged'
  planId: string | null
  planTitle: string
  duration: number
  timestamp: string
}

export interface TrainingPlanCreatedEvent {
  type: 'training:plan:created'
  planId: string
  title: string
  timestamp: string
}

export interface GoalCreatedEvent {
  type: 'goal:created'
  goalId: string
  title: string
  timestamp: string
}

export interface GoalCompletedEvent {
  type: 'goal:completed'
  goalId: string
  title: string
  timestamp: string
}

export interface GoalMilestoneCompletedEvent {
  type: 'goal:milestone:completed'
  goalId: string
  milestoneTitle: string
  timestamp: string
}

export type PlatformEvent =
  | TaskCreatedEvent
  | TaskCompletedEvent
  | TaskDeletedEvent
  | HabitCheckedEvent
  | HabitUncheckedEvent
  | NoteCreatedEvent
  | NoteDeletedEvent
  | SnippetCreatedEvent
  | CardCreatedEvent
  | CardMovedEvent
  | StudioRunEvent
  | GameScoreEvent
  | LearningSessionCompletedEvent
  | LearningPlanCreatedEvent
  | LearningPlanCompletedEvent
  | TrainingWorkoutLoggedEvent
  | TrainingPlanCreatedEvent
  | GoalCreatedEvent
  | GoalCompletedEvent
  | GoalMilestoneCompletedEvent

export type PlatformEventType = PlatformEvent['type']
