# SUHAS-MAX Messenger module

This module is an additive, isolated copy of the existing Messenger presentation assets.

## Entry and dependencies
- Compatibility entry: `/messenger.html` (kept at the repository root).
- Module stylesheet: `messenger.css`.
- Module script: `messenger.js`.
- The page continues to use the existing root-level `social.html?tab=messages&messenger=1` iframe as the single owner of Supabase authentication, conversations, messages and realtime behavior.
- The existing root-level `messenger.css` and `messenger.js` are retained as rollback/legacy copies; do not edit them as the active implementation.

## Isolation contract
- Do not add selectors or global behavior intended for other pages.
- Keep the iframe integration and existing element IDs stable unless a separately tested integration change is approved.
- Root-level logo, social and profile routes remain unchanged.
- No database, storage, authentication or user-data changes are part of this module.

## Verification boundary
The assets were copied without source changes. The compatibility page now loads the module-folder copies. Browser/device and authenticated two-account behavior still require live testing.
