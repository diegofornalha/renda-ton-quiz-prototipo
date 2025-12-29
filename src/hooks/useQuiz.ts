import { useState, useCallback } from "react";
import { quizQuestions, quizLevels } from "@/data/quizQuestions";
import type { ChatMessage, QuizState } from "@/types/quiz";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Olá! 👋 Sou o assistente do Renda Extra Ton. Vou te fazer algumas perguntas para testar seus conhecimentos sobre o programa. Pronto para começar?",
  type: "text",
};

export const useQuiz = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(
    new Array(quizQuestions.length).fill(null)
  );

  const totalQuestions = quizQuestions.length;

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const startQuiz = useCallback(() => {
    setQuizState("playing");
    setCurrentQuestion(0);
    setScore(0);
    setAnswers(new Array(quizQuestions.length).fill(null));

    const question = quizQuestions[0];
    addMessage({
      id: `q-0`,
      role: "assistant",
      content: `**Pergunta 1/${totalQuestions}**\n\n${question.question}`,
      type: "question",
      questionIndex: 0,
      options: question.options,
    });
  }, [addMessage, totalQuestions]);

  const handleOptionClick = useCallback(
    (optionIndex: number) => {
      if (quizState !== "playing") return;

      const question = quizQuestions[currentQuestion];
      const isCorrect = optionIndex === question.correctAnswer;
      const selectedOption = question.options[optionIndex];

      // Add user's answer
      addMessage({
        id: `a-${currentQuestion}`,
        role: "user",
        content: selectedOption,
        type: "text",
      });

      // Update score and answers
      const newScore = isCorrect ? score + 1 : score;
      if (isCorrect) setScore(newScore);
      
      setAnswers((prev) => {
        const newAnswers = [...prev];
        newAnswers[currentQuestion] = isCorrect;
        return newAnswers;
      });

      // Add feedback after delay
      setTimeout(() => {
        addMessage({
          id: `f-${currentQuestion}`,
          role: "assistant",
          content: isCorrect
            ? `✅ **Correto!** ${question.explanation}`
            : `❌ **Ops!** A resposta certa era: "${question.options[question.correctAnswer]}"\n\n${question.explanation}`,
          type: "text",
          isCorrect,
        });

        // Next question or finish
        setTimeout(() => {
          if (currentQuestion < totalQuestions - 1) {
            const nextIndex = currentQuestion + 1;
            setCurrentQuestion(nextIndex);
            const nextQuestion = quizQuestions[nextIndex];

            addMessage({
              id: `q-${nextIndex}`,
              role: "assistant",
              content: `**Pergunta ${nextIndex + 1}/${totalQuestions}**\n\n${nextQuestion.question}`,
              type: "question",
              questionIndex: nextIndex,
              options: nextQuestion.options,
            });
          } else {
            // Finish quiz
            setQuizState("finished");
            const finalScore = newScore;
            const percentage = Math.round((finalScore / totalQuestions) * 100);
            const level =
              quizLevels.find(
                (l) => percentage >= l.minScore && percentage <= l.maxScore
              ) || quizLevels[0];

            addMessage({
              id: "result",
              role: "assistant",
              content: `🎉 **Quiz Finalizado!**\n\nVocê acertou **${finalScore}** de **${totalQuestions}** perguntas!\n\n${level.emoji} **Nível: ${level.name}**\n\n${level.description}`,
              type: "result",
            });
          }
        }, 800);
      }, 500);
    },
    [quizState, currentQuestion, score, addMessage, totalQuestions]
  );

  const restartQuiz = useCallback(() => {
    setMessages([
      {
        id: "restart",
        role: "assistant",
        content: "Vamos tentar novamente! 🚀 Pronto para um novo quiz?",
        type: "text",
      },
    ]);
    setQuizState("idle");
    setCurrentQuestion(0);
    setScore(0);
    setAnswers(new Array(quizQuestions.length).fill(null));
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      addMessage({
        id: Date.now().toString(),
        role: "user",
        content: text,
        type: "text",
      });

      setTimeout(() => {
        addMessage({
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            quizState === "idle"
              ? "Clique em 'Iniciar Quiz' para começarmos! 🎯"
              : "Continue respondendo as perguntas do quiz! 📝",
          type: "text",
        });
      }, 500);
    },
    [quizState, addMessage]
  );

  const lastMessage = messages[messages.length - 1];
  const showOptions = lastMessage?.type === "question" && quizState === "playing";

  return {
    messages,
    quizState,
    currentQuestion,
    totalQuestions,
    showOptions,
    lastMessage,
    startQuiz,
    handleOptionClick,
    restartQuiz,
    sendMessage,
  };
};
