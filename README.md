# SUHAS-MAX

SUHAS GROUP community and social platform.

## Hosting strategy — no-cost first

The project keeps a free-tier static hosting path so production does not depend on Vercel:

1. **Cloudflare Pages — preferred free production host after live verification.** Project: `suhasgroup`; expected site: [https://suhasgroup.pages.dev](https://suhasgroup.pages.dev). Static HTML/PWA deployment; Framework preset: None; build command: empty; output directory: `.`.
2. **GitHub Pages — automatic free fallback.** The repository already includes `.github/workflows/pages-deploy.yml`, which deploys the repository root on pushes to `main` and on manual dispatch.
3. **Vercel — keep unchanged temporarily as a recovery option.** Do not delete the project or detach its domain until Cloudflare Pages and the fallback have been tested end-to-end. The existing `*.vercel.app` hostname cannot simply be transferred to another provider.

### Cloudflare deployment setup

The repository includes `.github/workflows/cloudflare-pages-deploy.yml`. It deploys the root directory to the Pages project `suhasgroup` when these GitHub Actions repository secrets are configured:

- `CLOUDFLARE_API_TOKEN` — a Cloudflare API token with the required Pages project deployment permission.
- `CLOUDFLARE_ACCOUNT_ID` — the Cloudflare account ID that owns the Pages project.

Add secrets only in GitHub: **Repository → Settings → Secrets and variables → Actions → New repository secret**. Never paste API tokens or secret values into chat, source files, or commits.

### Free-plan limits and cost notes

Cloudflare currently lists its Free plan at $0/month. Pages currently allows up to 500 builds per month, one concurrent build, 20,000 files per site, and 25 MiB per asset. Requests to static assets are free and unlimited; Pages Functions consume Workers usage quotas. These are current plan terms, not a lifetime price guarantee. Provider terms and quotas may change, and usage of other connected services (including Supabase, domains, email, storage, or paid add-ons) may still incur separate charges.

### Production safety

- Do not cancel Vercel until the Cloudflare production URL has been verified for login, feed, profiles, Messenger, media, and all protected routes.
- Keep Supabase project, database, authentication, storage, and user records unchanged during hosting migration.
- Keep both free-host workflows intact; a failed Cloudflare deployment must not disable GitHub Pages.
