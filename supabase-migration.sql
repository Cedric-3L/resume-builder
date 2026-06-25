-- Add role column to profiles table for admin management
-- Run this in your Supabase SQL Editor (https://app.supabase.com/project/_/sql)

-- Step 1: Add the role column with default 'user'
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Step 2: Create RPC function to count auth users
CREATE OR REPLACE FUNCTION get_auth_user_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT count(*)::integer FROM auth.users;
$$;

-- Step 3: Set your account as admin (replace YOUR_EMAIL with your login email)
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL@example.com' LIMIT 1
-- );

-- Alternative: Set admin by user ID directly
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID';
