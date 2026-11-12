# SUHAS GROUP — Job Details module

## Entry points
- Module implementation: `/apps/suhas-group/job/job.html`
- Legacy compatibility URL: `/job.html` (forwards the complete query string and hash to the module route)
- Job listings remain at `/jobs.html`; this increment isolates the individual job-details view only.

## Shared platform contracts
The module intentionally continues to consume the existing root-level:
- `/assets/styles.css` (corporate design system)
- `/assets/config.js` and `/assets/auth.js` (Supabase client and auth/session gate)
- `/assets/script.js` (shared site behavior)
- Supabase tables `jobs`, `saved_jobs`, and `applications`

The `<base href="/">` keeps legacy relative navigation, assets and form destinations rooted at the site origin. The external job URL resolver uses `document.baseURI` to preserve the previous root-page URL resolution behavior.

## Isolation and safety
- The module owns its page markup and job-details behavior; shared corporate styling/auth/config remain platform dependencies.
- Existing job lookup, apply, save, external HTTPS validation and duplicate-application handling are copied unchanged except for the equivalent root-based URL resolver.
- No job listing page, other corporate page, database schema, records, storage or auth configuration was changed.
- Keep the legacy root entry until route tests confirm compatibility.

## Verification
Static checks should confirm preserved query parameters, existing Supabase table calls and root asset paths. Browser, signed-in/signed-out, apply/save, and mobile behavior still require live testing before merge/deployment.
