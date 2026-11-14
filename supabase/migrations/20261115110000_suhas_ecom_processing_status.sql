alter table public.ecom_orders drop constraint if exists ecom_orders_status_check;
alter table public.ecom_orders add constraint ecom_orders_status_check
  check (status = any (array['new','confirmed','processing','shipped','delivered','cancelled']));