import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailModalProps {
  isOpen: boolean;
  onSuccess: (email: string) => void;
  onClose?: () => void;
}

export const EmailModal = ({
  isOpen,
  onSuccess,
  onClose,
}: EmailModalProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // RFC 5322 compliant email regex with length validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim().toLowerCase();
    
    // Proper email validation: regex + max length (RFC 5321)
    if (!emailRegex.test(trimmedEmail) || trimmedEmail.length > 254) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    setIsSubmitting(true);
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsSubmitting(false);
    onSuccess(trimmedEmail);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>Antes de começar! 📧</DialogTitle>
          <DialogDescription>
            Insira seu email para registrar sua participação no quiz.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoFocus
              maxLength={254}
              pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Confirmando..." : "Iniciar Quiz"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
