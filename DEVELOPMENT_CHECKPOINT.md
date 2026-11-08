# SUHAS-MAX Development Checkpoint

## Project
- Product: SUHAS-MAX
- Corporate brand: SUHAS GROUP
- Repository: suhasgroupin-web/suhasgroup
- Supabase project ref: ehvgxbifqtyajeersnvq
- Working branch: suhas-max/phase-01-audit

## Current objective
Establish the SUHAS-MAX product identity consistently while preserving the existing SUHAS GROUP portal and all prior modules. Continue the repository and backend audit before feature expansion.

## Completed in this increment
- Renamed the existing social community product label from SUHASBOOK to SUHAS-MAX in the social page copy and browser title.
- Updated the Main Menu browser title to SUHAS-MAX with SUHAS GROUP corporate attribution.
- Updated the PWA manifest name, short name, description, categories and launch URL so the installed app opens the social Home experience.
- Preserved existing icon assets, shortcuts and corporate routes; added Home and Main Menu shortcuts without removing existing shortcuts.
- Changes are on the dedicated working branch and have not been merged into main.

## Existing backend baseline (audited)
- 17 public tables inspected; all 17 have RLS enabled.
- Existing social tables: suhas_posts, suhas_post_likes, suhas_post_comments, suhas_friend_requests, suhas_follows, suhas_conversations, suhas_conversation_members, suhas_messages, suhas_member_profiles, suhas_public_profiles.
- Existing corporate/member tables retained.
- Existing migrations retained.
- Existing Storage bucket found: member-avatars (public).
- Existing Edge Function: ai-assistant (ACTIVE).

## Known gaps and risks
- Current social page is a basic community implementation, not yet the full social feature set requested.
- Dedicated backend tables for notifications, groups, marketplace, media library, reels and audio were not identified in the current public schema.
- Storage policy and upload design require review before adding media.
- Security advisor warnings remain: public/authenticated EXECUTE on public.rls_auto_enable() SECURITY DEFINER function; leaked-password protection disabled.
- Performance advisor reports missing foreign-key indexes and auth RLS initplan warnings.
- Do not change security function grants until function body, dependencies and intended caller roles are reviewed.
- Dormitory module/page not identified in the earlier repository scan; locate legacy source before creating a replacement.

## Verification status
- Repository files fetched from the working branch before editing.
- Exact source files updated additively; no existing database records, tables, pages, app routes or assets deleted.
- No browser end-to-end test or authenticated device test performed in this increment.
- No deployment performed from this feature branch; GitHub Pages deploy workflow currently targets main only.

## Next steps
1. Audit complete social.html JavaScript against existing schema and RLS policies; document dead or incomplete controls.
2. Audit login/signup/profile/auth routing and verify protected-page behavior.
3. Inspect all existing corporate pages and identify the Dormitory legacy route/data.
4. Review RLS function definition, policies, storage policies and Auth settings; remediate only with safe additive changes.
5. Implement social modules incrementally with additive migrations, indexes, storage buckets and RLS.
6. Add automated checks and update this checkpoint after each verified increment.

## Data protection
No destructive schema operations, record deletions, storage cleanup or existing route removals are permitted. Every migration must be additive, reviewed and recoverable.
