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
