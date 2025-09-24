-- Create demo accounts for dosen and mahasiswa roles
-- Insert dosen user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'dosen@sipemal.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Insert mahasiswa user  
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'mahasiswa@sipemal.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Create profile for dosen
INSERT INTO public.profiles (
  user_id,
  nama,
  username,
  role,
  nomor_whatsapp,
  jenis_kelamin
) 
SELECT 
  id,
  'Dr. Ahmad Dosen',
  'dosen123',
  'dosen'::user_role,
  '081234567890',
  'laki-laki'::gender_type
FROM auth.users 
WHERE email = 'dosen@sipemal.com';

-- Create profile for mahasiswa
INSERT INTO public.profiles (
  user_id,
  nama,
  username,
  role,
  nim,
  nomor_whatsapp,
  jenis_kelamin
)
SELECT 
  id,
  'Budi Mahasiswa',
  'mahasiswa123',
  'mahasiswa'::user_role,
  '12345678',
  '081234567891',
  'laki-laki'::gender_type
FROM auth.users 
WHERE email = 'mahasiswa@sipemal.com';