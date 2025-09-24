-- Delete the accounts I created with incorrect password format
DELETE FROM public.profiles WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('dosen@sipemal.com', 'mahasiswa@sipemal.com')
);

DELETE FROM auth.users WHERE email IN ('dosen@sipemal.com', 'mahasiswa@sipemal.com');