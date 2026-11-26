# Suhas E-Com

Multi-vendor marketplace using GitHub, Cloudflare Pages and Supabase.

## Storefront
- `index.html` — public catalogue, search, cart and guest checkout (COD / bKash / Nagad).
- Category filters always show 18 standard shopping categories, even when no products are listed; custom seller categories are added automatically.
- Customer checkout requires a contact email. Successful orders are written to Supabase, stock is decremented transactionally, and the order is automatically marked Confirmed.
- Orders that fail database validation are not shown as successful.

## Admin & Seller Centre
- `manage.html` — Supabase Auth sign-in, first-time Admin account setup, and seller registration.
- Admin access is checked against `public.ecom_admins`; current authorized admin email: `suhasmax.in@gmail.com`.
- The first-time Admin setup tab lets the authorized email create its own password; complete the Supabase email-verification step, then sign in. The application does not store or expose the password in GitHub.
- Admin can create an official store, add/hide/delete products, approve/reject/suspend seller accounts, and update order status.
- Approved sellers can add, hide and delete their own products. Product images can be uploaded directly to the existing `ecom-products` Supabase Storage bucket (JPG / PNG / WebP, up to 2 MB) or supplied by URL. Their products become live immediately in the public catalogue.\n- Sellers can update their own order-item progress (new, packed, shipped, delivered, cancelled); Admin can update overall order status.
- Seller accounts remain pending until an Admin approves them.
- Seller product and order access is restricted by Supabase RLS.
- Admin and seller dashboards subscribe to Supabase Realtime order and order-item changes; visible orders refresh automatically and show an in-dashboard activity alert under existing RLS permissions.\n- The public storefront includes a WhatsApp support link to `+8801862144113`; order confirmation includes the order number and a WhatsApp support action.

## Supabase
- Project ref: `pokxiylebwzoxunccuwm`.
- Tables: `ecom_vendors`, `ecom_products`, `ecom_orders`, `ecom_order_items`.
- Migration: `../../supabase/migrations/20261115103000_suhas_ecom_order_email.sql`.
- Guest checkout uses `ecom_place_order`; database pricing and stock are authoritative.
- Customer email, one-time email claim token and send timestamp are stored on the order.
- Frontend uses only the public publishable key. No service-role key is exposed.

## Confirmation email setup (Cloudflare)
The Pages Function `/functions/api/ecom-order-email.js` sends a confirmation using Cloudflare Email Sending REST API. To enable real delivery:
1. Add a custom sending domain to Cloudflare Email Service and complete its DNS verification (SPF/DKIM).
2. Create a Cloudflare API token with **Email Sending: Edit** permission.
3. In GitHub repository Settings → Secrets and variables → Actions, add:
   - Secret `CLOUDFLARE_EMAIL_API_TOKEN` — the Email Sending token.
   - Variable `EMAIL_FROM` — a sender address on the verified domain (for example, `orders@your-verified-domain`).
   - Existing deployment secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are used to sync the email settings to Cloudflare Pages.
4. Run the **Deploy Cloudflare Pages** workflow again. Its optional email-setup step copies these values into Cloudflare Pages secrets.

Do not paste API tokens or passwords into chat or commit them to GitHub source.

Cloudflare Email Sending requires Workers Paid for arbitrary customer recipient addresses. On the Free plan, sends are limited to verified destination addresses, which is not suitable for arbitrary shoppers. Until the three settings and domain are configured, orders still save and confirm, but the page reports that the confirmation email could not be sent. Never put the Cloudflare API token in frontend code or GitHub source.

## Deployment
The repository's Cloudflare Pages workflow deploys the root site. The E-Com app is served under `/apps/suhas-ecom/`; the order-email endpoint is `/api/ecom-order-email`.

## 2026-11-23 — Alibaba-style marketplace + order workflow
- Pages: `index.html` (categories, banner, product grid, search), `product.html?id=` (gallery, price, MOQ, specs, Order now, Add to cart, WhatsApp +8801862144113), `track.html` (customer tracking with automatic status alerts), `delivery.html?t=<token>` (delivery person link, no login), `manage.html` (seller/admin).
- Shared: `ecom.css`, `ecom-core.js`.
- Flow: customer orders (status `new`) -> seller/admin notified (bell, sound, browser notification while the dashboard is open) -> seller confirms -> customer sees "Congratulations! Your order is confirmed." -> packing -> seller enters delivery person and sends delivery link -> delivery person taps Delivered -> seller/admin notified.
- Backend migration `supabase/migrations/20261121_ecom_order_flow_notifications.sql` applied to project `pokxiylebwzoxunccuwm`; owner Max.com seller accounts approved.
- Fixed a JavaScript syntax error (stray `\n`) in the old `manage.html` that could stop the dashboard from loading.
- Limits: customer/seller alerts work while the page is open (no server push). Confirmation email still needs the Cloudflare email setup above.

## 2026-11-24 — Sharing + SUHAS AI
- Share link `https://suhasgroup.pages.dev/s/<product-id>` (Pages Function `functions/s/[id].js`) returns Open Graph tags (photo, name, price) so Facebook, LinkedIn and WhatsApp show a rich preview, then redirects to `product.html`. Product page has Facebook / LinkedIn / WhatsApp / Copy link buttons. After a photo or price changes, refresh the cached preview with the Facebook Sharing Debugger and LinkedIn Post Inspector.
- SUHAS AI: widget `ecom-ai.js` beside the WhatsApp button; backend `supabase/functions/ecom-assistant` (deployed to project `ehvgxbifqtyajeersnvq` with the same `AI_API_KEY` secrets as `ai-assistant`, `verify_jwt=false`, rate limited). Customers get answers about products and only their own orders (order code + phone verified on server); sellers/admin get their orders via their signed-in token.
- Seller Centre: typed delivery person name is no longer wiped by live refresh.

## 2026-11-26 — Domain split + marketplace v2
- suhasmax.pages.dev = SUHAS E-COM only (apps/suhas-ecom served at root, Pages Functions /s/<id> and /api/ecom-order-email). suhasgroup.pages.dev = SUHAS GROUP apps only (social, messenger, max-profile, suhas-max-ai removed from the deployed group site; redirects to /home.html). Built by scripts/build-sites.sh; workflow deploys both projects. Repo files are untouched, only the deploy output changes.
- E-COM: 3-dot share menu (Facebook, LinkedIn, WhatsApp, imo, Instagram, Others) on each card and product page; sticky bottom Order Now bar (?buy=1 opens checkout); bigger Alibaba-style home (deals row, category tiles, showcases, RFQ, load more, footer columns).
- Seller WhatsApp (ecom_vendors.whatsapp, ecom_shops view, My shop tab); demo products can be claimed/edited/published (RPC ecom_claim_demo_product); admin can reassign a store when editing.
- SUHAS AI: instant local answers (FAQ, product search, order status) + richer ecom-assistant (v2 deployed via MCP).
- Tests: mocked Playwright run/run2/run3/run4 pass. NOT verified: real Facebook/LinkedIn crawlers, real AI replies, live Cloudflare deploy of both domains (see workflow run), Supabase Auth Site URL for the new domain.
