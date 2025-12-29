import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Play, RotateCcw } from "lucide-react";
import { quizQuestions, quizLevels } from "@/data/quizQuestions";
import tonHeroImage from "@/assets/ton-hero.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "question" | "options" | "result";
  questionIndex?: number;
  options?: string[];
  isCorrect?: boolean;
}

export const ChatQuiz = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! 👋 Sou o assistente do Renda Extra Ton. Vou te fazer algumas perguntas para testar seus conhecimentos sobre o programa. Pronto para começar?",
      type: "text",
    },
  ]);
  const [input, setInput] = useState("");
  const [quizState, setQuizState] = useState<"idle" | "playing" | "finished">("idle");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(new Array(quizQuestions.length).fill(null));

  const startQuiz = () => {
    setQuizState("playing");
    setCurrentQuestion(0);
    setScore(0);
    setAnswers(new Array(quizQuestions.length).fill(null));
    
    const question = quizQuestions[0];
    setMessages((prev) => [
      ...prev,
      {
        id: `q-${0}`,
        role: "assistant",
        content: `**Pergunta 1/${quizQuestions.length}**\n\n${question.question}`,
        type: "question",
        questionIndex: 0,
        options: question.options,
      },
    ]);
  };

  const handleOptionClick = (optionIndex: number) => {
    if (quizState !== "playing") return;

    const question = quizQuestions[currentQuestion];
    const isCorrect = optionIndex === question.correctAnswer;
    const selectedOption = question.options[optionIndex];

    // Add user's answer
    setMessages((prev) => [
      ...prev,
      {
        id: `a-${currentQuestion}`,
        role: "user",
        content: selectedOption,
        type: "text",
      },
    ]);

    // Update score and answers
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = isCorrect;
      return newAnswers;
    });

    // Add feedback
    setTimeout(() => {
      const feedbackMessage: Message = {
        id: `f-${currentQuestion}`,
        role: "assistant",
        content: isCorrect
          ? `✅ **Correto!** ${question.explanation}`
          : `❌ **Ops!** A resposta certa era: "${question.options[question.correctAnswer]}"\n\n${question.explanation}`,
        type: "text",
        isCorrect,
      };
      setMessages((prev) => [...prev, feedbackMessage]);

      // Next question or finish
      setTimeout(() => {
        if (currentQuestion < quizQuestions.length - 1) {
          const nextIndex = currentQuestion + 1;
          setCurrentQuestion(nextIndex);
          const nextQuestion = quizQuestions[nextIndex];
          
          setMessages((prev) => [
            ...prev,
            {
              id: `q-${nextIndex}`,
              role: "assistant",
              content: `**Pergunta ${nextIndex + 1}/${quizQuestions.length}**\n\n${nextQuestion.question}`,
              type: "question",
              questionIndex: nextIndex,
              options: nextQuestion.options,
            },
          ]);
        } else {
          finishQuiz();
        }
      }, 800);
    }, 500);
  };

  const finishQuiz = () => {
    setQuizState("finished");
    const finalScore = score + (answers[currentQuestion] === null ? 0 : answers[currentQuestion] ? 1 : 0);
    const percentage = Math.round((finalScore / quizQuestions.length) * 100);
    const level = quizLevels.find(
      (l) => percentage >= l.minScore && percentage <= l.maxScore
    ) || quizLevels[0];

    setMessages((prev) => [
      ...prev,
      {
        id: "result",
        role: "assistant",
        content: `🎉 **Quiz Finalizado!**\n\nVocê acertou **${finalScore}** de **${quizQuestions.length}** perguntas!\n\n${level.emoji} **Nível: ${level.name}**\n\n${level.description}`,
        type: "result",
      },
    ]);
  };

  const restartQuiz = () => {
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
  };

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content: input,
        type: "text",
      },
    ]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: quizState === "idle" 
            ? "Clique em 'Iniciar Quiz' para começarmos! 🎯" 
            : "Continue respondendo as perguntas do quiz! 📝",
          type: "text",
        },
      ]);
    }, 500);
  };

  const lastMessage = messages[messages.length - 1];
  const showOptions = lastMessage?.type === "question" && quizState === "playing";

  return (
    <div className="min-h-screen bg-gradient-hero py-6 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <img
            src={tonHeroImage}
            alt="Ton Renda Extra"
            className="w-24 h-auto mx-auto drop-shadow-lg"
          />
          <h1 className="text-xl font-bold text-foreground">
            <span className="text-gradient">Renda Extra Ton</span>
          </h1>
        </div>

        {/* Chat Container */}
        <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px] bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="bg-primary/10 px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Assistente Ton</p>
                <p className="text-xs text-muted-foreground">
                  {quizState === "playing" 
                    ? `Pergunta ${currentQuestion + 1}/${quizQuestions.length}` 
                    : "Online"}
                </p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  } animate-fade-in`}
                >
                  {message.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {message.content.split("**").map((part, i) => 
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {/* Options for current question */}
              {showOptions && lastMessage.options && (
                <div className="ml-9 space-y-2 animate-slide-up">
                  {lastMessage.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4 text-sm hover:bg-primary/10 hover:border-primary transition-all"
                      onClick={() => handleOptionClick(index)}
                    >
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-xs font-semibold text-primary flex-shrink-0">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="leading-relaxed">{option}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-border bg-background/50">
            {quizState === "idle" && (
              <Button
                onClick={startQuiz}
                className="w-full h-12 rounded-xl font-semibold gap-2 bg-gradient-primary hover:opacity-90 transition-all"
              >
                <Play className="w-5 h-5" />
                Iniciar Quiz
              </Button>
            )}
            
            {quizState === "finished" && (
              <Button
                onClick={restartQuiz}
                className="w-full h-12 rounded-xl font-semibold gap-2 bg-gradient-primary hover:opacity-90 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                Fazer Novamente
              </Button>
            )}

            {quizState === "playing" && !showOptions && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 bg-background border-border"
                />
                <Button type="submit" size="icon" className="shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
