-- Fix function security issue by setting search_path
CREATE OR REPLACE FUNCTION public.create_penalty_record(
  p_borrowing_id UUID,
  p_amount INTEGER,
  p_reason TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.penalties (borrowing_id, amount, reason, status)
  VALUES (p_borrowing_id, p_amount, p_reason, 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';