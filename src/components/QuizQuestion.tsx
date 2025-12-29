import { useState } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizOption } from "./QuizOption";
import { QuizFeedback } from "./QuizFeedback";
import { QuizProgress } from "./QuizProgress";
import { QuizQuestion as QuizQuestionType } from "@/data/quizQuestions";
import { cn } from "@/lib/utils";

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionIndex: number;
  totalQuestions: number;
  answers: (boolean | null)[];
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

export const QuizQuestion = ({
  question,
  questionIndex,
  totalQuestions,
  answers,
  onAnswer,
  onNext,
}: QuizQuestionProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleSelect = (index: number) => {
    if (hasAnswered) return;
    setSelectedOption(index);
  };

  const handleConfirm = () => {
    if (selectedOption === null || hasAnswered) return;
    const isCorrect = selectedOption === question.correctAnswer;
    setHasAnswered(true);
    onAnswer(isCorrect);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setHasAnswered(false);
    onNext();
  };

  const isCorrect = selectedOption === question.correctAnswer;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Progress */}
      <QuizProgress
        current={questionIndex}
        total={totalQuestions}
        answers={answers}
      />

      {/* Question Card */}
      <div className="bg-card rounded-3xl p-6 shadow-card space-y-6">
        {/* Chat Style Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Pergunta {questionIndex + 1}</p>
            <h2 className="text-lg font-semibold text-foreground leading-relaxed">
              {question.question}
            </h2>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <QuizOption
              key={index}
              option={option}
              index={index}
              isSelected={selectedOption === index}
              isCorrect={
                hasAnswered
                  ? index === question.correctAnswer
                    ? true
                    : selectedOption === index
                    ? false
                    : null
                  : null
              }
              isDisabled={hasAnswered}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Feedback */}
        {hasAnswered && (
          <QuizFeedback
            isCorrect={isCorrect}
            explanation={question.explanation}
          />
        )}
      </div>

      {/* Action Button */}
      {!hasAnswered ? (
        <Button
          onClick={handleConfirm}
          disabled={selectedOption === null}
          className={cn(
            "w-full h-14 rounded-2xl font-semibold text-base transition-all",
            selectedOption !== null
              ? "bg-gradient-primary shadow-glow hover:opacity-90"
              : "bg-muted text-muted-foreground"
          )}
        >
          Confirmar Resposta
        </Button>
      ) : (
        <Button
          onClick={handleNext}
          className="w-full h-14 rounded-2xl font-semibold text-base gap-2 bg-gradient-primary shadow-glow hover:opacity-90"
        >
          {questionIndex < totalQuestions - 1 ? (
            <>
              Próxima Pergunta
              <ArrowRight className="w-5 h-5" />
            </>
          ) : (
            "Ver Resultado"
          )}
        </Button>
      )}
    </div>
  );
};
