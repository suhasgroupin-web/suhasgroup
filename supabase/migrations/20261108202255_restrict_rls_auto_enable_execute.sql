-- Restrict the SECURITY DEFINER event-trigger function to trusted database roles.
-- The event trigger continues to run for DDL events; public API callers do not need EXECUTE.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;
