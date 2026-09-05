# Deployment

VibeOS is a static single-page app. `npm run build` produces `dist/`, and
GitHub Actions publishes it to GitHub Pages on every push to `main` — the live
site is up roughly two minutes later. The version shown on the About page and in
the dashboard header is how you confirm which build is live.

## Environment

Three values are read at build time. Locally they live in `.env.local`, which is
never committed; in CI they are repository secrets.

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_ADMIN_EMAILS` | Comma-separated list of addresses that get admin screens |

Set the secrets under **Settings → Secrets and variables → Actions** in the
repository.

Without Supabase values the app still runs: `isSupabaseConfigured` is false, and
everything falls back to local storage and demo mode. That is the path a
first-time visitor takes, so it is worth keeping working.

## Admin access

`auth.isAdmin` compares the signed-in user's email against `VITE_ADMIN_EMAILS`
(comma-separated, lower-cased). An admin additionally sees:

- a Dev/Admin section in Settings, with the full task panel and platform data;
- All Tasks and Platform Health in the dashboard sidebar.

Nothing else in the app branches on it.

## Versioning

`package.json` carries the version that the app displays, and it is bumped in
the same commit as the change it describes:

| Bump | When |
|---|---|
| Patch — `x.y.Z` | a fix, a visual tweak, a copy change |
| Minor — `x.Y.0` | a new module or a significant feature |
| Major — `X.0.0` | reserved for the production launch with full authentication |

Each release is summarised in [`../CHANGELOG.md`](../CHANGELOG.md).

## Checks before a release

```bash
npm run type-check
npm run lint
npm test
npm run build
```

CI runs the same set, and the lint step is not decorative — a lint failure
blocks the deploy, so a red pipeline means the live site is not moving.
