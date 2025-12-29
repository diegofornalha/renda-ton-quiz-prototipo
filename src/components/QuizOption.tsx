import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizOptionProps {
  option: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean | null;
  isDisabled: boolean;
  onSelect: (index: number) => void;
}

const optionLabels = ["A", "B", "C", "D"];

export const QuizOption = ({
  option,
  index,
  isSelected,
  isCorrect,
  isDisabled,
  onSelect,
}: QuizOptionProps) => {
  const getOptionStyles = () => {
    if (isCorrect === null) {
      return isSelected
        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
        : "border-border hover:border-primary/50 hover:bg-secondary/50";
    }
    
    if (isSelected) {
      return isCorrect
        ? "border-success bg-success/10 ring-2 ring-success/30 animate-pulse-success"
        : "border-destructive bg-destructive/10 ring-2 ring-destructive/30 animate-shake";
    }
    
    if (isCorrect) {
      return "border-success bg-success/10";
    }
    
    return "border-border opacity-50";
  };

  return (
    <button
      onClick={() => onSelect(index)}
      disabled={isDisabled}
      className={cn(
        "w-full p-4 rounded-xl border-2 transition-all duration-300 text-left flex items-center gap-4 group",
        getOptionStyles(),
        !isDisabled && "cursor-pointer active:scale-[0.98]"
      )}
    >
      <span
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm transition-all shrink-0",
          isCorrect === true && isSelected
            ? "bg-success text-success-foreground"
            : isCorrect === false && isSelected
            ? "bg-destructive text-destructive-foreground"
            : isSelected
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground group-hover:bg-primary/20"
        )}
      >
        {isCorrect === true && isSelected ? (
          <Check className="w-5 h-5" />
        ) : isCorrect === false && isSelected ? (
          <X className="w-5 h-5" />
        ) : (
          optionLabels[index]
        )}
      </span>
      <span className="text-foreground font-medium flex-1">{option}</span>
    </button>
  );
};
