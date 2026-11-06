# SUHAS GROUP: Smart App build plan and progress

Live site: https://suhasgroupin-web.github.io/suhasgroup/ (GitHub Pages, branch `main`)
Backend: Supabase project https://ttqitzexhnnvghxwechs.supabase.co
Rule: nothing is marked DONE until it is built AND tested. Secrets (API keys, tokens) live only in Supabase Edge Function secrets, never in frontend code.
Work rule: build on branch `wip-smart-app`, commit and push after every step, merge to `main` only when a stage is tested.

## Decisions (from owner)
- AI automation: ChatGPT (OpenAI API), called only from a Supabase Edge Function. Model name is an Admin setting (not hard-coded). OpenAI API is paid, usage-based; a ChatGPT subscription does not include API credit.
- Social publishing: Telegram bot and Facebook Page auto-post. LinkedIn and WhatsApp Channel: ready post text with Copy and Open buttons (no official auto-post API).
- Everything lives inside this one site/app (one login, one database).
- Permissions: show clear in-app "Allow" buttons (notifications for job alerts, file/camera for CV upload). Browser shows the real prompt when tapped.

## Stages
- [x] Barcode tool inside the app (/barcode/, home card, O5 Desk tab, shortcut, offline, Buyer watermark, footer)
- [ ] Stage 1: Admin panel + Link Management (editable page text, banners, menu, footer, contact, social links; no code edits)
- [ ] Stage 2: Missing pages (Services, Candidates, Recruitment Solutions, FAQ, Privacy Policy, Terms)
- [ ] Stage 3: Create Job (LinkedIn/external URL or pasted JD, ChatGPT drafting, edit + approve, unique job ID/URL, duplicate check)
- [ ] Stage 4: Publishing (Telegram, Facebook, drafts for LinkedIn/WhatsApp, schedule, history, retry, error alerts)
- [ ] Final: test every button/link on mobile and desktop, API docs, deployment and admin setup notes

## Needed from owner (not yet provided)
- OpenAI API key, and the model name to use
- Telegram bot token and channel
- Facebook Page access token
- OK to apply database migrations to the live Supabase project (migrations are written to supabase/migrations/ first)

## How to resume in a new session
1. Read this file and `git log` on `wip-smart-app`.
2. Continue the first unchecked stage. Commit and push after each step.
