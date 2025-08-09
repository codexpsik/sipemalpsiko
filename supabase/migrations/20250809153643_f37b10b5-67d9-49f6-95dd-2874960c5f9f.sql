-- Create demo users with proper authentication
-- First, let's create a function to set user passwords (this is a one-time setup)

-- Insert or update auth users for demo accounts with known passwords
-- Note: In a real production environment, you would never do this

-- For now, let's create a simple SQL function to help with demo setup
-- We'll create these users through the application instead

-- Let's ensure all our demo users have email confirmation
UPDATE auth.users 
SET email_confirmed_at = now(), 
    confirmed_at = now(),
    last_sign_in_at = now()
WHERE email IN ('admin@sipemal.com', 'dosen@sipemal.com', 'mahasiswa@sipemal.com');

-- Also ensure profiles are properly linked
UPDATE profiles 
SET updated_at = now()
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('admin@sipemal.com', 'dosen@sipemal.com', 'mahasiswa@sipemal.com')
);