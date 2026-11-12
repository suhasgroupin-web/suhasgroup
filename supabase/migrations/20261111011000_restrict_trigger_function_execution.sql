-- Trigger-only functions must not be callable through the public RPC API.
-- PostgreSQL triggers continue to invoke these functions as part of their owning table operation.
revoke all on function public.suhas_dispatch_push_for_notification() from public, anon, authenticated;
revoke all on function public.suhas_record_paid_creator_payout() from public, anon, authenticated;
grant execute on function public.suhas_dispatch_push_for_notification() to postgres;
grant execute on function public.suhas_record_paid_creator_payout() to postgres;
