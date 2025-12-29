import { Bot } from "lucide-react";

interface ChatHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  isPlaying: boolean;
}

export const ChatHeader = ({ currentQuestion, totalQuestions, isPlaying }: ChatHeaderProps) => {
  return (
    <div className="bg-primary/10 px-4 py-3 md:px-6 md:py-4 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Bot className="w-5 h-5 md:w-6 md:h-6 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm md:text-base text-foreground">Assistente Ton</p>
          <p className="text-xs md:text-sm text-muted-foreground">
            {isPlaying
              ? `Pergunta ${currentQuestion + 1}/${totalQuestions}`
              : "Online"}
          </p>
        </div>
      </div>
    </div>
  );
};
