import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Trophy, History } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface QuizResult {
  id: string;
  email: string;
  score: number;
  total_questions: number;
  completed_at: string;
  duration_seconds: number | null;
}

interface ParticipantSummary {
  email: string;
  latestResult: QuizResult;
  allResults: QuizResult[];
  totalParticipations: number;
  bestScore: number;
  firstParticipation: string;
  lastParticipation: string;
}

interface ParticipantHistoryModalProps {
  participant: ParticipantSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteResult: (resultId: string) => void;
}

const formatDuration = (seconds: number | null): string => {
  if (!seconds) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}min ${secs}s`;
};

export const ParticipantHistoryModal = ({
  participant,
  open,
  onOpenChange,
  onDeleteResult,
}: ParticipantHistoryModalProps) => {
  if (!participant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Histórico do Participante
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email */}
          <div className="text-lg font-medium text-foreground break-all">
            {participant.email}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Total de participações</div>
              <div className="text-xl font-bold">{participant.totalParticipations}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Maior pontuação
              </div>
              <div className="text-xl font-bold">{participant.bestScore}/10</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Primeira vez</div>
              <div className="text-sm font-medium">
                {format(new Date(participant.firstParticipation), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground">Última vez</div>
              <div className="text-sm font-medium">
                {format(new Date(participant.lastParticipation), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </div>
            </div>
          </div>

          {/* History Table */}
          <div>
            <div className="text-sm font-medium mb-2">Histórico completo:</div>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {participant.allResults.map((result, index) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between bg-muted/30 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(result.completed_at), "dd/MM HH:mm", { locale: ptBR })}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDuration(result.duration_seconds)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        {result.score}/{result.total_questions}
                        {index === 0 && " (atual)"}
                      </Badge>
                      <button
                        onClick={() => onDeleteResult(result.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export type { ParticipantSummary, QuizResult };
