import { Button } from "@/components/ui/button";

interface QuizOptionsProps {
  options: string[];
  onSelect: (index: number) => void;
}

export const QuizOptions = ({ options, onSelect }: QuizOptionsProps) => {
  return (
    <div className="ml-10 space-y-2 animate-slide-up">
      {options.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          className="w-full justify-start text-left h-auto py-3 px-4 text-sm hover:bg-primary/10 hover:border-primary transition-all"
          onClick={() => onSelect(index)}
        >
          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-xs font-semibold text-primary flex-shrink-0">
            {String.fromCharCode(65 + index)}
          </span>
          <span className="leading-relaxed">{option}</span>
        </Button>
      ))}
    </div>
  );
};
