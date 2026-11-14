# Suhas E-Com

Multi-vendor marketplace using GitHub, Cloudflare Pages and Supabase.

## Storefront
- `index.html` — public catalogue, search, cart and guest checkout (COD / bKash / Nagad).
- Customer checkout requires a contact email. Successful orders are written to Supabase, stock is decremented transactionally, and the order is automatically marked Confirmed.
- Orders that fail database validation are not shown as successful.

## Admin & Seller Centre
- `manage.html` — Supabase Auth sign-in and seller registration.
- Admin access is checked against `public.ecom_admins`; current authorized admin email: `suhasmax.in@gmail.com`.
- Admin can create an official store, add/hide/delete products, approve/reject/suspend seller accounts, and update order status.
- Approved sellers can add, hide and delete their own products. Their products become live immediately in the public catalogue.
- Seller accounts remain pending until an Admin approves them.
- Seller product and order access is restricted by Supabase RLS.

## Supabase
- Project ref: `pokxiylebwzoxunccuwm`.
- Tables: `ecom_vendors`, `ecom_products`, `ecom_orders`, `ecom_order_items`.
- Migration: `../../supabase/migrations/20261115103000_suhas_ecom_order_email.sql`.
- Guest checkout uses `ecom_place_order`; database pricing and stock are authoritative.
- Customer email, one-time email claim token and send timestamp are stored on the order.
- Frontend uses only the public publishable key. No service-role key is exposed.

## Confirmation email setup (Cloudflare)
The Pages Function `/functions/api/ecom-order-email.js` sends a confirmation using Cloudflare Email Sending REST API. To enable real delivery, configure these variables/secrets on the Cloudflare Pages project that serves this repository:
- `CLOUDFLARE_EMAIL_API_TOKEN` — encrypted secret with Email Sending: Edit permission.
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID.
- `EMAIL_FROM` — sender address on a domain onboarded and verified in Cloudflare Email Service (SPF/DKIM configured).

Cloudflare Email Sending requires Workers Paid for arbitrary customer recipient addresses. On the Free plan, sends are limited to verified destination addresses, which is not suitable for arbitrary shoppers. Until the three settings and domain are configured, orders still save and confirm, but the page reports that the confirmation email could not be sent. Never put the Cloudflare API token in frontend code or GitHub source.

## Deployment
The repository's Cloudflare Pages workflow deploys the root site. The E-Com app is served under `/apps/suhas-ecom/`; the order-email endpoint is `/api/ecom-order-email`.
