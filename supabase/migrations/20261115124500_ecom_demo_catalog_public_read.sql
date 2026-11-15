-- Publicly display only clearly marked, zero-stock demo catalogue rows.
-- Real seller listings remain subject to the existing approved-vendor policy.
create policy "ecom_demo_catalog_select"
on public.ecom_products
for select
to anon, authenticated
using (
  is_active = true
  and stock = 0
  and name like 'DEMO · %'
);
