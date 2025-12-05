-- ============================================
-- Supabase Schema for GPT Backend
-- Run this in your Supabase SQL Editor
-- ============================================

-- Memory Table for storing user preferences and data
CREATE TABLE IF NOT EXISTS public.user_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Unique constraint for upsert operations
CREATE UNIQUE INDEX IF NOT EXISTS user_memory_user_key_idx 
  ON public.user_memory (user_id, key);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS user_memory_user_id_idx 
  ON public.user_memory (user_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_memory_updated_at 
  BEFORE UPDATE ON public.user_memory 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Templates table for storing templates in DB
CREATE TABLE IF NOT EXISTS public.templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER update_templates_updated_at 
  BEFORE UPDATE ON public.templates 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Storage Bucket Setup (Run in Dashboard)
-- ============================================
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create bucket "zips" (public or private)
-- 3. Create bucket "renders" (public or private)
-- 
-- For public buckets, files can be accessed directly.
-- For private buckets, use signed URLs.
