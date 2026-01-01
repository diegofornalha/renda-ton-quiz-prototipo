import { useState, useCallback, useEffect, useRef } from "react";
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

const DEFAULT_QUESTION_TIME_LIMIT = 180; // 3 minutes in seconds

export const useQuiz = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [levels, setLevels] = useState<QuizLevel[]>([]);
  const [answers, setAnswers] = useState<(boolean | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Timer states
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [questionTimeLimit, setQuestionTimeLimit] = useState(DEFAULT_QUESTION_TIME_LIMIT);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(DEFAULT_QUESTION_TIME_LIMIT);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  const totalQuestions = 10; // Fixed number of questions per quiz

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Question timer effect
  useEffect(() => {
    if (quizState === "playing" && !isProcessingRef.current && timerEnabled) {
      // Clear existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Start new timer
      timerRef.current = setInterval(() => {
        setQuestionTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up - auto-submit wrong answer
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            // Trigger timeout handler
            handleTimeout();
            return questionTimeLimit;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Clear timer when not playing or timer disabled
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizState, currentQuestion, timerEnabled, questionTimeLimit]);

  // Fetch questions, levels, and settings from database
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [questionsRes, levelsRes, settingsRes] = await Promise.all([
          supabase.from("quiz_questions").select("*"),
          supabase.from("quiz_levels").select("*").order("min_score"),
          supabase.from("quiz_settings").select("*"),
        ]);

        if (questionsRes.data) {
          const typedQuestions = questionsRes.data.map(q => ({
            ...q,
            alternativas: q.alternativas as unknown as QuizAlternatives
          })) as QuizQuestion[];
          setQuestions(typedQuestions);
        }
        if (levelsRes.data) {
          setLevels(levelsRes.data as QuizLevel[]);
        }
        if (settingsRes.data) {
          settingsRes.data.forEach((setting) => {
            if (setting.key === "timer_enabled") {
              setTimerEnabled(setting.value === "true");
            } else if (setting.key === "timer_seconds") {
              const seconds = parseInt(setting.value) || DEFAULT_QUESTION_TIME_LIMIT;
              setQuestionTimeLimit(seconds);
              setQuestionTimeLeft(seconds);
            }
          });
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

  const finishQuiz = useCallback(async (finalScoreValue: number, startTime: number, email: string) => {
    const endTime = Date.now();
    const durationSeconds = Math.round((endTime - startTime) / 1000);
    setTotalDuration(durationSeconds);
    setQuizState("finished");
    setFinalScore(finalScoreValue);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Save result to database
    try {
      await supabase.from("quiz_results").insert({
        email,
        score: finalScoreValue,
        total_questions: totalQuestions,
        duration_seconds: durationSeconds,
      });
    } catch (error) {
      console.error("Error saving result:", error);
    }

    const level = levels.find(
      (l) => finalScoreValue >= l.min_score && finalScoreValue <= l.max_score
    ) || levels[0];

    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    const timeStr = `${minutes}min ${seconds}s`;

    addMessage({
      id: "result",
      role: "assistant",
      content: `🎉 **Quiz Finalizado!**\n\nVocê acertou **${finalScoreValue}** de **${totalQuestions}** perguntas!\n\n⏱️ **Tempo total:** ${timeStr}\n\n${level?.emoji || "🏆"} **Nível: ${level?.name || "Especialista"}**\n\n${level?.description || "Parabéns pelo seu desempenho!"}`,
      type: "result",
    });
  }, [levels, addMessage, totalQuestions]);

  const processAnswer = useCallback((optionIndex: number | null, isTimeout: boolean = false) => {
    if (isProcessingRef.current || quizState !== "playing" || questions.length === 0) return;
    
    isProcessingRef.current = true;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const question = questions[currentQuestion];
    const correctIndex = getCorrectAnswerIndex(question.alternativas);
    const isCorrect = optionIndex !== null && optionIndex === correctIndex;
    
    const keys = ["A", "B", "C", "D"] as const;
    const correctOption = question.alternativas[keys[correctIndex]];

    if (isTimeout) {
      addMessage({
        id: `a-${currentQuestion}`,
        role: "user",
        content: "⏰ Tempo esgotado!",
        type: "text",
      });
    } else if (optionIndex !== null) {
      const selectedKey = keys[optionIndex];
      const selectedOption = question.alternativas[selectedKey];
      addMessage({
        id: `a-${currentQuestion}`,
        role: "user",
        content: `${selectedKey}) ${selectedOption.texto}`,
        type: "text",
      });
    }

    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);

    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = isCorrect;
      return newAnswers;
    });

    setTimeout(() => {
      let feedbackContent: string;
      if (isTimeout) {
        feedbackContent = `⏰ **Tempo esgotado!** A resposta certa era: "${keys[correctIndex]}) ${correctOption.texto}"\n\n${correctOption.explicacao}\n\n📖 *${correctOption.regulamento_ref}*`;
      } else if (isCorrect && optionIndex !== null) {
        const selectedOption = question.alternativas[keys[optionIndex]];
        feedbackContent = `✅ **Correto!** ${selectedOption.explicacao}\n\n📖 *${selectedOption.regulamento_ref}*`;
      } else {
        feedbackContent = `❌ **Ops!** A resposta certa era: "${keys[correctIndex]}) ${correctOption.texto}"\n\n${correctOption.explicacao}\n\n📖 *${correctOption.regulamento_ref}*`;
      }

      addMessage({
        id: `f-${currentQuestion}`,
        role: "assistant",
        content: feedbackContent,
        type: "text",
        isCorrect,
      });

      setTimeout(() => {
        if (currentQuestion < totalQuestions - 1) {
          const nextIndex = currentQuestion + 1;
          setCurrentQuestion(nextIndex);
          setQuestionTimeLeft(questionTimeLimit);
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
          
          isProcessingRef.current = false;
        } else {
          finishQuiz(newScore, quizStartTime!, userEmail!);
          isProcessingRef.current = false;
        }
      }, 800);
    }, 500);
  }, [quizState, currentQuestion, score, addMessage, questions, finishQuiz, quizStartTime, totalQuestions]);

  const handleTimeout = useCallback(() => {
    processAnswer(null, true);
  }, [processAnswer]);

  const requestEmailForQuiz = useCallback(() => {
    if (questions.length === 0) return;
    setShowEmailModal(true);
  }, [questions.length]);

  const startQuizWithEmail = useCallback((email: string) => {
    if (questions.length === 0) return;

    setUserEmail(email);
    setShowEmailModal(false);

    const shuffledQuestions = shuffleArray(questions).slice(0, totalQuestions);
    setQuestions(shuffledQuestions);
    setQuizState("playing");
    setCurrentQuestion(0);
    setScore(0);
    setAnswers(new Array(totalQuestions).fill(null));
    setQuestionTimeLeft(questionTimeLimit);
    setQuizStartTime(Date.now());
    isProcessingRef.current = false;

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
  }, [addMessage, questions, totalQuestions]);

  const handleOptionClick = useCallback(
    (optionIndex: number) => {
      processAnswer(optionIndex, false);
    },
    [processAnswer]
  );

  const restartQuiz = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
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
    setQuestionTimeLeft(questionTimeLimit);
    setQuizStartTime(null);
    setTotalDuration(0);
    setUserEmail(null);
    isProcessingRef.current = false;
  }, [totalQuestions]);

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
  const showOptions = lastMessage?.type === "question" && quizState === "playing" && !isProcessingRef.current;

  const closeEmailModal = useCallback(() => {
    setShowEmailModal(false);
  }, []);

  const startQuiz = requestEmailForQuiz;

  return {
    messages,
    quizState,
    currentQuestion,
    totalQuestions,
    showOptions,
    lastMessage,
    isLoading,
    showEmailModal,
    finalScore,
    questionTimeLeft,
    totalDuration,
    timerEnabled,
    startQuiz,
    startQuizWithEmail,
    handleOptionClick,
    restartQuiz,
    sendMessage,
    closeEmailModal,
  };
};
