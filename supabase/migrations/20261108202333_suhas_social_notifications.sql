-- Add private member notifications without changing existing social records.
CREATE TABLE IF NOT EXISTS public.suhas_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (kind IN ('friend_request','post_like','post_comment','message')),
  entity_type text NOT NULL CHECK (entity_type IN ('friend_request','post','message')),
  entity_id text NOT NULL,
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 240),
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  CONSTRAINT suhas_notifications_no_self CHECK (actor_id IS NULL OR actor_id <> recipient_id)
);
CREATE INDEX IF NOT EXISTS suhas_notifications_recipient_created_idx ON public.suhas_notifications (recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS suhas_notifications_unread_idx ON public.suhas_notifications (recipient_id, created_at DESC) WHERE read_at IS NULL;
ALTER TABLE public.suhas_notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.suhas_notifications FROM anon;
GRANT SELECT, UPDATE ON TABLE public.suhas_notifications TO authenticated;
CREATE POLICY "Members read own notifications" ON public.suhas_notifications FOR SELECT TO authenticated USING ((SELECT auth.uid()) = recipient_id);
CREATE POLICY "Members mark own notifications read" ON public.suhas_notifications FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = recipient_id) WITH CHECK ((SELECT auth.uid()) = recipient_id);

CREATE OR REPLACE FUNCTION private.capture_suhas_notification()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_recipient uuid; v_actor uuid; v_kind text; v_entity_type text; v_entity_id text; v_message text;
  v_row jsonb := to_jsonb(NEW); v_member record;
BEGIN
  IF TG_TABLE_NAME = 'suhas_friend_requests' THEN
    v_recipient := (v_row->>'recipient_id')::uuid; v_actor := (v_row->>'sender_id')::uuid;
    IF v_row->>'status' <> 'pending' THEN RETURN NEW; END IF;
    v_kind := 'friend_request'; v_entity_type := 'friend_request'; v_entity_id := v_row->>'id'; v_message := 'sent you a friend request';
    IF v_recipient <> v_actor THEN INSERT INTO public.suhas_notifications(recipient_id,actor_id,kind,entity_type,entity_id,message) VALUES(v_recipient,v_actor,v_kind,v_entity_type,v_entity_id,v_message); END IF;
  ELSIF TG_TABLE_NAME = 'suhas_post_likes' THEN
    SELECT user_id INTO v_recipient FROM public.suhas_posts WHERE id = (v_row->>'post_id')::bigint;
    v_actor := (v_row->>'user_id')::uuid; v_kind := 'post_like'; v_entity_type := 'post'; v_entity_id := v_row->>'post_id'; v_message := 'liked your post';
    IF v_recipient IS NOT NULL AND v_recipient <> v_actor THEN INSERT INTO public.suhas_notifications(recipient_id,actor_id,kind,entity_type,entity_id,message) VALUES(v_recipient,v_actor,v_kind,v_entity_type,v_entity_id,v_message); END IF;
  ELSIF TG_TABLE_NAME = 'suhas_post_comments' THEN
    SELECT user_id INTO v_recipient FROM public.suhas_posts WHERE id = (v_row->>'post_id')::bigint;
    v_actor := (v_row->>'user_id')::uuid; v_kind := 'post_comment'; v_entity_type := 'post'; v_entity_id := v_row->>'post_id'; v_message := 'commented on your post';
    IF v_recipient IS NOT NULL AND v_recipient <> v_actor THEN INSERT INTO public.suhas_notifications(recipient_id,actor_id,kind,entity_type,entity_id,message) VALUES(v_recipient,v_actor,v_kind,v_entity_type,v_entity_id,v_message); END IF;
  ELSIF TG_TABLE_NAME = 'suhas_messages' THEN
    v_actor := (v_row->>'sender_id')::uuid; v_kind := 'message'; v_entity_type := 'message'; v_entity_id := v_row->>'id'; v_message := 'sent you a message';
    FOR v_member IN SELECT user_id FROM public.suhas_conversation_members WHERE conversation_id = (v_row->>'conversation_id')::uuid AND user_id <> v_actor LOOP
      INSERT INTO public.suhas_notifications(recipient_id,actor_id,kind,entity_type,entity_id,message) VALUES(v_member.user_id,v_actor,v_kind,v_entity_type,v_entity_id,v_message);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.capture_suhas_notification() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER suhas_notify_friend_request AFTER INSERT ON public.suhas_friend_requests FOR EACH ROW EXECUTE FUNCTION private.capture_suhas_notification();
CREATE TRIGGER suhas_notify_post_like AFTER INSERT ON public.suhas_post_likes FOR EACH ROW EXECUTE FUNCTION private.capture_suhas_notification();
CREATE TRIGGER suhas_notify_post_comment AFTER INSERT ON public.suhas_post_comments FOR EACH ROW EXECUTE FUNCTION private.capture_suhas_notification();
CREATE TRIGGER suhas_notify_message AFTER INSERT ON public.suhas_messages FOR EACH ROW EXECUTE FUNCTION private.capture_suhas_notification();
