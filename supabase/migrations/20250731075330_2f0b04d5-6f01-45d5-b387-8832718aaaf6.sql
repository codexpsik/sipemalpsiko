-- Create demo accounts for testing
-- Note: These are test passwords, should be changed in production

-- 1. Create demo admin account  
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-123456789012',
  '00000000-0000-0000-0000-000000000000',
  'admin@sipemal.com',
  crypt('password123', gen_salt('bf')),
  now(),
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{"email":"admin@sipemal.com"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- 2. Create demo dosen account
INSERT INTO auth.users (
  id,
  instance_id, 
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  'b2c3d4e5-f6g7-8901-bcde-234567890123',
  '00000000-0000-0000-0000-000000000000',
  'dosen@sipemal.com',
  crypt('password123', gen_salt('bf')),
  now(),
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{"email":"dosen@sipemal.com"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- 3. Create demo mahasiswa account
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  'c3d4e5f6-g7h8-9012-cdef-345678901234',
  '00000000-0000-0000-0000-000000000000',
  'mahasiswa@sipemal.com',
  crypt('password123', gen_salt('bf')),
  now(),
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{"email":"mahasiswa@sipemal.com"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create corresponding profiles
INSERT INTO public.profiles (
  user_id,
  nama,
  username,
  role,
  jenis_kelamin,
  nomor_whatsapp
) VALUES 
(
  'a1b2c3d4-e5f6-7890-abcd-123456789012',
  'Admin SIPEMAL',
  'admin',
  'admin',
  'laki-laki',
  '081234567890'
),
(
  'b2c3d4e5-f6g7-8901-bcde-234567890123', 
  'Dr. Contoh Dosen',
  'dosen',
  'dosen',
  'laki-laki',
  '081234567891'
),
(
  'c3d4e5f6-g7h8-9012-cdef-345678901234',
  'Mahasiswa Contoh',
  'mahasiswa',
  'mahasiswa', 
  'perempuan',
  '081234567892'
) ON CONFLICT (user_id) DO NOTHING;

-- Update mahasiswa profile with NIM
UPDATE public.profiles 
SET nim = '12345678901'
WHERE user_id = 'c3d4e5f6-g7h8-9012-cdef-345678901234';