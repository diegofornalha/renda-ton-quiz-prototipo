import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { ChatMessage as ChatMessageType } from "@/types/quiz";
import { Badge } from "@/components/ui/badge";

interface ChatMessageProps {
  message: ChatMessageType;
  onStreamingComplete?: () => void;
  onStreamingProgress?: () => void;
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

// Helper to split question header from body
const splitQuestionContent = (content: string): [string | null, string] => {
  const match = content.match(/^(\*\*Pergunta \d+\/\d+\*\*)\n\n(.+)$/s);
  if (match) {
    return [match[1], match[2]];
  }
  return [null, content];
};

export const ChatMessage = ({ message, onStreamingComplete, onStreamingProgress }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const difficultyConfig = message.difficulty ? getDifficultyBadge(message.difficulty) : null;
  const isQuestionMessage = message.type === "question";
  
  // Split question content into header (fixed) and body (streaming)
  const [questionHeader, questionBody] = isQuestionMessage 
    ? splitQuestionContent(message.content)
    : [null, message.content];
  
  const contentToStream = isQuestionMessage ? questionBody : message.content;
  
  const [displayedText, setDisplayedText] = useState(message.isStreaming ? "" : contentToStream);
  const [isStreamingComplete, setIsStreamingComplete] = useState(!message.isStreaming);

  useEffect(() => {
    if (!message.isStreaming) {
      setDisplayedText(contentToStream);
      setIsStreamingComplete(true);
      return;
    }

    setDisplayedText("");
    setIsStreamingComplete(false);
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < contentToStream.length) {
        setDisplayedText(contentToStream.slice(0, currentIndex + 1));
        currentIndex++;
        // Notify progress every 10 characters for smooth scrolling
        if (currentIndex % 10 === 0 && onStreamingProgress) {
          onStreamingProgress();
        }
      } else {
        setIsStreamingComplete(true);
        onStreamingComplete?.();
        clearInterval(interval);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [contentToStream, message.isStreaming, onStreamingComplete]);

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
        
        {/* Question header (fixed, no streaming) */}
        {isQuestionMessage && questionHeader && (
          <p className="text-sm leading-relaxed whitespace-pre-line mb-2">
            {parseContent(questionHeader)}
          </p>
        )}
        
        {/* Message body (with streaming for questions) */}
        <p className="text-sm leading-relaxed whitespace-pre-line">
          {parseContent(displayedText)}
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
