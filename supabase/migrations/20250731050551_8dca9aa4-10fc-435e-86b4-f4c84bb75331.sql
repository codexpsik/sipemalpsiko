-- Insert sample categories
INSERT INTO categories (nama, deskripsi, tipe) VALUES
('Tes Kepribadian', 'Alat tes untuk mengukur kepribadian', 'harus_dikembalikan'),
('Tes Intelegensi', 'Alat tes untuk mengukur tingkat kecerdasan', 'harus_dikembalikan'),
('Tes Proyektif', 'Alat tes proyektif untuk analisis psikologi', 'copy_1'),
('Lembar Jawaban', 'Lembar jawaban untuk berbagai tes', 'habis_pakai'),
('Manual Tes', 'Buku manual dan panduan tes', 'harus_dikembalikan')
ON CONFLICT DO NOTHING;

-- Insert sample equipment
INSERT INTO equipment (nama, deskripsi, kategori_id, stok, kondisi, gambar_url) 
SELECT 
  'MMPI-2 (Minnesota Multiphasic Personality Inventory)',
  'Tes kepribadian komprehensif untuk mengukur berbagai aspek psikologis',
  c.id,
  5,
  'Baik',
  NULL
FROM categories c WHERE c.nama = 'Tes Kepribadian'
ON CONFLICT DO NOTHING;

INSERT INTO equipment (nama, deskripsi, kategori_id, stok, kondisi, gambar_url) 
SELECT 
  'WAIS-IV (Wechsler Adult Intelligence Scale)',
  'Tes intelegensi untuk dewasa yang komprehensif',
  c.id,
  3,
  'Baik',
  NULL
FROM categories c WHERE c.nama = 'Tes Intelegensi'
ON CONFLICT DO NOTHING;

INSERT INTO equipment (nama, deskripsi, kategori_id, stok, kondisi, gambar_url) 
SELECT 
  'Beck Depression Inventory (BDI-II)',
  'Kuesioner untuk mengukur tingkat depresi',
  c.id,
  10,
  'Baik',
  NULL
FROM categories c WHERE c.nama = 'Tes Kepribadian'
ON CONFLICT DO NOTHING;

INSERT INTO equipment (nama, deskripsi, kategori_id, stok, kondisi, gambar_url) 
SELECT 
  'TAT (Thematic Apperception Test)',
  'Tes proyektif menggunakan gambar untuk analisis kepribadian',
  c.id,
  1,
  'Baik',
  NULL
FROM categories c WHERE c.nama = 'Tes Proyektif'
ON CONFLICT DO NOTHING;

INSERT INTO equipment (nama, deskripsi, kategori_id, stok, kondisi, gambar_url) 
SELECT 
  'Rorschach Inkblot Test',
  'Tes proyektif menggunakan noda tinta',
  c.id,
  1,
  'Baik',
  NULL
FROM categories c WHERE c.nama = 'Tes Proyektif'
ON CONFLICT DO NOTHING;

INSERT INTO equipment (nama, deskripsi, kategori_id, stok, kondisi, gambar_url) 
SELECT 
  'Stanford-Binet Intelligence Scales',
  'Tes intelegensi individual untuk berbagai usia',
  c.id,
  2,
  'Baik',
  NULL
FROM categories c WHERE c.nama = 'Tes Intelegensi'
ON CONFLICT DO NOTHING;

INSERT INTO equipment (nama, deskripsi, kategori_id, stok, kondisi, gambar_url) 
SELECT 
  'Lembar Jawaban MMPI-2',
  'Lembar jawaban khusus untuk tes MMPI-2',
  c.id,
  100,
  'Baru',
  NULL
FROM categories c WHERE c.nama = 'Lembar Jawaban'
ON CONFLICT DO NOTHING;

INSERT INTO equipment (nama, deskripsi, kategori_id, stok, kondisi, gambar_url) 
SELECT 
  'Lembar Jawaban BDI-II',
  'Lembar jawaban untuk Beck Depression Inventory',
  c.id,
  50,
  'Baru',
  NULL
FROM categories c WHERE c.nama = 'Lembar Jawaban'
ON CONFLICT DO NOTHING;

-- Insert system settings
INSERT INTO system_settings (key, value, description) VALUES
('max_borrow_duration_returnable', '7', 'Maksimal durasi peminjaman alat yang harus dikembalikan (hari)'),
('max_borrow_duration_disposable', '1', 'Maksimal durasi peminjaman alat habis pakai (hari)'),
('penalty_rate_per_day', '5000', 'Denda per hari keterlambatan (Rupiah)'),
('max_queue_position', '5', 'Maksimal posisi antrian untuk alat Copy 1'),
('notification_before_due', '1', 'Notifikasi sebelum jatuh tempo (hari)')
ON CONFLICT (key) DO UPDATE SET 
value = EXCLUDED.value,
description = EXCLUDED.description;