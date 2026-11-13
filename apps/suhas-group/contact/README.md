# SUHAS GROUP Contact module

- Module entry: `apps/suhas-group/contact/contact.html`
- Legacy public entry: `/contact.html` (kept as a compatibility redirect).
- The module uses `<base href="/">` so root-relative shared assets, navigation and form endpoints continue to resolve as before.
- Existing contact form, topic query preselection, email links, company links, Supabase client/config, shared auth and shared script are preserved.
- No database, storage, auth configuration, shared asset, or unrelated page is changed in this increment.
- Browser/mobile and authenticated form submission checks are required before production deployment.
