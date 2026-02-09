
-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public) VALUES ('article-images', 'article-images', true);

-- Public read access
CREATE POLICY "Public can read article images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

-- Authenticated users (admin/editor) can upload
CREATE POLICY "Admins can upload article images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'article-images');

-- Admins can update
CREATE POLICY "Admins can update article images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'article-images');

-- Admins can delete
CREATE POLICY "Admins can delete article images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'article-images');
