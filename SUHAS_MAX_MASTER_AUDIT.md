# SUHAS-MAX A–Z Master Upgrade — Initial Audit
Date: 2026-11-10
Branch: main
Project: existing SUHAS-MAX application (preserve; no replacement)

## Scope and safety
- Reviewed repository root, permanent development rules, latest development checkpoint, social.html structure, Supabase public table inventory, migration history, selected RLS policies, and Vercel production deployment history.
- No user data, database records, storage objects, authentication settings, or production configuration were modified during this audit.
- Existing visual design is the baseline. Preserve it where it already meets the requested Facebook-inspired behavior; improve only inconsistent or incomplete areas.
- Hosting policy superseded on 2026-11-13: Cloudflare Pages is the production target; Vercel is retired for new deployments. Existing historical deployment records are audit evidence only.

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
