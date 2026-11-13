# SUHAS-MAX production release process

## Versioned, member-approved updates

For every production release:

1. Increment `version` in `release.json` (for example, `2026.11.10.1` to `2026.11.25.1`).
2. Set `published_at` to the release publication time in ISO 8601 UTC.
3. Keep `notify_after_days` at `15` unless the product owner changes the policy.
4. Commit the release metadata together with the code changes. The app registers the service worker as `sw.js?v=<version>`, so changing the version causes a new worker install.
5. Verify the Cloudflare Pages production deployment serves the new `release.json` version and run smoke tests for login, Home/feed, profile, Messenger, media and protected routes. Cloudflare Pages is the only production release gate; do not use Vercel.

The service worker caches the app shell as a versioned cache and does not activate an update automatically. A signed-in member sees an in-app update notice once a waiting release is at least 15 days old. Selecting **Install update** activates the waiting worker and reloads the app. Selecting **Later** keeps the current worker active.

## Notification scope

This implementation provides an in-app notice when the member opens SUHAS-MAX after the 15-day waiting period. It does not yet send operating-system push notifications while the browser/app is closed; that requires opt-in push subscriptions and a secured push delivery service.

## Free hosting and migration

- Cloudflare Pages is the production static host; project `suhasgroup`, output directory repository root (`.`), production URL `https://suhasgroup.pages.dev`.
- GitHub Pages remains an automatic free fallback through `.github/workflows/pages-deploy.yml`.
- The Cloudflare GitHub Actions workflow requires repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`; never commit these values.
- Vercel is retired as a deployment target. Do not run or depend on Vercel deployments. Hosting changes must not modify Supabase auth, database, storage, or user data.
- No provider's free plan is guaranteed for the lifetime of the product. Recheck current quotas and pricing before scaling.

## Scale and operations

Cloudflare Pages and Supabase project plans/resources are not sized or load-tested for extreme global traffic. Before major growth, scale database compute and connection pooling, storage/CDN, background jobs/queues, observability, backups, abuse controls, and regional delivery; load-test each stage and review RLS policies and indexes.
