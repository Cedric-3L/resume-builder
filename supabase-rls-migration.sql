-- Supabase RLS Migration for Resume Builder
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- ============================================================
-- 1. Resumes table
-- ============================================================
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only access own resumes" ON public.resumes;
CREATE POLICY "Users can only access own resumes" ON public.resumes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 2. Profiles table
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can only update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can only upsert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 3. Favorite templates table
-- ============================================================
ALTER TABLE public.favorite_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only access own favorites" ON public.favorite_templates;
CREATE POLICY "Users can only access own favorites" ON public.favorite_templates
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4. Short-lived PDF print jobs table
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.print_resume_jobs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL,
  payload     JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_print_resume_jobs_expires_at
  ON public.print_resume_jobs(expires_at);

CREATE INDEX IF NOT EXISTS idx_print_resume_jobs_user_id
  ON public.print_resume_jobs(user_id);

ALTER TABLE public.print_resume_jobs ENABLE ROW LEVEL SECURITY;

-- No client-side policies are created for print_resume_jobs.
-- The application server uses the service role key and a one-time token to consume rows.

-- ============================================================
-- Verify
-- ============================================================
-- Check that all tables have RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('resumes', 'profiles', 'favorite_templates', 'print_resume_jobs');
