# SUHAS MAX Online Store

Standalone public storefront for SUHAS MAX. This app is separate from SUHAS AI and SUHAS GROUP.

## Public shopping
- No customer account or login required.
- Product catalog, search, category filters, cart and guest checkout.
- Cash on Delivery, bKash and Nagad selection.
- bKash/Nagad payment number is shared by the store admin after order confirmation; no payment gateway is configured.
- Delivery fee currently set to BDT 80 in the order RPC.

## Admin
- Open the store URL with `?admin=1` to access the admin sign-in.
- Admin access is restricted by database RLS to the email `Suhasmax.in@gmail.com`.
- Use the same SUHAS MAX Supabase Auth account/password; customer checkout does not require an account.
- Admin can add/edit/hide products and update order status.
- Product images are currently entered as public HTTPS image URLs.

## Backend
- Supabase project: `pokxiylebwzoxunccuwm` (SUHAS MAX only).
- Tables: `suhas_max_products`, `suhas_max_orders`.
- Guest orders use the `place_suhas_max_order` RPC, which looks up product prices in the database before creating an order.
- Public users can read active products and submit orders only. Order reads/updates and product management are admin-only via RLS.
- The frontend uses the public publishable key only. No Supabase secret/service-role key is included.

## Deployment
Deploy this directory as a separate Cloudflare Pages project with no build command and output directory set to this directory. Use a free `*.pages.dev` hostname. Do not deploy to the existing SUHAS GROUP Pages project. A separate Cloudflare Pages project/account authorization is required before a live URL can be claimed.
