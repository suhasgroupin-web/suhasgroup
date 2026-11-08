-- Add a dedicated, bounded media bucket for SUHAS-MAX social posts and marketplace photos.
INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('suhas-max-media','suhas-max-media',true,26214400,ARRAY['image/jpeg','image/png','image/webp','video/mp4','video/webm'])
ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.suhas_posts ADD COLUMN IF NOT EXISTS media_url text;
ALTER TABLE public.suhas_posts ADD COLUMN IF NOT EXISTS media_path text;
ALTER TABLE public.suhas_posts ADD COLUMN IF NOT EXISTS media_type text;
ALTER TABLE public.suhas_marketplace_listings ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.suhas_marketplace_listings ADD COLUMN IF NOT EXISTS image_path text;
CREATE POLICY "Public read SUHAS-MAX media" ON storage.objects FOR SELECT TO public USING (bucket_id='suhas-max-media');
CREATE POLICY "Members upload own SUHAS-MAX media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='suhas-max-media' AND (storage.foldername(name))[1]=(SELECT auth.uid())::text);
CREATE POLICY "Members update own SUHAS-MAX media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id='suhas-max-media' AND (storage.foldername(name))[1]=(SELECT auth.uid())::text) WITH CHECK (bucket_id='suhas-max-media' AND (storage.foldername(name))[1]=(SELECT auth.uid())::text);
CREATE POLICY "Members delete own SUHAS-MAX media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id='suhas-max-media' AND (storage.foldername(name))[1]=(SELECT auth.uid())::text);
