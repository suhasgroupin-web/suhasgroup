# SUHAS MAX — Store module

This is the E-Commerce module inside the single SUHAS MAX app. Customers open it from the SUHAS MAX website; it is not a separate installable app or PWA.

## Customer shopping
- Public product catalogue with category filters, search, cart and guest checkout.
- Cash on Delivery, bKash and Nagad selection.
- Category filters include common shopping categories and automatically add any custom category used by products.
- Checkout prices and stock are validated by the Supabase order RPC before an order is created.
- Customers do not need to create an account to place an order.

## Owner management
- Open the store URL with `?admin=1` to access the admin sign-in.
- Admin access is restricted by database RLS to the configured SUHAS MAX admin account.
- Admin can add, edit, hide products and update order status.
- Product categories can be selected from suggestions or entered as a custom category.
- Product images are entered as public HTTPS image URLs.
- Admin should publish only real products with verified prices, available stock and accurate photos.

## Backend
- Supabase project: `pokxiylebwzoxunccuwm`.
- Tables: `suhas_max_products`, `suhas_max_orders`.
- Guest orders use `place_suhas_max_order`, which reads authoritative product prices and stock from the database.
- Public users can read active products and submit orders only. Product management and order access are restricted by RLS.
- Frontend uses the public publishable key only. Never expose a service-role key.

## Deployment
- Served as a path inside the existing SUHAS MAX Cloudflare Pages deployment: `/apps/suhas-max-ecommerce/`.
- The root Pages workflow deploys the repository; no second app or separate install is created.
