-- Update existing user to admin role
UPDATE profiles 
SET role = 'admin'
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'fawajirafi511@gmail.com'
);

-- Insert sample accounts for testing (these will need manual signup through the UI)
-- We can't directly insert into auth.users, but we can prepare profiles for when they sign up

-- Note: The actual user accounts need to be created through the signup process
-- This migration just ensures the admin role is set correctly