
-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Public can read approved comments
CREATE POLICY "Public can read approved comments"
ON public.comments FOR SELECT
USING (is_approved = true);

-- Anyone can insert comments (public commenting)
CREATE POLICY "Anyone can insert comments"
ON public.comments FOR INSERT
WITH CHECK (true);

-- Admins can manage all comments
CREATE POLICY "Admins can manage comments"
ON public.comments FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Editors can manage all comments
CREATE POLICY "Editors can manage comments"
ON public.comments FOR ALL
USING (public.has_role(auth.uid(), 'editor'::app_role));
