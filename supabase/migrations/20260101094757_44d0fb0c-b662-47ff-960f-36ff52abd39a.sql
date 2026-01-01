-- Create table for quiz questions
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero INTEGER NOT NULL,
  texto TEXT NOT NULL,
  alternativas JSONB NOT NULL,
  dificuldade TEXT NOT NULL DEFAULT 'média',
  topico TEXT NOT NULL,
  regulamento_ref TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public read access for quiz)
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read questions (public quiz)
CREATE POLICY "Anyone can view quiz questions" 
ON public.quiz_questions 
FOR SELECT 
USING (true);

-- Create table for quiz levels
CREATE TABLE public.quiz_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  min_score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.quiz_levels ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read levels
CREATE POLICY "Anyone can view quiz levels" 
ON public.quiz_levels 
FOR SELECT 
USING (true);

-- Insert default levels
INSERT INTO public.quiz_levels (name, emoji, min_score, max_score, color, description) VALUES
('Iniciante', '🌱', 0, 3, 'bg-secondary', 'Você está começando sua jornada! Continue estudando para evoluir.'),
('Especialista I', '📚', 4, 5, 'bg-primary/70', 'Bom progresso! Você já entende o básico do programa.'),
('Especialista II', '⭐', 6, 7, 'bg-primary/85', 'Excelente! Seu conhecimento está se consolidando.'),
('Especialista III', '🌟', 8, 9, 'bg-primary', 'Impressionante! Você domina quase tudo sobre o Renda Extra.'),
('Embaixador', '🏆', 10, 10, 'bg-accent', 'Perfeito! Você é um verdadeiro especialista no Renda Extra Ton!');