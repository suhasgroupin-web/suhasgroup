# SUHAS-MAX Standalone Product Boundary

Status: architecture branch opened; runtime extraction is NOT complete.
Branch: suhas-max/standalone-product-20261114
Base: main
Date: 2026-11-14

## Product requirement

SUHAS GROUP and SUHAS-MAX are two independently usable software products. SUHAS GROUP may link to SUHAS-MAX from its existing Main Navigation, but that link is only an entry point; it must not make SUHAS-MAX dependent on the corporate profile, corporate account, or corporate app shell.

A person must be able to open and install SUHAS-MAX directly on a phone without first installing or registering for SUHAS GROUP.

## Product boundaries

### SUHAS GROUP
- Retains its corporate home, Main Menu, Job, O5 INTL, Career/Profile, Team and Contact.
- Owns its corporate account/profile data and corporate authentication lifecycle.
- May show one explicit SUHAS-MAX launch button.
- Must not write SUHAS-MAX profile, cover, avatar, account or social data.

### SUHAS-MAX
- Own standalone app shell and direct entry route under a dedicated path (target: /suhas-max/).
- Own dedicated PWA manifest and service-worker scope, with standalone app name, icons, start URL and install behavior.
- Own registration/login and social identity/profile.
- Must support direct mobile-number registration/login using verified OTP; do not claim phone auth is ready until Supabase Auth phone provider, SMS provider, OTP screens, rate limits, recovery and RLS are configured and tested.
- Includes Social, Messenger and SUHAS AI as SUHAS-MAX modules.
- Messenger uses the SUHAS-MAX social identity/profile, not the SUHAS GROUP corporate profile.
- Does not require a SUHAS GROUP account or an installed SUHAS GROUP app.

## Isolation contracts

1. Separate profile records and ownership for corporate members and SUHAS-MAX users.
2. No cross-product profile sync, avatar/cover fallback, shared local-storage keys, or implicit auth-session coupling.
3. Supabase access must be enforced by RLS and verified ownership; hiding UI or changing client-side table names is not security.
4. Keep existing data and legacy URLs. No destructive migrations, account deletion, or bulk data moves as part of extraction.
5. Cross-product navigation is a one-way explicit link from SUHAS GROUP's SUHAS-MAX button; SUHAS-MAX can have an explicit Go to SG link.
6. SUHAS-MAX assets, CSS and JS must be scoped to its own shell/modules. Shared code must be documented and must not carry product-specific profile state.
7. Give SUHAS-MAX its own manifest and service-worker scope so installing it does not install the corporate portal as the app identity.
8. Keep the current root manifest and root routes stable until the standalone app passes route, auth, PWA install, offline-cache and regression checks.

## Extraction plan

- Audit current entry points, navigation, authentication/session storage, Supabase queries/RLS, Messenger dependencies, PWA manifest/service worker, build/deploy workflows.
- Create a standalone SUHAS-MAX shell and direct route, preserving current social.html as a compatibility route during migration.
- Move/extract features incrementally into apps/suhas-max; do not copy the 600KB legacy social page wholesale without tracing DOM, state, handlers and backend calls.
- Add /suhas-max/manifest.webmanifest and a scoped service worker only after the direct route exists and references are verified.
- Configure verified phone-number OTP registration/login and RLS-backed SUHAS-MAX identity. Confirm whether existing Supabase Auth phone provider/SMS configuration is enabled before promising OTP.
- Verify independent profile writes with two test accounts: changing corporate avatar/cover/details must not affect SUHAS-MAX; changing SUHAS-MAX profile must not affect corporate profile; Messenger must show SUHAS-MAX identity.
- Verify install flow on Android Chrome and iOS Safari, then deploy and test the production URL.
- Only after all checks pass should the SUHAS-MAX button link to the new standalone route and release be marked complete.

## Current repository facts (main branch audit, 2026-11-14)

- Repository default branch is main.
- Root index.html is the SUHAS GROUP / SUHAS-MAX combined welcome gate.
- Root manifest.json identifies the installable app as "SUHAS-MAX — Powered by SUHAS GROUP", with start_url and scope both at /.
- Root social.html is a large legacy social app entry and links the root manifest.
- messenger.html exists at root; Messenger CSS/JS have copies under apps/suhas-max/messenger/.
- apps/suhas-max currently contains Messenger assets and settings styling, but no standalone SUHAS-MAX app shell or README.
- Cloudflare Pages deployment workflow deploys the repository root on pushes to main to the existing Pages project suhasgroup.
- Therefore, current repository structure does NOT yet prove that SUHAS-MAX can be installed as a standalone app without the combined root app identity.

## Release gates

Do not merge to main or deploy until:
- direct SUHAS-MAX route and dedicated manifest/service-worker scope work;
- phone OTP registration/login is genuinely configured and tested;
- RLS and data ownership tests pass;
- profile isolation and Messenger identity tests pass;
- legacy SUHAS GROUP routes and its one SUHAS-MAX button still work;
- Android/iOS install tests and production deployment are verified.
