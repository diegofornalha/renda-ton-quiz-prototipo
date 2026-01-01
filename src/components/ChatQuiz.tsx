import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuiz } from "@/hooks/useQuiz";
import { ChatHeader, ChatMessage, ChatInput, QuizOptions } from "@/components/chat";
import { EmailModal } from "@/components/EmailModal";

export const ChatQuiz = () => {
  const {
    messages,
    quizState,
    currentQuestion,
    totalQuestions,
    showOptions,
    lastMessage,
    isLoading,
    showEmailModal,
    questionTimeLeft,
    startQuiz,
    startQuizWithEmail,
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
    <div className="h-screen h-[100dvh] bg-gradient-hero p-2 sm:p-3 md:p-4">
      <div className="h-full max-w-4xl mx-auto">
        {/* Chat Container */}
        <main className="flex flex-col h-full bg-card rounded-2xl md:rounded-3xl border border-border shadow-card overflow-hidden">
          <ChatHeader
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
            isPlaying={quizState === "playing"}
            timeLeft={questionTimeLeft}
          />

          <ScrollArea className="flex-1 p-3 sm:p-4 md:p-6">
            <div className="space-y-3 sm:space-y-4 md:space-y-5">
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

          <div className="p-3 md:p-4 border-t border-border bg-background/50">
            <ChatInput
              quizState={quizState}
              showOptions={showOptions}
              isLoading={isLoading}
              onStartQuiz={startQuiz}
              onRestartQuiz={restartQuiz}
              onSendMessage={sendMessage}
            />
          </div>
        </main>
      </div>

      <EmailModal
        isOpen={showEmailModal}
        onSuccess={startQuizWithEmail}
      />
    </div>
  );
};
