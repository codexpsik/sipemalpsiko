-- Note: These are the test accounts you should register manually through the /auth page
-- After registration, the profiles will be automatically created

-- Admin Account:
-- Email: admin@sipemal.test
-- Password: admin123

-- Dosen Account: 
-- Email: dosen@sipemal.test
-- Password: dosen123

-- Mahasiswa Account:
-- Email: mahasiswa@sipemal.test  
-- Password: mahasiswa123

-- Insert sample user profiles (these will be linked after manual registration)
-- We'll create placeholder UUIDs that match what Supabase will generate

-- For testing purposes, let's create some sample borrowing and return data
-- This will help demonstrate the system functionality

INSERT INTO borrowings (user_id, equipment_id, jumlah, tanggal_pinjam, tanggal_kembali, status, catatan)
SELECT 
  '1fe0e648-2904-4e5f-833a-e4d2c5ca42ea'::uuid, -- existing user from auth logs
  e.id,
  2,
  CURRENT_DATE - INTERVAL '3 days',
  CURRENT_DATE + INTERVAL '4 days', 
  'approved'::borrowing_status,
  'Untuk penelitian tugas akhir'
FROM equipment e 
WHERE e.nama = 'MMPI-2 (Minnesota Multiphasic Personality Inventory)'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO borrowings (user_id, equipment_id, jumlah, tanggal_pinjam, tanggal_kembali, status, catatan)
SELECT 
  '1fe0e648-2904-4e5f-833a-e4d2c5ca42ea'::uuid,
  e.id,
  1,
  CURRENT_DATE - INTERVAL '1 day',
  CURRENT_DATE + INTERVAL '6 days',
  'pending'::borrowing_status,
  'Untuk praktikum mahasiswa'
FROM equipment e 
WHERE e.nama = 'Beck Depression Inventory (BDI-II)'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert a sample return record
INSERT INTO returns (borrowing_id, status, catatan_tahap_awal, kondisi_alat)
SELECT 
  b.id,
  'initial'::return_status,
  'Alat dikembalikan sesuai jadwal',
  'Baik, tidak ada kerusakan'
FROM borrowings b
WHERE b.user_id = '1fe0e648-2904-4e5f-833a-e4d2c5ca42ea'::uuid
AND b.status = 'approved'::borrowing_status
LIMIT 1
ON CONFLICT DO NOTHING;