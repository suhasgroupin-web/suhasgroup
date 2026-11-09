# SUHAS — Permanent Development & Data Protection Rules

**Status:** Mandatory for every future SUHAS development task.

## 1. Non-destructive development
- Never delete, overwrite, reset, truncate, drop, or replace existing user data, database records, tables, storage objects, designs, pages, apps, features, assets, routes, or configuration as a shortcut.
- Preserve every existing feature and its working behavior unless the user explicitly authorizes a specific removal.
- If something must be relocated, move it and verify the destination. Keep a recoverable copy and record the old and new locations.
- Prefer additive changes, backward-compatible migrations, feature flags, and new versions.
- Before changing an existing file or schema, inspect its current state and identify dependencies. Never assume it is disposable.
- Destructive database or storage operations are prohibited by default. Require an explicit, specific user instruction and a verified backup before any such operation.

## 2. Small, saved development increments
- Split work into small, independently verifiable tasks.
- After each completed increment: save the changed files, commit the work, record what changed, and verify the result before starting the next increment.
- Do not keep a large unfinished batch only in temporary memory or an unsaved editor.
- If work is interrupted by a usage limit, network loss, device shutdown, or session end, the last completed and committed increment is the recovery point.
- On resumption, read the latest checkpoint and continue from the first unfinished item. Never restart completed work or repeat completed steps unnecessarily.
- Never mark partial work as complete. Record exact progress (for example, 3.8/4 completed; 0.2 remaining) and list the remaining actions.

## 3. Required checkpoint after every increment
Maintain `DEVELOPMENT_CHECKPOINT.md` in the repository. Update it in the same commit as each completed increment where practical. It must record:
- Current task and objective.
- Completed items and their commit IDs.
- Current in-progress item and exact next step.
- Files, database objects, app pages, and assets changed.
- Tests/checks actually run and their results.
- Known issues, risks, and rollback/recovery notes.
- Whether deployment was done and whether live behavior was actually verified.

If an increment cannot be committed together with the checkpoint, commit the code first and immediately create a checkpoint commit before continuing.

## 4. Backup and change safety
- Inspect Git status/history and fetch the latest file before editing.
- Keep changes focused; do not replace whole files when a small patch is sufficient.
- Preserve existing content, identifiers, URLs, settings, and user-created records.
- For database changes, use additive migrations; inspect constraints, RLS, triggers, dependencies, and existing rows first.
- For storage changes, preserve existing objects and policies; never empty a bucket to fix an issue.
- For app/design changes, preserve the old route or component until the replacement is verified. If relocation is required, maintain a redirect or compatibility path where possible.
- Before risky changes, create a recoverable Git commit or export/backup. Verify the backup exists and can be accessed.

## 5. Verification and release
- Check syntax/build and relevant tests after each increment where tooling allows.
- Test the affected flow and at least one relevant existing flow to detect regressions.
- Deploy only saved, committed changes.
- After deployment, verify the live URL or service. Clearly distinguish code committed, deployment completed, and live behavior verified.
- If verification is blocked, report exactly what remains unverified; never claim 100% completion without evidence.

## 6. Resume protocol
At the start of every SUHAS development session:
1. Read this file and the latest `DEVELOPMENT_CHECKPOINT.md`.
2. Inspect the latest repository commit and current working state.
3. Confirm the last completed increment and the first unfinished step.
4. Continue from that exact point without deleting or rebuilding completed work.

## 7. Mandatory completion report
For every task, report:
- Done and saved (with commit ID).
- Remaining work (if any).
- Tests and verification actually performed.
- Live deployment status.
- Exact resume point if unfinished.

**Core command:** Develop continuously in small increments; save and checkpoint every completed increment; preserve all existing data, designs, apps, and features; move rather than delete; resume exactly where work stopped.


## 8. Facebook Official Mobile App design-reference integration — SUHAS-MAX
- Treat the user's supplied `home (2).html` and `home.html` files as design/behavior references, not replacement applications.
- The Supabase-integrated reference is the preferred source for reusable working patterns. The static/demo reference may guide visual layout only; do not import mock accounts, sample metrics, fake content, localStorage-only social actions, or placeholder buttons as production functionality.
- Match the familiar Facebook Official Mobile App interaction patterns and responsive visual hierarchy across Home Feed, post composer, Stories, Reels, Friends, Notifications, Marketplace, Profile, Menu, Search, and Messenger, while retaining SUHAS-MAX / SUHAS GROUP identity, logo, colors where appropriate, and all corporate modules.
- Every visible control must perform its real intended action, persist through the existing Supabase-backed data model where applicable, respect authentication and Row Level Security (RLS), and provide clear loading, success, empty, and error states. Do not ship visual-only buttons or fake interactions.
- Before integrating a reference feature, inspect the current SUHAS-MAX implementation, database tables/columns, RLS policies, storage buckets/policies, and dependent routes. Reuse existing tables and handlers whenever possible; add schema only through backward-compatible migrations when a verified gap requires it.
- Preserve all existing records, accounts, media, pages, routes, styles, modules, and working behavior. Never replace `social.html` wholesale with either reference file. Prefer small additive, reversible changes and keep compatibility with existing URLs and data.
- Required workflow for this design task: AUDIT CURRENT APP + REFERENCES → MAP UI/FEATURES → CHECK SUPABASE/RLS/STORAGE → IMPLEMENT A SMALL INCREMENT → STATIC/SYNTAX TEST → FUNCTIONAL TEST → COMMIT + CHECKPOINT → DEPLOY → LIVE VERIFY.
- Test mobile and desktop layouts, keyboard/accessibility states, navigation, post creation, media upload, likes, comments, share/repost, story/reel viewing, friend requests, notifications, profiles, and messaging. Mark any flow not exercised with real accounts/devices as pending.
- Do not claim a Facebook-level visual or functional match until the relevant screen and actions have been compared and tested. Record exact completed, pending, failed, and blocked items in `DEVELOPMENT_CHECKPOINT.md`.


## 9. Mandatory real-functionality requirement for every button and control
- Every visible button, icon-button, menu item, tab, chip, toggle, card-action, form submit, and clickable surface in SUHAS-MAX must have a defined, implemented, and tested action. Visual resemblance alone is not completion.
- Maintain a control inventory for each screen: control label/selector, intended action, handler, data/API dependency, authorization/RLS requirement, loading/disabled state, success state, error state, and test result.
- No dead buttons, placeholder alerts, fake success toasts, cosmetic-only toggles, or controls that silently do nothing. If an external integration is unavailable, clearly show the real setup requirement and do not label the feature Active or On.
- A toggle may display On only when the setting is actually saved and the corresponding integration/action is available. Persist preferences where appropriate and restore them on reload.
- For social actions (like, comment, share, repost, save, follow, friend request, messaging, upload, story, reel, marketplace, group, notification, profile, settings), verify the actual Supabase operation, ownership, authentication, RLS, and refresh behavior.
- For device features (camera, gallery, location, contacts, phone, external sharing), request permission at the point of use, handle denial/cancellation, and provide a supported fallback. Never claim a call, livestream, cross-post, or media upload succeeded unless the platform/provider confirms it.
- Before release, enumerate every rendered button/control in the changed screen and verify its handler is reachable. Exercise each control on mobile and desktop when applicable; record passed, failed, blocked, and not-yet-integrated items separately.
- If a button cannot be safely completed in the current increment, keep it visibly unavailable with an honest explanation and record the dependency; do not ship a misleading active-looking control.
- This requirement applies to new and existing controls, including all buttons copied or inspired by Facebook's official mobile app.
