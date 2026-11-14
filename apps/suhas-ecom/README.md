# Suhas E-Com

Multi-vendor marketplace (Daraz-style) on a free stack: Cloudflare Pages + Supabase + GitHub.

- `index.html` — storefront: search, categories, flash sale, cart, guest checkout (COD / bKash / Nagad), seller application.
- `../../supabase/migrations/20261115_suhas_ecom_marketplace.sql` — tables `ecom_vendors`, `ecom_products`, `ecom_orders` with row-level security (apply in Supabase before going live).
- `../../docs/SUHAS_ECOM_BUSINESS_PLAN.docx` — business plan.

Until the migration is applied the page runs in demo mode with sample products; demo orders stay on the visitor's device and are never sent to sellers.
