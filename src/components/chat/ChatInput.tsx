import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Play, Settings, Smile, Paperclip, Mic } from "lucide-react";
import type { QuizState } from "@/types/quiz";

interface ChatInputProps {
  quizState: QuizState;
  showOptions: boolean;
  isLoading?: boolean;
  onStartQuiz: () => void;
  onRestartQuiz: () => void;
  onSendMessage: (text: string) => void;
}

export const ChatInput = ({
  quizState,
  showOptions,
  isLoading = false,
  onStartQuiz,
  onRestartQuiz,
  onSendMessage,
}: ChatInputProps) => {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

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
        disabled={isLoading}
        className="w-full h-12 rounded-full font-semibold gap-2 text-sm bg-gradient-primary hover:opacity-90 transition-all disabled:opacity-50 shadow-glow"
      >
        <Play className="w-5 h-5" />
        {isLoading ? "Carregando..." : "Iniciar Quiz"}
      </Button>
    );
  }

  if (quizState === "finished") {
    return (
      <Button
        onClick={() => navigate("/admin")}
        className="w-full h-12 rounded-full font-semibold gap-2 text-sm bg-gradient-primary hover:opacity-90 transition-all shadow-glow"
      >
        <Settings className="w-5 h-5" />
        Ir para Tela do Administrador
      </Button>
    );
  }

  if (showOptions) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      {/* Emoji button */}
      <button type="button" className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
        <Smile className="w-5 h-5" />
      </button>
      
      {/* Input container */}
      <div className="flex-1 flex items-center gap-2 bg-input rounded-full px-4 py-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Mensagem"
          className="flex-1 h-auto bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0 p-0"
        />
        <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
          <Paperclip className="w-5 h-5" />
        </button>
      </div>
      
      {/* Send/Mic button */}
      {input.trim() ? (
        <Button type="submit" size="icon" className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90">
          <Send className="w-5 h-5" />
        </Button>
      ) : (
        <button type="button" className="h-10 w-10 flex items-center justify-center bg-primary rounded-full text-primary-foreground">
          <Mic className="w-5 h-5" />
        </button>
      )}
    </form>
  );
};
