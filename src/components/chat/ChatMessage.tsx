import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { ChatMessage as ChatMessageType } from "@/types/quiz";
import { Badge } from "@/components/ui/badge";

interface ChatMessageProps {
  message: ChatMessageType;
}

const parseBold = (text: string, startKey: number): React.ReactNode[] => {
  return text.split("**").map((part, i) =>
    i % 2 === 1 ? <strong key={startKey + i}>{part}</strong> : part
  );
};

const parseContent = (content: string): React.ReactNode[] => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = linkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index);
      parts.push(...parseBold(textBefore, keyIndex));
      keyIndex += 10;
    }
    
    const [, linkText, linkUrl] = match;
    const isExternal = linkUrl.startsWith('http');
    
    if (isExternal) {
      parts.push(
        <a key={keyIndex++} href={linkUrl} target="_blank" rel="noopener noreferrer"
           className="text-primary hover:underline font-medium">
          {linkText}
        </a>
      );
    } else {
      parts.push(
        <Link key={keyIndex++} to={linkUrl} 
              className="text-primary hover:underline font-medium">
          {linkText}
        </Link>
      );
    }
    
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(...parseBold(content.slice(lastIndex), keyIndex));
  }

  return parts.length > 0 ? parts : parseBold(content, 0);
};

const getDifficultyBadge = (difficulty: string) => {
  const config: Record<string, { label: string; className: string }> = {
    fácil: { label: "Fácil", className: "bg-green-500/20 text-green-700 border-green-500/30" },
    média: { label: "Média", className: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30" },
    difícil: { label: "Difícil", className: "bg-red-500/20 text-red-700 border-red-500/30" },
  };
  return config[difficulty.toLowerCase()] || null;
};

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const difficultyConfig = message.difficulty ? getDifficultyBadge(message.difficulty) : null;
  
  const [displayedText, setDisplayedText] = useState(message.isStreaming ? "" : message.content);
  const [isStreamingComplete, setIsStreamingComplete] = useState(!message.isStreaming);

  useEffect(() => {
    if (!message.isStreaming) {
      setDisplayedText(message.content);
      setIsStreamingComplete(true);
      return;
    }

    setDisplayedText("");
    setIsStreamingComplete(false);
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < message.content.length) {
        setDisplayedText(message.content.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsStreamingComplete(true);
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [message.content, message.isStreaming]);

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
        
        {/* Difficulty badge */}
        {difficultyConfig && (
          <Badge variant="outline" className={`mb-1.5 text-[10px] ${difficultyConfig.className}`}>
            {difficultyConfig.label}
          </Badge>
        )}
        
        <p className="text-sm leading-relaxed whitespace-pre-line">
          {parseContent(displayedText)}
          {!isStreamingComplete && <span className="inline-block w-0.5 h-4 bg-foreground/70 ml-0.5 animate-pulse" />}
        </p>
        
        {/* Timestamp placeholder */}
        {isStreamingComplete && (
          <div className={`text-[10px] mt-0.5 text-right ${isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
};
