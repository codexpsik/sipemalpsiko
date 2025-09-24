-- Insert sample admin user profile for testing
-- Note: This user must be created through Supabase Auth interface first
-- Email: admin@sipemal.com, Password: admin123

-- Insert admin profile (assuming the user already exists in auth.users)
INSERT INTO public.profiles (user_id, nama, username, role, nomor_whatsapp, jenis_kelamin)
VALUES (
  -- Using a placeholder UUID - this will need to be updated with actual user_id from auth.users
  'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
  'Admin SIPEMAL',
  'admin',
  'admin',
  '081234567890',
  'laki-laki'
) ON CONFLICT (user_id) DO NOTHING;

-- Insert sample dosen profile for testing
INSERT INTO public.profiles (user_id, nama, username, role, nomor_whatsapp, jenis_kelamin)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d480'::uuid,
  'Dr. Sarah Wilson',
  'sarahwilson',
  'dosen',
  '081234567891',
  'perempuan'
) ON CONFLICT (user_id) DO NOTHING;

-- Insert sample mahasiswa profile for testing
INSERT INTO public.profiles (user_id, nama, username, role, nim, nomor_whatsapp, jenis_kelamin)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d481'::uuid,
  'Ahmad Rizki',
  'ahmadrizki',
  'mahasiswa',
  '2021001',
  '081234567892',
  'laki-laki'
) ON CONFLICT (user_id) DO NOTHING;