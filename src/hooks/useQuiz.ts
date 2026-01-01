import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage, QuizState, QuizQuestion, QuizLevel, QuizAlternatives } from "@/types/quiz";

const createWelcomeMessage = (): ChatMessage => ({
  id: "welcome",
  role: "assistant",
  content: "Olá! 👋 Sou o assistente do Renda Extra Ton. Vou te fazer algumas perguntas para testar seus conhecimentos sobre o programa. Pronto para começar?",
  type: "welcome",
  options: ["Sim ✅", "Não, quero ler o regulamento 📖"],
  isTyping: true,
});

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

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const useQuiz = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([createWelcomeMessage()]);
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [levels, setLevels] = useState<QuizLevel[]>([]);
  const [answers, setAnswers] = useState<(boolean | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [awaitingEmail, setAwaitingEmail] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Timer states
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [questionTimeLimit, setQuestionTimeLimit] = useState(DEFAULT_QUESTION_TIME_LIMIT);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(DEFAULT_QUESTION_TIME_LIMIT);
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  // Difficulty settings
  const [difficultyOrderEnabled, setDifficultyOrderEnabled] = useState(true);
  const [showDifficultyEnabled, setShowDifficultyEnabled] = useState(true);
  const [questionsEasy, setQuestionsEasy] = useState(3);
  const [questionsMedium, setQuestionsMedium] = useState(4);
  const [questionsHard, setQuestionsHard] = useState(3);

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
            } else if (setting.key === "difficulty_order_enabled") {
              setDifficultyOrderEnabled(setting.value === "true");
            } else if (setting.key === "show_difficulty_enabled") {
              setShowDifficultyEnabled(setting.value === "true");
            } else if (setting.key === "questions_easy") {
              setQuestionsEasy(parseInt(setting.value) || 3);
            } else if (setting.key === "questions_medium") {
              setQuestionsMedium(parseInt(setting.value) || 4);
            } else if (setting.key === "questions_hard") {
              setQuestionsHard(parseInt(setting.value) || 3);
            }
          });
        }

        // Trigger welcome message streaming after data loads
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === "welcome"
                ? { ...msg, isTyping: false, isStreaming: true }
                : msg
            )
          );
          // Finalize after streaming
          const welcomeContent = "Olá! 👋 Sou o assistente do Renda Extra Ton. Vou te fazer algumas perguntas para testar seus conhecimentos sobre o programa. Pronto para começar?";
          const streamDuration = welcomeContent.length * 25 + 100;
          setTimeout(() => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === "welcome"
                  ? { ...msg, isTyping: false, isStreaming: false }
                  : msg
              )
            );
          }, streamDuration);
        }, 1500);
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

  // Add message with typing indicator, then streaming effect
  const addMessageWithTyping = useCallback((message: ChatMessage, typingDelay: number = 1500) => {
    // First, add message with typing indicator
    const typingMessage: ChatMessage = {
      ...message,
      isTyping: true,
      isStreaming: false,
    };
    setMessages((prev) => [...prev, typingMessage]);

    // After typing delay, switch to streaming
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id
            ? { ...msg, isTyping: false, isStreaming: true }
            : msg
        )
      );

      // After streaming completes (estimate based on content length), finalize message
      const streamDuration = message.content.length * 25 + 100;
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === message.id
              ? { ...msg, isTyping: false, isStreaming: false }
              : msg
          )
        );
      }, streamDuration);
    }, typingDelay);
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
            difficulty: showDifficultyEnabled ? nextQuestion.dificuldade as "fácil" | "média" | "difícil" : undefined,
          });
          
          isProcessingRef.current = false;
        } else {
          finishQuiz(newScore, quizStartTime!, userEmail!);
          isProcessingRef.current = false;
        }
      }, 800);
    }, 500);
  }, [quizState, currentQuestion, score, addMessage, questions, finishQuiz, quizStartTime, totalQuestions, questionTimeLimit, showDifficultyEnabled, userEmail]);

  const handleTimeout = useCallback(() => {
    processAnswer(null, true);
  }, [processAnswer]);

  const startQuizWithEmail = useCallback((email: string) => {
    if (questions.length === 0) return;

    setUserEmail(email);
    setAwaitingEmail(false);

    // Separate questions by difficulty
    const easy = questions.filter(q => q.dificuldade.toLowerCase() === 'fácil');
    const medium = questions.filter(q => q.dificuldade.toLowerCase() === 'média');
    const hard = questions.filter(q => q.dificuldade.toLowerCase() === 'difícil');

    // Select questions based on configured distribution
    const selectedQuestions = [
      ...shuffleArray(easy).slice(0, questionsEasy),
      ...shuffleArray(medium).slice(0, questionsMedium),
      ...shuffleArray(hard).slice(0, questionsHard),
    ];

    // Order by difficulty (easy → medium → hard) or shuffle
    const finalQuestions = difficultyOrderEnabled
      ? selectedQuestions
      : shuffleArray(selectedQuestions);
    
    setQuestions(finalQuestions);
    setQuizState("playing");
    setCurrentQuestion(0);
    setScore(0);
    setAnswers(new Array(totalQuestions).fill(null));
    setQuestionTimeLeft(questionTimeLimit);
    setQuizStartTime(Date.now());
    isProcessingRef.current = false;

    const question = finalQuestions[0];
    const options = getOptionsFromAlternatives(question.alternativas);

    addMessage({
      id: `q-0`,
      role: "assistant",
      content: `**Pergunta 1/${totalQuestions}**\n\n${question.texto}`,
      type: "question",
      questionIndex: 0,
      options,
      difficulty: showDifficultyEnabled ? question.dificuldade as "fácil" | "média" | "difícil" : undefined,
    });
  }, [addMessage, questions, totalQuestions, questionsEasy, questionsMedium, questionsHard, difficultyOrderEnabled, showDifficultyEnabled, questionTimeLimit]);

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
        type: "welcome",
        options: ["Sim ✅", "Não, quero ler o regulamento 📖"],
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
    setAwaitingEmail(false);
    isProcessingRef.current = false;
  }, [totalQuestions, questionTimeLimit]);

  // Handle welcome options (Sim/Não)
  const handleWelcomeOptionClick = useCallback((optionIndex: number) => {
    if (optionIndex === 0) {
      // Sim - proceed to ask for email
      addMessage({
        id: `welcome-response-${Date.now()}`,
        role: "user",
        content: "Sim ✅",
        type: "text",
      });
      
      setAwaitingEmail(true);
      
      addMessageWithTyping({
        id: "ask-email",
        role: "assistant",
        content: "Ótimo! Antes de começarmos, preciso do seu email para registrar sua participação. 📧",
        type: "text",
      });
    } else {
      // Não - show regulation link and ask again
      addMessage({
        id: `welcome-response-${Date.now()}`,
        role: "user",
        content: "Não, quero ler o regulamento 📖",
        type: "text",
      });
      
      addMessageWithTyping({
        id: `regulation-link-${Date.now()}`,
        role: "assistant",
        content: "Sem problemas! 📚 Você pode ler o regulamento completo aqui: [Regulamento Renda Extra](/regulamento)",
        type: "text",
      }, 1000);
      
      // After showing link, ask again
      setTimeout(() => {
        addMessageWithTyping({
          id: `ask-again-${Date.now()}`,
          role: "assistant",
          content: "Quando estiver pronto, é só me avisar! Pronto para começar?",
          type: "welcome",
          options: ["Sim ✅", "Não, quero ler o regulamento 📖"],
        }, 1000);
      }, 3500);
    }
  }, [addMessage, addMessageWithTyping]);

  // Start quiz by asking for email in chat (kept for compatibility)
  const startQuiz = useCallback(() => {
    if (questions.length === 0) return;
    handleWelcomeOptionClick(0);
  }, [questions.length, handleWelcomeOptionClick]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      // Add user message
      addMessage({
        id: Date.now().toString(),
        role: "user",
        content: text,
        type: "text",
      });

      // If awaiting email, validate and start quiz
      if (awaitingEmail) {
        const trimmedEmail = text.trim().toLowerCase();
        
        if (EMAIL_REGEX.test(trimmedEmail) && trimmedEmail.length <= 254) {
          // Valid email - confirm and start quiz
          addMessageWithTyping({
            id: "email-confirmed",
            role: "assistant",
            content: `Perfeito! Vamos começar o quiz... 🚀`,
            type: "text",
          }, 1000);
          
          // After animation, start quiz
          const confirmContent = "Perfeito! Vamos começar o quiz... 🚀";
          const totalDelay = 1000 + (confirmContent.length * 25) + 300;
          setTimeout(() => {
            startQuizWithEmail(trimmedEmail);
          }, totalDelay);
        } else {
          // Invalid email
          addMessageWithTyping({
            id: `email-invalid-${Date.now()}`,
            role: "assistant",
            content: "Hmm, esse email não parece válido. Pode tentar novamente? 🤔",
            type: "text",
          });
        }
        return;
      }

      // Normal behavior for other messages
      setTimeout(() => {
        addMessage({
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            quizState === "idle"
              ? "Use os botões acima para começar! 🎯"
              : "Continue respondendo as perguntas do quiz! 📝",
          type: "text",
        });
      }, 500);
    },
    [quizState, addMessage, addMessageWithTyping, awaitingEmail, startQuizWithEmail]
  );

  const lastMessage = messages[messages.length - 1];
  const showOptions = lastMessage?.type === "question" && quizState === "playing" && !isProcessingRef.current;
  const showWelcomeOptions = lastMessage?.type === "welcome" && lastMessage?.options && quizState === "idle" && !awaitingEmail && !lastMessage.isTyping && !lastMessage.isStreaming;

  return {
    messages,
    quizState,
    currentQuestion,
    totalQuestions,
    showOptions,
    showWelcomeOptions,
    lastMessage,
    isLoading,
    awaitingEmail,
    finalScore,
    questionTimeLeft,
    totalDuration,
    timerEnabled,
    startQuiz,
    startQuizWithEmail,
    handleOptionClick,
    handleWelcomeOptionClick,
    restartQuiz,
    sendMessage,
  };
};
