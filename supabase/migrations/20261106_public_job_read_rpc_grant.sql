-- Public jobs SELECT policy calls is_editor() for anonymous visitors.
-- The helper only returns whether auth.uid() has an editor role; it exposes no role data.
grant execute on function public.is_editor() to anon, authenticated;
