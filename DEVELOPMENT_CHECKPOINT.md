# SUHAS-MAX Development Checkpoint

## Project
- Product: SUHAS-MAX
- Corporate brand: SUHAS GROUP
- Repository: suhasgroupin-web/suhasgroup
- Supabase project ref: ehvgxbifqtyajeersnvq
- Production branch: main

## Current objective
Establish the SUHAS-MAX product identity consistently while preserving the existing SUHAS GROUP portal and all prior modules. Continue the repository and backend audit before feature expansion.

## Completed in this increment
- Renamed the existing social community product label from SUHASBOOK to SUHAS-MAX in the social page copy and browser title.
- Updated the Main Menu browser title to SUHAS-MAX with SUHAS GROUP corporate attribution.
- Updated the PWA manifest name, short name, description, categories and launch URL so the installed app opens the social Home experience.
- Preserved existing icon assets, shortcuts and corporate routes; added Home and Main Menu shortcuts without removing existing shortcuts.
- SUHAS-MAX identity/PWA updates are present on main.
- Mobile corporate navigation Home now opens `social.html`; owner-only Edit Suhas is inserted before Home when the authenticated user passes the owner check.
- Latest Home navigation commit `6ccac883182848ed2c7c2a1202f2bf2b1d37fba3` deployed successfully to GitHub Pages; site quality and Datadog synthetic checks passed.

## Existing backend baseline (audited)
- 17 public tables inspected; all 17 have RLS enabled.
- Existing social tables: suhas_posts, suhas_post_likes, suhas_post_comments, suhas_friend_requests, suhas_follows, suhas_conversations, suhas_conversation_members, suhas_messages, suhas_member_profiles, suhas_public_profiles.
- Existing corporate/member tables retained.
- Existing migrations retained.
- Existing Storage bucket found: member-avatars (public).
- Existing Edge Function: ai-assistant (ACTIVE).

## Known gaps and risks
- Current social page has feed, likes, comments, friends/requests, follows, basic messaging and a newly added notification center. It is not yet the full social feature set requested.
- Added `suhas_notifications` with RLS and trigger-generated alerts for friend requests, post likes, comments and direct messages. Added a notification center in `social.html` with read-state handling and a Realtime subscription.
- Dedicated backend tables for groups, marketplace, media library, reels and audio were not identified in the current public schema.
- Storage policy and upload design require review before adding media.
- Social notification SQL/JS is syntax-checked and its table/RLS policies were verified. Authenticated end-to-end notification delivery still needs a two-account device test.
- Fixed the exposed SECURITY DEFINER event-trigger RPC risk: revoked EXECUTE on `public.rls_auto_enable()` from PUBLIC, anon and authenticated. Verified anon/authenticated cannot execute; postgres retains execute. Security advisor no longer reports this finding.
- Remaining security advisor warning: leaked-password protection is disabled; this is an Auth dashboard setting and was not changed here.
- Performance advisor reports missing foreign-key indexes and auth RLS initplan warnings.
- Do not change security function grants until function body, dependencies and intended caller roles are reviewed.
- Dormitory module/page not identified in the earlier repository scan; locate legacy source before creating a replacement.

## Verification status
- Repository files fetched from the working branch before editing.
- Exact source files updated additively; no existing database records, tables, pages, app routes or assets deleted.
- No browser end-to-end test or authenticated device test performed in this increment.
- Latest navigation deployment from main completed successfully. CodeQL was still running at last status check; it is not a deployment blocker.

## Next steps
1. Complete a line-by-line audit of social.html and correct incomplete social actions; current page has feed, likes, comments, friends, follows and basic messaging only.
2. Test notifications end-to-end using two real authenticated member accounts; verify friend request, like, comment and message delivery.
3. Add groups, marketplace, media upload, reels/video and profile improvements incrementally.
4. Audit login/signup/profile/auth routing and verify protected-page behavior.
5. Inspect all existing corporate pages and identify the Dormitory legacy route/data.
6. Review Storage policies, Auth settings and remaining database advisor warnings; remediate only with safe additive changes.
7. Add automated checks and update this checkpoint after each verified increment.

## Latest notifications increment
- Applied migrations `20261108202333_suhas_social_notifications` and `20261108202419_harden_suhas_notification_updates_and_realtime`.
- Notification rows are visible only to their recipient; authenticated users can update only `read_at`.
- Trigger events cover friend requests, post likes, post comments and direct messages. Realtime publication is enabled when the publication exists.
- Notification center is available in the social page navigation; JavaScript syntax check passed.
- Matching SQL files are committed under `supabase/migrations/`.

## Latest backend security change
- Applied Supabase migration `20261108202255_restrict_rls_auto_enable_execute`.
- Matching migration source is committed at `supabase/migrations/20261108202255_restrict_rls_auto_enable_execute.sql`.
- Verification query confirmed: anon=false, authenticated=false, postgres=true for EXECUTE privilege.

## Data protection
No destructive schema operations, record deletions, storage cleanup or existing route removals are permitted. Every migration must be additive, reviewed and recoverable.
