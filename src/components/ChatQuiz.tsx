import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuiz } from "@/hooks/useQuiz";
import { ChatHeader, ChatMessage, ChatInput, QuizOptions } from "@/components/chat";
import tonHeroImage from "@/assets/ton-hero.png";

export const ChatQuiz = () => {
  const {
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
  } = useQuiz();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-hero py-4 px-3 sm:py-6 sm:px-4">
      <div className="max-w-lg mx-auto space-y-3 sm:space-y-4">
        {/* Header */}
        <header className="text-center space-y-1">
          <img
            src={tonHeroImage}
            alt="Ton Renda Extra"
            className="w-16 sm:w-24 h-auto mx-auto drop-shadow-lg"
          />
          <h1 className="text-lg sm:text-xl font-bold text-foreground">
            <span className="text-gradient">Renda Extra Ton</span>
          </h1>
        </header>

        {/* Chat Container */}
        <main className="flex flex-col h-[calc(100vh-140px)] h-[calc(100dvh-140px)] sm:h-[calc(100vh-180px)] min-h-[400px] bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <ChatHeader
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
            isPlaying={quizState === "playing"}
          />

          <ScrollArea className="flex-1 p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {showOptions && lastMessage?.options && (
                <QuizOptions
                  options={lastMessage.options}
                  onSelect={handleOptionClick}
                />
              )}

              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-border bg-background/50">
            <ChatInput
              quizState={quizState}
              showOptions={showOptions}
              onStartQuiz={startQuiz}
              onRestartQuiz={restartQuiz}
              onSendMessage={sendMessage}
            />
          </div>
        </main>
      </div>
    </div>
  );
};
