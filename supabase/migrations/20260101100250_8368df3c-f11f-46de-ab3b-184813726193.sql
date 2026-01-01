-- Add duration column to quiz_results
ALTER TABLE public.quiz_results 
ADD COLUMN duration_seconds INTEGER DEFAULT 0;