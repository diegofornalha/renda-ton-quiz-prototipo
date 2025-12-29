import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Play, RotateCcw } from "lucide-react";
import type { QuizState } from "@/types/quiz";

interface ChatInputProps {
  quizState: QuizState;
  showOptions: boolean;
  onStartQuiz: () => void;
  onRestartQuiz: () => void;
  onSendMessage: (text: string) => void;
}

export const ChatInput = ({
  quizState,
  showOptions,
  onStartQuiz,
  onRestartQuiz,
  onSendMessage,
}: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };

  if (quizState === "idle") {
    return (
      <Button
        onClick={onStartQuiz}
        className="w-full h-12 rounded-xl font-semibold gap-2 bg-gradient-primary hover:opacity-90 transition-all"
      >
        <Play className="w-5 h-5" />
        Iniciar Quiz
      </Button>
    );
  }

  if (quizState === "finished") {
    return (
      <Button
        onClick={onRestartQuiz}
        className="w-full h-12 rounded-xl font-semibold gap-2 bg-gradient-primary hover:opacity-90 transition-all"
      >
        <RotateCcw className="w-5 h-5" />
        Fazer Novamente
      </Button>
    );
  }

  if (showOptions) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Digite uma mensagem..."
        className="flex-1 h-12 bg-background border-border"
      />
      <Button type="submit" size="icon" className="h-12 w-12 shrink-0">
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
};
