-- Add a member-to-member marketplace without modifying existing posts or member data.
CREATE TABLE IF NOT EXISTS public.suhas_marketplace_listings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
 description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 3000),
 category text NOT NULL DEFAULT 'Other' CHECK (char_length(category) <= 50),
 price numeric(12,2) NOT NULL CHECK (price >= 0),
 condition text NOT NULL DEFAULT 'used' CHECK (condition IN ('new','used')),
 status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','sold')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS suhas_marketplace_active_created_idx ON public.suhas_marketplace_listings(created_at DESC) WHERE status='active';
CREATE INDEX IF NOT EXISTS suhas_marketplace_seller_idx ON public.suhas_marketplace_listings(seller_id,created_at DESC);
ALTER TABLE public.suhas_marketplace_listings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.suhas_marketplace_listings FROM anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.suhas_marketplace_listings TO authenticated;
CREATE POLICY "Members browse active marketplace listings" ON public.suhas_marketplace_listings FOR SELECT TO authenticated USING (status='active' OR seller_id=(SELECT auth.uid()));
CREATE POLICY "Members create their own listings" ON public.suhas_marketplace_listings FOR INSERT TO authenticated WITH CHECK (seller_id=(SELECT auth.uid()));
CREATE POLICY "Sellers update their own listings" ON public.suhas_marketplace_listings FOR UPDATE TO authenticated USING (seller_id=(SELECT auth.uid())) WITH CHECK (seller_id=(SELECT auth.uid()));
CREATE POLICY "Sellers remove their own listings" ON public.suhas_marketplace_listings FOR DELETE TO authenticated USING (seller_id=(SELECT auth.uid()));
