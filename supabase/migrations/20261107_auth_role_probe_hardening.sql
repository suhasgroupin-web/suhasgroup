-- SUHAS GROUP: tighten client-visible role checks.
-- Apply through Supabase SQL Editor or the project's migration deployment process.
BEGIN;

CREATE OR REPLACE FUNCTION public.has_suhas_role(
  p_user_id uuid,
  p_roles text[]
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND p_user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role = ANY(p_roles)
    );
$$;

REVOKE ALL ON FUNCTION public.has_suhas_role(uuid, text[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_suhas_role(uuid, text[]) TO authenticated;

COMMIT;
