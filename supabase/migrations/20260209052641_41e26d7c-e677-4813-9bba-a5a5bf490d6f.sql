
-- Create editorial_staff table
CREATE TABLE public.editorial_staff (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position text NOT NULL,
  name text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.editorial_staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read editorial staff"
ON public.editorial_staff FOR SELECT
USING (true);

CREATE POLICY "Admins can manage editorial staff"
ON public.editorial_staff FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Editors can manage editorial staff"
ON public.editorial_staff FOR ALL
USING (has_role(auth.uid(), 'editor'::app_role));

-- Seed default positions
INSERT INTO public.editorial_staff (position, sort_order) VALUES
  ('Pemimpin Umum', 1),
  ('Pemimpin Redaksi', 2),
  ('Redaktur Pelaksana', 3),
  ('Redaktur', 4),
  ('Reporter / Kontributor', 5),
  ('Editor', 6),
  ('Admin & Media Sosial', 7);
