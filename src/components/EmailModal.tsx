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
  score: number;
  totalQuestions: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const EmailModal = ({
  isOpen,
  score,
  totalQuestions,
  onClose,
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
    try {
      const { error } = await supabase.from("quiz_results").insert({
        email: email.trim(),
        score,
        total_questions: totalQuestions,
      });

      if (error) throw error;

      toast.success("Resultado registrado com sucesso!");
      setEmail("");
      onSuccess();
    } catch (error) {
      console.error("Error saving result:", error);
      toast.error("Erro ao salvar resultado. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registre seu resultado! 🎉</DialogTitle>
          <DialogDescription>
            Você acertou <strong>{score}</strong> de <strong>{totalQuestions}</strong> perguntas.
            Deixe seu email para registrar sua pontuação.
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
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Pular
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
