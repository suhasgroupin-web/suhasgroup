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


## SUHAS-MAX international male demo profiles — 2026-11-09
- Expanded the Home Feed discovery shelf from 12 local demo personas to 15 fictional male demo personas across China (Shanghai, Beijing, Shenzhen), USA (New York, Los Angeles, Chicago), United Kingdom, Canada, Japan, India, UAE and Singapore.
- Each card now includes a portrait URL, fictional name, role, company/industry, city/country and a short bio. Cards retain the visible `DEMO USER` label (with country) and disabled `DEMO ONLY` action; no Verified badge or simulated friend/message/post activity is created.
- Existing real member discovery cards and all existing app/database records remain unchanged. No Auth users or database rows were created; these are clearly marked demo showcase profiles, not independently sign-in-able accounts.
- Changed file: `social.html`.
- Commit: `2e41172e1450f485ac64a698a4f69472e91a5919`.
- Verification: re-fetched committed source; confirmed 15 profiles, 8 countries, demo labels and disabled actions. Both inline JavaScript blocks passed syntax parsing.
- External avatar image availability and Android/browser rendering have not been live-tested. Real Supabase Auth demo-account provisioning is not included in this increment.
- No existing tables, records, pages, routes, assets or features were deleted or replaced.


## SUHAS-MAX young demo profile balance — 2026-11-09
- Updated the 15 clearly labeled fictional showcase profiles to 10 female and 5 male personas, ages 18–25.
- Each profile includes gender, age, role, company/industry, city/country, bio and portrait URL; age and gender are displayed on each card.
- Kept `DEMO USER` country label and disabled `DEMO ONLY` action. No Verified badges, fake activity, Auth accounts or database rows created.
- Commit: `199678699b63494665c184a7caefa522c43a94f3`.
- Verification: fetched latest source; profile counts 10 female and 5 male; age range 19–25; both inline JS blocks parsed successfully.
- Portrait host availability and actual Android/browser rendering remain untested. Existing real member profiles/data/features were not deleted or changed.


## 2026-11-09 — Social UI design polish
- Added a visual polish layer to `social.html` without deleting or replacing existing features.
- Feed Like/Comment/Share action controls now have tactile 3D-style raised/pressed states; primary actions have matching depth and pressed feedback.
- Added keyboard-visible focus styling, reduced-motion support, and subtle discovery-card hover treatment.
- Verified the latest GitHub source contains the design block once, before `</head>`, and includes the expected 3D action, primary button, focus, and reduced-motion rules.
- Commit: `5eed4bf27797eb290af7964f6e98eb19991c6240`
- Limitation: source-level verification only; live Android/browser rendering and real tap interaction still require device testing.


## 2026-11-09 — Photo/video Stories
- Added a private Supabase Storage bucket `suhas-max-stories` (25 MB limit; JPEG, PNG, WebP, MP4, WebM).
- Added `media_path` and `media_type` columns to `public.suhas_stories`.
- Added Storage RLS: authenticated owners upload only into their own UUID folder; downloads require ownership or an active story row visible under the story audience RLS.
- Updated `social.html` Stories composer to accept text-only, photo, or video stories; uploads are attached to the story row and viewer requests a one-hour signed URL.
- Failed story-row insertion attempts clean up the just-uploaded media object.
- Verified bucket privacy/limits, both columns, and both Storage policies via SQL; fetched latest GitHub source and JavaScript syntax parsing passed.
- Commits: `f93f2af48d5bb169319cf9acd368d142cbbfa431` (feature), `58d75389c7ea3a4ac34c3e0f1a89fae21caf23ca` (syntax fix).
- Supabase security advisor still reports the pre-existing warning that leaked-password protection is disabled; no change made to Auth settings.
- Not yet live-tested with actual Android uploads, friend/public audience accounts, or video playback.


## 2026-11-09 — Facebook-style Menu Drawer
- Updated `social.html` to replace the full-page Menu panel with a left-side slide-in drawer matching the supplied Facebook reference: account header, two-column shortcuts, See more/less, expandable Help and support / Settings and privacy / SUHAS services, and Log out link.
- Added dimmed scrim, close controls, body scroll lock, responsive sizing, and reduced-motion handling. Existing tab navigation remains wired through `activateMaxTab`; selecting a menu destination closes the drawer.
- GitHub commit: `942509fc7ad086a81527d49931f60fc653e5c1b6`.
- Verification: latest `social.html` re-fetched from `main`; drawer/overlay/shortcut/see-more/close/open hooks found; both inline scripts passed JavaScript syntax parsing.
- Not yet verified: live deployment, actual Android layout/tap behavior, and authentication/logout behavior on device.

- Follow-up Menu activation update: account header now loads the signed-in user's `full_name` and `profile_photo_url` from `suhas_public_profiles` with email fallback; Log out now calls Supabase `auth.signOut()` and redirects to login only after success. Commit: `a28414b822523f210a4462c517ff36685a67fb24`. Latest source re-fetched; dynamic profile/logout hooks and both inline script syntax checks passed. Device/live-session test still pending.


## 2026-11-09 — Direct Messages / Messenger usability update
- Updated `social.html` Messages panel with a member search and direct Message actions for up to 12 matching real completed profiles, plus clearer existing-conversation list with avatars and mobile-friendly layout.
- Existing `startMessage`, `openChat`, `suhas_messages` insert/read, and Supabase Realtime subscription are retained; selecting a member creates/reuses a conversation, opens it, and selecting a thread loads its messages.
- GitHub commit: `b702bdc1b1a8f45cb87c110e35ab6c30b1748521`.
- Verification: latest source re-fetched; both inline JS blocks pass syntax parsing. Supabase confirms RLS enabled on `suhas_conversations`, `suhas_conversation_members`, and `suhas_messages`; policies exist for creating conversations, adding participants, viewing member conversations/messages, and sending own messages subject to recipient message preferences/friend restrictions.
- Not yet verified: actual two-account send/receive, Realtime delivery, and Android live deployment/device interaction.


## 2026-11-09 — Friend Request send/show fix
- Centralized friend-request sending in `sendFriendRequest()` and wired both People discovery (`data-friend`) and profile (`data-profile-friend`) buttons to it.
- Sends explicit `status:'pending'`, checks both directions for existing pending/accepted/declined relationships to prevent duplicate-pair errors, shows useful feedback, disables/re-enables the action safely, and refreshes both People and Friend Requests (incoming/sent) views after success.
- GitHub commit: `d834ac49d3124616eeef66124377914b748c45d2`.
- Latest `social.html` re-fetched; both inline scripts pass syntax parsing; helper and both button integrations verified.
- Supabase check: `suhas_friend_requests.status` is NOT NULL with default `'pending'`; RLS permits authenticated users to insert own pending requests (subject to recipient friend-request preference), participants to read, and recipient to accept/decline. Unique pair index prevents duplicate same-direction requests.
- Not yet verified: two separate real accounts sending/receiving and live Android interaction. If recipient has disabled friend requests, RLS will correctly reject the request.


## 2026-11-09 — Account profile sync RLS and photo/cover fix
- Root cause confirmed from screenshot: `suhas_public_profiles` had RLS enabled but only a SELECT policy; profile page `syncPublicProfile()` performs UPSERT, which requires INSERT and UPDATE policies. This caused the exact `new row violates row-level security policy` error after the primary `suhas_member_profiles` save.
- Applied additive Supabase migration `allow_members_to_sync_own_public_profiles`: authenticated members may INSERT their own public profile and UPDATE only their own row (`auth.uid() = user_id` in both USING and WITH CHECK). Existing profile discovery SELECT policy retained.
- Verified with a transaction executed as database role `authenticated` and simulated JWT subject for a test account: own-row UPSERT succeeded; transaction rolled back. No test data persisted.
- Fixed `profile.html`: preserve existing `profile_photo_url` when saving the profile form (prevents accidentally nulling the public avatar); add version query to avatar and cover public URLs after upload to avoid stale browser cache.
- Commit: `281846b7dbafff7a55b51fcd173065ef7081e856`.
- Latest source re-fetched; both inline scripts pass syntax parsing. Avatar and cover inputs confirmed. Storage bucket `member-avatars` exists, public read enabled, 5 MB max, JPEG/PNG/WebP; own-folder INSERT/UPDATE/DELETE and public SELECT storage policies exist.
- Not yet verified on user's Android device with a real image upload; the Supabase RLS upsert path is verified in a rolled-back authenticated transaction.


## 2026-11-09 — Login existing-session switch-account option
- Updated `login.html`: an existing Supabase session now shows the current signed-in email with `Continue account` and `Switch account` actions instead of immediately redirecting with no choice.
- Continue retains the current account flow; Switch calls `sb.auth.signOut()` for the current session only, then reveals the normal login form for another email. It does not delete profile, posts, messages, or other account data.
- Commit: `8a455a626a8a27aa414657c5e66f902b14f1d729`.
- Latest login source re-fetched and its inline JavaScript syntax parsed successfully; both actions and sign-out path verified in source.
- Not yet live-tested on Android with two real accounts or deployment.


## 2026-11-09 — Invisible typed text fix for post composers
- Updated `social.html` with explicit foreground text, WebKit text fill, caret, placeholder contrast and focus styles for main Home post composer, group post composer, Marketplace description, message textareas and Story textareas.
- Added explicit dark-theme overrides so text remains visible in both light and dark modes, on desktop and mobile responsive layouts. No existing feature or stored post data changed.
- Commit: `73f8ff197522f628998583d9e45d6645eb0d100b`.
- Latest source re-fetched; both inline JavaScript blocks parse successfully and light/dark text-fill selectors confirmed. Browser/device visual typing test still pending.


## 2026-11-09 — Story gallery picker and media preview
- Updated `social.html`: clicking `＋ Add Story` with no text/media opens the native device file picker/gallery; selecting an image/video immediately displays a local preview and changes the action label to `Share Story`.
- Existing submit flow uploads selected media to the private `suhas-max-stories` bucket, inserts `media_path`/`media_type` into `suhas_stories`, and the story viewer loads the media using a signed URL. Preview is cleared after successful share.
- Verified the storage bucket exists (private, 25 MB, JPEG/PNG/WebP/MP4/WebM), required story media columns exist, and both inline JavaScript blocks parse. Actual Android gallery picker, upload, and cross-account story viewing still require live device testing.
- GitHub commit: `2b26ec053349e4a3bb501f56cd2a745dd873eaf3`.


## 2026-11-09 — Facebook UX review and mobile navigation refresh
- Reviewed Meta's official Facebook product updates: cleaner/immersive Feed, Story and Feed composer, comment improvements, photo grid/full-screen viewing, and more prominent Reels/Friends/Marketplace/Profile navigation. Sources: https://about.fb.com/news/2025/12/making-it-easier-to-create-discover-and-share-content-on-facebook/ and https://about.fb.com/news/2026/10/introducing-your-algorithm-facebook/.
- Updated `social.html` mobile bottom navigation from Home/Friends/Groups/Reels/Menu to six primary destinations: Home, Friends, Reels, Marketplace, Notifications, Menu. Groups remains available in the desktop navigation and side/menu shortcuts. Added accessible labels/current-page state and tuned six-item mobile spacing.
- Verification: latest `social.html` refetched; both inline JavaScript blocks parse; all six expected tab routes are present in navigation markup. Browser/device interaction not yet tested.
- Repository audit: `app.html`, `social.html`, `profile.html`, `login.html`, and `index.html` inline JavaScript syntax checks all passed (3/3, 2/2, 2/2, 1/1, 1/1 respectively). No files or user data were deleted.
- Supabase advisors: security warning — leaked-password protection is not enabled (https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Performance findings include 19 unindexed foreign keys, 31 RLS initplan warnings, 11 unused indexes, and 3 multiple-permissive-policy warnings. These require policy/index-by-index review; no potentially risky blanket database changes were made.
- GitHub UI commit: `bb7de88934fa7ec1f0e52b6680d8d4454b8edd8b`.


## 2026-11-09 — Mobile bottom navigation layout hotfix
- Fixed `social.html` mobile bottom navigation so all six primary destinations render in a single horizontal six-column bar, not a vertical centered stack.
- Added high-specificity mobile-only layout rules for fixed bottom positioning, compact button sizing, icon/label sizing, and page bottom clearance. Existing navigation actions and destination handlers are unchanged.
- GitHub commit: `410ab6bb36636d9c24cbccfaa8c63cd3f8bd5bd4`.
- Source update committed; actual Android browser rendering and tap-through verification still pending.

 
## 2026-11-09 — Unified text contrast for posts, comments and Messenger
- Updated `social.html` with a final high-specificity readability layer for Home post creation, group post creation, Marketplace description, feed/Reels comments, and Messenger compose input.
- Light mode now enforces dark readable text and muted dark placeholders on light input surfaces; dark mode enforces white/light text and pale placeholders on dark surfaces. Added clear focus outlines and explicit contrast for rendered feed comments and Messenger bubbles.
- Existing data, posts, comments, messages, features, and navigation were not changed; this is a CSS-only additive change.
- Commit: `dfb2d68d59d6134478834ee44c9fc6eb8b4f4774`.
- Source verification: style block inserted before `</head>`; all target selectors and both theme branches confirmed in the committed source. JavaScript and database behavior were not changed.
- Pending: visual verification on the user's Android device in both light and dark themes; hard refresh/reopen the SUHAS-MAX social page to load the new CSS.


## 2026-11-09 — Facebook-style reference integration started (audit + master rules)
- Reconnected to GitHub repository `suhasgroupin-web/suhasgroup` on `main` and Supabase project `ehvgxbifqtyajeersnvq` (`suhasgroup`, ACTIVE_HEALTHY).
- Read the current `social.html`, `app.html`, `index.html`, shared CSS/config/display-mode assets, `DEVELOPMENT_RULES.md`, and the latest checkpoint. Confirmed the production social page already contains Supabase-backed profiles, feed, stories/reels, friend requests, notifications, Messenger, Marketplace, and navigation; avoid importing the supplied static demo's fake/local-only actions.
- Inspected Supabase public schema with verbose table metadata; existing social tables and RLS are present. Security advisor currently reports leaked-password protection disabled and two RLS-enabled/no-policy LinkedIn OAuth tables. Performance advisor reports findings including unindexed foreign keys, RLS initplan warnings, unused indexes, and multiple permissive policies. No database changes were made.
- Added a permanent, additive section 8 to `DEVELOPMENT_RULES.md` describing how to use the two supplied HTML files as references, preserve existing app/data, integrate only real Supabase-backed features, and require mobile/desktop functional verification.
- GitHub commit for rules addendum: `ed7b4dba8e525a10342af07657b6a779880a6ea7`.
- Completed: repository/database discovery and source audit baseline; master development rules updated. Not completed: UI changes, automated/browser/device tests, deployment, or live visual verification.
- Next step: continue auditing the supplied reference files against the current live social page and isolate a specific, testable UI/interaction improvement before editing `social.html`. Do not change Supabase schema until a concrete gap and safe migration are demonstrated.


## 2026-11-09 — SUHAS-MAX post sharing and repost increment
- Added permanent Facebook-style reference integration requirements to `DEVELOPMENT_RULES.md` (section 8), using the two uploaded HTML files as references only. Static/demo placeholders are not to be imported as production actions. Rules commit: `ed7b4dba8e525a10342af07657b6a779880a6ea7`.
- Added the new Supabase table `public.suhas_post_reposts` with original-post and member references, created-at timestamp, unique member/post constraint, indexes, RLS enabled, and three policies: read own or visible reposts, insert reposts only for accessible non-private posts as the signed-in member, and delete only own reposts. Migration: `20261109142830_suhas_post_reposts`.
- Updated `social.html` additively: the Share dialog now offers Repost to my SUHAS-MAX feed, Messenger delivery to accepted friends, and native sharing/copy to other apps. Repost entries render in Home feed with attribution, reuse original likes/comments/media, and can be removed without changing the original post. The Messenger/other-app options remain available even when the member has no accepted friends. Latest social code commit: `ada26c5fa037eee72926d02309a297930229291f`.
- Added a unique menu key per repost card so multiple reposts of one source post do not collide in the post-menu controls.
- Fixed a pre-existing malformed trailing-slash regular expression in `apply-for-job.html` that caused the repository-wide site-quality workflow to fail. Intended behavior (strip one trailing slash from the Supabase URL) is preserved. Commit: `50ad0298086d6b48a4a54e860b3f482198ebdda8`.
- Verification passed: all four inline scripts in `social.html` parse; both inline scripts in `apply-for-job.html` parse; Supabase confirms the repost table, RLS enabled, and exactly three policies; an authenticated-role INSERT against a public post succeeded inside a transaction and was rolled back; follow-up count confirms zero repost rows persisted from the test. GitHub Site quality checks passed and Datadog Synthetic tests passed for commit `50ad0298086d6b48a4a54e860b3f482198ebdda8`. GitHub Pages build/upload job passed; deploy job was still running at checkpoint time.
- No existing post, account, profile, message, media object, table, page, or feature was deleted. No pre-existing production rows were changed.
- Pending: confirm the GitHub Pages deploy job reaches success; live browser rendering and two-account Android testing of repost, Messenger delivery, and external share remain unverified. The direct Pages URL could not be fetched through the available live-page viewer in this session, so do not mark live visual verification complete.
- Next step: confirm deployment status, then test Share dialog on Android with an authenticated member who has an accepted friend; verify repost appears in feed, attribution is correct, remove-repost leaves the source post intact, Messenger sends the post link, and external share sheet opens. Continue the broader visual comparison against the supplied references after these checks.


## 2026-11-09 — Profile timeline repost visibility
- Extended the social profile viewer with a Posts & Reposts timeline. It loads the member's visible original posts and repost records through existing Supabase RLS, resolves original post content/media, and shows repost attribution without copying or modifying the source post.
- Repost and remove-repost actions refresh the open member's own profile timeline as well as the Home feed. The share dialog labels the action as “Repost to my profile”.
- Latest `social.html` commit: `31b560320f0eb8b25e005b7cab81d610376c2ef7`.
- Verification: all four inline scripts in `social.html` and both inline scripts in `apply-for-job.html` parse successfully; profile timeline container and repost action labels are present. GitHub Site quality checks and Datadog Synthetic tests passed for this commit. Supabase security advisor shows no new repost-table warning; existing LinkedIn OAuth policy and leaked-password-protection findings remain unchanged.
- Pending: GitHub Pages deploy run for this commit is still in progress; real Android visual/tap testing and two-account Messenger/repost verification remain pending.


## 2026-11-09 — Mandatory real-action audit for every button
- Added section 9 to `DEVELOPMENT_RULES.md` requiring every visible button/control to have a real, tested action, persisted settings where applicable, authorization/RLS checks, loading/success/error states, and honest handling of unavailable external integrations. Commit: `0432fe25f825b49cbf72bda1a64a4de54f3797b0`.
- Audited the current `social.html` source: 190 static/dynamic button templates were detected. Existing code already wires many core actions (navigation, create menu, post like/comment/share/repost, friend requests, groups, marketplace, notifications, profile actions, games, and Messenger); this source scan is not proof that every action works at runtime.
- Identified clear composer-control gaps that must be corrected in a focused next increment: Music/Tag/Location/Feeling/GIF currently use text prompts that append labels to post text rather than structured features; Live currently displays an unavailable alert; WhatsApp only explains a post-publish workaround; Calls only displays an alert; Instagram/Threads switches only change their visual On/Off state and do not perform or persist cross-posting. Audience selection uses a browser prompt. These must not be reported as fully functional.
- Supabase `suhas_posts` currently has only id, user_id, content, created_at, media_url, media_path, media_type, and audience. No metadata columns for music, tags, location, feeling, or background were found, so schema additions require a separate additive migration and RLS compatibility review before structured persistence.
- No application source or user data was changed in this audit increment; only the development rulebook was updated. No runtime button-by-button device test was performed.
- Next step: implement one composer feature increment at a time, beginning with safe structured metadata and media actions; then implement or honestly gate WhatsApp/Instagram/Threads/Calls/Live according to actual integration availability. Maintain a per-control pass/fail/blocked inventory and test on Android before claiming all buttons active.


## 2026-11-09 — Real post composer metadata increment
- Added `public.suhas_posts.metadata jsonb not null default '{}'` and a GIN index additively; existing post rows retain empty metadata and no rows were deleted or rewritten.
- Updated `social.html` to save structured composer metadata with new posts, render saved metadata chips and selected background color in the feed, and clear metadata after successful publishing. Composer options now use structured metadata for music title, collaborator names, location coordinates (browser permission required), feeling/life update, and approved background colors instead of appending these values to the post body.
- Instagram/Threads toggles are now disabled and labeled unavailable until their official cross-post integrations are configured; Live and Calls explain their provider/credential dependency; GIF is gated until a verified provider is connected. This avoids misleading On/Off or fake-success behavior.
- Latest source commit: `2e74670dc868ae65feb06011ec97b7c0cce94549`. All five inline JavaScript blocks parse successfully and the metadata column/index were confirmed in Supabase.
- Not yet complete: actual member tagging/collaboration, music catalog playback/licensing, GIF provider/search insertion, WhatsApp direct-share flow, Instagram/Threads OAuth cross-post, Live streaming, and voice/video calling. These need dedicated integrations and additional UI/database work. Android runtime testing and deployment are pending; workflows are currently running/pending for this commit.


## 2026-11-09 — Facebook-style Create Story screen
- Reworked `loadHomeStories()` to always show a dedicated first "Create story" card using the signed-in user's current `suhas_public_profiles.profile_photo_url` and name-derived fallback, even when there are no active stories. The plus badge overlays the lower edge of the photo and the card label reads "Create story".
- Added a full-screen mobile story creation dialog modeled on the supplied Facebook screenshots: close/title/settings header, Text/Music/Collage/Boomerang tool row, Gallery selection row, and existing story form (caption, photo/video picker, preview, audience, publish). Text and Gallery actions are wired to existing story creation; Music/Collage/Boomerang are visibly disabled with explanations until their actual integrations/editors exist.
- Kept the existing Supabase story upload/insert/view flow; story creator closes only after the existing submit handler confirms successful insert and reload. Added `suhas_stories.metadata jsonb not null default '{}'` and GIN index additively for future structured story options.
- Latest commits: `54dca4ee94f4d3e0132243f70a9b599f445ebed8` (UI) and `93aac8e37794e789481f616093995309cb50ef77` (success-only close).
- All six inline JavaScript blocks parse successfully. Latest GitHub Actions for commit `93aac8e...`: Pages deploy, CodeQL, site quality and Datadog tests queued/pending at last check. Android visual/runtime verification remains pending.

 
## 2026-11-09 — Premium Home header, member search and Messenger presence
- Updated `social.html` additively in commit `41f1c5111ded09141983f5f05e40b798a12f35d5`.
- Header now keeps the existing left hamburger and SUHAS-MAX identity, and places the controls at the right in this order: Messenger, expandable member search, circular premium Create (+), and a 3×3 three-dot menu. The old center navigation menu button was moved out of the center navigation; its existing `data-tab="maxmenu"` action and current SUHAS-MAX menu drawer remain the action target.
- Messenger uses the blue/cyan/purple gradient icon treatment. Header search opens the existing Find People section and filters the existing Supabase-backed public member list as the user types; no separate or fake account store was introduced.
- Messenger's start-conversation list now includes all loaded `profile_complete=true` public profiles (up to the existing 500-row query limit), sorted online-first then alphabetically. Added ephemeral Supabase Realtime Presence tracking: green dot means a member currently has an active SUHAS-MAX session on the shared presence channel; gray means no active presence was observed. No new database table or schema change was made.
- SUHAS-MAX wordmark received a blue/silver premium gradient treatment. Existing Story Audio code was checked and preserved.
- Verification: all 6 inline scripts in `social.html` parse successfully; static checks confirmed header controls, search wiring, Presence channel, status indicators, and unchanged Story Audio handler. GitHub Site quality workflow run `42648709579` completed successfully. Combined commit status endpoint returned no individual status entries.
- Not yet verified: Android/desktop visual tap-through, real two-account Presence behavior, and live GitHub Pages deployment for this commit. Demo-only entries not represented by real Supabase public profiles are not fabricated or shown as chat-capable accounts; they require a separate, clearly marked demo source before they can appear.
- Recovery: commit `41f1c5111ded09141983f5f05e40b798a12f35d5`; no prior page, account, message, story, media, data, or feature was deleted.

- Additional Supabase data check: `public.suhas_public_profiles` currently contains 2 rows, both `profile_complete=true`, and 0 profile names marked “demo”. The table has no demo/account-type column. Therefore the current Messenger member list can show these 2 real public profiles; there is no verified demo-account dataset to merge. Do not invent demo identities or create fake chat targets.
- Presence implementation follows Supabase Realtime Presence's documented `sync` → `presenceState()` and `subscribe('SUBSCRIBED')` → `track()` pattern (Supabase Presence docs updated Aug 3, 2026).


## 2026-11-10 — Restore Profile as the final mobile navigation tab
- Removed the separate Menu button from the mobile bottom shortcut bar so the signed-in member's own profile photo is the rightmost control, matching the user's explicit navigation preference and Facebook's profile-tab pattern.
- Kept Menu available from the top-left hamburger and desktop side navigation; no menu route or feature was deleted.
- Set the mobile bottom bar to six equal columns: Home, Friends, Reels, Marketplace, Notifications, Profile. The existing profile-avatar loader and click handler continue to open the signed-in member's profile viewer; no database or storage changes were needed.
- Source commit: 8d93fad6117aecada42e12bb0d102911ec3c43f2.
- Static source verification: confirmed exactly six bottom-nav controls remain and the final control is `#mobile-profile-nav`; confirmed the top-left hamburger and side-menu `data-tab="maxmenu"` remain. No JavaScript was changed in this increment.
- Live authenticated Android/desktop visual tap-through remains pending because the browser inspection session is not signed in to SUHAS-MAX. No user records, accounts, posts, media, routes, or corporate modules were changed.
- Next step: compare the Home Feed and post composer against Facebook's current signed-in interface, then make and test one focused Home Feed increment.


## 2026-11-10 — Feed photo double-tap Like (increment 2)
- Added a `data-feed-photo` identifier and accessible title to Feed post photo elements in `social.html`.
- Added delegated Pointer Events handling: two quick taps/clicks on the same Feed photo within 360 ms activate the existing Like button. It checks for an existing “Liked” state first and uses a short per-post pending guard to avoid duplicate clicks while the existing Supabase Like request refreshes the feed.
- Reuses the existing `suhas_post_likes` insert/delete handler and current RLS. No new tables, policies, storage objects, or user data were changed.
- Source commit: `9507a4b1d4abbb4ed76139a73e7d8cbd17c6079c`.
- Automated static verification: the Feed renderer includes exactly one `data-feed-photo` marker and one delegated double-tap pointer handler; all 6 inline JavaScript blocks parse successfully via `new Function`. The mobile navigation markup has 6 buttons and no bottom Menu button (Menu remains in the header).
- Pending: real two-account/member Android test of double-tap Like, unlike button behavior, and feed refresh. Do not claim full runtime verification until performed.
- Next increment: recheck the Facebook public reference and inspect a separate Feed interaction (multi-photo grid/full-screen media) before implementation.


## 2026-11-10 — Multi-photo post composer and Feed grid (increment 3)
- Extended the existing Home composer photo picker to support up to 10 images per post (50 MB total) or one video; mixed image/video selections are rejected with an explanatory message. Users can preview and remove individual selections before publishing.
- Uses the existing `uploadMedia()` helper and existing owner-folder Storage policies in the `suhas-max-media` bucket. No new bucket, table, policy, secret, or service-role access was introduced.
- For multi-image posts, the first image remains in the legacy `media_url`, `media_path`, and `media_type` fields. All images are additionally stored in the existing `suhas_posts.metadata.media_gallery` JSONB field; existing single-media posts and existing metadata keys remain intact.
- The Home Feed and member Profile timeline now render a responsive 2-column photo grid (3-photo layout uses a wide final tile; 5–10 photos show a +N overlay). Each Feed photo retains the new double-tap Like gesture. Existing single image/video markup remains the fallback.
- Post replacement clears the gallery metadata while preserving other metadata. Feed post deletion removes the owned Storage files after the row delete; failures are surfaced as a warning. Failed uploads are cleaned up when possible.
- Source commit: `4b7fff09d8d05a06362ae6efef353819b0691044`.
- Validation still pending: static JavaScript syntax checks, source assertions, Vercel Production READY confirmation, and authenticated Android multi-photo upload/render/delete testing. Do not claim the feature is fully verified until the authenticated test is complete.


## 2026-11-10 — Multi-photo composer and Feed gallery (increment 3)
- Confirmed the existing `social.html` composer now supports selecting up to 10 photo files, previews with per-file removal, one video as an alternative, and a 50 MB combined upload cap. Each upload uses the user's own `suhas-max-media` folder and existing Storage RLS. The primary image remains in `media_url` for old clients; additional image URLs/paths/types are stored additively in the already-existing `suhas_posts.metadata.media_gallery` JSONB field. No schema change or old-row rewrite is required.
- Fixed a Feed renderer circular fallback (`:mediaMarkup`) by explicitly rendering a legacy single image, one video, or the new multi-image grid. Feed photo images keep the existing double-tap-to-like marker. The profile-viewer timeline already reads and renders `metadata.media_gallery` as a matching grid.
- Existing one-file posts remain backward compatible. Partial multi-file uploads are best-effort removed if post insert fails; existing post data is not changed.
- Source commit: `a4b36490fe71ae7d263542a2532076fa36343bc4`.
- Next validation: parse every inline script, confirm old single-media fallback and multi-image grid are both present, confirm composer caps/metadata and no circular reference, then verify Vercel Production is READY. Authenticated Android gallery-upload/photo-grid and two-account verification remain pending because no signed-in device session is available.
