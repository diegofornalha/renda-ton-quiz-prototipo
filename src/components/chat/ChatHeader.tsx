import { Bot, Clock, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const navigate = useNavigate();
  const isLowTime = timerEnabled && timeLeft <= 30;
  const isCriticalTime = timerEnabled && timeLeft <= 10;

  return (
    <div className="bg-gradient-header px-3 py-2 safe-area-inset-top">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-base text-foreground truncate">Quiz Ton</p>
            <p className="text-xs text-muted-foreground">
              {isPlaying
                ? `Pergunta ${currentQuestion + 1} de ${totalQuestions}`
                : "online"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isPlaying && timerEnabled && (
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-xs font-semibold transition-colors ${
                isCriticalTime 
                  ? "bg-destructive/20 text-destructive animate-pulse" 
                  : isLowTime 
                    ? "bg-orange-500/20 text-orange-400" 
                    : "bg-primary/20 text-primary"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border z-50">
              <DropdownMenuItem onClick={() => navigate("/admin")}>
                Admin
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};