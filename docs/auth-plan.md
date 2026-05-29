# VibeOS — Authentication & Backend Architecture Plan

> Written 2026-05-29. Covers backend option comparison, chosen implementation strategy,  
> production security patterns, data migration, and demo subscription layer design.  
> Prerequisite docs: `docs/privacy-security.md` · `docs/strategy.md` · `docs/roadmap.md`  
> **Status: Research complete. Ready to implement as Sprint S3.**

---

## 1. Requirements

| Requirement | Detail |
|-------------|--------|
| Auth | Email + password registration, login, logout |
| Routes | All app routes protected; `/welcome`, `/login`, `/register` public |
| Sessions | JWT-based; auto-refresh; persist across page reloads |
| Data isolation | Per-user: tasks, habits, notes, goals, kanban, settings, learning plans, training logs |
| Scale | 2–3 users/month (personal + demo account) |
| Cost | Free tier only; no unexpected bills ever |
| Security | No hardcoded keys; env vars only; user API keys in localStorage only |
| Demo layer | Demo subscription tier at $0 — for architecture demonstration |

---

## 2. Backend Option Comparison

### 2A. Supabase ⭐ chosen

| Property | Detail |
|----------|--------|
| **Database** | PostgreSQL (fully managed) |
| **Auth** | Email/password, OAuth, magic link |
| **Free tier** | 500 MB database, 1 GB file storage, 50K MAU, unlimited API requests |
| **Free tier cost** | $0, no credit card required |
| **SDK** | `@supabase/supabase-js` — TypeScript-first, 41 KB |
| **RLS** | PostgreSQL Row Level Security — native, per-policy |
| **Realtime** | Built-in (Postgres changes → WebSocket) |
| **Self-hosting** | Yes (Docker Compose) |

**Critical limitation — inactivity pausing:**  
Supabase free tier **pauses projects after 7 days of no database activity**. A paused project returns errors until manually unpaused in the dashboard.  
**Mitigation:** Point UptimeRobot (free) at `${VITE_SUPABASE_URL}/rest/v1/` every 3 days with an `Authorization: Bearer ${anon_key}` header. This counts as activity and prevents pausing. Zero cost, zero maintenance.

**Why Supabase wins:**
- PostgreSQL — proper relational schema, foreign keys, joins
- Row Level Security is first-class and already documented for VibeOS in `privacy-security.md`
- TypeScript SDK with generated types
- Auth is production-grade with JWT refresh, magic links, OAuth ready for later
- Built-in dashboard to inspect data without writing queries
- Anon key is safe to expose in frontend code — RLS is the real access control
- Portfolio value: "Supabase + RLS" is a recognisable pattern recruiters understand

---

### 2B. Firebase (alternative)

| Property | Detail |
|----------|--------|
| **Database** | Firestore (NoSQL document store) |
| **Auth** | Email/password, OAuth, phone |
| **Free tier** | 1 GB storage, 50K reads/day, 20K writes/day, 20K deletes/day |
| **Inactivity pausing** | None — always-on |
| **SDK** | `firebase` — ~80–150 KB depending on modules |

**Pros:** No pausing, Google-backed, generous reads, Auth is rock-solid.  
**Cons:** NoSQL data model requires denormalisation; no SQL joins; Firebase SDK is significantly heavier than Supabase; Firestore security rules are less elegant than RLS for a relational schema; vendor lock-in is high.  
**Verdict:** Strong alternative if Supabase pausing becomes a real issue. Would require redesigning the data model from relational to document-oriented.

---

### 2C. Appwrite (alternative)

| Property | Detail |
|----------|--------|
| **Database** | Custom document DB (not Postgres) |
| **Auth** | Email/password, OAuth, phone, TOTP |
| **Free tier** | 75K users, 750K requests/month, 10 GB storage |
| **Inactivity pausing** | Similar cold-start behavior on cloud free tier |
| **Self-hosting** | Yes (Docker) |

**Pros:** Open source, can fully self-host for free, TypeScript SDK.  
**Cons:** Not PostgreSQL (loses SQL + RLS elegance); cloud free tier has same cold-start concern as Supabase; self-hosting requires a VPS (~$5–10/month, DigitalOcean/Fly.io).  
**Verdict:** Good if you want full self-hosting control. For VibeOS personal use, self-hosting infrastructure overhead is not worth it.

---

### 2D. PocketBase (alternative)

| Property | Detail |
|----------|--------|
| **Database** | SQLite (embedded) |
| **Auth** | Email/password, OAuth |
| **Free tier** | Self-hosted only; no managed cloud |
| **Inactivity pausing** | None if self-hosted on always-on VPS |
| **Deploy** | Single Go binary — `./pocketbase serve` |
| **SDK** | `pocketbase` TypeScript SDK — lightweight |

**Pros:** Incredibly simple to deploy; single binary + SQLite file; built-in admin UI; no cold starts when self-hosted on Fly.io free tier (3 shared VMs, always-on); TypeScript SDK; complete data ownership.  
**Cons:** Requires hosting setup (Fly.io or DigitalOcean ~$0–5/mo); SQLite not Postgres (less familiar tooling, no PostgREST); less portfolio recognition than Supabase.  
**Verdict:** Best DX for a 1-person project. Genuinely free on Fly.io. **A serious alternative if Supabase pausing proves disruptive.** Noted as fallback in roadmap.

---

### 2E. Custom backend (rejected)

Express/Hono + JWT + PostgreSQL on a VPS. Full control but high maintenance burden (auth tokens, refresh logic, password hashing, migration runner, security hardening). Not appropriate for a solo personal project. Rejected.

---

## 3. Decision

**Primary: Supabase** — already aligned with `strategy.md`, `roadmap.md`, and `privacy-security.md`.  
**Fallback: PocketBase on Fly.io** — if Supabase inactivity pausing proves disruptive in practice.

The inactivity pausing risk is real but **completely mitigated** by a free UptimeRobot monitor pinging the health endpoint every 3 days.

---

## 4. Architecture Overview

```
Browser (Vue 3 SPA)
├── useAuthStore (Pinia)          — session state, login/logout/register
├── router guard                  — redirect to /login if not authed
├── module stores (tasks, habits…) — dual-write: localStorage + Supabase
└── @supabase/supabase-js client   — JWT auto-refresh, RLS-enforced API calls

Supabase (PostgreSQL + Auth + RLS)
├── auth.users                    — managed by Supabase Auth
├── tasks, notes, habits…         — all with user_id FK + RLS policies
├── user_settings                 — per-user preferences, synced key refs
└── demo_user (demo@vibeos.app)   — seeded with fictional data
```

### Offline-first principle

localStorage **always** remains the primary data store. Supabase is a sync layer:

```
read:  localStorage → (render) → background fetch Supabase → merge → update localStorage
write: localStorage (instant) → background upsert to Supabase
```

This means the app works offline, loads instantly (no waiting for network), and syncs when connected. Conflict resolution: last-write-wins by `updated_at` timestamp.

---

## 5. Data Schema

All tables follow the same pattern:

```sql
-- Every data table has this structure
CREATE TABLE tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- ... module-specific columns
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see only their own rows"
  ON tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Tables to create

| Table | Key columns | Notes |
|-------|-------------|-------|
| `tasks` | `title`, `priority`, `due_date`, `category`, `status`, `linked_goal_id?` | Unified with Board cards |
| `notes` | `content`, `pinned`, `type` | Full markdown content |
| `habits` | `name`, `emoji`, `frequency`, `completed_dates` (JSONB array) | Heatmap data in JSONB |
| `goals` | `title`, `category`, `target_date`, `emoji`, `notes`, `completed` | |
| `goal_milestones` | `goal_id`, `text`, `completed` | FK to goals |
| `board_cards` | Maps to tasks with `column` field | Or extend tasks table with `board_column` |
| `learning_plans` | `topic`, `total_hours`, `sessions_per_week`, `deadline` | |
| `learning_sessions` | `plan_id`, `date`, `minutes`, `notes` | |
| `training_plans` | `name`, `sport`, `sessions_per_week` | |
| `workout_logs` | `plan_id`, `date`, `duration_min`, `distance_km`, `feeling`, `notes` | |
| `snippets` | `title`, `language`, `content`, `tags` (JSONB) | |
| `user_settings` | `theme`, `locale`, `sidebar_open` | One row per user |

---

## 6. Auth Store (`useAuthStore`)

```typescript
// src/core/stores/auth.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/core/services/supabase'

const DEMO_EMAIL = 'demo@vibeos.app'

export const useAuthStore = defineStore('auth', () => {
  const user    = ref<User | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)
  const isDemoMode      = computed(() => user.value?.email === DEMO_EMAIL)
  const userId          = computed(() => user.value?.id ?? null)

  async function init() {
    // Restore session from localStorage (Supabase does this automatically)
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    loading.value = false

    // Keep user in sync with auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
  }

  async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data.user
  }

  async function register(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    user.value = data.user
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
  }

  return { user, loading, isAuthenticated, isDemoMode, userId, init, login, register, logout }
})
```

---

## 7. Router Guard

```typescript
// src/router/index.ts
const PUBLIC_ROUTES = new Set(['/welcome', '/login', '/register'])

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Wait for auth to initialize on first load
  if (auth.loading) await auth.init()

  if (!PUBLIC_ROUTES.has(to.path) && !auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})
```

---

## 8. Supabase Client Setup

```typescript
// src/core/services/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase.generated'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn('[VibeOS] Supabase env vars not set — running in offline-only mode')
}

export const supabase = createClient<Database>(url ?? '', key ?? '')
```

**Environment variables** (never hardcode values):
```
# .env.local (gitignored)
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

The anon key **is safe to expose in frontend code**. It is designed to be public. Row Level Security is the actual data protection layer.

---

## 9. Store Sync Pattern

Each module store uses a dual-write adapter:

```typescript
// Pattern for any store (example: tasks)
import { useAuthStore } from '@/core/stores/auth.store'
import { supabase } from '@/core/services/supabase'

// On login: fetch from Supabase and merge with localStorage
async function syncOnLogin() {
  const auth = useAuthStore()
  if (!auth.isAuthenticated) return

  const { data } = await supabase
    .from('tasks')
    .select('*')
    .order('updated_at', { ascending: false })

  if (data) {
    // Merge: keep whichever version has the later updated_at
    mergeWithLocal(data)
  }
}

// On write: optimistic local update + background Supabase upsert
async function addTask(task: Task) {
  tasks.value.push(task)            // instant local
  saveToStorage()                   // immediate localStorage

  const auth = useAuthStore()
  if (auth.isAuthenticated && !auth.isDemoMode) {
    supabase.from('tasks').upsert({ ...task, user_id: auth.userId })
      .then(({ error }) => {
        if (error) console.warn('[sync] task upsert failed', error)
      })
  }
}
```

**Demo mode write blocking:** when `isDemoMode` is true, all Supabase writes are skipped. Local changes still work (demo user can play with the UI) but nothing persists to the database.

---

## 10. Protected Routes & Pages

### Login page (`/login`)

```
─────────────────────────────
  VibeOS                  ←  Logo

  Sign in to your OS

  Email ____________________
  Password _________________
  [ Sign in ]
  
  ─ or ─
  [ Try the demo → ]
  
  Don't have an account? Register
─────────────────────────────
```

### Register page (`/register`)

Same layout. Disabled by default for personal use — only the owner needs an account. Enable by flipping `VITE_REGISTRATION_OPEN=true` in env.

### Welcome / landing (`/welcome`)

Public marketing page:
- App description + module highlights
- Screenshots / GIF
- "Try Demo" → auto-login as `demo@vibeos.app`
- "Sign In" → `/login`
- GitHub / live site links

---

## 11. Demo Subscription Layer

**Purpose:** Demonstrate a subscription/tier architecture without charging real money. Satisfies interview questions like "how would you add a paid tier?" Shows understanding of auth, permissions, and feature gates.

### Design

```typescript
type SubscriptionTier = 'free' | 'pro' | 'demo'

// In user_settings table:
// subscription_tier: 'free' | 'pro' | 'demo'
```

| Tier | Who | Features |
|------|-----|----------|
| `demo` | `demo@vibeos.app` | All modules visible, all data read-only, shows "Demo Mode" badge |
| `free` | Any registered user | All current modules, local + synced data, no limits |
| `pro` | (future) | Same as free + extra: AI daily digest credits, export formats, custom themes |

### Feature gate composable

```typescript
// src/core/composables/useFeatureGate.ts
export function useFeatureGate() {
  const auth = useAuthStore()

  function canUse(feature: 'ai_digest' | 'export_pdf' | 'custom_theme'): boolean {
    if (auth.isDemoMode) return false   // demo can see but not use premium features
    // future: check auth.user?.subscription_tier === 'pro'
    return true                         // free tier gets everything for now
  }

  return { canUse }
}
```

This is the entire subscription architecture. Adding a real payment tier later means:
1. Connect Stripe webhook → update `subscription_tier` in `user_settings`
2. The `canUse()` checks already exist — just add the tier conditions
3. No refactoring needed

**The $0 price point is intentional.** It's a placeholder that proves the architecture works without charging anyone.

---

## 12. Production Security Patterns

### What Supabase handles automatically
- Password hashing (bcrypt)
- JWT signing and verification
- HTTPS only (no plain HTTP auth)
- Token expiry and automatic refresh (default: 1 hour access token, 60-day refresh)
- Brute force protection (built-in rate limiting on auth endpoints)

### What VibeOS must handle
1. **No secrets in source code** — `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` only; both safe to expose
2. **Service role key never in frontend** — would bypass RLS; never needed client-side
3. **User API keys (Anthropic, etc.)** — stored in `localStorage` only; never sent to Supabase; user's own responsibility
4. **Demo account password** — intentionally public (`vibeOSdemo2026` or similar); shown on `/welcome`; RLS means they can only ever see demo data
5. **Registration** — gated behind `VITE_REGISTRATION_OPEN` env var; personal use means `false` by default
6. **HTTPS** — GitHub Pages and Vercel both enforce this; no action needed
7. **XSS prevention** — Vue 3 escapes template content by default; `v-html` used only for `marked`-rendered markdown (user's own notes, no cross-user exposure)
8. **CSRF** — not applicable for a pure SPA with JWT auth (no cookies with `SameSite=Lax` concerns)

---

## 13. localStorage → Supabase Migration Plan

Current state: all data in localStorage under `platform:[module]:[entity]` keys.

Migration strategy (S3 implementation):

```
Phase 1 — Auth only (no data migration yet):
  - Login/logout/register works
  - Session persists across reloads
  - All data still in localStorage
  - Supabase calls only for auth endpoints

Phase 2 — Sync on login (S3 core):
  - On login: read localStorage → upsert all rows to Supabase
  - All new writes: dual-write (localStorage + Supabase)
  - On new device login: fetch from Supabase → populate localStorage

Phase 3 — Incremental sync:
  - Periodic background sync (every 5 minutes when authenticated)
  - Conflict resolution: updated_at timestamp wins
  - Offline queue: failed Supabase writes retried when connection restored
```

Migration is non-destructive: localStorage is never cleared. Supabase is additive. The app always works offline.

---

## 14. Implementation Checklist (S3 Sprint)

### Setup (one-time)
- [ ] Create Supabase project at supabase.com
- [ ] Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local`
- [ ] Add same vars to GitHub Pages Actions secrets
- [ ] Verify `.gitignore` covers `.env.local`
- [ ] Add `@supabase/supabase-js` as dependency
- [ ] Set up UptimeRobot free monitor → ping `${url}/rest/v1/` every 3 days (prevents pausing)

### Database
- [ ] Run schema migration: create all tables with `user_id` FK
- [ ] Enable RLS on every table
- [ ] Write policies: `auth.uid() = user_id` on every table
- [ ] Create `demo@vibeos.app` user in Supabase dashboard
- [ ] Run demo seed SQL (see `privacy-security.md §6`)
- [ ] Add `subscription_tier` column to `user_settings`

### Code — core auth
- [ ] `src/core/services/supabase.ts` — client singleton
- [ ] `src/core/stores/auth.store.ts` — login/logout/register/init/isDemoMode
- [ ] `src/core/types/supabase.generated.ts` — generate with `supabase gen types`
- [ ] Router guard in `src/router/index.ts` — redirect to `/login` if not authed
- [ ] `src/modules/auth/views/LoginView.vue`
- [ ] `src/modules/auth/views/RegisterView.vue`
- [ ] `src/modules/welcome/WelcomeView.vue` — update "Try Demo" to auto-login

### Code — sync layer
- [ ] `src/core/composables/useSupabaseSync.ts` — generic upsert helper
- [ ] Add sync to `tasksStore` (dual-write + login sync)
- [ ] Add sync to `habitsStore`
- [ ] Add sync to `notesStore`
- [ ] Add sync to `goalsStore`
- [ ] Remaining stores: learning, training, snippets, board

### Code — UX
- [ ] "Demo Mode" chip in `AppHeader` when `isDemoMode` is true
- [ ] Block write operations in demo mode (show "Sign up to save" toast)
- [ ] `src/core/composables/useFeatureGate.ts` — subscription tier checks
- [ ] Logout button in sidebar footer

### Testing
- [ ] Login as personal account → verify own data appears
- [ ] Login as demo → verify demo data appears, writes blocked
- [ ] Login on second device → verify data synced from Supabase
- [ ] Logout → verify redirect to /welcome, no data leakage

---

## 15. Dependency Budget

| Package | Size | Purpose |
|---------|------|---------|
| `@supabase/supabase-js` | ~41 KB gzipped | Supabase client (auth + database) |

No other new dependencies needed. The Supabase client covers auth, database queries, and realtime. Total bundle size impact: ~41 KB gzipped (from current ~380 KB → ~421 KB).

---

## 16. Answers to Open Questions

| Question | Answer |
|----------|--------|
| Which backend? | Supabase |
| Supabase pausing risk? | Mitigated with free UptimeRobot monitor |
| Firebase alternative? | Viable but NoSQL model is a downgrade for relational VibeOS schema |
| PocketBase? | Best fallback; use if Supabase pausing proves unworkable |
| Custom backend? | Rejected — too much maintenance for a personal project |
| Registration open? | No — gated behind env var; personal use only |
| Demo account? | `demo@vibeos.app` with public password shown on `/welcome` |
| Subscription tier? | Free tier + demo tier now; `pro` tier shape defined but $0-priced; Stripe hookup deferred |
| Per-user data isolation? | RLS policies: `auth.uid() = user_id` on every table |
| Offline-first? | Yes — localStorage primary, Supabase sync layer |
| User API keys (Anthropic)? | localStorage only; never sent to Supabase; never in `.env` |
| Unexpected billing risk? | Near-zero — free tier limits are far above 2–3 users/month |
