import { Play, Clock, HelpCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { quizLevels, quizQuestions } from "@/data/quizQuestions";
import { ChatInterface } from "./ChatInterface";
import tonHeroImage from "@/assets/ton-hero.png";

interface QuizStartProps {
  onStart: () => void;
}

export const QuizStart = ({ onStart }: QuizStartProps) => {
  return (
    <div className="animate-fade-in space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <img
          src={tonHeroImage}
          alt="Ton Renda Extra"
          className="w-48 h-auto mx-auto animate-bounce-in drop-shadow-xl"
        />
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            <span className="text-gradient">Renda Extra Ton</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Tire dúvidas no chat ou teste seus conhecimentos no quiz!
          </p>
        </div>
      </div>

      {/* Chat Section */}
      <ChatInterface />

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl p-4 shadow-card text-center space-y-2">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <p className="font-semibold text-foreground">{quizQuestions.length}</p>
          <p className="text-xs text-muted-foreground">Perguntas</p>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow-card text-center space-y-2">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <p className="font-semibold text-foreground">~5 min</p>
          <p className="text-xs text-muted-foreground">Tempo médio</p>
        </div>
      </div>

      {/* Levels Preview */}
      <div className="bg-card rounded-2xl p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Níveis para Conquistar</h3>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {quizLevels.map((level) => (
            <div
              key={level.name}
              className="text-center space-y-1.5 p-2 rounded-xl hover:bg-secondary/50 transition-colors"
            >
              <span className="text-2xl">{level.emoji}</span>
              <p className="text-xs font-medium text-muted-foreground leading-tight">
                {level.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <Button
        onClick={onStart}
        size="lg"
        className="w-full h-14 rounded-2xl text-lg font-semibold gap-3 bg-gradient-primary hover:opacity-90 transition-all shadow-glow"
      >
        <Play className="w-5 h-5" />
        Iniciar Quiz
      </Button>
    </div>
  );
};
