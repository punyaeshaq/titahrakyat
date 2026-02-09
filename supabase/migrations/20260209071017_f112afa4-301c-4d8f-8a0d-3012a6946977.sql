
-- Drop the old overly permissive upload policy
DROP POLICY IF EXISTS "Admins can upload article images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update article images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete article images" ON storage.objects;

-- Recreate with proper role checks
CREATE POLICY "Admins can upload article images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'article-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Editors can upload article images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'article-images' AND has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins can update article images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'article-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Editors can update article images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'article-images' AND has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins can delete article images"
ON storage.objects FOR DELETE
USING (bucket_id = 'article-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Editors can delete article images"
ON storage.objects FOR DELETE
USING (bucket_id = 'article-images' AND has_role(auth.uid(), 'editor'::app_role));
