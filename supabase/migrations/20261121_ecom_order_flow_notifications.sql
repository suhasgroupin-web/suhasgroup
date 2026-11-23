-- SUHAS E-COM: Alibaba-style catalogue fields, order workflow, notifications, delivery-person link.
-- Flow: customer places order (new) -> seller/admin confirms -> processing -> shipped (delivery person assigned)
--       -> delivery person marks delivered via secret link -> seller/admin notified.

-- ---------- Product catalogue fields ----------
alter table public.ecom_products
  add column if not exists images text[] not null default '{}',
  add column if not exists min_order integer not null default 1,
  add column if not exists unit text not null default 'piece',
  add column if not exists brand text,
  add column if not exists lead_time text,
  add column if not exists specs jsonb not null default '[]'::jsonb;
alter table public.ecom_products drop constraint if exists ecom_products_min_order_chk;
alter table public.ecom_products add constraint ecom_products_min_order_chk check (min_order between 1 and 99);

-- ---------- Order workflow fields ----------
alter table public.ecom_orders
  add column if not exists delivery_token uuid not null default gen_random_uuid(),
  add column if not exists delivery_person text,
  add column if not exists delivery_phone text,
  add column if not exists confirmed_at timestamptz,
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz;
create unique index if not exists ecom_orders_delivery_token_idx on public.ecom_orders (delivery_token);

create table if not exists public.ecom_order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.ecom_orders(id) on delete cascade,
  status text not null,
  note text,
  actor text,
  created_at timestamptz not null default now()
);
create index if not exists ecom_order_events_order_idx on public.ecom_order_events (order_id, created_at);
alter table public.ecom_order_events enable row level security;
drop policy if exists ecom_events_select on public.ecom_order_events;
create policy ecom_events_select on public.ecom_order_events for select to authenticated
  using (public.ecom_is_admin() or public.ecom_vendor_has_order(order_id));

create table if not exists public.ecom_notifications (
  id uuid primary key default gen_random_uuid(),
  audience text not null check (audience in ('admin','vendor')),
  vendor_id uuid references public.ecom_vendors(id) on delete cascade,
  order_id uuid references public.ecom_orders(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists ecom_notifications_vendor_idx on public.ecom_notifications (vendor_id, created_at desc);
create index if not exists ecom_notifications_audience_idx on public.ecom_notifications (audience, created_at desc);
alter table public.ecom_notifications enable row level security;
drop policy if exists ecom_notif_select on public.ecom_notifications;
create policy ecom_notif_select on public.ecom_notifications for select to authenticated
  using ((audience = 'admin' and public.ecom_is_admin()) or (audience = 'vendor' and (public.ecom_owns_vendor(vendor_id) or public.ecom_is_admin())));
drop policy if exists ecom_notif_update on public.ecom_notifications;
create policy ecom_notif_update on public.ecom_notifications for update to authenticated
  using ((audience = 'admin' and public.ecom_is_admin()) or (audience = 'vendor' and (public.ecom_owns_vendor(vendor_id) or public.ecom_is_admin())))
  with check ((audience = 'admin' and public.ecom_is_admin()) or (audience = 'vendor' and (public.ecom_owns_vendor(vendor_id) or public.ecom_is_admin())));
revoke update on public.ecom_notifications from authenticated;
grant update (is_read) on public.ecom_notifications to authenticated;

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'ecom_notifications') then
    alter publication supabase_realtime add table public.ecom_notifications;
  end if;
end $$;

-- ---------- Internal notification helper ----------
create or replace function public.ecom_notify_order(p_order uuid, p_kind text, p_title text, p_body text, p_admin boolean, p_vendors boolean)
returns void language plpgsql security definer set search_path = '' as $function$
begin
  if p_admin then
    insert into public.ecom_notifications (audience, order_id, kind, title, body) values ('admin', p_order, p_kind, p_title, p_body);
  end if;
  if p_vendors then
    insert into public.ecom_notifications (audience, vendor_id, order_id, kind, title, body)
    select distinct 'vendor'::text, i.vendor_id, p_order, p_kind, p_title, p_body
      from public.ecom_order_items i where i.order_id = p_order;
  end if;
end $function$;
revoke all on function public.ecom_notify_order(uuid,text,text,text,boolean,boolean) from public, anon, authenticated;

-- ---------- Place order (guest checkout): starts as NEW, notifies admin + sellers ----------
create or replace function public.ecom_place_order(
  p_name text, p_phone text, p_address text, p_email text,
  p_pay text, p_ref text, p_items jsonb
) returns jsonb
language plpgsql security definer set search_path = ''
as $function$
declare
  r record; prod record; oid uuid; code text;
  mail_token uuid := pg_catalog.gen_random_uuid();
  sub numeric := 0; ship numeric := 0; cnt int := 0;
begin
  if pg_catalog.char_length(pg_catalog.btrim(coalesce(p_name,''))) < 2
     or pg_catalog.char_length(pg_catalog.btrim(coalesce(p_phone,''))) < 6
     or pg_catalog.char_length(pg_catalog.btrim(coalesce(p_address,''))) < 5 then
    raise exception 'Please enter your name, phone number and delivery address.';
  end if;
  if pg_catalog.length(pg_catalog.btrim(coalesce(p_email,''))) > 254
     or pg_catalog.btrim(coalesce(p_email,'')) !~* '^[A-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+$' then
    raise exception 'Please enter a valid email address for your order confirmation.';
  end if;
  if p_pay not in ('cod','bkash','nagad') then raise exception 'Invalid payment method.'; end if;
  if p_pay <> 'cod' and pg_catalog.char_length(pg_catalog.btrim(coalesce(p_ref,''))) < 4 then
    raise exception 'Please enter the payment transaction ID.';
  end if;
  if p_items is null or pg_catalog.jsonb_typeof(p_items) <> 'array'
     or pg_catalog.jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'Your cart is empty.';
  end if;
  loop
    code := 'SE-' || pg_catalog.to_char(pg_catalog.now() at time zone 'Asia/Dhaka', 'YYMMDD') || '-' ||
            pg_catalog.lpad(pg_catalog.floor(pg_catalog.random() * 100000)::int::text, 5, '0');
    exit when not exists (select 1 from public.ecom_orders where order_code = code);
  end loop;
  insert into public.ecom_orders
    (order_code, customer_name, phone, address, customer_email, payment_method, payment_ref, status, email_send_token)
  values
    (code, left(trim(p_name),80), left(trim(p_phone),20), left(trim(p_address),300),
     lower(trim(p_email)), p_pay,
     case when p_pay = 'cod' then null else left(trim(p_ref),40) end,
     'new', mail_token)
  returning id into oid;
  for r in
    select (e ->> 'id')::uuid as pid, sum(least(greatest((e ->> 'qty')::int, 1), 99)) as qty
    from pg_catalog.jsonb_array_elements(p_items) e group by 1
  loop
    select p.*, v.status as vstatus into prod
      from public.ecom_products p join public.ecom_vendors v on v.id = p.vendor_id
      where p.id = r.pid for update of p;
    if not found or not prod.is_active or prod.vstatus <> 'approved' then
      raise exception 'A product in your cart is no longer available.';
    end if;
    if r.qty < prod.min_order then
      raise exception 'Minimum order for "%" is % %.', prod.name, prod.min_order, prod.unit;
    end if;
    if prod.stock < r.qty then
      raise exception 'Not enough stock for "%". Only % left.', prod.name, prod.stock;
    end if;
    update public.ecom_products set stock = stock - r.qty where id = prod.id;
    insert into public.ecom_order_items (order_id, vendor_id, product_id, name, price_bdt, qty)
      values (oid, prod.vendor_id, prod.id, prod.name, prod.price_bdt, least(r.qty, 99));
    sub := sub + prod.price_bdt * r.qty;
    cnt := cnt + 1;
  end loop;
  ship := case when sub >= 2000 then 0 else 120 end;
  update public.ecom_orders set subtotal_bdt = sub, delivery_bdt = ship, total_bdt = sub + ship where id = oid;
  insert into public.ecom_order_events (order_id, status, note, actor) values (oid, 'new', 'Order placed by customer', 'customer');
  perform public.ecom_notify_order(oid, 'new_order',
    'New order ' || code,
    left(trim(p_name),80) || ' · ' || cnt || ' item(s) · ৳' || (sub + ship)::text || ' · ' || upper(p_pay) || '. Please confirm the order.',
    true, true);
  return pg_catalog.jsonb_build_object(
    'order_code', code, 'subtotal', sub, 'delivery', ship, 'total', sub + ship,
    'email_token', mail_token, 'status', 'new'
  );
end
$function$;
revoke execute on function public.ecom_place_order(text,text,text,text,text,text,jsonb) from public;
grant execute on function public.ecom_place_order(text,text,text,text,text,text,jsonb) to anon, authenticated;

-- ---------- Seller / admin order status changes ----------
create or replace function public.ecom_set_order_status(
  p_order uuid, p_status text, p_person text default null, p_person_phone text default null
) returns jsonb
language plpgsql security definer set search_path = ''
as $function$
declare
  o public.ecom_orders%rowtype;
  adm boolean := public.ecom_is_admin();
  ok boolean;
  who text;
  label text;
begin
  select * into o from public.ecom_orders where id = p_order for update;
  if not found then raise exception 'Order not found.'; end if;
  if not adm and not public.ecom_vendor_has_order(p_order) then raise exception 'You are not allowed to update this order.'; end if;
  ok := (o.status = 'new'        and p_status in ('confirmed','cancelled'))
     or (o.status = 'confirmed'  and p_status in ('processing','shipped','cancelled'))
     or (o.status = 'processing' and p_status in ('shipped','cancelled'))
     or (adm and o.status = 'shipped' and p_status in ('delivered','cancelled'));
  if not ok then raise exception 'Cannot change this order from % to %.', o.status, p_status; end if;
  if p_status = 'shipped' and pg_catalog.char_length(pg_catalog.btrim(coalesce(p_person,''))) < 2
     and pg_catalog.char_length(pg_catalog.btrim(coalesce(o.delivery_person,''))) < 2 then
    raise exception 'Enter the delivery person name before marking the order as shipped.';
  end if;
  who := case when adm then 'admin' else 'seller' end;

  update public.ecom_orders set
    status = p_status,
    confirmed_at = case when p_status = 'confirmed' then pg_catalog.now() else confirmed_at end,
    shipped_at = case when p_status = 'shipped' then pg_catalog.now() else shipped_at end,
    delivered_at = case when p_status = 'delivered' then pg_catalog.now() else delivered_at end,
    delivery_person = coalesce(nullif(pg_catalog.btrim(coalesce(p_person,'')),''), delivery_person),
    delivery_phone = coalesce(nullif(pg_catalog.btrim(coalesce(p_person_phone,'')),''), delivery_phone)
  where id = p_order;

  update public.ecom_order_items set status = case p_status
      when 'processing' then 'packed' when 'shipped' then 'shipped'
      when 'delivered' then 'delivered' when 'cancelled' then 'cancelled' else status end
    where order_id = p_order and p_status in ('processing','shipped','delivered','cancelled');

  if p_status = 'cancelled' then
    update public.ecom_products p set stock = p.stock + i.qty
      from public.ecom_order_items i where i.order_id = p_order and p.id = i.product_id;
  end if;

  label := case p_status when 'confirmed' then 'Order confirmed by ' || who
                         when 'processing' then 'Order is being packed'
                         when 'shipped' then 'Out for delivery'
                         when 'delivered' then 'Delivered'
                         else 'Order cancelled by ' || who end;
  insert into public.ecom_order_events (order_id, status, note, actor) values (p_order, p_status, label, who);
  perform public.ecom_notify_order(p_order, 'status_' || p_status, label || ': ' || o.order_code,
    'Customer: ' || o.customer_name || ' · ' || o.phone, adm, true);
  return pg_catalog.jsonb_build_object('order_code', o.order_code, 'status', p_status);
end
$function$;
revoke execute on function public.ecom_set_order_status(uuid,text,text,text) from public, anon;
grant execute on function public.ecom_set_order_status(uuid,text,text,text) to authenticated;

-- ---------- Delivery person (secret link, no login) ----------
create or replace function public.ecom_delivery_view(p_token uuid)
returns jsonb language sql stable security definer set search_path = '' as $function$
  select pg_catalog.jsonb_build_object(
    'order_code', o.order_code, 'status', o.status, 'customer_name', o.customer_name, 'phone', o.phone,
    'address', o.address, 'payment_method', o.payment_method, 'total', o.total_bdt,
    'delivery_person', o.delivery_person,
    'collect_cash', case when o.payment_method = 'cod' then o.total_bdt else 0 end,
    'items', (select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('name', i.name, 'qty', i.qty)), '[]'::jsonb)
                from public.ecom_order_items i where i.order_id = o.id))
  from public.ecom_orders o
  where o.delivery_token = p_token and o.status in ('shipped','delivered')
$function$;

create or replace function public.ecom_delivery_complete(p_token uuid)
returns jsonb language plpgsql security definer set search_path = '' as $function$
declare o public.ecom_orders%rowtype;
begin
  update public.ecom_orders set status = 'delivered', delivered_at = pg_catalog.now()
    where delivery_token = p_token and status = 'shipped' returning * into o;
  if not found then raise exception 'This delivery is not open or was already completed.'; end if;
  update public.ecom_order_items set status = 'delivered' where order_id = o.id;
  insert into public.ecom_order_events (order_id, status, note, actor)
    values (o.id, 'delivered', 'Delivered' || coalesce(' by ' || o.delivery_person, ''), 'delivery');
  perform public.ecom_notify_order(o.id, 'status_delivered', 'Delivery done: ' || o.order_code,
    'Delivered to ' || o.customer_name || coalesce(' by ' || o.delivery_person, '') || '.', true, true);
  return pg_catalog.jsonb_build_object('order_code', o.order_code, 'status', 'delivered');
end
$function$;
revoke all on function public.ecom_delivery_view(uuid) from public;
revoke all on function public.ecom_delivery_complete(uuid) from public;
grant execute on function public.ecom_delivery_view(uuid) to anon, authenticated;
grant execute on function public.ecom_delivery_complete(uuid) to anon, authenticated;

-- ---------- Customer tracking (order code + phone) ----------
create or replace function public.ecom_track_order(p_code text, p_phone text)
returns jsonb language sql stable security definer set search_path = 'public' as $function$
  select jsonb_build_object(
    'order_code', o.order_code, 'status', o.status, 'total', o.total_bdt, 'created_at', o.created_at,
    'delivery_person', o.delivery_person, 'delivery_phone', o.delivery_phone,
    'items', (select coalesce(jsonb_agg(jsonb_build_object('name', i.name, 'qty', i.qty, 'price', i.price_bdt, 'status', i.status)), '[]'::jsonb)
              from public.ecom_order_items i where i.order_id = o.id),
    'events', (select coalesce(jsonb_agg(jsonb_build_object('status', e.status, 'note', e.note, 'at', e.created_at) order by e.created_at), '[]'::jsonb)
              from public.ecom_order_events e where e.order_id = o.id))
  from public.ecom_orders o
  where o.order_code = upper(trim(p_code))
    and right(regexp_replace(o.phone, '\D', '', 'g'), 8) = right(regexp_replace(coalesce(p_phone,''), '\D', '', 'g'), 8)
    and length(regexp_replace(coalesce(p_phone,''), '\D', '', 'g')) >= 6
$function$;
grant execute on function public.ecom_track_order(text,text) to anon, authenticated;
