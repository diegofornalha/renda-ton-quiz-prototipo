-- Create table for quiz results/completions
CREATE TABLE public.quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL DEFAULT 10,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert results (public quiz)
CREATE POLICY "Anyone can submit quiz results" 
ON public.quiz_results 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to read results (for admin dashboard - we'll add proper auth later if needed)
CREATE POLICY "Anyone can view quiz results" 
ON public.quiz_results 
FOR SELECT 
USING (true);