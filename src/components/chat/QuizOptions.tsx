import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface QuizOptionsProps {
  options: string[];
  onSelect: (index: number) => void;
  animateSequentially?: boolean;
}

export const QuizOptions = ({ options, onSelect, animateSequentially = true }: QuizOptionsProps) => {
  const [visibleCount, setVisibleCount] = useState(animateSequentially ? 0 : options.length);

  useEffect(() => {
    if (animateSequentially) {
      setVisibleCount(0);
      // Show one option every 250ms for smoother UX
      const timers = options.map((_, index) => 
        setTimeout(() => setVisibleCount(index + 1), (index + 1) * 250)
      );
      return () => timers.forEach(clearTimeout);
    } else {
      setVisibleCount(options.length);
    }
  }, [options, animateSequentially]);

  return (
    <div className="space-y-2 px-1">
      {options.slice(0, visibleCount).map((option, index) => (
        <Button
          key={index}
          variant="outline"
          className="w-full justify-start text-left h-auto py-3 px-3 text-sm bg-secondary/50 border-border hover:bg-primary/20 hover:border-primary transition-all rounded-lg animate-fade-in"
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
