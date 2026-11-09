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

## Latest SUHAS-MAX post permission fix
- Root cause found: `public.suhas_posts` had authenticated SELECT/INSERT/DELETE grants and RLS policies, but no UPDATE grant or owner-only UPDATE policy. Existing post edit and media-replacement actions therefore failed with a table permission error.
- Applied migration `20261108223813_suhas_posts_owner_update_permissions` to production Supabase project `ehvgxbifqtyajeersnvq`.
- Granted UPDATE only to `authenticated`; added an UPDATE policy requiring `auth.uid() = user_id` and a valid audience value. Members cannot edit another member's post or transfer ownership.
- Verification passed: authenticated SELECT/INSERT/UPDATE/DELETE privileges are present; exactly one owner-only UPDATE policy exists.
- Transactional policy test passed under the `authenticated` role: a no-op update against the authenticated owner's own post returned the expected row and was rolled back. No user post content was changed.
- Matching migration source committed to `supabase/migrations/20261108223813_suhas_posts_owner_update_permissions.sql`.
- Remaining verification: test actual browser interactions with a signed-in member account, including creating a post, editing a post, replacing media, liking, commenting and deleting. No authenticated browser session is available from this GitHub/Supabase connection.

## SUHAS-MAX duplicate group-action fix — 2026-11-09
- Audited the delegated click handlers in `social.html`.
- Found that Group Join and Open Group were processed by both the first document click handler and a later generic action handler, causing duplicate database requests for a single click.
- Removed only the duplicate Group Join/Open Group branches from the later handler. The original handler remains responsible for joining, refreshing the group list and opening the selected group.
- Changed file: `social.html`.
- Commit: `e90cd8cd3461c0820620433b4d50ec1b3ffa5dcf`.
- Static source verification: confirmed the duplicate branch was removed from the later handler; the original Group Join/Open Group handler remains. No authenticated browser/device test has been run, so live click behavior is not yet verified.
- No tables, records, pages, assets, routes or existing features were deleted.
- Next step: continue the social action audit and test group joining/opening with an authenticated member account; then address remaining friend/message preference enforcement.


## SUHAS-MAX group-join duplicate-submission guard — 2026-11-09
- Continued the social action audit after the duplicate delegated-handler fix.
- Updated the existing public Group Join action to disable the clicked button immediately and show “Joining…” while the membership request is in progress, preventing repeated taps from submitting duplicate requests from the same UI.
- A duplicate-membership response (Postgres unique-violation code 23505) is now handled as an already-joined state; other errors restore the button and show the returned error.
- Changed file: `social.html`.
- Code commit: `d8db9854e19251ced80a822572b8bbb1d1c4443e`.
- Static source verification: the updated handler was written successfully. No authenticated browser/device test has been run; live behavior remains unverified.
- No existing tables, records, pages, assets, routes or features were deleted or replaced.
- Next step: continue the delegated-action audit, then enforce saved friend-request/message privacy preferences at every relevant social entry point after reviewing the preference schema and existing policies.


## SUHAS-MAX privacy enforcement audit and UI status correction — 2026-11-09
- Audited the live Supabase RLS policies for `suhas_friend_requests` and `suhas_messages` plus the existing Account Control Centre save/load code.
- Confirmed the friend-request INSERT policy checks the recipient's `allow_friend_requests` preference (default allow when no preference row exists).
- Confirmed the message INSERT policy blocks recipients set to `nobody` and requires an accepted friendship when the recipient setting is `friends`; `everyone` remains allowed.
- The earlier checkpoint wording that these preferences were “saved only” was stale relative to the live database policies. Updated `member-tools.html` helper text and save confirmation so the UI accurately says these permissions are enforced.
- Changed file: `member-tools.html`.
- Code commit: `7c835180375083b0dbe7fb1094a60187187e5fe8`.
- Verification: read-only Supabase catalog query confirmed the relevant RLS policy definitions; GitHub source update succeeded. No live two-account send/deny UI test was performed.
- No schema, records, routes, existing features or user data were changed or deleted.
- Next step: run authenticated two-account tests for friend requests and messages; then audit feed audience enforcement, profile visibility, block/report, notification routing, media storage, and remaining Facebook-style feature gaps.


## SUHAS-MAX group-join error recovery — 2026-11-09
- Continued the group action hardening after the duplicate-handler and repeat-tap guards.
- Wrapped the existing Group Join request and subsequent group refresh/open steps in error handling. The button is disabled and shows `Joining…` during the request; on a returned database error (other than unique violation `23505`) or a later refresh/open failure, the original button label and enabled state are restored and a visible error notice is shown.
- Duplicate membership (`23505`) continues to be treated as already joined, followed by refreshing and opening the group.
- Changed file: `social.html`.
- Code commit: `edae48e970a37790ed1cc16b38bbe1ed6455d7a6`.
- Verification performed in this increment: source-level replacement guard confirmed the intended handler existed before update and the updated file was committed. Browser/device interaction and authenticated Supabase two-account behavior are not yet verified.
- No existing tables, records, pages, assets, routes or features were deleted or replaced.
- Next step: run JavaScript syntax validation and inspect GitHub Pages deployment/workflow status; then test the Group Join action with an authenticated account.


## SUHAS-MAX 3D Like button correction — 2026-11-09
- Audited the latest 3D engagement update and found the Like button markup was missing the existing `suhas-3d-action suhas-like-action` classes in both the main feed and Reels.
- Added the existing 3D Like classes to exactly one feed Like button template and one Reels Like button template; existing Like handlers and database operations were left unchanged.
- Changed file: `social.html`.
- Commit: `ad20bf9499748b95a5033f45a6b97b68d2174ead`.
- Verification: fetched the committed file again and confirmed Feed Like, Reels Like, Comment and Share all carry their expected 3D styling hooks.
- Static JavaScript syntax check passed for both inline scripts (61 bytes and 78,340 bytes).
- No database schema, records, pages, routes, media assets or existing features were deleted or modified.
- Live browser/device rendering and authenticated Like/Unlike interactions are still pending; do not mark those as confirmed until tested.


## SUHAS-MAX in-app post sharing — 2026-11-09
- Added a post-share dialog with an accepted-friends selector.
- Added an in-app Messenger action that opens or creates the existing one-to-one conversation and sends the post text plus its SUHAS-MAX post link using the existing `suhas_messages` table.
- Kept external sharing through the device Web Share API and a copy-link fallback.
- Restricted sharing of posts whose audience is `only_me`.
- Reused existing friend relationships, conversations and message RLS; no database schema changes or existing records were modified.
- Changed file: `social.html`.
- Commit: `7ed162b4215cb6d6045841aa063e98fd6c9bde5d`.
- Verification: fetched the committed source again; confirmed friend picker, Messenger insert path, external share option, Web Share API, copy fallback and private-post restriction.
- Static JavaScript syntax check passed for both inline scripts (61 bytes and 81,124 bytes).
- Live authenticated browser/device test, actual recipient delivery, external app chooser behavior and share analytics remain pending.


## SUHAS-MAX Facebook-inspired mobile feed and Reels layout — 2026-11-09
- Added a mobile-first feed presentation with white rounded post cards, clearer author/profile header, readable post text, edge-to-edge media, compact comment bubbles, and a responsive comment composer.
- Changed the Reels shelf to a horizontally scrollable, snap-aligned card row, matching the reference screenshot's swipeable Reels presentation; kept the existing video elements and controls.
- Preserved existing 3D Like/Comment/Share controls and the in-app/external share implementation.
- Changed file: `social.html`.
- Commit: `47b2b9454a10ea339e19b1b56a5a6a3d5ee4b9c6`.
- Verification: fetched the committed file again and confirmed the new layout block, horizontal Reels rules, responsive feed styles, and previous 3D/share hooks are present. Browser/device visual inspection and live interaction tests have not been run.
- No existing tables, records, pages, assets, routes or features were deleted; no database schema was changed.
- Next: implement the repost-to-profile flow with original-author attribution and privacy-safe visibility, then continue feed menu, media, notifications and Reels interaction tests.


## SUHAS-MAX Home Feed Reels shelf — 2026-11-09
- Added a horizontal, swipeable Reels shelf directly inside the Home Feed, with vertical video previews, caption, creator name, and a See all action to open the existing Reels page.
- Shelf content is loaded from existing visible video posts in `suhas_posts` and creator names/photos from `suhas_public_profiles`; no sample/fake content and no new database tables were introduced.
- Kept the existing dedicated Reels page and its Like/Comment/Share actions unchanged.
- Changed file: `social.html`.
- Commit: `dea63bce5e692b96641bb7b43db06ed0c2c6f382`.
- Verification: fetched the committed file, confirmed the shelf markup, query, profile attribution, Home initialization, and existing 3D/share hooks. All inline JavaScript blocks passed syntax parsing.
- Actual Android rendering, video preview playback, and tap-through behavior still require live browser/device testing.
- No existing records, tables, pages, media or features were deleted; no schema changes were made.


## SUHAS-MAX Stories — 2026-11-09
- Added a Home Feed Stories row with creator avatars, circular story rings, own-story creation, audience selection (Public/Friends), story viewing dialog, and 24-hour expiry.
- Added `public.suhas_stories` with RLS enabled. Authenticated users can create their own stories; reads are limited to active public stories, accepted friends' stories, and their own stories; updates/deletes are owner-only.
- No media upload in this first Stories increment; it supports text stories only. Photo/video story upload and view tracking remain pending.
- Changed file: `social.html`; database migration: `create_suhas_stories_with_privacy`.
- Code commit: `234bc1f79c2a3215ed1b5430ba830fc90606f138`.
- Verification: fetched committed source, confirmed form/loader/expiry/audience/viewer hooks, and parsed inline JavaScript. Confirmed stories table and four RLS policies exist.
- Not yet tested with authenticated browser sessions or actual users; live create/view/privacy/expiry behavior remains pending.
- No existing tables, records, pages, assets, or features were deleted; additive migration only.


## SUHAS-MAX Story View Tracking UI — 2026-11-09
- Connected the Home Stories UI to the additive `suhas_story_views` table: opening another member's active story records one view per viewer; opening own story displays the recorded view count.
- Code commit: `97f33dc1b9c08a4798b109f487339dc2a6c2fc22`.
- Verification: re-fetched committed source; confirmed view-read, unique upsert, and view-count rendering hooks. Both inline JavaScript blocks passed syntax parsing. Confirmed the story-view RLS policies are present.
- Live multi-user/browser verification remains pending.
- No existing records or features were deleted.


## SUHAS-MAX Demo Community Profiles — 2026-11-09
- Added 12 clearly fictional demo profiles to the Home Feed “People you may know” discovery shelf, alongside up to 6 real community profiles.
- Demo cards show profile-style photos, names, job/industry, city, and an explicit “DEMO USER” label. Demo controls are disabled and display “DEMO ONLY”; they do not create fake auth users, friend requests, messages, posts, likes, or database activity.
- Kept all existing real profiles and database records unchanged; no schema or data migration was needed.
- Changed file: `social.html`.
- Code commits: `4f755a7b85ab2b57439be4b253d887504be24f47` and `f75959549bfdc92491b2baad1ce65cff580b939f`.
- Verification: fetched the committed source; confirmed 12 demo profile records, explicit demo labels, disabled demo actions, and valid avatar URL entries. All inline JavaScript blocks passed syntax parsing.
- Live Android/browser rendering and image-host availability have not been tested. Demo profiles currently appear in the Home Feed discovery shelf, not as real authenticated accounts or real Friends/Messenger identities.
- No existing tables, records, pages, routes, assets or features were deleted or replaced.
