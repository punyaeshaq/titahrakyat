-- Site settings (key-value store for about, visi, misi, etc.)
CREATE TABLE public.site_settings (
  key TEXT NOT NULL PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings"
ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Admins can manage site settings"
ON public.site_settings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Editors can manage site settings"
ON public.site_settings FOR ALL USING (has_role(auth.uid(), 'editor'::app_role));

-- Seed default values
INSERT INTO public.site_settings (key, value) VALUES
  ('about', 'MenaraPublik.News adalah media online independen yang menyajikan berita terkini, akurat, dan terpercaya untuk masyarakat Indonesia.'),
  ('visi', 'Menjadi media berita digital terdepan yang menyajikan informasi berkualitas dan berimbang untuk mencerdaskan kehidupan bangsa.'),
  ('misi', 'Menyajikan berita yang akurat, berimbang, dan bertanggung jawab.\nMendorong transparansi dan akuntabilitas publik.\nMemberikan ruang bagi suara masyarakat.\nMemanfaatkan teknologi untuk inovasi penyampaian informasi.');

-- Social media links
CREATE TABLE public.social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read social links"
ON public.social_links FOR SELECT USING (true);

CREATE POLICY "Admins can manage social links"
ON public.social_links FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Editors can manage social links"
ON public.social_links FOR ALL USING (has_role(auth.uid(), 'editor'::app_role));

-- Seed default social links
INSERT INTO public.social_links (platform, url, icon, sort_order) VALUES
  ('Facebook', '', 'facebook', 1),
  ('Twitter / X', '', 'twitter', 2),
  ('Instagram', '', 'instagram', 3),
  ('YouTube', '', 'youtube', 4),
  ('TikTok', '', 'tiktok', 5);