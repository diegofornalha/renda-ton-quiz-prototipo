import { Button } from "@/components/ui/button";

interface QuizOptionsProps {
  options: string[];
  onSelect: (index: number) => void;
}

export const QuizOptions = ({ options, onSelect }: QuizOptionsProps) => {
  return (
    <div className="ml-10 md:ml-12 space-y-2 md:space-y-3 animate-slide-up">
      {options.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          className="w-full justify-start text-left h-auto py-3 px-4 md:py-4 md:px-5 text-sm md:text-base hover:bg-primary/10 hover:border-primary transition-all"
          onClick={() => onSelect(index)}
        >
          <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-xs md:text-sm font-semibold text-primary flex-shrink-0">
            {String.fromCharCode(65 + index)}
          </span>
          <span className="leading-relaxed">{option}</span>
        </Button>
      ))}
    </div>
  );
};
