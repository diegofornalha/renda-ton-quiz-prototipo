import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface QuizOptionsProps {
  options: string[];
  onSelect: (index: number) => void;
  animateSequentially?: boolean;
  initialDelay?: number;
}

export const QuizOptions = ({ 
  options, 
  onSelect, 
  animateSequentially = true,
  initialDelay = 400 
}: QuizOptionsProps) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [started, setStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initial delay before showing options
  useEffect(() => {
    const startTimer = setTimeout(() => {
      setStarted(true);
    }, initialDelay);
    return () => clearTimeout(startTimer);
  }, [initialDelay]);

  // Sequential animation after initial delay
  useEffect(() => {
    if (!started) return;
    
    if (animateSequentially) {
      setVisibleCount(0);
      // Show one option every 200ms for smoother UX
      const timers = options.map((_, index) => 
        setTimeout(() => setVisibleCount(index + 1), (index + 1) * 200)
      );
      return () => timers.forEach(clearTimeout);
    } else {
      setVisibleCount(options.length);
    }
  }, [options, animateSequentially, started]);

  // Auto-scroll to show options when they appear
  useEffect(() => {
    if (visibleCount > 0 && containerRef.current) {
      // Small delay to let animation start
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ 
          behavior: "smooth", 
          block: "end" 
        });
      }, 50);
    }
  }, [visibleCount]);

  if (!started) return null;

  return (
    <div ref={containerRef} className="space-y-2 px-1 pb-2">
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
