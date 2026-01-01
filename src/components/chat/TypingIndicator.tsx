export const TypingIndicator = () => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="relative max-w-[85%] rounded-lg px-4 py-3 bg-chat-incoming text-foreground rounded-bl-sm">
        {/* WhatsApp-style message tail */}
        <div
          className="absolute top-0 left-[-6px] w-3 h-3 bg-chat-incoming"
          style={{
            clipPath: "polygon(100% 0, 0 0, 100% 100%)"
          }}
        />
        
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms", animationDuration: "1s" }} />
            <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms", animationDuration: "1s" }} />
            <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms", animationDuration: "1s" }} />
          </div>
          <span className="text-xs text-muted-foreground ml-2">digitando...</span>
        </div>
      </div>
    </div>
  );
};
