-- Allow deleting quiz results (for admin panel)
CREATE POLICY "Anyone can delete quiz results" 
ON public.quiz_results 
FOR DELETE 
USING (true);