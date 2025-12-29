import { useState } from "react";
import { QuizStart } from "./QuizStart";
import { QuizQuestion } from "./QuizQuestion";
import { QuizResult } from "./QuizResult";
import { quizQuestions } from "@/data/quizQuestions";

type QuizState = "start" | "playing" | "result";

export const Quiz = () => {
  const [state, setState] = useState<QuizState>("start");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(
    new Array(quizQuestions.length).fill(null)
  );

  const handleStart = () => {
    setState("playing");
    setCurrentQuestion(0);
    setScore(0);
    setAnswers(new Array(quizQuestions.length).fill(null));
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = isCorrect;
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setState("result");
    }
  };

  const handleRestart = () => {
    setState("start");
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8 px-4">
      <div className="max-w-lg mx-auto">
        {state === "start" && <QuizStart onStart={handleStart} />}
        {state === "playing" && (
          <QuizQuestion
            key={currentQuestion}
            question={quizQuestions[currentQuestion]}
            questionIndex={currentQuestion}
            totalQuestions={quizQuestions.length}
            answers={answers}
            onAnswer={handleAnswer}
            onNext={handleNext}
          />
        )}
        {state === "result" && (
          <QuizResult
            score={score}
            total={quizQuestions.length}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
};
