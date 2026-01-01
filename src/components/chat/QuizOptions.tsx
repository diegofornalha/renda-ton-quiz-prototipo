import { Button } from "@/components/ui/button";

interface QuizOptionsProps {
  options: string[];
  onSelect: (index: number) => void;
}

export const QuizOptions = ({ options, onSelect }: QuizOptionsProps) => {
  return (
    <div className="space-y-2 animate-slide-up px-1">
      {options.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          className="w-full justify-start text-left h-auto py-3 px-3 text-sm bg-secondary/50 border-border hover:bg-primary/20 hover:border-primary transition-all rounded-lg"
          onClick={() => onSelect(index)}
        >
          <span className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center mr-3 text-xs font-bold text-primary flex-shrink-0">
            {String.fromCharCode(65 + index)}
          </span>
          <span className="leading-relaxed text-foreground">{option}</span>
        </Button>
      ))}
    </div>
  );
};
