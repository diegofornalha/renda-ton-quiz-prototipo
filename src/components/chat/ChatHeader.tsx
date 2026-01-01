import { Bot, Clock } from "lucide-react";

interface ChatHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  isPlaying: boolean;
  timeLeft?: number;
  timerEnabled?: boolean;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const ChatHeader = ({ 
  currentQuestion, 
  totalQuestions, 
  isPlaying,
  timeLeft = 0,
  timerEnabled = true
}: ChatHeaderProps) => {
  const isLowTime = timerEnabled && timeLeft <= 30;
  const isCriticalTime = timerEnabled && timeLeft <= 10;

  return (
    <div className="bg-primary/10 px-4 py-3 md:px-6 md:py-4 border-b border-border">
      <div className="flex items-center justify-between">
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
        
        {isPlaying && timerEnabled && (
          <div 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-sm md:text-base font-semibold transition-colors ${
              isCriticalTime 
                ? "bg-destructive/20 text-destructive animate-pulse" 
                : isLowTime 
                  ? "bg-orange-500/20 text-orange-600" 
                  : "bg-primary/20 text-primary"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
