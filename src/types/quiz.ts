export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizLevel {
  name: string;
  emoji: string;
  minScore: number;
  maxScore: number;
  color: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type: "text" | "question" | "result";
  questionIndex?: number;
  options?: string[];
  isCorrect?: boolean;
}

export type QuizState = "idle" | "playing" | "finished";
