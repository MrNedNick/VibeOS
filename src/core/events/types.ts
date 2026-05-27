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

export interface GameScoreEvent {
  type: 'game:score'
  game: string
  score: number
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
  | GameScoreEvent

export type PlatformEventType = PlatformEvent['type']
