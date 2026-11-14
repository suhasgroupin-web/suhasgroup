-- Suhas E-Com: multi-vendor marketplace schema (free-tier friendly).
-- Review before applying. Owner/admin = suhasmax.in@gmail.com (same as SUHAS MAX store).

create table if not exists public.ecom_vendors (
  id uuid primary key default gen_random_uuid(),
  shop_name text not null check (char_length(shop_name) between 2 and 80),
  owner_name text not null check (char_length(owner_name) between 2 and 80),
  phone text not null check (char_length(phone) between 6 and 20),
  email text,
  city text,
  category text,
  note text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.ecom_products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.ecom_vendors(id) on delete set null,
  name text not null check (char_length(name) between 2 and 160),
  category text not null default 'General',
  description text,
  price_bdt numeric(12,2) not null check (price_bdt >= 0),
  compare_at_bdt numeric(12,2),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ecom_orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  customer_name text not null check (char_length(customer_name) between 2 and 80),
  phone text not null check (char_length(phone) between 6 and 20),
  address text not null check (char_length(address) between 5 and 300),
  payment_method text not null default 'cod' check (payment_method in ('cod','bkash','nagad')),
  payment_ref text,
  items jsonb not null,
  subtotal_bdt numeric(12,2) not null check (subtotal_bdt >= 0),
  delivery_bdt numeric(12,2) not null default 0,
  total_bdt numeric(12,2) not null check (total_bdt >= 0),
  status text not null default 'new' check (status in ('new','confirmed','shipped','delivered','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.ecom_vendors enable row level security;
alter table public.ecom_products enable row level security;
alter table public.ecom_orders enable row level security;

create or replace function public.ecom_is_admin() returns boolean
language sql stable as $$ select coalesce(auth.jwt() ->> 'email','') = 'suhasmax.in@gmail.com' $$;

-- Vendors: anyone may apply (always pending); public sees approved only; admin manages.
drop policy if exists ecom_vendors_apply on public.ecom_vendors;
create policy ecom_vendors_apply on public.ecom_vendors for insert to anon, authenticated
  with check (status = 'pending');
drop policy if exists ecom_vendors_read on public.ecom_vendors;
create policy ecom_vendors_read on public.ecom_vendors for select to anon, authenticated
  using (status = 'approved' or public.ecom_is_admin());
drop policy if exists ecom_vendors_admin on public.ecom_vendors;
create policy ecom_vendors_admin on public.ecom_vendors for update to authenticated
  using (public.ecom_is_admin()) with check (public.ecom_is_admin());

-- Products: public sees active; only admin writes.
drop policy if exists ecom_products_read on public.ecom_products;
create policy ecom_products_read on public.ecom_products for select to anon, authenticated
  using (is_active or public.ecom_is_admin());
drop policy if exists ecom_products_admin on public.ecom_products;
create policy ecom_products_admin on public.ecom_products for all to authenticated
  using (public.ecom_is_admin()) with check (public.ecom_is_admin());

-- Orders: guests may place (status forced to new); only admin reads/updates.
drop policy if exists ecom_orders_place on public.ecom_orders;
create policy ecom_orders_place on public.ecom_orders for insert to anon, authenticated
  with check (status = 'new');
drop policy if exists ecom_orders_admin_read on public.ecom_orders;
create policy ecom_orders_admin_read on public.ecom_orders for select to authenticated
  using (public.ecom_is_admin());
drop policy if exists ecom_orders_admin_update on public.ecom_orders;
create policy ecom_orders_admin_update on public.ecom_orders for update to authenticated
  using (public.ecom_is_admin()) with check (public.ecom_is_admin());

create index if not exists ecom_products_active_idx on public.ecom_products (is_active, category);
create index if not exists ecom_orders_created_idx on public.ecom_orders (created_at desc);
