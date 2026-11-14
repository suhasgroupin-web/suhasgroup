
alter table public.ecom_orders
  add column if not exists customer_email text,
  add column if not exists email_send_token uuid,
  add column if not exists email_claimed_at timestamptz,
  add column if not exists email_sent_at timestamptz;

create or replace function public.ecom_place_order(
  p_name text, p_phone text, p_address text, p_email text,
  p_pay text, p_ref text, p_items jsonb
) returns jsonb
language plpgsql security definer set search_path = ''
as $function$
declare
  r record; prod record; oid uuid; code text;
  mail_token uuid := pg_catalog.gen_random_uuid();
  sub numeric := 0; ship numeric := 0;
begin
  if pg_catalog.char_length(pg_catalog.trim(coalesce(p_name,''))) < 2
     or pg_catalog.char_length(pg_catalog.trim(coalesce(p_phone,''))) < 6
     or pg_catalog.char_length(pg_catalog.trim(coalesce(p_address,''))) < 5 then
    raise exception 'Please enter your name, phone number and delivery address.';
  end if;
  if pg_catalog.length(pg_catalog.trim(coalesce(p_email,''))) > 254
     or pg_catalog.trim(coalesce(p_email,'')) !~* '^[A-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+$' then
    raise exception 'Please enter a valid email address for your order confirmation.';
  end if;
  if p_pay not in ('cod','bkash','nagad') then raise exception 'Invalid payment method.'; end if;
  if p_pay <> 'cod' and pg_catalog.char_length(pg_catalog.trim(coalesce(p_ref,''))) < 4 then
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
     'confirmed', mail_token)
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
    if prod.stock < r.qty then
      raise exception 'Not enough stock for "%". Only % left.', prod.name, prod.stock;
    end if;
    update public.ecom_products set stock = stock - r.qty where id = prod.id;
    insert into public.ecom_order_items (order_id, vendor_id, product_id, name, price_bdt, qty)
      values (oid, prod.vendor_id, prod.id, prod.name, prod.price_bdt, r.qty);
    sub := sub + prod.price_bdt * r.qty;
  end loop;
  ship := case when sub >= 2000 then 0 else 120 end;
  update public.ecom_orders set subtotal_bdt = sub, delivery_bdt = ship, total_bdt = sub + ship where id = oid;
  return pg_catalog.jsonb_build_object(
    'order_code', code, 'subtotal', sub, 'delivery', ship, 'total', sub + ship,
    'email_token', mail_token, 'status', 'confirmed'
  );
end
$function$;

revoke execute on function public.ecom_place_order(text,text,text,text,text,jsonb) from public, anon, authenticated;

create or replace function public.ecom_claim_order_email(p_token uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $function$
declare v_order public.ecom_orders%rowtype; v_items jsonb;
begin
  update public.ecom_orders o set email_claimed_at = pg_catalog.now()
   where o.email_send_token = p_token and o.email_sent_at is null
     and (o.email_claimed_at is null or o.email_claimed_at < pg_catalog.now() - interval '10 minutes')
  returning o.* into v_order;
  if not found then return null; end if;
  select coalesce(pg_catalog.jsonb_agg(
    pg_catalog.jsonb_build_object('name',i.name,'quantity',i.qty,'unit_price',i.price_bdt,'line_total',i.price_bdt*i.qty)
    order by i.name), '[]'::jsonb)
  into v_items from public.ecom_order_items i where i.order_id = v_order.id;
  return pg_catalog.jsonb_build_object(
    'order_code',v_order.order_code,'customer_name',v_order.customer_name,
    'customer_email',v_order.customer_email,'phone',v_order.phone,'address',v_order.address,
    'payment_method',v_order.payment_method,'subtotal',v_order.subtotal_bdt,
    'delivery',v_order.delivery_bdt,'total',v_order.total_bdt,'status',v_order.status,
    'created_at',v_order.created_at,'items',v_items
  );
end
$function$;

create or replace function public.ecom_mark_order_email_sent(p_token uuid)
returns boolean language plpgsql security definer set search_path = ''
as $function$
begin
  update public.ecom_orders set email_sent_at=pg_catalog.now(),email_send_token=null,email_claimed_at=null
   where email_send_token=p_token and email_sent_at is null
     and email_claimed_at > pg_catalog.now()-interval '10 minutes';
  return found;
end
$function$;

create or replace function public.ecom_release_order_email(p_token uuid)
returns boolean language plpgsql security definer set search_path = ''
as $function$
begin
  update public.ecom_orders set email_claimed_at=null
   where email_send_token=p_token and email_sent_at is null;
  return found;
end
$function$;

revoke all on function public.ecom_claim_order_email(uuid) from public;
revoke all on function public.ecom_mark_order_email_sent(uuid) from public;
revoke all on function public.ecom_release_order_email(uuid) from public;
grant execute on function public.ecom_claim_order_email(uuid) to anon, authenticated;
grant execute on function public.ecom_mark_order_email_sent(uuid) to anon, authenticated;
grant execute on function public.ecom_release_order_email(uuid) to anon, authenticated;
