-- Create profile for the logged-in user who doesn't have a profile yet
INSERT INTO public.profiles (user_id, nama, username, role, nomor_whatsapp, jenis_kelamin)
VALUES (
  '636d8d8a-dbb1-4300-be2e-bbb603cc4407'::uuid,
  'Admin SIPEMAL',
  'admin',
  'admin',
  '081234567890',
  'laki-laki'
) ON CONFLICT (user_id) DO UPDATE SET
  nama = EXCLUDED.nama,
  username = EXCLUDED.username,
  role = EXCLUDED.role,
  nomor_whatsapp = EXCLUDED.nomor_whatsapp,
  jenis_kelamin = EXCLUDED.jenis_kelamin;