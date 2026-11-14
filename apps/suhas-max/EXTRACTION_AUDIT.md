# SUHAS-MAX standalone extraction audit

Audit date: 2026-11-14
Branch: suhas-max/standalone-product-20261114
Repository: suhasgroupin-web/suhasgroup

## Confirmed current-state findings

1. The connected Supabase account currently exposes one project only: `suhasgroup` (ref `ehvgxbifqtyajeersnvq`, region `ap-southeast-1`, status `ACTIVE_HEALTHY`). The existing corporate and social product data therefore share one Supabase project and Auth user store.
2. `assets/auth.js` initializes the shared client with local-storage key `suhas-group-auth-v2`. It also attempts to restore sessions from legacy keys. This is not an independent SUHAS-MAX authentication boundary.
3. `max-profile.html` independently labels the profile as SUHAS-MAX but still creates the same shared Supabase client and reads/writes `public.suhas_public_profiles`.
4. A database trigger on `public.suhas_member_profiles` calls `private.sync_suhas_public_profile()`, which mirrors selected member-profile fields into `public.suhas_public_profiles`. This is an internal social-profile projection, not proof of a separate product database.
5. `messenger.html` embeds `social.html?tab=messages`; the embedded social page owns the shared Supabase auth client. Messenger is therefore not yet an independently authenticated application shell.
6. Root `manifest.json` has `start_url: /` and `scope: /`; root `sw.js` caches both corporate and social pages. Current install identity and service-worker scope are shared.
7. Existing public-profile RLS policies restrict member rows by `auth.uid()`, but row ownership within one shared Auth project does not constitute separate corporate/social databases or independently managed identities.
8. Existing tables, profile rows, storage and Auth users must be preserved. No destructive schema/data changes were made during this audit.

## Release blockers

- A dedicated SUHAS-MAX Supabase project/database and its own Auth configuration are required for true backend separation. The currently connected Supabase account lists only the existing `suhasgroup` project. Creating another project requires the user to choose the Supabase organization and approve any non-zero quoted cost.
- Phone-number OTP must be configured and tested in the new project, including an SMS provider, rate limits, recovery, and ownership/RLS checks.
- A dedicated `/suhas-max/` application shell, manifest, service-worker file and scope must be implemented and tested before changing the corporate SUHAS MAX button.
- Messenger and Social must be migrated together to the new SUHAS-MAX Auth identity and database; no iframe or profile fallback may silently use the corporate product identity.
- Test accounts must verify that corporate profile/avatar/cover edits and SUHAS-MAX profile/avatar/cover edits cannot affect each other.

## Safe implementation sequence

1. Provision a separate Supabase project after organization and cost approval.
2. Create a reviewed, additive schema migration for SUHAS-MAX social, Messenger, AI, media and identity tables with RLS and storage policies.
3. Configure phone OTP and validate it with real test numbers.
4. Build the standalone app shell and PWA assets under `/suhas-max/`.
5. Migrate application code and data deliberately; preserve original records and legacy routes during the transition.
6. Run independent-auth, profile-isolation, Messenger-identity, refresh/cache, install, accessibility and corporate regression tests.
7. Only then update the single SUHAS GROUP SUHAS MAX navigation button and prepare production release.

## Safety status

This audit is documentation only. No database migration, data deletion, profile rewrite, merge to `main`, or Cloudflare production deployment was performed.
