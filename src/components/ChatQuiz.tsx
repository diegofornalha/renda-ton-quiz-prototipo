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
    timerEnabled,
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
    <div className="h-screen h-[100dvh] flex flex-col bg-background">
      {/* WhatsApp-style Header */}
      <ChatHeader
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        isPlaying={quizState === "playing"}
        timeLeft={questionTimeLeft}
        timerEnabled={timerEnabled}
      />

      {/* Chat Area with pattern background */}
      <div className="flex-1 overflow-hidden chat-pattern">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-2">
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
      </div>

      {/* Bottom input area */}
      <div className="p-2 bg-card border-t border-border">
        <ChatInput
          quizState={quizState}
          showOptions={showOptions}
          isLoading={isLoading}
          onStartQuiz={startQuiz}
          onRestartQuiz={restartQuiz}
          onSendMessage={sendMessage}
        />
      </div>

      <EmailModal
        isOpen={showEmailModal}
        onSuccess={startQuizWithEmail}
      />
    </div>
  );
};
