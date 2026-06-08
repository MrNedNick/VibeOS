import type { App } from 'vue'
import type { Router } from 'vue-router'
import { useInteractionBus } from '@/core/stores/interaction.store'
import { useAnalyticsSync } from '@/core/composables/useAnalyticsSync'
import type { SessionStartEvent, SessionEndEvent, ModuleVisitedEvent, ModuleTimeSpentEvent } from '@/core/events/interaction.types'

const SESSION_GAP_MS = 30 * 60 * 1000  // 30 min inactivity = new session

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function deriveModule(path: string, metaModule?: unknown): string {
  if (metaModule && typeof metaModule === 'string') return metaModule
  const seg = path.split('/').filter(Boolean)[0]
  return seg || 'welcome'
}

export function createNavigationTracker(router: Router) {
  return {
    install(_app: App): void {
      let sessionId: string | null = null
      let sessionStarted: number | null = null
      let lastActivity: number = Date.now()
      const modulesVisited: string[] = []

      let currentModule: string | null = null
      let moduleEnteredAt: number | null = null

      function startSession(): void {
        sessionId = generateId()
        sessionStarted = Date.now()
        lastActivity = Date.now()
        modulesVisited.length = 0
        const bus = useInteractionBus()
        const ev: SessionStartEvent = { type: 'session:start', sessionId: sessionId!, timestamp: new Date().toISOString() }
        bus.emit(ev)
      }

      function endSession(): void {
        if (!sessionId || !sessionStarted) return
        const bus = useInteractionBus()
        const duration = Math.round((Date.now() - sessionStarted) / 1000)
        const ev: SessionEndEvent = {
          type: 'session:end',
          sessionId: sessionId,
          duration,
          modulesVisited: [...modulesVisited],
          timestamp: new Date().toISOString(),
        }
        bus.emit(ev)
        sessionId = null
        sessionStarted = null
        useAnalyticsSync().syncEvents().catch(() => { /* silent — offline or unauthenticated */ })
      }

      function emitTimeSpent(module: string, enteredAt: number): void {
        const seconds = Math.round((Date.now() - enteredAt) / 1000)
        if (seconds < 2) return
        const bus = useInteractionBus()
        const ev: ModuleTimeSpentEvent = {
          type: 'module:time-spent',
          module,
          seconds,
          sessionId: sessionId!,
          timestamp: new Date().toISOString(),
        }
        bus.emit(ev)
      }

      router.afterEach((to, from) => {
        const now = Date.now()
        const module = deriveModule(to.path, to.meta?.module)

        // Gap check — start a new session if inactive > 30 min
        const gap = now - lastActivity
        if (!sessionId || gap > SESSION_GAP_MS) {
          if (sessionId) endSession()
          startSession()
        }
        lastActivity = now

        // Emit time spent on previous module
        if (currentModule && moduleEnteredAt && from.path !== to.path) {
          emitTimeSpent(currentModule, moduleEnteredAt)
        }

        // Track module visit
        if (!modulesVisited.includes(module)) modulesVisited.push(module)
        currentModule = module
        moduleEnteredAt = now

        const bus = useInteractionBus()
        const ev: ModuleVisitedEvent = {
          type: 'module:visited',
          module,
          from: from.path !== '/' ? deriveModule(from.path, from.meta?.module) : undefined,
          timestamp: new Date().toISOString(),
          sessionId: sessionId!,
        }
        bus.emit(ev)
      })

      // End session on tab close / hide
      const handleVisibilityChange = (): void => {
        if (document.visibilityState === 'hidden') {
          if (currentModule && moduleEnteredAt) emitTimeSpent(currentModule, moduleEnteredAt)
          endSession()
        } else {
          // Returning — if gap was large, new session will start on next navigation
          lastActivity = Date.now()
        }
      }

      const handleBeforeUnload = (): void => {
        if (currentModule && moduleEnteredAt) emitTimeSpent(currentModule, moduleEnteredAt)
        endSession()
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('beforeunload', handleBeforeUnload)
    },
  }
}
