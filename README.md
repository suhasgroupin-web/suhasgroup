# SUHAS GROUP Security + AI Package

## Included
- `supabase/migrations/20260929_suhas_security.sql`
- `supabase/functions/ai-assistant/index.ts`
- `supabase/config.toml`
- `supabase/functions/.env.example`
- `.gitignore`

## 1. Run SQL
Open Supabase Dashboard -> SQL Editor and run the migration SQL.

It bootstraps `suhasgroup.in@gmail.com` as OWNER if that Auth user already exists.
If the Auth account does not exist yet, the signup trigger assigns OWNER when that exact
email signs up.

## 2. Set AI secret
Set `AI_API_KEY` in Supabase Edge Function Secrets. Do NOT put the real key in GitHub,
frontend code, SQL, or the ZIP.

Optional:
- AI_BASE_URL
- AI_MODEL

Supabase Edge Function secrets are intended for server-side credentials.

## 3. Deploy the function
Using Supabase CLI from this package/project:

`supabase functions deploy ai-assistant`

Then configure the secrets in Supabase.

## 4. Frontend
Call the `ai-assistant` Edge Function using the authenticated user's session.
Do not call the AI provider directly from the browser.

## Important
This package cannot safely replace your entire existing frontend application because
the existing framework/schema was not supplied. The migration is designed to add the
security foundation without assuming a particular frontend framework.

Before production, test:
- owner login
- user login
- saved jobs
- application access
- admin access
- editor access
- role changes
- AI function
- RLS behavior
- logout/session expiry
