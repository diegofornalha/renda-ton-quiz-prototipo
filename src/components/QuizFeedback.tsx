import { CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizFeedbackProps {
  isCorrect: boolean;
  explanation: string;
}

export const QuizFeedback = ({ isCorrect, explanation }: QuizFeedbackProps) => {
  return (
    <div
      className={cn(
        "p-5 rounded-2xl animate-slide-up",
        isCorrect
          ? "bg-success/10 border border-success/30"
          : "bg-destructive/10 border border-destructive/30"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
            isCorrect ? "bg-success" : "bg-destructive"
          )}
        >
          {isCorrect ? (
            <CheckCircle className="w-5 h-5 text-success-foreground" />
          ) : (
            <XCircle className="w-5 h-5 text-destructive-foreground" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <h4
            className={cn(
              "font-semibold text-lg",
              isCorrect ? "text-success" : "text-destructive"
            )}
          >
            {isCorrect ? "Resposta correta!" : "Ops, resposta incorreta!"}
          </h4>
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-muted-foreground text-sm leading-relaxed">
              {explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
