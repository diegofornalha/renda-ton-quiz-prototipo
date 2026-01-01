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
}

export const EmailModal = ({
  isOpen,
  onSuccess,
}: EmailModalProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes("@")) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    setIsSubmitting(true);
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsSubmitting(false);
    onSuccess(email.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
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
