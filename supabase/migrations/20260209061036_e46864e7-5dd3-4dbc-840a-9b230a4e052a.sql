-- Create videos table
CREATE TABLE public.videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  video_url TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT NOT NULL DEFAULT '',
  video_type TEXT NOT NULL DEFAULT 'url' CHECK (video_type IN ('url', 'upload')),
  duration TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Public can read all videos
CREATE POLICY "Public can read videos"
ON public.videos
FOR SELECT
USING (true);

-- Admins can manage videos
CREATE POLICY "Admins can manage videos"
ON public.videos
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Editors can manage videos
CREATE POLICY "Editors can manage videos"
ON public.videos
FOR ALL
USING (has_role(auth.uid(), 'editor'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_videos_updated_at
BEFORE UPDATE ON public.videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create storage bucket for video uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);

-- Storage policies for video uploads
CREATE POLICY "Anyone can view videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'videos');

CREATE POLICY "Admins can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Editors can upload videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'videos' AND has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins can delete videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Editors can delete videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'videos' AND has_role(auth.uid(), 'editor'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;