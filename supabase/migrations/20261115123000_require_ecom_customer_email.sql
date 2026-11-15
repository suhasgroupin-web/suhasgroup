-- Enforce customer email on every SUHAS E-COM checkout.
-- The no-email overload is obsolete and would permit legacy clients to bypass confirmation-email capture.
drop function if exists public.ecom_place_order(text,text,text,text,text,jsonb);
