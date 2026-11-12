# SUHAS GROUP — O5 International All-in-One module

## Entry points
- Module implementation: `/apps/suhas-group/o5-intl/o5-all-in-one.html`
- Legacy compatibility URL: `/o5-all-in-one.html` (forwards the complete query string and hash)
- Existing O5 child pages remain at their current root routes: `related-apk.html`, `o5-calculator.html`, `suhas-calculator.html`, and `o5-desk.html`.

## Shared platform contract
- Uses the existing root stylesheet `/assets/styles.css`.
- Uses the existing root authentication gate `/assets/auth.js`.
- A root `<base href="/">` preserves the original child-page and asset URL resolution when this page is served from its module directory.
- The existing page-specific visual styles and O5 tool links are retained.

## Isolation and safety
- This increment isolates only the O5 All-in-One landing page. It does not relocate or rewrite the linked calculator, desk, or app-library pages.
- The legacy URL remains as a compatibility redirect.
- No Supabase schema/data, storage, authentication configuration, other corporate routes or O5 child pages were changed.
- No production deployment performed.

## Verification
Static checks should confirm the compatibility redirect, query/hash forwarding, base URL, shared auth/style dependencies, and all three existing tool links. Browser and mobile visual/auth-gate behavior still require live testing before merge/deployment.
