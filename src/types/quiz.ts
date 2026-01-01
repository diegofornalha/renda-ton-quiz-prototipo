export interface QuizAlternative {
  texto: string;
  correta: boolean;
  explicacao: string;
  regulamento_ref: string;
}

export interface QuizAlternatives {
  A: QuizAlternative;
  B: QuizAlternative;
  C: QuizAlternative;
  D: QuizAlternative;
}

export interface QuizQuestion {
  id: string;
  numero: number;
  texto: string;
  alternativas: QuizAlternatives;
  dificuldade: string;
  topico: string;
  regulamento_ref?: string;
  created_at: string;
}

export interface QuizLevel {
  id: string;
  name: string;
  emoji: string;
  min_score: number;
  max_score: number;
  color: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type: "text" | "question" | "result" | "welcome";
  questionIndex?: number;
  options?: string[];
  isCorrect?: boolean;
  difficulty?: "fácil" | "média" | "difícil";
  isTyping?: boolean;
  isStreaming?: boolean;
  videoUrl?: string;
}

export type QuizState = "idle" | "playing" | "finished";
