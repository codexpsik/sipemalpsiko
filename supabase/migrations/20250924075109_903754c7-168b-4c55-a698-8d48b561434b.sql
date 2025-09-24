-- Fix security vulnerability: Restrict profile access
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a new secure policy that allows:
-- 1. Users to view their own profile
-- 2. Admins to view all profiles
CREATE POLICY "Users can view own profile, admins can view all"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.role = 'admin'
  )
);