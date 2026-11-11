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
- Static validation: all 6 inline JavaScript blocks parse successfully; source assertions confirm multi-file input, 10-file/50-MB limits, video/photo exclusion, gallery metadata, legacy single-media fallback, Profile timeline grid, Storage cleanup code, and the existing double-tap handler. Vercel deployment `dpl_4S9LtQFLhAM13Gsnkn9JAffF4LCN` is READY for Production. Authenticated Android upload/render/delete testing remains pending, so do not claim full end-to-end verification.


## 2026-11-10 — Multi-photo composer and Feed gallery (increment 3)
- Confirmed the existing `social.html` composer now supports selecting up to 10 photo files, previews with per-file removal, one video as an alternative, and a 50 MB combined upload cap. Each upload uses the user's own `suhas-max-media` folder and existing Storage RLS. The primary image remains in `media_url` for old clients; additional image URLs/paths/types are stored additively in the already-existing `suhas_posts.metadata.media_gallery` JSONB field. No schema change or old-row rewrite is required.
- Fixed a Feed renderer circular fallback (`:mediaMarkup`) by explicitly rendering a legacy single image, one video, or the new multi-image grid. Feed photo images keep the existing double-tap-to-like marker. The profile-viewer timeline already reads and renders `metadata.media_gallery` as a matching grid.
- Existing one-file posts remain backward compatible. Partial multi-file uploads are best-effort removed if post insert fails; existing post data is not changed.
- Source commit: `a4b36490fe71ae7d263542a2532076fa36343bc4`.
- Latest source validation: all 6 inline JavaScript blocks parse successfully; checks confirm the gallery metadata, 2-column grid, legacy single-image/video fallback, 10-photo/50-MB composer limits, and double-tap Like guard. Latest Production deployment `dpl_8S4ubXBYyrtY3HFReay271GznvSk` is READY and assigned to `suhasgroup.vercel.app`. Authenticated Android gallery-upload/photo-grid and two-account verification remain pending because no signed-in device session is available.


## 2026-11-10 — Feed photo viewer and album navigation (increment 4)
- Added an accessible full-screen Feed photo viewer in `social.html`. A single tap opens the viewer; previous/next controls, swipe navigation, Escape, backdrop click and Close button are supported. Multi-photo posts use the saved `metadata.media_gallery` URL list, and the selected photo opens at its matching index.
- Double-tap behavior: an unliked post invokes the existing Like button; if the post is already liked, double-tap opens the photo viewer rather than removing the Like. Corrected the Like-state word-boundary regex so `Liked` is detected reliably.
- Retained the existing mobile six-tab bar with Profile avatar at the final position and Menu in the header drawer.
- Facebook public reference was revisited. Logged-out Facebook exposes a public Watch video-card grid, but the news Feed, photo albums, photo grid, and media viewer remain behind login. SUHAS-MAX `/social.html` was rechecked and redirects unauthenticated visitors to `/login.html?next=%2Fsocial.html`.
- Static verification on the latest `social.html`: all 6 inline JavaScript blocks parse; the photo viewer, album URL/index handling, single-tap open, double-tap Like guard, previous/next and swipe handlers are present.
- Latest Production deployment: `dpl_4whrKf6Cao1B5jkvLt2tsSDrD8NW`, source commit `d8e397bd98af48a0c72c413319eb1b77377c040b`, state `READY`, aliases include `https://suhasgroup.vercel.app`.
- Authenticated Android testing of real user uploads, reactions, profile timeline and media interactions is still pending; do not claim full end-to-end verification until exercised in a signed-in session.
- Next increment: inspect and refine the post reaction/comment/share controls one focused change at a time, then repeat the Facebook public-reference check.


## 2026-11-10 — Feed post action controls visual and accessibility refinement (increment 5)
- Revisited Meta's official Facebook Feed interaction guidance and compared the current SUHAS-MAX mobile Feed against the supplied Android screenshot.
- Replaced the visually heavy 3D Like/Comment/Share controls in the Home Feed and Reels with a flat, high-contrast, touch-friendly action row: recognizable inline SVG icons, readable labels, visible counts, blue selected Like state, hover/pressed states, and accessible labels/pressed state.
- Preserved the existing delegated handlers and Supabase data operations: Like toggles rows in `suhas_post_likes`; Comment focuses the existing composer and inserts into `suhas_post_comments`; Share continues through the existing SUHAS-MAX share/repost dialog flow. Save remains available from the existing post-options menu and writes to `suhas_saved_posts`.
- Updated the comment composer sizing and post-options menu tap targets for mobile. No tables, policies, storage objects, records, routes, or other app pages were changed.
- Static verification: all 6 inline JavaScript blocks parsed successfully with `new Function`; source assertions confirmed Like/Comment/Share selectors and existing save handler are retained. Authenticated real-account mobile/desktop action tests are still pending; do not claim full end-to-end verification until exercised.
- Source commit: `0acc77fb426c07e15cb5517212e0dc348c5e6c2b`.
- Production deployment: `dpl_J1BYbHckZYF3WFa4rdM4vwCHqZqm`, state `READY`, target `production`, commit `0acc77fb426c07e15cb5517212e0dc348c5e6c2b`.
- Live verification: `https://suhasgroup.vercel.app/release.json` returned HTTP 200 with version `2026.11.10.9`; `https://suhasgroup.vercel.app/social.html` returned HTTP 200 and contains the new post-action CSS, updated Like/Comment/Share markup, and existing Save/Share handlers.
- Authenticated real-account mobile/desktop action tests remain pending; the page is protected and this browser session is not signed in. Do not claim full end-to-end verification until exercised.
- Next step: complete authenticated Like/Comment/Share/Save tests in a user-authorized session.

## 2026-11-10 — SUHAS-MAX full-app redesign: Post composer increment 1
- Scope: first isolated step in the user's requested Facebook-inspired, one-feature-at-a-time redesign. Reviewed Meta's official Facebook product update describing the current Feed, standardized multi-photo grid, double-tap Like, full-screen media, tab navigation, refreshed menu, audience/cross-post controls, simplified comments and profile experience.
- Audited the current `social.html` post composer, upload flow, audience dialog, metadata rendering and tool handlers. The core post flow already uses the existing `suhas_posts` table, existing `uploadMedia()` Storage helper, existing audience selector and current RLS. Existing photo gallery, background, location and feeling metadata paths are preserved.
- Changed the composer primary action label from misleading `Next` to `Post`, matching its actual behavior (submits the post immediately).
- Added `assets/suhas-max-composer-v1.css` for a clearer disabled/enabled Post state, touch-friendly focus treatment and honest styling for unsupported composer tools.
- Disabled Music attachment, Tag/collaborate, GIF search, Live video and Calls controls because their real provider/member-mention/streaming/calling integrations are not configured. The controls now expose an unavailable explanation instead of pretending the action works. Gallery, audience, background, location, feeling/life update and WhatsApp guidance remain on their existing handlers.
- Files changed: `social.html`, new `assets/suhas-max-composer-v1.css`.
- Source commits: CSS `6a999fb85d96606cde520e028c2e4ecfabed46e5`; composer `d58f3cb9b12159adbcd3f66ab212bf04726c94ab`.
- Static verification: re-fetched both committed files; all 6 inline JavaScript blocks pass syntax parsing; confirmed the new stylesheet is linked, primary button reads Post, unsupported controls are gated, and disabled styling exists.
- Not yet verified: live deployment completion, signed-in Android/desktop post submission, audience persistence, media upload, story creation, share/repost and profile actions. No database schema, existing records, user media, routes or accounts were changed.
- Next increment: inspect and improve the full post/feed experience (post preview, metadata/background rendering, post menu/edit/delete, reaction/comment/share states) with actual handlers and Supabase/RLS preservation; then continue Stories, Profile, Friends, Reels, Marketplace, Notifications, Menu/Search and Messenger one at a time.
- Cache/release follow-up: added the new composer stylesheet to the service-worker precache list, bumped service-worker cache key to `v96`, and published release `2026.11.10.10` so installed clients can receive the increment. Commits: `d40d14d9f94b43bbc97656e213692df0e367ce0f` and `5ed06d6a2346a22bd1e34ff84189c4579d618c13`.
- Production deployment for the latest commit: `dpl_JBwDeLNRBXFT7FCzPLLbhW59Rqii`, state `READY`, aliases include `https://suhasgroup.vercel.app`.
- Live verification: production `social.html` contains the composer stylesheet link and Post label; `release.json` returns `2026.11.10.10`; `sw.js` returns cache key `v96` and includes the new CSS in its core assets. This confirms source/deployment delivery, not signed-in user interaction.


## 2026-11-10 — Facebook-style post time and audience status (increment 6)
- Continued from the Home Feed/post experience audit; no full-app completion claim is made.
- Updated the Home Feed and member Profile timeline post queries to include the existing `audience` field, including fallback fetches for reposted posts. No database schema or records were changed.
- Added a shared relative post-time formatter: new posts show “Just now”, then minutes/hours/days, and older posts show a localized date. The exact timestamp remains available as the accessible/native time tooltip and `datetime` value.
- Added explicit audience status beside the post time: Public, Friends, or Only me, with distinct familiar icons. Existing audience selection, share restrictions, Supabase queries, and RLS remain unchanged.
- Changed file: `social.html` only.
- Source commit: `4d0e4dabf9f285b552e17905b716bd09e75cff28`.
- Static verification: all 6 inline JavaScript blocks passed syntax parsing; source checks confirmed the formatter and audience label are used in both Feed and Profile timeline, and audience is selected in all matching post fetches.
- Not yet verified: signed-in Android/desktop rendering, actual audience enforcement for different accounts, and live Production deployment for this commit. No authenticated browser session is available in this workflow.
- No tables, policies, user records, posts, media, pages, routes, or existing features were deleted or replaced.
- Next increment: audit the full post card and profile controls, then test the Feed/Composer/Profile flows with a real authenticated member session. Continue screen-by-screen through Stories, Friends, Reels, Notifications, Marketplace, Menu/Search, and Messenger; external integrations (Live, calls, third-party cross-posting, licensed music/GIF providers) remain separate dependencies.


## Latest Facebook-reference Profile redesign increment
- Compared the user-supplied Facebook Official Profile screenshot with the existing SUHAS-MAX profile viewer screenshot.
- Updated only the existing profile viewer styling in `social.html`: wider desktop profile surface, taller cover, large overlapping profile photo, clearer name/role and connection statistics, Facebook-like action button proportions, and a full-screen mobile profile layout.
- Added functional in-profile section navigation for Posts, About and Friends. The tabs scroll to the existing data-backed sections; no placeholder Photos/Reels tabs were added.
- Preserved existing Supabase profile reads, friend/follow/message actions, cover/avatar upload controls, and profile menu actions. No database schema, records, storage objects, or routes changed.
- Code commit: `738682a4aeaee9c3cd839175a95e7e6462c9950d`.
- Static verification: 6/6 inline JavaScript blocks parse successfully; profile tab markup, anchors, delegated click handler and mobile full-screen CSS checks passed.
- Not yet verified: real authenticated mobile/desktop rendering, profile image upload, and tab interaction on a live signed-in account. The supplied screenshots remain the visual reference; this increment does not claim a complete Facebook match.
- Next step: inspect the new production deployment, then test own profile and another member profile with real authenticated accounts; adjust spacing from actual device screenshots before moving to the next screen.


## 2026-11-10 — Keep Profile and Edit Profile inside SUHAS-MAX (navigation increment)
- Objective: ensure profile entry points and the profile editor stay inside the SUHAS-MAX social app rather than navigating to the SUHAS GROUP main website.
- Updated `social.html`: My Profile links are intercepted and open the existing in-app member Profile viewer; the Profile's Edit profile action and profile menu edit action open an in-app full-screen editor overlay.
- The editor overlay embeds the existing `profile.html?embed=1` form, preserving its Supabase-backed profile fields and save flow; embedded mode hides the corporate site header and provides a Back to SUHAS-MAX link instead of Main website.
- Updated browser route state to preserve the active SUHAS-MAX tab/profile and support the editor overlay in the URL/back-stack. Home/feed navigation remains on `social.html`.
- Changed files: `social.html`, `profile.html`. No database schema, RLS policy, user records, media objects, or existing social features were changed.
- Source commits: `e866da5c7cd1972b8e619a4cd38057da179bada5`, `ee10b64852c0e0e95640adb952981c07f5d4ec2e`, `f2d61f471ce1751987dd39d8956972ff83df8829`.
- Static verification: all 6 inline scripts in `social.html` and all 3 inline scripts in `profile.html` pass JavaScript syntax parsing; static checks confirm in-app editor overlay, embedded editor mode, edit action, profile-link interception, and back navigation hooks.
- Not yet verified: authenticated Android/desktop click-through, editor form save from inside iframe, image upload from real device, browser back/forward behavior on device, and live deployment. External third-party links (e.g. LinkedIn) and separate corporate modules are not converted into SUHAS-MAX screens by this increment.
- Next step: inspect Vercel Production deployment for commit `f2d61f471ce1751987dd39d8956972ff83df8829`; then test Profile → Edit Profile → Save → Back and the bottom Profile/Home navigation using an authenticated account. Continue routing any remaining first-party social-app links to in-app screens without changing corporate modules.


## 2026-11-10 — Attach profile and cover camera controls to photo corners
- User screenshot showed both camera controls detached: profile camera floated above the avatar and cover camera appeared near the bottom of the profile content.
- Root cause: the camera buttons were siblings of their photo elements, so their absolute positioning used the wrong containing block. Moved the cover camera button inside `#profile-viewer-cover` and wrapped the avatar plus its camera button in `.profile-viewer-avatar-wrap`.
- Added scoped CSS to anchor cover camera at the cover's bottom-right corner and avatar camera at the avatar's bottom-right corner; corrected flex sizing so the name, verification badge, and menu retain their layout.
- Existing Gallery picker, preview, cancel, and Supabase upload/save logic remains connected to the same button/input IDs. No database or storage policy changes.
- Commits: `3993069ea31164be92d92557047e3fd4dcbf9a98`, `8dcb116e9ec2c01f1760937a8168bd73aecf92b9`.
- Static verification: 6/6 inline JavaScript blocks parse; static checks confirm both buttons are nested within their respective photo containers and existing preview/save handlers remain present.
- Still required: verify visual placement and gallery/save behavior on an authenticated Android device after deployment.


## 2026-11-10 — Runtime-enforced photo camera placement
- Rechecked the user's latest screenshot and the full cascade of legacy CSS rules. Earlier static CSS was not sufficient because later profile-detail styles also target the same camera controls.
- Added runtime positioning in `openMemberProfile()` after owner permissions are determined. It applies important inline styles to anchor the cover camera to the cover's bottom-right and the avatar camera to the avatar wrapper's bottom-right, and explicitly toggles display for owner/non-owner profiles.
- Preserves existing camera button IDs, file inputs, image preview and upload/save handlers.
- Source commit: `2cfbb41cf39b8545be70bef074228c98a00a474a`.
- Static validation: 6 inline scripts; syntax errors: 0.
- Pending: wait for Production deployment and confirm visual placement on the user's Android device.


## 2026-11-10 — Feed engagement visibility and larger profile photo
- User reported that post engagement was not visible and the profile avatar was too small; the corner camera control still needed refinement.
- Updated `social.html` feed rendering to show a Facebook-style engagement summary below each post: first liker plus additional liker count, comment count, and repost count. Expanding the summary shows the names and profile photos of people who liked and reposted.
- Existing comment list remains rendered below action buttons with commenter names; engagement profile lookup now includes likers and reposters as well as commenters.
- Increased the Profile viewer avatar and its containing wrapper from 58px to 76px on mobile and desktop; increased the attached camera control to 30px and kept it anchored to the avatar's bottom-right corner.
- No database schema or existing post/like/comment/repost records were changed. The current app supports Like reactions only; external share events are not persisted in a share table, so the visible share-related count is explicitly labelled Reposts and does not pretend to count external shares.
- Source commit: `835f92f425169d80947338ecfdf18c8da3c6829d`.
- Static validation: all 6 inline scripts pass JavaScript syntax parsing; checks confirm likes/comments/reposts queries, visible engagement summary, liker/reposter name lists, 76px avatar and 30px camera control.
- Pending: production deployment and authenticated Android verification of engagement visibility, avatar size, and photo upload/save.


## 2026-11-10 — User-confirmed permanent no-regression rule
- User explicitly reported that new implementations have been causing previously existing steps/features to disappear and instructed that this must not happen again.
- Added mandatory Rule 10 to `DEVELOPMENT_RULES.md`: additive-only enhancements, preserve every existing feature/control/layout/route/data flow, inspect before edits, use minimal scoped patches, maintain regression checklist, test adjacent behavior, and never silently remove conflicting functionality.
- This is a process safeguard, not a claim that the whole app has been regression-tested. Future increments must include before/after regression checks and record unverified items.
- Rules commit: `997604a5abbb32a04e11130206270914c7afae31`.
- Next work: before the next SUHAS-MAX feature edit, read the latest rules/checkpoint, inspect the current screen and existing handlers, write a control/regression checklist, then implement one small additive increment.


## 2026-11-10 — Feed comments collapsed by default, light presentation
- User requested that comments not be visible beneath every post until the Comment button is tapped, and that comment text/background remain black-on-white/light like the post feed rather than dark bubbles.
- Wrapped the existing feed comment list and comment form in a per-post closed-by-default `details` panel. The existing Comment button now toggles only that post's panel and focuses the existing composer when opening.
- Preserved the comment count on the Comment button, the comment records/query/rendering, commenter profile links, comment submit form, Like and Share controls, engagement summary, and post layout. No DB schema or records changed.
- Added scoped light styling for the feed comments panel and comment bubbles, including a dark-theme override so the comments remain white/light grey with black text as requested. This is limited to `#feed-list`; Reels and other comment surfaces were not changed.
- Source commits: `c20e4f96c8d9607fa43f30b1969183286a2ee269`, `5b74fc8f58e3ce99132b2caf3080924ffacf9b90`.
- Static validation after the change: all 6 inline scripts parse without syntax errors; static checks confirm closed details wrapper, toggle handler, comment form, Like, Share, and existing engagement summary are present.
- Pending: Production deployment and authenticated Android interaction/visual verification (tap to open, tap again to close, submit comment, refresh, dark/light mode).


## 2026-11-10 — Profile cover full-width gap fix
- User screenshot showed the profile cover ending early with an empty white strip on the right.
- Root cause from current markup/CSS: the profile close button was floated right before the cover block, allowing the cover block to flow beside the float and shrink in width.
- Added a narrowly scoped style override: close button is now absolutely positioned at the top-right (removed from normal flow); cover block is explicitly full-width with 100% width/min/max and border-box sizing. Kept the existing cover height/background, cover camera position, profile avatar camera, and upload inputs unchanged.
- No existing controls, features, routes, or data were removed or rewritten.
- Source commit: `19887d8170dae7fc49d34f27232c3f2fa88bd620`.
- Static checks: all 6 inline scripts parse without syntax errors; cover full-width override, close no-float positioning, cover camera, avatar camera, and cover upload input all remain present.
- Pending: production deployment and Android visual verification that the right-side gap is gone and Close / cover-camera controls remain usable.


## 2026-11-10 — Profile cover viewport-width correction v2
- User reported the prior full-width cover CSS did not change the visible right-side gap.
- Re-inspected the real markup: `#profile-viewer` contains `.profile-viewer-card`, then `#profile-viewer-close` and `#profile-viewer-cover`. Previous selector targeted the wrong card close-button relationship in part and did not force the mobile viewer/card to the viewport width.
- Added a mobile-only v2 override forcing the open profile viewer, its direct card child, and cover element to `100vw`, with full-width flex basis, zero margins/padding, and no horizontal overflow. Close control is fixed to top-right safe-area position. Existing cover/avatar camera controls and photo editor/save inputs remain unchanged.
- Source commit: `0d6acc339941a0cc6fea2ab504fe00cfc0412f00`.
- Static validation: all 6 inline scripts parse; cover/avatar camera and image editor save controls remain present.
- Pending: production deployment readiness and Android visual verification; prior fix was not visually verified and user reported it did not resolve the gap.


## 2026-11-10 — Profile cover/avatar 3D visual polish
- User supplied two visual references: a cover/header treatment and a large circular profile portrait with a camera control attached at the lower-right.
- Kept the existing dynamic cover photo source and upload/save behavior. Refined the cover as the top banner with image-cover sizing, subtle dark lower gradient, and a raised blue/silver camera control at bottom-right.
- Increased the profile avatar to 116px desktop / 104px mobile and made it overlap the cover's lower edge. Added a white raised rim, soft 3D shadow, and attached metallic-blue camera button at the avatar's bottom-right. Kept existing owner-only hidden behavior, gallery input, preview, cancel, and save workflow.
- Refined the profile name/subtitle row with restrained dark-blue/grey colors. No routes, sections, buttons, DB records, or existing profile functions were removed.
- CSS source commits: `5d512b09470438a60b842fd405749424eaf83840`, `a0759a6f8eb58a4ab3fbd2cdd3628957dca5659c`.
- Static validation on latest source: all 6 inline scripts parse; dynamic cover image assignment, cover/avatar camera buttons, larger avatar sizing, bottom-right camera placement, identity row selector, image save control, and both file inputs are present.
- Pending: Production deployment readiness and visual/functional verification on Android with an authenticated profile. CSS-only appearance has not yet been confirmed on a real device.


## 2026-11-10 — Android full-screen profile viewer v3
- User screenshot showed the profile viewer rendered as a centered narrow modal (~80% of visible width), not a full-screen mobile profile. The CSS viewport in the Android custom tab evidently did not match the 760px breakpoint; additionally later legacy avatar-image rules were overriding the larger avatar image.
- Added final high-specificity override targeting both `max-width:1100px` and coarse-pointer devices. The open profile viewer/card now fills 100vw × 100dvh, with scrolling inside the card and no modal side gutters.
- Explicitly sized the avatar wrapper AND its child image to 112px, attached the profile camera at the lower-right, and set the cover camera as a circular 3D control at the cover's lower-right. Kept cover at top, image upload inputs, preview and Save workflow, and all profile sections.
- Source commit: `6b1cab7822122d4b0cc6c4bad5f2beb99bb54e44`.
- Static validation: all inline scripts parse; cover/avatar camera controls and image Save button remain present.
- Pending: production deployment readiness and visual confirmation on user's Android device. Do not claim device-level visual test completed.


## 2026-11-10 — Friend requests, live message alerts and compact composer (increment)
- Objective: make incoming friend requests actionable and visible by member name, add in-app live notification bubbles for friend requests/direct messages, preserve the existing reply-capable Messenger, and make post composer controls compact with white surfaces and black text.
- Audited live Supabase schema and RLS before editing. Existing tables are retained: `suhas_friend_requests`, `suhas_notifications`, `suhas_conversations`, `suhas_conversation_members`, and `suhas_messages`. All have RLS enabled.
- Verified the existing database triggers: friend-request INSERT creates a recipient notification; message INSERT creates a notification for the other conversation participant. Verified authenticated notification SELECT/UPDATE are recipient-only, friend-request SELECT/UPDATE/DELETE are participant/recipient scoped, and message reads/sends are conversation-member scoped.
- Updated the incoming request card to show the sender's profile name/photo plus Confirm, Cancel (decline), and Delete. Confirm marks the request accepted; Cancel marks it declined; Delete removes that pending request using the already-existing participant DELETE policy. Each action reloads the request list, so the pending action controls disappear after completion. Outgoing requests retain Cancel request; this removes the sender's own pending request.
- Added live in-app notification bubbles from the existing recipient-filtered Supabase Realtime subscription. Friend-request bubbles open Friend Requests; message bubbles open the relevant Messenger conversation. The notification center rows now mark read and route to the related request/chat/post. Existing message compose/send/reply flow is preserved.
- Made post composer option controls compact, rounded, Facebook-style chips instead of large tiles; composer and writing fields remain white with black text. No composer tool, existing post action, or existing page section was intentionally removed.
- Changed file: `social.html`. No database schema, policies, triggers, records, messages, friend requests, posts, media, routes, or existing feature records were changed.
- Source commit: `eb108a0dd85fe2da64be0c0a932b059be1db82e5`.
- Static verification: all 6 inline JavaScript blocks parse with zero syntax errors. Source checks confirm incoming Confirm/Cancel/Delete, outgoing Cancel, live friend/message notifications, notification-to-chat routing, existing Messenger compose/reply handler, compact composer CSS, and white/black composer colors.
- Backend verification: live schema and policies inspected; notification triggers confirmed for friend request and direct message inserts. No SQL migration was required.
- Not yet verified: two real authenticated accounts sending/receiving friend requests and messages on Android; push notifications when the app is closed/backgrounded are not implemented by this in-app bubble and require browser/PWA push subscription plus delivery infrastructure. The current increment provides live in-app alerts while SUHAS-MAX is open.
- Next step: deploy this exact commit to Vercel Production, then perform two-account device testing. If a request/message event fails, inspect Supabase Realtime and RLS logs before changing schema.

## 2026-11-10 — Home navigation row regression repair
- User screenshot showed the Home/Friends/Reels/Market/Alerts/Profile navigation rendering as full-width stacked rows with alternating blue bands instead of one compact horizontal shortcut bar.
- Audited the latest social.html cascade. Multiple legacy responsive overrides set the same navigation container to both flex and grid, while generic button styling could leak active/gradient backgrounds into the shortcut controls. The screenshot also exposed that the six destinations were not being held to a single consistent row.
- Added a final, narrowly scoped navigation-only CSS guard in social.html: six equal columns, one horizontal row, fixed compact height, white surface, transparent button backgrounds, blue active icon/text only, correctly sized profile avatar, and touch-friendly tap feedback. The desktop-mode preference still hides the mobile bar. All existing tab IDs, data-tab routes, event handlers, and profile avatar click behavior remain unchanged.
- Bumped the service-worker cache fallback from v97 to v98 so the repaired page is refreshed instead of being kept behind the prior cached shell.
- Source commit for UI repair: 597e860784a26cec8362c9bb0b28345dd2a4bd4e; service-worker/cache and checkpoint updates follow separately.
- Static verification: source markup still contains exactly six navigation controls (Home, Friends, Reels, Marketplace, Notifications, Profile); existing data-tab targets and #mobile-profile-nav remain. CSS override is appended after previous navigation rules.
- Pending: Vercel production build/live verification and user screenshot confirmation on the same laptop/browser. No account data, posts, messages, database schema, or existing social features were changed.


## 2026-11-10 — Force Home navigation into one horizontal row
- User clarified that Home, Friends, Reels, Market, Alerts and Profile must appear side by side, never vertically stacked.
- Added a final high-specificity responsive override in `social.html` that forces the existing six controls into six equal horizontal columns, one row, across mobile/tablet/desktop and desktop-mode; keeps icon/label vertical within each tab, but all six tabs side by side.
- Removed the desktop-mode CSS exception that hid the mobile six-tab bar; preserved the existing tab IDs, data-tab routes, click handlers, profile-avatar action and underlying features.
- Bumped the service-worker cache fallback from v98 to v99 to prevent the prior cached layout from persisting.
- Source commits: UI `30d0307c6a3c4684d57803bc505e75eb90b93a75`; service worker `9f7ab1da5acc82d6f1d499ac95cc23b85205b9bc`.
- Static source checks: six existing destination controls retained; final override specifies six equal columns, row flow, fixed bottom placement and transparent active backgrounds.
- Pending: Vercel Production deployment and real laptop/browser visual + tap verification. No user records, posts, messages, database objects or routes changed.


## 2026-11-10 — Fix saved cover photo not rendering
- Investigated the user's Hasnain Abir profile: the cover image object exists in the public `member-avatars` bucket (PNG, 2,789,626 bytes), and both `suhas_public_profiles.cover_photo_url` and `suhas_member_profiles.cover_photo_url` contain the same saved URL.
- Root cause: later profile CSS declared a blue gradient with `!important`, which overrode the normal-priority inline `backgroundImage` set by profile loading and by the save handler. The saved photo was therefore hidden by CSS even though persistence succeeded.
- Fixed both profile-load and immediate-save paths in `social.html` to set `background-image` with inline `!important`, ensuring the persisted URL takes precedence over gradient theme rules.
- Bumped service worker cache fallback from v99 to v100.
- UI commit: `99cabecbeac1a143c3a980a580e4bf662ec04b9e`; cache commit: `6633381040491ecf6a3fef38f1ea9230dd8d38a1`.
- No user profile data, cover object, other photos, or social features modified.
- Pending: Vercel Production deployment and visual confirmation after refresh.


## 2026-11-10 — Remove misplaced header pencil
- User screenshot showed a pencil icon overlapping the SUHAS-MAX wordmark in the mobile header.
- Confirmed it was the header-only `#header-profile-edit` button, separate from profile-page editing controls.
- Added a scoped CSS rule to hide only `.site-header #header-profile-edit`; profile edit actions inside the profile page remain available.
- Bumped service-worker cache fallback from v100 to v101.
- UI commit: `c68c658541d2feb5cc3b2d3c94bf293b4e2bbaa6`; cache commit: `2920df093a499f389f5e424fc1f8aba5ba931b99`.
- Pending: Production deployment and visual verification.


## 2026-11-10 — Facebook-style Messenger inbox and unread count
- User requested the header Messenger icon to open a Facebook-like Messenger page and show numeric unread counts (1, 2, 5, etc.) that disappear/reduce as conversations are opened/read.
- Confirmed existing Supabase messaging schema: `suhas_conversations`, `suhas_conversation_members`, `suhas_messages` with `read_at`; participant-only SELECT and recipient-only mark-read RLS policies are already in place.
- Confirmed `suhas_messages` is already included in the `supabase_realtime` publication; no database schema or RLS changes required.
- Added a numeric red badge to the header Messenger icon (no notification label), exact unread count with 99+ cap, per-conversation unread counts, and Realtime INSERT/UPDATE refreshes.
- Messenger panel is now styled as an inbox + conversation layout; header activation explicitly scrolls the opened Messenger panel into view.
- Removed automatic opening of the first conversation when entering Messenger, so merely opening the inbox does not mark a message as seen. Opening a conversation still marks incoming messages read using existing `read_at` logic.
- Existing message send, conversation, read receipt and access-control paths preserved.
- Source commits: `3503be35dea2cecacd6e8803c946a6fbf79d6e1e` (badge/inbox), `30facdbf5cb4ae2aa0653c5da66967f505544050` (header open/scroll); service worker cache bumped to v102 in `1c608b7731ab7db30e956c0d9da761149be507c8`.
- Database read-only check: current account has 1 conversation and 0 unread messages at check time. No test messages or user data were inserted/modified.
- Pending: Production deployment and real-device verification of incoming-message badge updates.


## 2026-11-10 — Header search toggle and live profile suggestions
- User reports tapping the header search icon does not open search; requests Facebook-style name search with profile photos.
- Existing markup/results renderer already provided member suggestions from loaded `members`, including photo, name, position/company/location, and profile-opening data attributes.
- Fixed the header search toggle to open/close the search input in-place without navigating away from the current Home page.
- Search input now filters the already-loaded member directory immediately and displays matching profile-photo/name rows; removed unnecessary async people-page rendering from each keystroke.
- Escape closes the search. Mobile dropdown/input positioning and z-index/visibility were hardened.
- UI commit: `79e7dd4bc346ef82f804a5e103620bb8e30a2ca3`; service worker cache bumped to v103 in `fb809644e6fdf535080674f636d13697ec2ab444`.
- Pending: Production deployment and real-device visual verification.


## 2026-11-10 — Header Create menu media picker routing
- Audited the existing Create menu and media handlers in `social.html`; existing upload flows and Supabase storage/post/story tables were retained.
- Fixed Story menu routing: it now opens the existing Story creator dialog and launches the native photo/video picker instead of only scrolling to and focusing the story text field.
- Fixed Video menu routing: it now opens the Reels tab and launches the existing MP4/WebM Reel file picker, instead of sending the video into the ordinary feed-post photo/video picker.
- Photo continues to open the feed photo picker; Reel continues to open the Reels video picker. Existing previews, upload handlers, publish buttons, and data flows are preserved.
- Code commit: `41ab47d97007144a6ff030bc8f220b323caa9ef3`.
- Static inspection confirms the four menu actions now point to their intended existing pickers. No authenticated Android gallery selection, media upload, or two-account viewing test was performed in this increment; those remain pending.
- Production deployment/live verification: pending. The Vercel project API returned 403 Forbidden in this session; do not claim the live site is updated until deployment access is restored and the production URL is checked.
- Recovery point: commit `41ab47d97007144a6ff030bc8f220b323caa9ef3`; next step is deploy the main branch and test Story, Photo, Video, and Reel on Android with an authenticated account.


## 2026-11-10 — Create menu native-picker activation correction
- Follow-up review identified an important mobile-browser constraint: calling a file input after an awaited tab switch or timer can lose the direct user activation required to open Android's native picker.
- Updated the Create menu to open a temporary native file picker synchronously in the original menu-item tap. Once the user chooses files, the files are passed to the existing hidden Story, Post, or Reel file input and its existing preview/upload handler is triggered.
- Story opens its existing creator dialog without launching a second picker. Photo selects images for the existing multi-image post composer. Video and Reel select a video for the existing Reels composer.
- This is an additive routing fix; existing Supabase storage, table writes, and publish actions remain unchanged.
- Corrected implementation commit: `c4574ad63a7e504858b2c80baf4962f6e24ca1df`.
- Static source review completed. Real Android picker, preview, upload, and publish verification remains pending.
- Deployment remains blocked/unverified: Vercel project and deployment reads returned 403 Forbidden in this session. Do not tell the user the production site is updated until an authorized deployment succeeds and the live site is checked.
- Recovery point: `c4574ad63a7e504858b2c80baf4962f6e24ca1df`; deploy main and exercise all four Create actions on Android.


## 2026-11-10 — Cloudflare Pages migration preparation
- User requested migration from Vercel to Cloudflare Pages, with preference to retain the current site address.
- Repository inspected: `suhasgroupin-web/suhasgroup`; this is a static multi-page HTML/PWA site with no root `package.json`, no `wrangler.toml`, and no `vercel.json`. Cloudflare Pages Git integration can deploy it without a build command; expected output directory is the repository root (`.`).
- Added a Cloudflare Pages-compatible `_headers` file with conservative HTML revalidation, no-cache service worker/release metadata, one-hour asset caching, and basic response security headers. This file is ignored by Vercel as ordinary static content and does not alter existing app code.
- Preparation commit: `39f8435f7e128c649d2e958ae3dc264aabd5108e`.
- Cloudflare account is not yet created/connected. No Cloudflare Pages project or deployment exists yet.
- Current public URL in repository metadata is `https://suhasgroup.vercel.app`. This is a Vercel-owned subdomain and cannot be reassigned to Cloudflare Pages. Prior conversation says ownership of `suhasgroup.in` was not established and user previously stated they do not own a custom domain. Do not alter canonical URLs, sitemap, DNS, or Vercel production while the replacement domain is unresolved.
- Next required user actions: create a free Cloudflare account, authorize Cloudflare Workers & Pages GitHub App for repository `suhasgroupin-web/suhasgroup`, and choose a domain that the user owns for production. If no owned domain is available, use the temporary `*.pages.dev` hostname until a custom domain is registered.
- After authorization: create a Pages Git-integrated project with production branch `main`, no build command, output directory `.`; deploy and verify all routes, PWA manifest/service worker, Supabase auth, media uploads, and realtime features before changing any DNS.


## 2026-11-10 — Facebook-style Messenger conversation list upgrade
- User asked to activate Messenger with Facebook-like behavior. Preserved the existing Messenger implementation, Supabase schema, message rows, RLS policies, Realtime channel, online presence, unread counter, two-way send/receive, and read receipts.
- Audited production source `social.html` and Supabase project `ehvgxbifqtyajeersnvq`. Existing tables `suhas_conversations`, `suhas_conversation_members`, and `suhas_messages` are present with RLS enabled. Existing policies enforce conversation membership, sender ownership, message preferences, and recipient-only read marking.
- Confirmed `suhas_messages` is in `supabase_realtime`; conversations and membership tables are not, but the current app uses realtime on messages and refreshes thread membership on demand. No schema changes were necessary.
- Added conversation search by participant name or message text, most-recent-message sorting, latest-message preview, online indicator in each thread, and retained unread counts. Existing profile/member search remains.
- GitHub commit: `acb43100acf69f483bfccee4ffd2b71d01aecb8c` on `main`.
- Security advisor scan returned unrelated existing findings: two LinkedIn tables with RLS but no policies, a push-dispatch SECURITY DEFINER RPC executable by anon/authenticated, and leaked-password protection disabled. These were not changed as they are outside the Messenger task and must be reviewed separately.
- Static/source and database schema/RLS/Realtime checks completed. No authenticated end-to-end test was performed because no signed-in browser profile is connected. Production deployment status not verified; Vercel remains enabled and was not disabled or modified.
- User's permanent project constraint: additive development only; preserve existing features and data; never turn off Vercel or delete/replace existing work without explicit permission.
- Next verification: user should refresh `https://suhasgroup.vercel.app`, open Messenger, and test sending/receiving with a second signed-in account; confirm unread badge and Seen status.


## 2026-11-10 — Dedicated Messenger inbox and send repair
- Added a full-screen, in-app Messenger page overlay to `social.html`; it stays within SUHAS-MAX and does not navigate to an external Messenger site.
- Added Back to SUHAS-MAX and Back to inbox controls; mobile layout shows the conversation list first and the selected chat as a separate view.
- Fixed the one-conversation send path: if there is exactly one visible conversation and none is active, Send opens it before inserting the message. Multiple conversations still require an explicit selection.
- Reused existing `suhas_conversations`, `suhas_conversation_members`, and `suhas_messages` tables and existing RLS/Realtime setup; no schema changes or data deletion.
- Commit: `293f7edec732ca8fac236547e2f6106b159d05e9`.
- Verification: re-fetched committed source and confirmed the page controller, inbox/back controls, single-thread send fallback, and existing message table references are present. Authenticated end-to-end send/receive testing and production deployment remain unverified.


## 2026-11-10 — Suhas Messenger home redesign
- Added a Messenger-style black home shell to `messenger.html`: Messenger header, compose/settings controls, notification-permission banner, unified search, All/Unread/Groups shortcuts, and bottom Chats/People/Alerts/Menu navigation.
- Restyled the existing authenticated SUHAS-MAX inbox inside the Messenger frame; kept the underlying Supabase conversations, message send/receive, realtime, and seen status implementation intact.
- Inbox view now hides the chat pane until a conversation is selected; opening a conversation reveals the chat panel.
- Repository commits: `8699763` (main redesign), `379b010` (filter and inbox-view polish).
- Cloudflare Pages and Vercel production deployment status was not verified from this change; user must confirm the live page after deployment.


# SUHAS-MAX A–Z Master Upgrade — Initial Audit
Date: 2026-11-10
Branch: main
Project: existing SUHAS-MAX application (preserve; no replacement)

## Scope and safety
- Reviewed repository root, permanent development rules, latest development checkpoint, social.html structure, Supabase public table inventory, migration history, selected RLS policies, and Vercel production deployment history.
- No user data, database records, storage objects, authentication settings, or production configuration were modified during this audit.
- Existing visual design is the baseline. Preserve it where it already meets the requested Facebook-inspired behavior; improve only inconsistent or incomplete areas.
- Vercel remains enabled. Do not switch hosting or remove any existing modules.

## Repository inventory
- Root entries: 55 (directories and files).
- Existing HTML pages: about.html, admin.html, ai.html, app.html, apply-for-job.html, contact.html, departments.html, download.html, edit-suhas.html, employers.html, factories.html, factory-profile.html, group.html, hrm.html, index.html, job-portals.html, job.html, jobs.html, login.html, measurement-studio.html, member-page.html, member-tools.html, messenger.html, o5-all-in-one.html, o5-barcode.html, o5-calculator.html, o5-desk.html, privacy-policy.html, profile.html, quality.html, related-apk.html, religion.html, reset.html, signup.html, social.html, suhas-calculator.html, technical.html, plus other static assets/configuration.
- Main social interface: social.html, approximately 497 KB.
- Main social sections found in social.html: feed, maxmenu, people, friends, requests, following, groups, marketplace, reels, gaming, saved, settings, notifications, messages, suhas-profile-editor, profile-viewer, profile-viewer-posts, profile-events-panel, profile-friends, profile-about.
- Main social interface source count: 247 <button> elements and 11 inline onclick attributes at audit time. These are source counts, not a claim that all controls are functional or tested. A complete rendered-control inventory still needs runtime browser enumeration.
- 17 script tags in social.html at audit time.

## Supabase baseline
- Project ID: ehvgxbifqtyajeersnvq.
- 42 public tables observed; all returned with RLS enabled.
- Existing social tables include profiles, suhas_member_profiles, suhas_friend_requests, suhas_follows, suhas_conversations, suhas_conversation_members, suhas_messages, suhas_public_profiles, suhas_posts, suhas_post_likes, suhas_post_comments, suhas_notifications, suhas_groups, suhas_group_members, suhas_group_posts, suhas_marketplace_listings, suhas_group_invites, suhas_account_preferences, suhas_stories, suhas_story_views, suhas_post_reposts, suhas_saved_posts, suhas_push_subscriptions, and creator monetization application/earnings/payout tables.
- 28 recorded migrations observed.
- Existing member_settings has an owner-only ALL policy (auth.uid() = user_id).
- Existing suhas_account_preferences has owner-only SELECT/INSERT/UPDATE policies.
- Creator monetization tables have creator/admin-scoped policies. Existing verified-earnings ledger is empty at audit time; do not fabricate earnings.
- No schema migration was applied during this audit.

## Existing feature coverage confirmed from source/schema
- Social feed and post composer; post likes/comments/reposts/saved posts.
- Friends/follow relationships and requests.
- Messenger conversations/messages with read_at and realtime configuration (authenticated two-account test still required).
- Notifications.
- Groups and group posts.
- Marketplace listings.
- Stories and story views.
- Reels and gaming UI.
- Creator monetization application, verified earnings ledger and payout workflow foundation.
- Profile/member profile and member settings tables.
- Push subscription/dispatch foundation.
- LinkedIn OAuth secure-storage tables exist; provider/API approval and end-to-end LinkedIn login remain separate integration work.

## Confirmed gaps / risks
1. Current Settings screen is limited: Preferences, Appearance, Feed & media, Privacy & account, Account security, and Creator Monetization are present, but the full requested Accounts Center, privacy controls, notifications preferences, feed controls, blocking, language, accessibility, activity log, ads, payments, data permissions and help categories are not yet complete.
2. Existing settings save routine currently stores theme/text/autoplay/motion/audience in browser localStorage and reports “saved on this device”; it is not yet a cloud-synced settings experience.
3. Existing menu and navigation handlers require a rendered mobile/desktop browser test; static inspection is not proof every control works.
4. No authenticated browser session is available for real two-account end-to-end tests in this audit.
5. Vercel production history at audit time shows latest READY production SHA c59663b72626e7bf648dd68c32ef9a91e28d68a1. Latest source commit 9b15ea30705635bb330777547470d1a6eb9e5535 has no matching deployment record. A manual deployment request was rejected by Vercel with HTTP 402 rate limit (api-deployments-young-hobby-team-24h; retryAfter 86400 seconds). Do not claim the latest source is live.
6. No real ad-provider integration or verified per-view ad revenue tracking is confirmed; monetization must not promise per-view payments yet.

## Phase plan and exact progress
- Phase 01 — Settings and three-dot menus: audit completed; implementation and control-by-control tests pending.
- Phase 02 — Header and bottom navigation: source has direct tab actions, but mobile/desktop runtime tests pending.
- Phase 03 — Profile system: source/schema inspection pending.
- Phase 04–15 — continue in the exact order from the user's master prompt; not started in this audit.

## Verification performed
- Repository root listing and permanent rules/checkpoint read.
- social.html section/button/script source count.
- Supabase table inventory, migration history and selected RLS policy inspection.
- Vercel production deployment history inspection.
- No browser interaction tests, device tests, build tests or deployment of this audit were performed.

## Recovery / next action
- Preserve current main branch and all user data.
- Begin Phase 01 by implementing a searchable, grouped Settings dashboard using existing owner-scoped preferences where possible; do not label unsupported controls active.
- Build a control register and test each implemented settings/menu action.
- Deploy only after Vercel rate-limit clears or an authorized native deployment path is available; verify live behavior before marking complete.



## Phase 01 progress update — Settings foundation
Date: 2026-11-10
- Expanded the existing Settings & Privacy screen with searchable, grouped sections: Accounts Center, Privacy & audience, Notifications, Feed preferences, Language & region, Media, Accessibility, Activity log, Ads & payments, Data & permissions, Help & support. Existing Appearance, Feed & media, Privacy & account, Account security and Creator Monetization sections retained.
- Connected preferences to the existing owner-scoped Supabase member_settings.preferences JSONB record and existing suhas_account_preferences table. Uses the signed-in user ID and upsert; no service-role key or new migration used.
- Account preferences written only to existing schema fields: profile_searchable, show_company, show_location, show_skills, allow_friend_requests, allow_messages, email_notifications.
- Cloud settings load merges the suhas_max preference object and privacy fields; the UI reports success only after both upserts succeed.
- Retained secure Supabase auth.updateUser password update flow and Creator Monetization UI/application/payout/admin components.
- Added explicit notes where full workflows are not implemented (deactivation/deletion, full activity log, ads controls, payments, data export, push/SMS provider delivery). These are not presented as working features.
- Added responsive Settings group styling and accessible search input.
- GitHub commit: f2d7f35983bed28c92285ce9917ef638501d3582.
- Static verification after commit: confirm latest source SHA, settings search control, settings categories, both cloud upsert calls, monetization presence, password update flow, and section/button counts. This is source-level verification only; no authenticated browser/device QA has yet been performed.
- Deployment: not verified; Vercel deployment API previously returned HTTP 402 rate-limit. Do not call this production-live.
- Phase 01 is IN PROGRESS, not complete. Remaining: finish contextual three-dot menu destinations, validate all settings with authenticated sessions, test settings save/load across devices and verify menu controls in mobile/desktop browser.



## Phase 01 — live menu defect fix (2026-11-10)
- User requested the full master prompt to be run step by step on the existing SUHAS-MAX application.
- Inspected the existing menu drawer and click handler. Found a concrete defect: the “See more” handler was toggling `.max-menu-grid` instead of the actual `#max-menu-extra` element. The shortcut directory therefore could not expand as intended.
- Fixed the handler to toggle the correct `#max-menu-extra` element and update its accessible expanded state and arrow glyph. Added focus-visible styling and explicit hidden/expanded display rules.
- Commit: d8110b9598f072502c34e7ffa47ae5270b6da92d (main).
- Existing app, Vercel project, Supabase project and user data were not deleted or replaced. No database schema change.
- Next: verify the Git-triggered Vercel production deployment for this commit, then test menu open/close, See more/See less and every shortcut destination in authenticated mobile and desktop sessions. Continue Phase 01 before Phase 02.



## Execution run — Phase 01 source audit continuation
Date: 2026-11-10 (Dhaka)
- Re-opened current main branch sources for social.html and messenger.html; current social.html source SHA: 07fab8ccee7cc8dbc41d5918eb5252522bd2a71b.
- Verified current Settings screen contains the searchable settings field, Save/Reset actions, cloud preference load/save routines, password update form, and creator monetization application/dashboard section.
- Verified existing Supabase schema for suhas_account_preferences: user_id, profile_searchable, show_company, show_location, show_skills, allow_friend_requests, allow_messages, email_notifications, updated_at. Existing authenticated RLS policies restrict SELECT/INSERT/UPDATE to the row owner. member_settings has an authenticated owner-only ALL policy. No schema changes made.
- Verified menu source contains shortcut navigation, See more expansion handler, Settings/Privacy sections, Help/Support links, close/scrim handler, logout handler, and a single delegated data-tab router. All routed tabs are checked against an explicit allowlist before activation.
- Current menu route allowlist includes feed, people, friends, saved, groups, marketplace, reels, gaming, requests, following, notifications, messages, settings, maxmenu. Separate Video tab, Pages, Live, and several other A–Z modules are not yet present as independent destinations.
- Vercel project suhasgroup (project ID prj_euvijh8UOSSoVISVmaFTmhKLPl0E) currently returns a latest production deployment in READY state at suhasgroup.vercel.app, built from main SHA 534186253a299deffb4b705e9bd628b248558cf0. This commit changes the audit document only; the latest social.html source remains the SHA above. Production alias resolution is present. No new deployment was triggered.
- Important distinction: Vercel API now reports READY for the latest production deployment; earlier deployment-creation HTTP 402 remains an observed historical failure, but the latest deployment status should be checked again before any future release.
- Automated authenticated UI/browser tests have not been run. Source inspection is not proof of click behavior in a signed-in browser. Phase 01 remains IN PROGRESS pending runtime testing and completion of contextual profile/post/comment/message menus and remaining settings workflows.
- No destructive changes, no database writes/migrations, no hosting switch, and no user-data changes in this run.



## Master prompt execution — fresh repository audit
Date: 2026-11-10
- Re-inspected the live main-branch social.html (blob SHA 0198d9dafb424160dc1bf91a6c348e0e73c8e616; 509,742 characters) and messenger.html (blob SHA 1c3588e1a7808875df9aecae46b11ba83d20a7ad; 14,419 characters).
- Current static inventory in social.html: 20 section elements, 248 button elements, 17 anchor elements, 13 forms, 17 script tags. These are source counts, not unique tested controls.
- Settings categories present: Preferences, Appearance, Feed & media, Privacy & account, Account security, Accounts Center, Privacy/Audience/Visibility/Blocking, Notifications, Feed Preferences, Language/Region, Media, Accessibility, Activity Log, Ads/Payments, Data/Permissions, Help/Support, Monetization.
- Current routed destinations are feed, people, friends, saved, groups, marketplace, reels, gaming, requests, following, notifications, messages, settings, and maxmenu. Dedicated Video and Pages routes are absent; do not silently map these to unrelated features or mark them complete.
- Menu "See more" fix from commit d8110b9598f072502c34e7ffa47ae5270b6da92d is present in main; source handler toggles #max-menu-extra and sets aria-expanded.
- Current settings save routine writes only to the existing authenticated user's member_settings.preferences and suhas_account_preferences records. No schema change or user data mutation was made during this audit.
- Vercel latest production deployment query returned READY records for project suhasgroup. The newest listed production deployment URL is https://suhasgroup-hvbe04vzg-suhas-max.vercel.app and its build commit is 534186253a299deffb4b705e9bd628b248558cf0. This is older than the latest main branch commits, so it does NOT prove the current main source is deployed. Do not claim latest code is live until Vercel's deployment commit matches main.
- Facebook UX comparison reference: Meta's official guidance supports grouped searchable settings, Privacy Checkup, audience selection and tag/timeline review; feed preferences include Favorites, snooze/reconnect and show-more/less controls. Sources: https://www.meta.com/safety/topics/safety-basics/tools/privacy/ ; https://about.fb.com/news/2021/08/facebook-settings-redesign/ ; https://about.fb.com/news/2022/10/new-ways-to-customize-your-facebook-feed/
- Phase 01 remains IN PROGRESS: static source review passed, but full authenticated browser QA is outstanding and some contextual menu destinations/settings are still incomplete.
- Phase 02 has not started. No unsupported route was added, no fake data was introduced, no destructive code or database changes were made.


## 2026-11-11 — SUHAS GROUP + SUHAS-MAX integration registry baseline
- Created `docs/INTEGRATION_REGISTRY.md` on isolated branch `chore/integration-registry-audit`.
- Document defines the two-product architecture, integration security/acceptance rules, existing GitHub/Supabase/Vercel/Cloudflare/Pages/CodeQL/Datadog/Gemini/TinyFish/creative-tool baseline, and candidate technology license/hosting classifications.
- Explicitly records that no VPS/server is currently available; self-hosted automation/ERP platforms are not deployable as always-on services until persistent compute is provided.
- Identifies Activepieces MIT-covered Community core (with separately licensed enterprise/cloud areas), Node-RED Apache-2.0 core, Coolify Apache-2.0 requiring owned infrastructure, ERPNext GPLv3, and n8n Sustainable Use License restrictions. These are candidates, not installed or production-activated services.
- No application code, Supabase schema, production settings, secrets, DNS, user data or live integrations were changed.
- Registry commit: `53f49f0d9c14890ad6988df1eaf8e31557c451af`.
- Verification: GitHub create-file API returned the commit SHA; branch is isolated from `main`. No deployment was triggered.
- Next step: inspect workflow run outcomes and current deployment configuration, then prepare a portable adapter contract and only add non-production-safe improvements after review.


## SUHAS-MAX responsive Facebook-style navigation — 2026-11-11
- Replaced the empty desktop navigation placeholder with six real destinations: Home, Friends, Groups, Reels, Marketplace and Notifications. They use the existing `activateMaxTab` controller and existing page panels.
- Mobile bottom navigation now uses the same six destinations with full, readable labels (Marketplace and Notifications are no longer shortened); Profile remains reachable from the existing header/menu profile controls.
- Desktop (761px and wider) shows the six destinations horizontally in the header and hides the bottom bar. Mobile shows the six destinations in a fixed bottom bar and hides the desktop row.
- Changed file: `social.html`.
- Code commit: `3c729128b29deb59d40585a3a779da0362183e8c`.
- Verification: confirmed the desktop nav placeholder was replaced, all six controls point to existing tab IDs, and the existing delegated navigation handler binds `.social-topnav` and `.social-mobile-nav` controls. No database schema, user records, assets or existing feature handlers were changed.
- Pending: browser/device visual verification on Android and desktop; test all six destinations and verify there is no CSS/layout regression. Do not mark live visual behavior complete until tested.

## 2026-11-11 — Clean Facebook-style SUHAS-MAX mobile layout
- User approved applying the supplied clean Facebook-style mobile reference inside the actual SUHAS-MAX app.
- Added an additive, phone-width-only CSS layer in `social.html`: compact brand/search/Messenger header; removed excess create/header clutter on phones; full-width single-column feed; hidden desktop side columns on phone widths; horizontal story shelf; cleaner post cards/actions; fixed six-destination bottom navigation with safe-area spacing.
- Explicitly overrides the forced desktop-width shell only at phone viewport widths, so mobile screens no longer render the desktop three-column layout squeezed into a narrow display. Desktop/tablet-wide rules and existing navigation handlers remain unchanged.
- Changed files: `social.html`, `release.json`.
- Code commit: `8e12cb640392a2d0ed35c61145a6c6886a13fa12`.
- Release metadata commit: `37c2deacc530434aa5c74aa54bb30f8837949592`; version `2026.11.11.2`; service-worker version bump included so installed clients can detect the new release.
- Static checks actually run: new CSS block present; CSS braces balanced; style tag counts balanced; existing feed navigation handler, mobile navigation, and desktop-mode selectors still present. No database, storage, account data, social handlers, route or feature was changed.
- Pending verification: Vercel production build/deployment status, served `release.json`, and real Android mobile + desktop visual/interaction checks. Do not claim the new layout is live until the deployment commit matches this release and the live page is inspected.
- Recovery point: `main` after `37c2deacc530434aa5c74aa54bb30f8837949592`.


## 2026-11-11 — No-cost hosting strategy added
- User requested a lifetime-free hosting option for SUHAS-MAX.
- Added a no-cost-first hosting strategy to `README.md` and updated `RELEASE-PROCESS.md`.
- Cloudflare Pages is the preferred free static host after verification; project `suhasgroup`, output directory `.`, expected URL `https://suhasgroup.pages.dev`.
- GitHub Pages is retained as an automatic free fallback via `.github/workflows/pages-deploy.yml`.
- Existing Cloudflare deployment workflow is present but requires GitHub Actions repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. The values must be added by the owner in GitHub Settings > Secrets and variables > Actions; never ask the user to paste secrets in chat.
- Vercel is not deleted or disconnected until Cloudflare Pages is live and end-to-end tested. This protects the existing domain and recovery path. Supabase/Auth/database/storage and member data remain untouched.
- Cloudflare currently documents the Pages Free plan at $0/month, with 500 builds/month, one concurrent build, 20,000 files/site, and 25 MiB per asset; static asset requests are free and unlimited. These are current limits, not a lifetime guarantee; other services may have separate charges.
- Verification still pending: Cloudflare workflow secret setup, latest production deployment check, and Android/Desktop end-to-end tests.


## 2026-11-11 — Phone home feed matched to the supplied Facebook-style sample (SUHAS-MAX)
- Hosting note: Vercel is cancelled; production URL is https://suhasgroup.pages.dev (Cloudflare Pages). Canonical/sitemap/robots URLs were switched in commit `a6700b7`.
- Added `assets/suhas-max-fb-mobile-v1.css` (phone width only, `@media (max-width:760px)`, skipped in desktop mode) and linked it at the end of `social.html`. Rollback: remove that one `<link>` line.
- Header on phones: logo + SUHAS-MAX, round Search and Messenger buttons (existing unread badge). Hidden on phones only: left hamburger, My Profile pill, display-mode dots, create (+), edit-profile. Profile is still reachable at the top of the Menu sheet; the display-mode toggle is now a "Display mode · mobile / desktop" button in the Menu sheet that triggers the existing toggle.
- New phone icon tab bar under the header: Home, Friends, Groups, Notifications, Menu (real `activateMaxTab` actions). Notification badge counts real unread rows (`suhas_notifications.read_at is null`) for the signed-in member; hidden when 0.
- Bottom nav: Home, Friends, Watch (opens the existing Reels tab), Marketplace, Notifications, Menu. Groups moved from the bottom bar to the top tab bar.
- Stories shelf restyled (Create story card, avatar ring top-left, name on gradient). The story card now also renders the author's profile photo ring when one exists.
- Feed post card restyled: full-width media, like count row, Like / Comment / Share row with thumbs-up icon, and a real hide-post X button (uses the existing `data-post-action="hide"` handler). Desktop keeps its layout.
- Hidden on phones only (still available): Reels shelf on Home (use the Watch tab) and per-button action counts.
- Checks actually run: all inline scripts pass `node --check`; CSS braces balanced; Chrome render at 412px and 360px widths with mock content matches the sample layout; desktop width 1280px confirmed unaffected (phone tab bar and bottom nav hidden, desktop top nav shown).
- NOT verified (pending, needs a signed-in account on a real phone): real feed/stories data rendering, like/comment/share/hide actions, notification badge count, Menu sheet display-mode button, search dropdown overlap with the new tab bar.
- Release metadata `2026.11.11.3`; `assets/suhas-max-fb-mobile-v1.css` added to the service-worker core list.



## 2026-11-11 — Mobile navigation moved to the app bottom bar
- User requested Facebook-style app navigation with primary buttons at the bottom, not a second row above the feed.
- Reviewed the current SUHAS-MAX source and found a duplicate phone-only icon tab strip above the Home feed plus the existing six-item bottom navigation.
- Updated `assets/suhas-max-fb-mobile-v1.css` additively: hid the redundant top phone tab strip; retained the existing bottom destinations Home, Friends, Watch, Marketplace, Notifications and Menu; refined the bottom bar into a clean fixed app navigation with consistent touch targets, active blue indicator, notification badge position and Android safe-area spacing. Desktop navigation is unchanged.
- Bumped release metadata to `2026.11.11.4` and service-worker cache key to `v104` so installed clients can detect the update.
- Code/release commit: `27c8baa12ef5f42d7471685239aa227a4263814d`.
- Static verification: confirmed the new phone CSS hides `.suhas-fb-phone-tabs`, keeps the six existing bottom destinations, and applies only at phone widths; release version and service-worker cache version were updated. No HTML routes, feature handlers, Supabase schema, member records, storage objects, or corporate pages were changed.
- Pending: Cloudflare Pages deployment for this commit and real signed-in Android visual/interaction QA. Source changes being committed do not by themselves prove the live page is updated.
- Recovery point: `main` at `27c8baa12ef5f42d7471685239aa227a4263814d`.


## 2026-11-11 — Mobile stylesheet cache-bust and deployment verification
- Follow-up cache-safety change: updated the existing `social.html` stylesheet URL from `?v=20261111-1` to `?v=20261111-2`, ensuring mobile clients request the newly refined CSS instead of reusing a stale cached URL.
- Cache-bust commit: `99b41d05e3ad5c25d6fe6823c1e35454760bc849`.
- Live Cloudflare Pages checks returned `release.json` version `2026.11.11.4` and the updated phone stylesheet content from `https://suhasgroup.pages.dev`.
- The GitHub Actions Cloudflare deploy job for checkpoint commit `0ee94821e85de144c4acc544e14e397d0810a48c` failed with Cloudflare API Authentication error code `10000` (the configured API token lacks required permission or is invalid for the Pages project). Despite that workflow failure, the Cloudflare Pages hostname was already serving release `2026.11.11.4` at the time of the live fetch; confirm the final cache-busted `social.html` request after the latest commit.
- GitHub Actions Site Quality check passed for code commit `27c8baa12ef5f42d7471685239aa227a4263814d`.
- Pending: check Cloudflare live response after cache-bust commit; repair GitHub Actions Cloudflare token permission (owner action; do not request the token in chat); perform signed-in Android UI regression testing for bottom navigation, all six destinations, search, Messenger, post actions and desktop unaffected behavior.
- No Supabase schema, accounts, posts, media, storage objects, or corporate modules were modified.


## 2026-11-11 — Live browser QA result for mobile navigation
- A live browser opened `https://suhasgroup.pages.dev/social.html` at an unauthenticated session. The app correctly redirected to `/login?next=%2Fsocial`; therefore authenticated SUHAS-MAX mobile layout and actual button behavior could not be inspected without a signed-in browser session.
- The browser then inspected the login page's corporate bottom navigation, not the social app navigation. Its reported CSS/display values are not evidence about the signed-in social screen and must not be used to mark the social layout passed.
- Direct live fetch confirmed Cloudflare Pages serves `release.json` version `2026.11.11.4` and the updated `assets/suhas-max-fb-mobile-v1.css` content.
- The latest GitHub Actions Cloudflare deployment attempt reported API Authentication error `10000`; configured Cloudflare token permissions/validity require owner correction in GitHub Actions secrets. The live release and CSS asset are available, but the workflow health is not green.
- Next exact verification: owner signs in to SUHAS-MAX on Android, confirms the six-item bottom navigation is the only mobile app navigation row, taps each destination, verifies notification count and Menu, checks Search/Messenger, and refreshes a non-Home tab. Re-run Cloudflare deployment after correcting the token and confirm the workflow is green.
