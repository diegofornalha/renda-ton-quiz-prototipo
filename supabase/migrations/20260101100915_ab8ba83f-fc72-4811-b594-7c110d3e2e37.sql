-- Create quiz settings table
CREATE TABLE public.quiz_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quiz_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can view quiz settings" 
ON public.quiz_settings 
FOR SELECT 
USING (true);

-- Anyone can update settings (for now without auth)
CREATE POLICY "Anyone can update quiz settings" 
ON public.quiz_settings 
FOR UPDATE 
USING (true);

-- Insert default settings
INSERT INTO public.quiz_settings (key, value) VALUES 
  ('timer_enabled', 'true'),
  ('timer_seconds', '180');