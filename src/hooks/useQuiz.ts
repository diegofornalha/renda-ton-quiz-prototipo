import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage, QuizState, QuizQuestion, QuizLevel, QuizAlternatives } from "@/types/quiz";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Olá! 👋 Sou o assistente do Renda Extra Ton. Vou te fazer algumas perguntas para testar seus conhecimentos sobre o programa. Pronto para começar?",
  type: "text",
};

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const useQuiz = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [levels, setLevels] = useState<QuizLevel[]>([]);
  const [answers, setAnswers] = useState<(boolean | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const totalQuestions = 10; // Fixed number of questions per quiz

  // Fetch questions and levels from database
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [questionsRes, levelsRes] = await Promise.all([
          supabase.from("quiz_questions").select("*"),
          supabase.from("quiz_levels").select("*").order("min_score"),
        ]);

        if (questionsRes.data) {
          // Cast the alternativas field to the correct type
          const typedQuestions = questionsRes.data.map(q => ({
            ...q,
            alternativas: q.alternativas as unknown as QuizAlternatives
          })) as QuizQuestion[];
          setQuestions(typedQuestions);
        }
        if (levelsRes.data) {
          setLevels(levelsRes.data as QuizLevel[]);
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const getOptionsFromAlternatives = (alternativas: QuizAlternatives): string[] => {
    return ["A", "B", "C", "D"].map(
      (key) => `${key}) ${alternativas[key as keyof QuizAlternatives].texto}`
    );
  };

  const getCorrectAnswerIndex = (alternativas: QuizAlternatives): number => {
    const keys = ["A", "B", "C", "D"] as const;
    return keys.findIndex((key) => alternativas[key].correta);
  };

  const startQuiz = useCallback(() => {
    if (questions.length === 0) return;

    // Shuffle and pick 10 questions
    const shuffledQuestions = shuffleArray(questions).slice(0, totalQuestions);
    setQuestions(shuffledQuestions);
    setQuizState("playing");
    setCurrentQuestion(0);
    setScore(0);
    setAnswers(new Array(totalQuestions).fill(null));

    const question = shuffledQuestions[0];
    const options = getOptionsFromAlternatives(question.alternativas);

    addMessage({
      id: `q-0`,
      role: "assistant",
      content: `**Pergunta 1/${totalQuestions}**\n\n${question.texto}`,
      type: "question",
      questionIndex: 0,
      options,
    });
  }, [addMessage, questions]);

  const handleOptionClick = useCallback(
    (optionIndex: number) => {
      if (quizState !== "playing" || questions.length === 0) return;

      const question = questions[currentQuestion];
      const correctIndex = getCorrectAnswerIndex(question.alternativas);
      const isCorrect = optionIndex === correctIndex;
      
      const keys = ["A", "B", "C", "D"] as const;
      const selectedKey = keys[optionIndex];
      const selectedOption = question.alternativas[selectedKey];
      const correctOption = question.alternativas[keys[correctIndex]];

      // Add user's answer
      addMessage({
        id: `a-${currentQuestion}`,
        role: "user",
        content: `${selectedKey}) ${selectedOption.texto}`,
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
        const feedbackContent = isCorrect
          ? `✅ **Correto!** ${selectedOption.explicacao}\n\n📖 *${selectedOption.regulamento_ref}*`
          : `❌ **Ops!** A resposta certa era: "${keys[correctIndex]}) ${correctOption.texto}"\n\n${correctOption.explicacao}\n\n📖 *${correctOption.regulamento_ref}*`;

        addMessage({
          id: `f-${currentQuestion}`,
          role: "assistant",
          content: feedbackContent,
          type: "text",
          isCorrect,
        });

        // Next question or finish
        setTimeout(() => {
          if (currentQuestion < totalQuestions - 1) {
            const nextIndex = currentQuestion + 1;
            setCurrentQuestion(nextIndex);
            const nextQuestion = questions[nextIndex];
            const options = getOptionsFromAlternatives(nextQuestion.alternativas);

            addMessage({
              id: `q-${nextIndex}`,
              role: "assistant",
              content: `**Pergunta ${nextIndex + 1}/${totalQuestions}**\n\n${nextQuestion.texto}`,
              type: "question",
              questionIndex: nextIndex,
              options,
            });
          } else {
            // Finish quiz
            setQuizState("finished");
            const finalScore = newScore;
            const level = levels.find(
              (l) => finalScore >= l.min_score && finalScore <= l.max_score
            ) || levels[0];

            addMessage({
              id: "result",
              role: "assistant",
              content: `🎉 **Quiz Finalizado!**\n\nVocê acertou **${finalScore}** de **${totalQuestions}** perguntas!\n\n${level?.emoji || "🏆"} **Nível: ${level?.name || "Especialista"}**\n\n${level?.description || "Parabéns pelo seu desempenho!"}`,
              type: "result",
            });
          }
        }, 800);
      }, 500);
    },
    [quizState, currentQuestion, score, addMessage, questions, levels]
  );

  const restartQuiz = useCallback(async () => {
    // Refetch questions for a fresh random set
    try {
      const { data } = await supabase.from("quiz_questions").select("*");
      if (data) {
        const typedQuestions = data.map(q => ({
          ...q,
          alternativas: q.alternativas as unknown as QuizAlternatives
        })) as QuizQuestion[];
        setQuestions(typedQuestions);
      }
    } catch (error) {
      console.error("Error refetching questions:", error);
    }

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
    setAnswers(new Array(totalQuestions).fill(null));
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
    isLoading,
    startQuiz,
    handleOptionClick,
    restartQuiz,
    sendMessage,
  };
};
