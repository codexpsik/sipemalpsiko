-- Fix RLS policies for profiles table to allow user registration
-- Drop the problematic INSERT policy that requires admin role for profile creation
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;

-- Allow users to insert their own profile during registration
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Also allow users to view their own profile and others can view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);