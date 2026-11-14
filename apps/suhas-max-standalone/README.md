# SUHAS MAX Standalone App

Static Cloudflare Pages app root: `apps/suhas-max-standalone`.

- Independent Supabase project: `pokxiylebwzoxunccuwm`
- Supabase URL: `https://pokxiylebwzoxunccuwm.supabase.co`
- Publishable key is intentionally client-visible; never put service-role keys in this app.
- Auth session storage key: `suhas-max-auth-v1`
- Profile table: `public.max_profiles`, RLS restricts rows to `auth.uid() = user_id`.
- Dedicated manifest and service worker; Cloudflare Pages deployment should use this directory as the output directory, with no build command.

Initial release supports email/password registration and login. Phone OTP must not be advertised until an SMS provider is configured and verified in the new Supabase project.
