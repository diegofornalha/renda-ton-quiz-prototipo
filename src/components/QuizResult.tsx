import { Trophy, RefreshCw, Share2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLevelByScore, quizLevels } from "@/data/quizQuestions";
import { cn } from "@/lib/utils";
import tonHeroImage from "@/assets/ton-hero.png";

interface QuizResultProps {
  score: number;
  total: number;
  onRestart: () => void;
}

export const QuizResult = ({ score, total, onRestart }: QuizResultProps) => {
  const level = getLevelByScore(score);
  const percentage = Math.round((score / total) * 100);

  return (
    <div className="animate-scale-in space-y-8">
      {/* Hero Image */}
      <div className="flex justify-center">
        <img
          src={tonHeroImage}
          alt="Ton Renda Extra"
          className="w-48 h-auto animate-bounce-in"
        />
      </div>

      {/* Result Card */}
      <div className="bg-card rounded-3xl p-8 shadow-card text-center space-y-6">
        <div className="space-y-2">
          <span className="text-6xl animate-bounce-in inline-block" style={{ animationDelay: "0.2s" }}>
            {level.emoji}
          </span>
          <h2 className="text-2xl font-bold text-foreground">
            Parabéns! Você é <span className="text-gradient">{level.name}</span>
          </h2>
        </div>

        {/* Score Circle */}
        <div className="relative w-36 h-36 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 2.83} 283`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-foreground">{score}</span>
            <span className="text-sm text-muted-foreground">de {total}</span>
          </div>
        </div>

        <p className="text-muted-foreground">{level.description}</p>

        {/* Level Progress */}
        <div className="space-y-3 pt-4">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Níveis do Quiz
          </h3>
          <div className="flex justify-center gap-2 flex-wrap">
            {quizLevels.map((l) => (
              <div
                key={l.name}
                className={cn(
                  "px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5",
                  l.name === level.name
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/30 shadow-glow"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                <span>{l.emoji}</span>
                <span className="hidden sm:inline">{l.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onRestart}
          className="flex-1 h-14 rounded-2xl font-semibold text-base gap-2 bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-5 h-5" />
          Jogar Novamente
        </Button>
        <Button
          variant="outline"
          className="flex-1 h-14 rounded-2xl font-semibold text-base gap-2 border-2 hover:bg-secondary"
        >
          <Share2 className="w-5 h-5" />
          Compartilhar
        </Button>
      </div>
    </div>
  );
};
