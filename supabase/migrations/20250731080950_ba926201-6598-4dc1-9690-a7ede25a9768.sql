-- Create demo accounts using proper auth functions
-- This uses Supabase's auth.users table correctly

-- Function to create a demo user
CREATE OR REPLACE FUNCTION create_demo_user(
  user_email TEXT,
  user_password TEXT,
  user_name TEXT,
  user_username TEXT,
  user_role user_role,
  user_nim TEXT DEFAULT NULL,
  user_phone TEXT DEFAULT '081234567890'
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Insert into auth.users with proper password hashing
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
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
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- Insert corresponding profile
  INSERT INTO public.profiles (
    user_id,
    nama,
    username,
    role,
    nim,
    nomor_whatsapp,
    jenis_kelamin
  ) VALUES (
    new_user_id,
    user_name,
    user_username,
    user_role,
    user_nim,
    user_phone,
    'laki-laki'
  );

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the demo accounts
SELECT create_demo_user('dosen@sipemal.com', 'password123', 'Dr. Ahmad Dosen', 'dosen123', 'dosen'::user_role, NULL, '081234567890');
SELECT create_demo_user('mahasiswa@sipemal.com', 'password123', 'Budi Mahasiswa', 'mahasiswa123', 'mahasiswa'::user_role, '12345678', '081234567891');

-- Drop the function after use
DROP FUNCTION create_demo_user(TEXT, TEXT, TEXT, TEXT, user_role, TEXT, TEXT);