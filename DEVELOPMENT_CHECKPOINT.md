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
- Current social page has feed, likes, comments, friends/requests, follows, basic messaging, notification center, public/private group creation and public-group join/posts, marketplace listings and a dedicated Reels/video feed. It is not yet the full social feature set requested.
- Added `suhas_notifications` with RLS and trigger-generated alerts for friend requests, post likes, comments and direct messages. Added a notification center in `social.html` with read-state handling and a Realtime subscription.
- Added `suhas_groups`, `suhas_group_members`, `suhas_group_posts` with RLS, owner auto-membership, public group joining and group posts. Private group invitations/approval are not yet implemented.
- Added `suhas_marketplace_listings` with RLS for active listings, seller-owned updates and sold status. Listings are currently text-first; image upload, checkout/payment and delivery workflows are not implemented.
- Added `suhas-max-media` public media bucket (25 MB limit; JPG/PNG/WebP/MP4/WebM allowlist) with owner-folder upload/update/delete policies. Added media fields to existing posts and marketplace listings; existing records preserved.
- Dedicated audio library, paid checkout, delivery and advanced video editing are not implemented.
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
2. Test notifications, groups and marketplace end-to-end using two real authenticated member accounts.
3. Add private group invitations/moderation, marketplace image upload and safe media handling.
5. Improve profile, settings and member privacy controls; complete Reels moderation and media reporting.
4. Audit login/signup/profile/auth routing and verify protected-page behavior.
5. Inspect all existing corporate pages and identify the Dormitory legacy route/data.
6. Review Storage policies, Auth settings and remaining database advisor warnings; remediate only with safe additive changes.
7. Add automated checks and update this checkpoint after each verified increment.

## Latest Media and Reels increment
- Applied migration `20261108203000_suhas_max_media_storage_and_post_fields`.
- Added dedicated `suhas-max-media` bucket with a 25 MB limit and strict MIME allowlist; each signed-in member can upload/update/delete only under their own user-id folder; public reads support media display.
- Added optional photo/video upload to feed posts, image upload to marketplace listings, and a dedicated Reels composer/feed for MP4/WebM videos.
- Added additive media columns to existing tables; no old posts, listings or files were deleted.
- Matching SQL source is committed under `supabase/migrations/`; JavaScript syntax check passed.

## Latest Groups and Marketplace increment
- Applied migrations `20261108202754_suhas_groups_and_group_posts` and `20261108202904_suhas_marketplace_listings`.
- Groups support public/private creation, automatic owner membership, public group joining, member-only group posts and group navigation on desktop/mobile. Private group invitation/approval flow remains pending.
- Marketplace supports member listings with title, description, category, price (BDT), condition, search, seller messaging and seller mark-as-sold. Image upload and transactions remain pending.
- Group and marketplace SQL source files are committed under `supabase/migrations/`; social page JavaScript syntax check passed.

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


## Latest private group invitation increment
- Applied additive migration `suhas_private_group_invites`; creates `suhas_group_invites` with three RLS policies and a response trigger.
- Group owners/admins can invite existing SUHAS-MAX members; invitees can accept or decline. Acceptance adds the member to the group automatically.
- Added invitation inbox, accept/decline actions and owner/admin invite controls to the Groups panel. Public-group join behavior remains unchanged.
- SQL migration source is committed under `supabase/migrations/20261109023000_suhas_private_group_invites.sql`; embedded JavaScript syntax check passed.
- Supabase verification confirmed the invitation table, three RLS policies and response trigger. Full two-account UI flow test remains pending; latest GitHub Pages deployment is queued/in progress.


## Latest Account Privacy and Settings increment
- Applied additive migration `suhas_account_privacy_preferences` and follow-up migration `enforce_suhas_profile_privacy_on_sync`.
- Created per-user `suhas_account_preferences` with RLS ownership policies. Members can control directory discoverability and visibility of company, location and skills. Original profile data in `suhas_member_profiles` is retained.
- Added privacy controls to the existing `member-tools.html` Account Control Centre. Existing email verification, password update, TOTP setup and global sign-out controls remain intact.
- Friend-request and message-permission choices are currently saved as preferences only; enforcement at all social entry points remains pending. Email notification preference delivery is not connected.
- SQL migration sources are committed under `supabase/migrations/`; embedded JavaScript syntax check passed. Supabase verification confirmed the preference table, 3 RLS policies and 2 privacy triggers.
- Security advisor still reports leaked-password protection disabled; this is an Auth dashboard setting and has not been changed automatically.


## SUHAS-MAX Gaming Hub increment
- Added a mobile-accessible Gaming Hub entry to the existing social navigation without removing existing tabs.
- Added two original browser mini-games: Tic-Tac-Toe (player vs random-move computer) and Rock Paper Scissors.
- Added per-account personal win/loss/draw totals stored in the new `public.suhas_game_scores` table. Scores are private to the signed-in owner through three RLS policies; RLS is enabled and authenticated grants are explicit.
- Existing social pages, posts, media, groups and account records were not deleted or replaced.
- Migration source: `supabase/migrations/20261109040000_suhas_max_gaming_hub.sql`. Database verification confirmed the table, RLS enabled and 3 policies.
- Embedded JavaScript syntax check passed. Real two-account gameplay/score-save UI test remains pending; latest GitHub Pages deploy and CI checks are queued.
