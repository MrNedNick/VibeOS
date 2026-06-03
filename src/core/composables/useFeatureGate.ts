/**
 * useFeatureGate — subscription tier scaffold
 *
 * Usage:
 *   const gate = useFeatureGate()
 *   if (!gate.can('ai-studio')) { show upgrade prompt }
 *
 * Tiers:
 *   free  — unauthenticated, read-only or limited writes (no auth yet → everything open)
 *   demo  — authenticated via demo@vibeos.app, same as free features
 *   pro   — paid subscriber (Supabase + Stripe, S5)
 */

import { computed } from 'vue'
import { useAuthStore } from '@/core/stores/auth.store'
import { isSupabaseConfigured } from '@/core/services/supabase'

// Show nudge at most once per 5 minutes to avoid spam
let _lastNudgeAt = 0
const NUDGE_COOLDOWN = 5 * 60 * 1000

// ── Feature catalogue ──────────────────────────────────────────────────
type Feature =
  | 'ai-studio'         // AI chat
  | 'ai-context'        // inject project context into AI
  | 'cloud-sync'        // Supabase data sync
  | 'export-data'       // JSON / CSV export
  | 'unlimited-tasks'   // > 100 tasks
  | 'unlimited-habits'  // > 20 habits
  | 'unlimited-goals'   // > 10 goals
  | 'analytics'         // personal analytics module
  | 'kanban'            // kanban board

// Which tiers have access to each feature
const TIER_GATES: Record<Feature, ('free' | 'demo' | 'pro')[]> = {
  'ai-studio':        ['free', 'demo', 'pro'],
  'ai-context':       ['free', 'demo', 'pro'],
  'cloud-sync':       ['pro'],
  'export-data':      ['demo', 'pro'],
  'unlimited-tasks':  ['demo', 'pro'],
  'unlimited-habits': ['pro'],
  'unlimited-goals':  ['pro'],
  'analytics':        ['free', 'demo', 'pro'],
  'kanban':           ['free', 'demo', 'pro'],
}

// ── Composable ────────────────────────────────────────────────────────
export function useFeatureGate() {
  const auth = useAuthStore()

  const currentTier = computed(() => auth.tier)

  function can(feature: Feature): boolean {
    const allowed = TIER_GATES[feature]
    return allowed ? allowed.includes(currentTier.value) : true
  }

  function require(feature: Feature, onDenied?: () => void): boolean {
    const allowed = can(feature)
    if (!allowed) {
      onDenied?.()
    }
    return allowed
  }

  // Show "sign up to save" toast when demo user creates data and Supabase is available
  function nudgeWrite(): void {
    if (!auth.isDemoMode || !isSupabaseConfigured) return
    const now = Date.now()
    if (now - _lastNudgeAt < NUDGE_COOLDOWN) return
    _lastNudgeAt = now

    import('@/core/stores/notifications.store').then(({ useNotificationsStore }) => {
      useNotificationsStore().push('info', 'Sign up to keep your data across devices', 6000, {
        label: 'Create account',
        fn: () => { window.location.href = '/register' },
      })
    })
  }

  return {
    currentTier,
    can,
    require,
    nudgeWrite,
  }
}
