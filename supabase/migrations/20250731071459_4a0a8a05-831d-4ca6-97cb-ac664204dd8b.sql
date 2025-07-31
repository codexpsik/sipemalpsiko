-- Update RLS policy for equipment to allow public read access
-- This allows anyone to view equipment catalog without authentication

-- First drop the existing restrictive policy
DROP POLICY IF EXISTS "Everyone can view equipment" ON equipment;

-- Create new policy that allows public read access
CREATE POLICY "Everyone can view equipment" 
ON equipment 
FOR SELECT 
USING (true);

-- Keep the existing admin-only write policy
-- Only admins can manage equipment (CREATE, UPDATE, DELETE)
-- This policy should already exist but let's ensure it's correct
DROP POLICY IF EXISTS "Only admins can manage equipment" ON equipment;

CREATE POLICY "Only admins can manage equipment" 
ON equipment 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);