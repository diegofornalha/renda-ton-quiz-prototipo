-- Remove public SELECT access to quiz_results (data now accessed via secure Edge Function)
DROP POLICY IF EXISTS "Anyone can view quiz results" ON public.quiz_results;

-- Remove public UPDATE access to quiz_settings (settings now updated via secure Edge Function)
DROP POLICY IF EXISTS "Anyone can update quiz settings" ON public.quiz_settings;