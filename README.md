# SUHAS-MAX

SUHAS GROUP community and social platform.

## Hosting strategy — no-cost first

Cloudflare Pages is the sole production deployment target for the public SUHAS GROUP / SUHAS-MAX web app. Vercel is retired for this project; do not use it for builds, deployment, domains, or release decisions:

1. **Cloudflare Pages — SUHAS E-COM.** Project: `suhasgroup`; production site: [https://suhasgroup.pages.dev](https://suhasgroup.pages.dev). The root redirects to `/apps/suhas-ecom/index.html`.\n2. **Cloudflare Pages — SUHAS MAX.** Project: `suhasmax`; production site: [https://suhasmax.pages.dev](https://suhasmax.pages.dev). Deploys the repository root app separately.
2. **GitHub Pages — non-production emergency fallback only.** It may remain available for recovery testing, but it is not the canonical production URL.
3. **Vercel — retired.** Do not deploy to it or use its deployment status as a release gate. The canonical public app URL is `https://suhasgroup.pages.dev`.

### Cloudflare deployment setup

The repository includes `.github/workflows/cloudflare-pages-deploy.yml`. It deploys the E-COM root redirect and full app files to `suhasgroup`, and the SUHAS MAX root site to `suhasmax`, when these GitHub Actions repository secrets are configured:

- `CLOUDFLARE_API_TOKEN` — a Cloudflare API token with the required Pages project deployment permission.
- `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account ID that owns the Pages project.

Add secrets only in GitHub: **Repository → Settings → Secrets and variables → Actions → New repository secret**. Never paste API tokens or secret values into chat, source files, or commits.

### Free-plan limits and cost notes

Cloudflare currently lists its Free plan at $0/month. Pages currently allows up to 500 builds per month, one concurrent build, 20,000 files per site, and 25 MiB per asset. Requests to static assets are free and unlimited; Pages Functions consume Workers usage quotas. These are current plan terms, not a lifetime price guarantee. Provider terms and quotas may change, and usage of other connected services (including Supabase, domains, email, storage, or paid add-ons) may still incur separate charges.

### Production safety

- Use Cloudflare Pages only for production. Verify login, feed, profiles, Messenger, media, and protected routes on the Cloudflare URL before announcing a release.
- Keep Supabase project, database, authentication, storage, and user records unchanged during hosting migration.
- Keep GitHub Pages only as a separate emergency fallback; it must never replace or override the Cloudflare production URL.
