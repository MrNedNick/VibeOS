import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@/core/composables/useStorage'
import { en, type Messages } from './locales/en'
import { ru } from './locales/ru'

export type LocaleCode = 'en' | 'ru'

const LOCALES: Record<LocaleCode, Messages> = { en, ru }

// ── Store ─────────────────────────────────────────────────────────────
export const useLocaleStore = defineStore('locale', () => {
  const locale = useStorage<LocaleCode>('platform:locale', 'ru')

  const messages = computed<Messages>(() => LOCALES[locale.value] ?? en)

  /** Locale string for Intl APIs */
  const localeCode = computed<string>(() =>
    locale.value === 'ru' ? 'ru-RU' : 'en-GB'
  )

  /**
   * Translate a dot-path key with optional variable interpolation.
   * e.g. t('dashboard.title') or t('dashboard.planned', { n: 5 })
   */
  function t(key: string, vars?: Record<string, string | number>): string {
    const keys = key.split('.')
    let val: unknown = messages.value
    for (const k of keys) {
      val = (val as Record<string, unknown>)?.[k]
    }
    let str = typeof val === 'string' ? val : key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v))
      }
    }
    return str
  }

  function setLocale(l: LocaleCode) {
    locale.value = l
  }

  function toggleLocale() {
    locale.value = locale.value === 'ru' ? 'en' : 'ru'
  }

  return { locale, localeCode, t, setLocale, toggleLocale }
})

// ── Convenience composable ────────────────────────────────────────────
export function useLocale() {
  return useLocaleStore()
}

// ── Russian pluralization helper ──────────────────────────────────────
export function pluralRu(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n)
  const lastTwo = abs % 100
  const lastOne = abs % 10
  if (lastTwo >= 11 && lastTwo <= 19) return `${n} ${many}`
  if (lastOne === 1) return `${n} ${one}`
  if (lastOne >= 2 && lastOne <= 4) return `${n} ${few}`
  return `${n} ${many}`
}
