-- Fix the email confirmation for demo users
-- Let's just update the email_confirmed_at field
UPDATE auth.users 
SET email_confirmed_at = now()
WHERE email IN ('admin@sipemal.com', 'dosen@sipemal.com', 'mahasiswa@sipemal.com')
AND email_confirmed_at IS NULL;