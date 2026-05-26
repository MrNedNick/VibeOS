const PREFIX = 'platform'

export function storageKey(module: string, key: string): string {
  return `${PREFIX}:${module}:${key}`
}

export function storagGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function storageSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota exceeded or private browsing — fail silently
  }
}

export function storageRemove(key: string): void {
  localStorage.removeItem(key)
}
