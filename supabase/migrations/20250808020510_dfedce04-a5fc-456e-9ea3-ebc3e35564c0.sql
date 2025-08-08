-- Add missing status values to borrowing_status enum
ALTER TYPE public.borrowing_status ADD VALUE IF NOT EXISTS 'active';
ALTER TYPE public.borrowing_status ADD VALUE IF NOT EXISTS 'overdue';

-- Add status column to equipment table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment' AND column_name = 'status') THEN
        ALTER TABLE public.equipment ADD COLUMN status TEXT DEFAULT 'available';
    END IF;
END $$;