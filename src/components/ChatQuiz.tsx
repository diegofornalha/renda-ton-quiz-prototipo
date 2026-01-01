import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuiz } from "@/hooks/useQuiz";
import { ChatHeader, ChatMessage, ChatInput, QuizOptions, TypingIndicator } from "@/components/chat";

export const ChatQuiz = () => {
  const {
    messages,
    quizState,
    currentQuestion,
    totalQuestions,
    showOptions,
    showWelcomeOptions,
    lastMessage,
    isLoading,
    awaitingEmail,
    questionTimeLeft,
    timerEnabled,
    startQuiz,
    handleOptionClick,
    handleWelcomeOptionClick,
    restartQuiz,
    sendMessage,
  } = useQuiz();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive or during streaming
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, lastMessage?.content]);

  return (
    <div className="h-screen h-[100dvh] flex flex-col bg-background overflow-hidden">
      {/* WhatsApp-style Header */}
      <ChatHeader
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        isPlaying={quizState === "playing"}
        timeLeft={questionTimeLeft}
        timerEnabled={timerEnabled}
      />

      {/* Chat Area with pattern background */}
      <div className="flex-1 min-h-0 overflow-hidden chat-pattern">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-2 max-w-full overflow-hidden">
            {messages.map((message) => (
              message.isTyping ? (
                <TypingIndicator key={message.id} />
              ) : (
                <ChatMessage key={message.id} message={message} />
              )
            ))}

            {showOptions && lastMessage?.options && (
              <QuizOptions
                options={lastMessage.options}
                onSelect={handleOptionClick}
              />
            )}

            {showWelcomeOptions && lastMessage?.options && (
              <QuizOptions
                options={lastMessage.options}
                onSelect={handleWelcomeOptionClick}
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
          awaitingEmail={awaitingEmail}
          onStartQuiz={startQuiz}
          onRestartQuiz={restartQuiz}
          onSendMessage={sendMessage}
        />
      </div>
    </div>
  );
};
