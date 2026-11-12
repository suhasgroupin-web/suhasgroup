# SUHAS GROUP — Career Profile module

## Entry points
- Module implementation: `/apps/suhas-group/career-profile/profile.html`
- Legacy compatibility URL: `/profile.html` (forwards the complete query string and hash)
- Existing callers continue using the legacy URL; no caller links are rewritten in this increment.

## Shared platform contracts
The existing profile implementation continues to use the root-level:
- `/assets/styles.css` and existing display-mode assets
- Supabase JS client CDN and `/assets/config.js`
- `/assets/auth.js` for authentication/session behavior
- `/assets/script.js` for shared site behavior
- Existing member profile/public-profile data synchronization and member-avatars storage behavior already present in the page

A root `<base href="/">` preserves the original root-relative assets, links, redirects, and form destinations when served from the module directory.

## Isolation and safety
- This is an additive relocation of the current `profile.html` implementation into a module-owned path.
- Existing profile form fields, profile completeness logic, avatar/cover selection, public profile sync, auth metadata updates, logout and Main Menu redirect are retained.
- The legacy root URL remains as a compatibility redirect and forwards query/hash parameters.
- No database schema, user records, storage objects, auth settings, other pages or links were changed.
- The current profile page has shared member/social profile synchronization behavior; it is preserved as-is, not simplified or redesigned by this isolation change.

## Verification
Static checks should confirm the compatibility redirect, root base URL, auth/config/style dependencies, profile form/upsert and sync hooks, and logout behavior. Browser/mobile and authenticated profile-save/photo/logout tests remain required before merge/deployment.
