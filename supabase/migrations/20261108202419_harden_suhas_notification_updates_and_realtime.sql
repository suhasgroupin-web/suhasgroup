-- Users may only set the read timestamp on their own notification rows.
REVOKE UPDATE ON TABLE public.suhas_notifications FROM authenticated;
GRANT UPDATE (read_at) ON TABLE public.suhas_notifications TO authenticated;

-- Enable notification INSERT events for the app's Realtime subscription when available.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'suhas_notifications'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.suhas_notifications;
  END IF;
END
$$;
