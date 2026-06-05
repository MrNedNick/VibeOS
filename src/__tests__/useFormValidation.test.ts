/**
 * useFormValidation — built-in validators + the composable state machine.
 * Pure logic that guards the auth forms (login / register / password reset).
 */
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import {
  required, email, minLength, mustMatch, useFormValidation,
} from '@/core/composables/useFormValidation'

describe('validators', () => {
  it('required rejects empty / whitespace, accepts content', () => {
    const v = required()
    expect(v('')).toBe('Required')
    expect(v('   ')).toBe('Required')
    expect(v('x')).toBeNull()
  })

  it('required supports a custom message', () => {
    expect(required('Name needed')('')).toBe('Name needed')
  })

  it('email accepts valid and rejects invalid addresses', () => {
    const v = email()
    expect(v('a@b.co')).toBeNull()
    expect(v('  user@example.com  ')).toBeNull() // trimmed
    expect(v('nope')).toBe('Enter a valid email')
    expect(v('a@b')).toBe('Enter a valid email')
    expect(v('a@@b.co')).toBe('Enter a valid email')
  })

  it('minLength enforces the boundary', () => {
    const v = minLength(8)
    expect(v('1234567')).toBe('At least 8 characters')
    expect(v('12345678')).toBeNull()
    expect(minLength(3, 'too short')('ab')).toBe('too short')
  })

  it('mustMatch compares against a live ref', () => {
    const other = ref('secret')
    const v = mustMatch(other)
    expect(v('secret')).toBeNull()
    expect(v('nope')).toBe("Doesn't match")
    other.value = 'changed'
    expect(v('changed')).toBeNull()
  })
})

describe('useFormValidation', () => {
  function setup() {
    const emailVal = ref('')
    const pwVal = ref('')
    const form = useFormValidation(
      { email: [required(), email()], password: [required(), minLength(8)] },
      { email: emailVal, password: pwVal },
    )
    return { emailVal, pwVal, form }
  }

  it('starts with no errors and untouched fields', () => {
    const { form } = setup()
    expect(form.errors.email).toBeNull()
    expect(form.touched.email).toBe(false)
  })

  it('validate() returns false and fills errors when invalid', () => {
    const { form } = setup()
    expect(form.validate()).toBe(false)
    expect(form.errors.email).toBe('Required')
    expect(form.errors.password).toBe('Required')
    expect(form.touched.email).toBe(true)
  })

  it('validate() returns true when all fields pass', () => {
    const { emailVal, pwVal, form } = setup()
    emailVal.value = 'a@b.co'
    pwVal.value = 'longenough'
    expect(form.validate()).toBe(true)
    expect(form.errors.email).toBeNull()
    expect(form.errors.password).toBeNull()
  })

  it('reports the first failing rule per field', () => {
    const { emailVal, form } = setup()
    emailVal.value = 'bad'
    form.validate()
    expect(form.errors.email).toBe('Enter a valid email') // required passed, email failed
  })

  it('onBlur validates only the blurred field', () => {
    const { form } = setup()
    form.onBlur('email')
    expect(form.touched.email).toBe(true)
    expect(form.errors.email).toBe('Required')
    expect(form.touched.password).toBe(false)
    expect(form.errors.password).toBeNull()
  })

  it('reset clears errors and touched flags', () => {
    const { form } = setup()
    form.validate()
    form.reset()
    expect(form.errors.email).toBeNull()
    expect(form.touched.email).toBe(false)
  })
})
