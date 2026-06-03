import { reactive, readonly, type Ref } from 'vue'

export type Validator = (value: string) => string | null

export type ValidationSchema<T extends string> = Record<T, Validator[]>

export interface FormValidation<T extends string> {
  errors: Readonly<Record<T, string | null>>
  touched: Readonly<Record<T, boolean>>
  onBlur: (field: T) => void
  validate: () => boolean
  reset: () => void
}

// ── Built-in validators ───────────────────────────────────────────────────
export const required = (msg = 'Required'): Validator =>
  (v) => v.trim().length === 0 ? msg : null

export const email = (msg = 'Enter a valid email'): Validator =>
  (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : msg

export const minLength = (n: number, msg?: string): Validator =>
  (v) => v.length >= n ? null : (msg ?? `At least ${n} characters`)

export const mustMatch = (other: Ref<string>, msg = "Doesn't match"): Validator =>
  (v) => v === other.value ? null : msg

// ── Composable ────────────────────────────────────────────────────────────
export function useFormValidation<T extends string>(
  schema: ValidationSchema<T>,
  values: Record<T, Ref<string>>,
): FormValidation<T> {
  const fields = Object.keys(schema) as T[]

  // Use Record<string, …> internally to avoid Reactive<Record<T,…>> index errors
  const _errors  = reactive<Record<string, string | null>>(Object.fromEntries(fields.map(f => [f, null])))
  const _touched = reactive<Record<string, boolean>>(Object.fromEntries(fields.map(f => [f, false])))

  function runField(field: T): string | null {
    const validators = schema[field]
    const value = values[field].value
    for (const validator of validators) {
      const msg = validator(value)
      if (msg !== null) return msg
    }
    return null
  }

  function onBlur(field: T): void {
    _touched[field] = true
    _errors[field] = runField(field)
  }

  function validate(): boolean {
    let valid = true
    for (const field of fields) {
      _touched[field] = true
      _errors[field] = runField(field)
      if (_errors[field] !== null) valid = false
    }
    return valid
  }

  function reset(): void {
    for (const field of fields) {
      _errors[field] = null
      _touched[field] = false
    }
  }

  return {
    errors:  readonly(_errors)  as Readonly<Record<T, string | null>>,
    touched: readonly(_touched) as Readonly<Record<T, boolean>>,
    onBlur,
    validate,
    reset,
  }
}
