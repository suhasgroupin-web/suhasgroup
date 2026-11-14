# SUHAS Four-App Platform Control Registry

Status: architecture/control baseline only. This file does not claim that any new app is deployed or that the Supabase projects are connected to the automation account.

## Source of truth and control plane

- GitHub repository: `suhasgroupin-web/suhasgroup`
- The existing GitHub repository and its `main` branch remain the central source of truth.
- App work is isolated in app-specific branches. Feature/button work is isolated in corresponding button branches.
- Do not merge to `main` or deploy production without validation and an explicit release decision.
- Do not use Vercel or TinyFish. Use GitHub, Supabase, and Cloudflare only; prefer free tiers and do not incur charges.

## Four independent applications

| App | Product | Intended Cloudflare Pages project | Default Pages URL |
|---|---|---|---|
| GROUP | SUHAS GROUP | `suhasgroup` (existing; protect) | `https://suhasgroup.pages.dev` |
| MAX | SUHAS MAX | `suhasmax` | `https://suhasmax.pages.dev` |
| MESSAGE | SUHAS MESSAGE | `suhasmessage` | `https://suhasmessage.pages.dev` |
| AI | SUHAS AI | `suhasai` | `https://suhasai.pages.dev` |

The user's requested `.page.dev` hostnames are not Cloudflare Pages default hostnames. Use `.pages.dev` unless the user later supplies a separately owned custom domain and configures it.

## Branch topology

App branches:
- `app/suhas-group`
- `app/suhas-max`
- `app/suhas-message`
- `app/suhas-ai`

App button/feature branches:
- `buttons/suhas-group`
- `buttons/suhas-max`
- `buttons/suhas-message`
- `buttons/suhas-ai`

These branch names already exist in the repository at the time this registry was written. Continue using them; do not recreate or overwrite them. New work must branch from the corresponding app branch, and should be merged back only into that app branch after review. Cross-app changes must not be copied between apps without deliberate review.

## Supabase project references supplied by the owner

New `suhasmax` organization:
- SUHAS AI project ref: `tvabctgjwtkmdfypscqo`
- SUHAS MESSAGE project ref: `bsdkkbrgmmyfliqwwdai`

These references were supplied by the owner. The currently connected Supabase automation account cannot yet access these projects (permission error); do not attempt schema writes until access is confirmed. Never put database passwords, service-role keys, secret keys, or access tokens in this repository.

Existing GROUP and MAX Supabase projects must remain untouched while setting up AI and MESSAGE. Keep auth, user data, database, and storage isolated per application.

## Deployment guardrails

- Each Pages project must have its own deployment workflow and target directory.
- Each workflow must deploy only its own app directory and Pages project.
- Do not change the existing GROUP deployment workflow or GROUP production project while working on the other apps.
- Use repository Actions secrets for Cloudflare credentials; never commit credentials.
- Before calling any app live, verify its Pages project, successful deployment, correct URL, independent auth, and app-specific data isolation.

## Completion checklist

- [ ] Confirm Supabase access to AI and MESSAGE projects through the connected account.
- [ ] Audit current main and app branches before code changes.
- [ ] Create/verify isolated schema, Auth, Storage, RLS, and policies for each app.
- [ ] Create/verify independent app shells, manifests, service workers, and route boundaries.
- [ ] Configure separate Cloudflare Pages projects and app-only deployment workflows.
- [ ] Test each app independently without changing GROUP production.
- [ ] Merge reviewed app changes to the relevant app branch; merge to main only through reviewed integration.
