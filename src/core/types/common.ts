export type ID = string

export interface SelectOption<T = string> {
  label: string
  value: T
  disabled?: boolean
}

export interface PaginationMeta {
  page: number
  perPage: number
  total: number
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'
