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
      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
    >
      <div
        className={`relative max-w-[85%] rounded-lg px-3 py-2 ${
          isUser
            ? "bg-chat-outgoing text-primary-foreground rounded-br-sm"
            : "bg-chat-incoming text-foreground rounded-bl-sm"
        }`}
      >
        {/* WhatsApp-style message tail */}
        <div
          className={`absolute top-0 w-3 h-3 ${
            isUser
              ? "right-[-6px] bg-chat-outgoing"
              : "left-[-6px] bg-chat-incoming"
          }`}
          style={{
            clipPath: isUser
              ? "polygon(0 0, 100% 0, 0 100%)"
              : "polygon(100% 0, 0 0, 100% 100%)"
          }}
        />
        
        <p className="text-sm leading-relaxed whitespace-pre-line">
          {parseContent(message.content)}
        </p>
        
        {/* Timestamp placeholder */}
        <div className={`text-[10px] mt-0.5 text-right ${isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
