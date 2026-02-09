
-- Add scheduled_at column to articles
ALTER TABLE public.articles ADD COLUMN scheduled_at timestamp with time zone DEFAULT NULL;
