-- Create audit_logs table for tracking all system activities
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit_logs
-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- System can insert audit logs (for triggers)
CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Create function to log activities
CREATE OR REPLACE FUNCTION public.log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_table_name TEXT,
  p_record_id UUID DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id, 
    action, 
    table_name, 
    record_id, 
    old_data, 
    new_data
  )
  VALUES (
    p_user_id, 
    p_action, 
    p_table_name, 
    p_record_id, 
    p_old_data, 
    p_new_data
  );
END;
$$;

-- Create trigger function for automatic logging
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_id_val UUID;
  action_val TEXT;
  old_data_val JSONB;
  new_data_val JSONB;
BEGIN
  -- Get current user ID
  user_id_val := auth.uid();
  
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_val := 'CREATE';
    old_data_val := NULL;
    new_data_val := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    action_val := 'UPDATE';
    old_data_val := to_jsonb(OLD);
    new_data_val := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    action_val := 'DELETE';
    old_data_val := to_jsonb(OLD);
    new_data_val := NULL;
  END IF;

  -- Log the activity
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  )
  VALUES (
    user_id_val,
    action_val,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    old_data_val,
    new_data_val
  );

  -- Return appropriate value
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create triggers for important tables
-- Profiles table (user registration)
CREATE TRIGGER audit_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Categories table
CREATE TRIGGER audit_categories_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Equipment table  
CREATE TRIGGER audit_equipment_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Borrowings table
CREATE TRIGGER audit_borrowings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.borrowings
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Returns table
CREATE TRIGGER audit_returns_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.returns
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Equipment queue table
CREATE TRIGGER audit_equipment_queue_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.equipment_queue
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();