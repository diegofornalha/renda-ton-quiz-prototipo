import { Bot, User } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/types/quiz";

interface ChatMessageProps {
  message: ChatMessageType;
}

const parseContent = (content: string) => {
  return content.split("**").map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
};

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
    >
      {!isUser && (
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 md:w-5 md:h-5 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 md:px-5 md:py-4 ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        }`}
      >
        <p className="text-sm md:text-base leading-relaxed whitespace-pre-line">
          {parseContent(message.content)}
        </p>
      </div>
      {isUser && (
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 md:w-5 md:h-5 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};
