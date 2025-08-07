-- Add foreign key relationship between borrowings and profiles
ALTER TABLE public.borrowings 
ADD CONSTRAINT borrowings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key relationship between equipment and categories
ALTER TABLE public.equipment 
ADD CONSTRAINT equipment_kategori_id_fkey 
FOREIGN KEY (kategori_id) REFERENCES public.categories(id) ON DELETE CASCADE;

-- Add foreign key relationship between returns and borrowings
ALTER TABLE public.returns 
ADD CONSTRAINT returns_borrowing_id_fkey 
FOREIGN KEY (borrowing_id) REFERENCES public.borrowings(id) ON DELETE CASCADE;