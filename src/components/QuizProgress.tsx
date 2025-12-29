import { cn } from "@/lib/utils";

interface QuizProgressProps {
  current: number;
  total: number;
  answers: (boolean | null)[];
}

export const QuizProgress = ({ current, total, answers }: QuizProgressProps) => {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground font-medium">
          Pergunta {current + 1} de {total}
        </span>
        <span className="text-primary font-semibold">
          {Math.round(progress)}% completo
        </span>
      </div>
      
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex gap-1.5 justify-center mt-4">
        {answers.map((answer, index) => (
          <div
            key={index}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              index === current
                ? "w-6 bg-primary"
                : answer === true
                ? "bg-success"
                : answer === false
                ? "bg-destructive"
                : "bg-border"
            )}
          />
        ))}
      </div>
    </div>
  );
};
