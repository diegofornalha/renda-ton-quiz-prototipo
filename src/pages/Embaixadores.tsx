import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Trophy, Mail, Calendar, Clock } from "lucide-react";
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

const Embaixadores = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [embaixadores, setEmbaixadores] = useState<ParticipantSummary[]>([]);
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

    return participantsList;
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
        const allParticipants = groupResultsByEmail(data);
        // Filter only embaixadores (latest score = 10)
        const embaixadoresList = allParticipants
          .filter((p) => p.latestResult.score === 10)
          .sort((a, b) => new Date(b.lastParticipation).getTime() - new Date(a.lastParticipation).getTime());
        setEmbaixadores(embaixadoresList);
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
      const allParticipants = groupResultsByEmail(newResults);
      const embaixadoresList = allParticipants
        .filter((p) => p.latestResult.score === 10)
        .sort((a, b) => new Date(b.lastParticipation).getTime() - new Date(a.lastParticipation).getTime());
      setEmbaixadores(embaixadoresList);

      if (selectedParticipant) {
        const updatedParticipant = embaixadoresList.find((p) => p.email === selectedParticipant.email);
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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-7 h-7 text-accent" />
              Embaixadores
            </h1>
            <p className="text-sm text-muted-foreground">
              Participantes com nota máxima (última participação)
            </p>
          </div>
        </div>

        {/* Embaixadores List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏆 {embaixadores.length} {embaixadores.length === 1 ? "Embaixador" : "Embaixadores"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : embaixadores.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum embaixador ainda</p>
                <p className="text-sm text-muted-foreground">
                  Embaixadores são participantes que tiraram 10/10 na última participação
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {embaixadores.map((participant) => (
                    <Card 
                      key={participant.email} 
                      className="bg-accent/10 border-accent/30 cursor-pointer hover:bg-accent/20 transition-colors"
                      onClick={() => handleParticipantClick(participant)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
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
                          <div className="flex items-center gap-2">
                            <Badge className="shrink-0 bg-accent text-accent-foreground">
                              10/10 🏆
                            </Badge>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteResult(participant.latestResult.id);
                              }}
                              className="text-xs text-red-500 hover:text-red-700 font-medium"
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

export default Embaixadores;
