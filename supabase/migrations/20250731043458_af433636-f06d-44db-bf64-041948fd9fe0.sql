-- Create penalties table
CREATE TABLE public.penalties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  borrowing_id UUID NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'waived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE,
  waived_at TIMESTAMP WITH TIME ZONE,
  waived_by UUID,
  notes TEXT
);

-- Create system_settings table for penalty configuration
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default penalty settings
INSERT INTO public.system_settings (key, value, description) VALUES
('penalty_per_day', '5000', 'Denda per hari keterlambatan dalam Rupiah'),
('penalty_enabled', 'true', 'Apakah sistem denda diaktifkan'),
('grace_period_hours', '0', 'Masa tenggang dalam jam sebelum denda diterapkan');

-- Enable Row Level Security
ALTER TABLE public.penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for penalties
CREATE POLICY "Users can view their own penalties and admins can view all" 
ON public.penalties 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM borrowings b 
    WHERE b.id = penalties.borrowing_id 
    AND (b.user_id = auth.uid() OR 
         EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'))
  )
);

CREATE POLICY "Only admins can manage penalties" 
ON public.penalties 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create RLS policies for system_settings
CREATE POLICY "Everyone can view system settings" 
ON public.system_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage system settings" 
ON public.system_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create function to update timestamps
CREATE TRIGGER update_penalties_updated_at
BEFORE UPDATE ON public.penalties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_penalties_borrowing_id ON public.penalties (borrowing_id);
CREATE INDEX idx_penalties_status ON public.penalties (status);
CREATE INDEX idx_system_settings_key ON public.system_settings (key);