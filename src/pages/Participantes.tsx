import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Users, Mail, Calendar, Clock, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { ParticipantHistoryModal, ParticipantSummary, QuizResult } from "@/components/admin/ParticipantHistoryModal";

const formatDuration = (seconds: number | null): string => {
  if (!seconds) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}min ${secs}s`;
};

const Participantes = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [participants, setParticipants] = useState<ParticipantSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantSummary | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const groupResultsByEmail = useCallback((allResults: QuizResult[]): ParticipantSummary[] => {
    const emailMap = new Map<string, QuizResult[]>();
    
    allResults.forEach((result) => {
      const existing = emailMap.get(result.email) || [];
      existing.push(result);
      emailMap.set(result.email, existing);
    });

    const participantsList: ParticipantSummary[] = [];
    emailMap.forEach((results, email) => {
      const sortedResults = [...results].sort(
        (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      );
      
      const latestResult = sortedResults[0];
      const oldestResult = sortedResults[sortedResults.length - 1];
      const bestScore = Math.max(...results.map((r) => r.score));

      participantsList.push({
        email,
        latestResult,
        allResults: sortedResults,
        totalParticipations: results.length,
        bestScore,
        firstParticipation: oldestResult.completed_at,
        lastParticipation: latestResult.completed_at,
      });
    });

    // Sort by latest participation
    return participantsList.sort(
      (a, b) => new Date(b.lastParticipation).getTime() - new Date(a.lastParticipation).getTime()
    );
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("quiz_results")
        .select("*")
        .order("completed_at", { ascending: false });

      if (error) throw error;
      
      if (data) {
        setResults(data);
        setParticipants(groupResultsByEmail(data));
      }
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  }, [groupResultsByEmail]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteResult = async (resultId: string) => {
    try {
      const { error } = await supabase
        .from("quiz_results")
        .delete()
        .eq("id", resultId);

      if (error) throw error;

      const newResults = results.filter((r) => r.id !== resultId);
      setResults(newResults);
      const newParticipants = groupResultsByEmail(newResults);
      setParticipants(newParticipants);

      if (selectedParticipant) {
        const updatedParticipant = newParticipants.find((p) => p.email === selectedParticipant.email);
        if (updatedParticipant) {
          setSelectedParticipant(updatedParticipant);
        } else {
          setSelectedParticipant(null);
          setHistoryModalOpen(false);
        }
      }

      toast.success("Resultado excluído");
    } catch {
      toast.error("Erro ao excluir resultado");
    }
  };

  const handleParticipantClick = (participant: ParticipantSummary) => {
    setSelectedParticipant(participant);
    setHistoryModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Participantes
            </h1>
            <p className="text-sm text-muted-foreground">
              {participants.length} {participants.length === 1 ? "email único" : "emails únicos"} • {results.length} participações totais
            </p>
          </div>
        </div>

        {/* Participants List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Todos os Participantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : participants.length === 0 ? (
              <p className="text-muted-foreground">Nenhum participante ainda</p>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <Card 
                      key={participant.email} 
                      className="bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                      onClick={() => handleParticipantClick(participant)}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="space-y-2 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Mail className="w-4 h-4 text-primary shrink-0" />
                              <span className="font-medium truncate">
                                {participant.email}
                              </span>
                              {participant.totalParticipations > 1 && (
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {participant.totalParticipations}x
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  {format(
                                    new Date(participant.latestResult.completed_at),
                                    "dd/MM/yyyy 'às' HH:mm",
                                    { locale: ptBR }
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span>{formatDuration(participant.latestResult.duration_seconds)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1">
                              <Trophy className="w-4 h-4 text-accent" />
                              <span className="text-sm font-medium">{participant.bestScore}/10</span>
                            </div>
                            <Badge className="shrink-0">
                              {participant.latestResult.score}/{participant.latestResult.total_questions}
                            </Badge>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteResult(participant.latestResult.id);
                              }}
                              className="text-xs text-red-500 hover:text-red-700 font-medium shrink-0"
                            >
                              excluir
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <ParticipantHistoryModal
        participant={selectedParticipant}
        open={historyModalOpen}
        onOpenChange={setHistoryModalOpen}
        onDeleteResult={handleDeleteResult}
      />
    </div>
  );
};

export default Participantes;
