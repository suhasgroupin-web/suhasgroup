-- Add SUHAS-MAX groups without changing existing social tables or records.
CREATE TABLE IF NOT EXISTS public.suhas_groups (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL CHECK (char_length(name) BETWEEN 3 AND 80),
 description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 1000),
 category text NOT NULL DEFAULT 'General' CHECK (char_length(category) <= 40),
 privacy text NOT NULL DEFAULT 'public' CHECK (privacy IN ('public','private')),
 created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.suhas_group_members (
 group_id uuid NOT NULL REFERENCES public.suhas_groups(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
 joined_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(group_id,user_id)
);
CREATE TABLE IF NOT EXISTS public.suhas_group_posts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 group_id uuid NOT NULL REFERENCES public.suhas_groups(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 5000),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS suhas_groups_created_idx ON public.suhas_groups(created_at DESC);
CREATE INDEX IF NOT EXISTS suhas_group_members_user_idx ON public.suhas_group_members(user_id,joined_at DESC);
CREATE INDEX IF NOT EXISTS suhas_group_posts_group_created_idx ON public.suhas_group_posts(group_id,created_at DESC);

CREATE OR REPLACE FUNCTION private.is_suhas_group_member(p_group_id uuid,p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$ SELECT EXISTS (SELECT 1 FROM public.suhas_group_members gm WHERE gm.group_id=p_group_id AND gm.user_id=p_user_id) $$;
REVOKE ALL ON FUNCTION private.is_suhas_group_member(uuid,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.is_suhas_group_member(uuid,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION private.add_suhas_group_owner()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$ BEGIN INSERT INTO public.suhas_group_members(group_id,user_id,role) VALUES(NEW.id,NEW.created_by,'owner') ON CONFLICT DO NOTHING; RETURN NEW; END $$;
REVOKE ALL ON FUNCTION private.add_suhas_group_owner() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS suhas_group_add_owner ON public.suhas_groups;
CREATE TRIGGER suhas_group_add_owner AFTER INSERT ON public.suhas_groups FOR EACH ROW EXECUTE FUNCTION private.add_suhas_group_owner();

ALTER TABLE public.suhas_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suhas_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suhas_group_posts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.suhas_groups,public.suhas_group_members,public.suhas_group_posts FROM anon;
GRANT SELECT,INSERT,UPDATE ON public.suhas_groups TO authenticated;
GRANT SELECT,INSERT ON public.suhas_group_members TO authenticated;
GRANT SELECT,INSERT,DELETE ON public.suhas_group_posts TO authenticated;
CREATE POLICY "Members discover public or joined groups" ON public.suhas_groups FOR SELECT TO authenticated USING (privacy='public' OR created_by=(SELECT auth.uid()) OR private.is_suhas_group_member(id,(SELECT auth.uid())));
CREATE POLICY "Members create groups as themselves" ON public.suhas_groups FOR INSERT TO authenticated WITH CHECK (created_by=(SELECT auth.uid()));
CREATE POLICY "Owners update their groups" ON public.suhas_groups FOR UPDATE TO authenticated USING (created_by=(SELECT auth.uid())) WITH CHECK (created_by=(SELECT auth.uid()));
CREATE POLICY "Members view group memberships" ON public.suhas_group_members FOR SELECT TO authenticated USING (user_id=(SELECT auth.uid()) OR private.is_suhas_group_member(group_id,(SELECT auth.uid())));
CREATE POLICY "Members join public groups" ON public.suhas_group_members FOR INSERT TO authenticated WITH CHECK (user_id=(SELECT auth.uid()) AND role='member' AND EXISTS (SELECT 1 FROM public.suhas_groups g WHERE g.id=group_id AND g.privacy='public'));
CREATE POLICY "Members leave groups" ON public.suhas_group_members FOR DELETE TO authenticated USING (user_id=(SELECT auth.uid()) AND role<>'owner');
CREATE POLICY "Members read posts in joined groups" ON public.suhas_group_posts FOR SELECT TO authenticated USING (private.is_suhas_group_member(group_id,(SELECT auth.uid())));
CREATE POLICY "Members post in joined groups" ON public.suhas_group_posts FOR INSERT TO authenticated WITH CHECK (user_id=(SELECT auth.uid()) AND private.is_suhas_group_member(group_id,(SELECT auth.uid())));
CREATE POLICY "Authors delete own group posts" ON public.suhas_group_posts FOR DELETE TO authenticated USING (user_id=(SELECT auth.uid()));
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') AND NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='suhas_group_posts') THEN ALTER PUBLICATION supabase_realtime ADD TABLE public.suhas_group_posts; END IF; END $$;
