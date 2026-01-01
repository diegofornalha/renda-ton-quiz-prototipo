-- Allow reading quiz results (for admin panel)
CREATE POLICY "Anyone can view quiz results" 
ON public.quiz_results 
FOR SELECT 
USING (true);