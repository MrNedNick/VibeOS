# Privacy & Security Plan

> Written 2026-05-27. Core reference for all auth, data classification, and public/private decisions.
> See `docs/strategy.md` for the product context behind these decisions.

---

## 1. The Core Question

VibeOS will contain real personal data: tasks, goals, habits, health/training logs, learning progress, and personal notes. At the same time, the GitHub repository should be public and the deployed app should be shareable with recruiters.

**Solution:** Public code + private data + demo mode.

The code is safe to be public. The data is safe behind authentication and Supabase Row Level Security. Demo mode gives recruiters a full-feature experience without touching your personal data.

---

## 2. Data Classification

### Always private (behind authentication)
- Personal tasks, notes, and to-do lists
- Goals and milestones
- Habit logs and streaks
- Training/workout logs and plans
- Learning plans and session history
- Personal analytics and progress data
- Any free-text notes (potentially sensitive)
- Settings with personal API keys

### Safe to show publicly (in demo mode or portfolio screenshots)
- App structure, navigation, module list
- UI and visual design (vibe-paks, layout)
- Feature demonstrations (command palette, kanban, dashboard)
- Seeded fake demo data (fictional tasks, habits, goals for "Alex Demo")
- Architecture — how modules are built, patterns used

### Always public (by design)
- Source code on GitHub
- README and documentation
- Changelog and commit history
- No personal data should ever appear in any of these

---

## 3. GitHub Repository Safety

**The repository can be public.** This is safe as long as:

| Rule | Why |
|------|-----|
| `.env` and `.env.local` in `.gitignore` | Supabase URL, anon key, and any API keys must never be committed |
| No real data hardcoded | No personal tasks, names, or notes in source files |
| No secrets in `docs/` | Documentation refers to env var names, not values |
| Supabase anon key is public-safe | The anon key is designed to be public; RLS enforces security |
| Supabase service role key never in frontend | Service role bypasses RLS — only use server-side if ever needed |

### Required `.gitignore` entries
```
.env
.env.local
.env.*.local
*.env
```

### Environment variables in use
```
VITE_SUPABASE_URL=           # Your Supabase project URL
VITE_SUPABASE_ANON_KEY=      # Supabase anon (public) key — safe to expose in frontend
```

No other secrets belong in the frontend. Personal API keys (Anthropic, OpenAI, OpenWeatherMap) are stored in-app via Settings → Keys, in the user's own Supabase row or localStorage, never in `.env`.

---

## 4. Supabase Security Architecture

### Row Level Security (RLS) — non-negotiable
Every table must have RLS enabled and policies that restrict access to the authenticated user's own rows.

```sql
-- Example policy for tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own tasks"
  ON tasks FOR ALL
  USING (auth.uid() = user_id);
```

This ensures:
- Even if someone knows your Supabase project URL + anon key, they cannot read your data
- The demo user account can only see demo data
- You can only see your own data when logged in

### Tables requiring RLS
- `tasks`
- `notes`
- `habits` and `habit_logs`
- `goals` and `goal_milestones`
- `learning_plans` and `learning_sessions`
- `training_plans` and `workout_logs`
- `user_settings` (API keys, preferences)
- `board_cards` (if separate from tasks)

### Authentication
- **Email/password** via Supabase Auth (simplest, no OAuth complexity)
- JWT tokens managed by Supabase client automatically
- Token stored in `localStorage` by Supabase client (acceptable; site is HTTPS only)
- Session refresh handled automatically by Supabase client

---

## 5. Authentication Plan

### Routes
```
/welcome     — public landing page (no auth required)
/login       — login form
/register    — registration (or disabled: invite-only personal app)
/            — protected (redirect to /login if not authenticated)
/dashboard   — protected
/tasks       — protected
/goals       — protected
... all other modules — protected
```

### Router guard
```ts
// router/index.ts
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})
```

### Auth store responsibilities
- `user` — current Supabase user object
- `isAuthenticated` — boolean
- `login(email, password)` — Supabase signInWithPassword
- `logout()` — Supabase signOut + redirect to /welcome
- `register(email, password)` — Supabase signUp (future)
- `isDemoMode` — true when logged in as demo account

### Personal vs demo distinction
```ts
const DEMO_EMAIL = 'demo@vibeos.app'
const isDemoMode = computed(() => user.value?.email === DEMO_EMAIL)
```

When `isDemoMode` is true, the UI can show a "Demo Mode" chip in the header and disable write operations (or write only to demo user's rows — both options work).

---

## 6. Demo Mode Design

### The goal
A recruiter clicks "Try Demo" on the landing page → sees a fully populated app with realistic fake data → explores all modules → is impressed → no personal data was exposed.

### Option A — Seeded demo account (recommended)
- A real Supabase user: `demo@vibeos.app` / public password shown on landing page
- Demo data seeded via SQL migration: fake tasks, habits, goals, workouts, learning sessions
- Demo user's data is read-only in the UI (mutations show "Demo mode — sign up to save")
- Resets periodically (optional: cron job reseeds weekly)
- Advantage: All features work exactly as in personal mode, no special code paths

### Option B — Local fixture data
- No Supabase account for demo
- Static JSON fixture data loaded when `?demo=true` param is present
- No writes to any database
- Advantage: No maintenance, completely isolated
- Disadvantage: Some features (real-time, sync) won't work in demo

**Recommendation: Option A** (seeded account). It demonstrates Supabase integration to recruiters and requires no special code paths.

### Demo data to seed
```
Goals:
  - "Run a half-marathon by September" (health, 45% progress)
  - "Launch a side project" (career, 20% progress)
  - "Learn TypeScript deeply" (skill, 60% progress)

Habits (last 30 days of logs):
  - Morning run (5 days/week)
  - Read 20 minutes
  - Code daily

Tasks (realistic mix):
  - 5 work tasks with priorities
  - 3 learning tasks linked to TypeScript goal
  - 3 training tasks linked to marathon goal

Notes:
  - "TypeScript Learning Plan" note
  - "Half Marathon Training Notes" note
  - Journal entry from yesterday

Workout log (last 4 weeks):
  - 2 runs/week, increasing distance
  - Strength session 1/week

Learning sessions (TypeScript plan):
  - 3 weeks of 20 min/day sessions logged
```

---

## 7. What Recruiters / Visitors See

### Public landing page (`/welcome`)
- Product overview and screenshots
- Feature highlights
- "Try Demo" button → logs in as demo account
- "Sign In" button → personal login
- Stack badges, GitHub link

### Demo experience
- Full app with all modules accessible
- Realistic data that tells a story ("Alex" is training for a half marathon and learning TypeScript)
- "Demo Mode" chip visible in header (transparent, not hidden)
- "Create your own account" CTA in sidebar footer

### What they cannot see (ever)
- Your real name, email, tasks, habits, goals
- Your personal notes
- Your API keys
- Your actual progress data

---

## 8. Deployment Security

### Environment separation
```
.env.local           — local development (gitignored)
Vercel/host env vars — production (set in hosting dashboard, never in code)
```

### HTTPS only
Supabase auth only works securely over HTTPS. GitHub Pages and Vercel both enforce HTTPS. Never test auth over plain HTTP in production context.

### API keys stored by users
Users store their own API keys (Anthropic, OpenWeatherMap, etc.) in:
1. Browser `localStorage` (current — fine for personal use, clears on cache clear)
2. Future: Supabase `user_settings` table (encrypted at rest by Supabase)

Never store third-party API keys in your `.env` — those would be served to all users.

---

## 9. Risk Table

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| Personal data exposed via demo | Low | RLS + separate user accounts |
| API keys committed to git | Medium | `.gitignore`, pre-commit check |
| Demo account spammed/abused | Low | Rate limits via Supabase; reset weekly |
| Supabase anon key exposed | N/A — expected | Anon key is designed to be public; RLS is the real protection |
| localStorage data lost | Medium | Sync to Supabase on login covers this |
| Demo data too sparse, not impressive | Medium | Seed realistically, include 30-day history |

---

## 10. Implementation Checklist (for S3 sprint)

- [ ] Create Supabase project
- [ ] Create `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
- [ ] Add both to hosting platform env vars (Vercel/GitHub Pages)
- [ ] Verify `.gitignore` covers all `.env*` patterns
- [ ] Create all tables with `user_id UUID NOT NULL` column
- [ ] Enable RLS on every table
- [ ] Write RLS policy for every table
- [ ] Implement `useAuthStore` with login/logout/register
- [ ] Implement router guard for protected routes
- [ ] Create `/login` page and `/welcome` landing page
- [ ] Create demo user `demo@vibeos.app` in Supabase dashboard
- [ ] Write and run seed SQL for demo data
- [ ] Add "Demo Mode" chip to AppHeader when `isDemoMode` is true
- [ ] Test: log in as demo → explore all modules → verify no personal data visible
- [ ] Test: log in as personal account → verify demo data is NOT visible
