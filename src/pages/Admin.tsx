import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, HelpCircle, Trophy, Calendar, Mail, Clock, Settings, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { ParticipantHistoryModal, ParticipantSummary, QuizResult } from "@/components/admin/ParticipantHistoryModal";

interface ScoreGroup {
  score: number;
  count: number;
  participants: ParticipantSummary[];
}

const formatDuration = (seconds: number | null): string => {
  if (!seconds) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}min ${secs}s`;
};

const Admin = () => {
  const navigate = useNavigate();
  const [questionsCount, setQuestionsCount] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [scoreGroups, setScoreGroups] = useState<ScoreGroup[]>([]);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantSummary | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  
  // Timer settings
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Difficulty settings
  const [difficultyOrderEnabled, setDifficultyOrderEnabled] = useState(true);
  const [showDifficultyEnabled, setShowDifficultyEnabled] = useState(true);
  const [questionsEasy, setQuestionsEasy] = useState(3);
  const [questionsMedium, setQuestionsMedium] = useState(4);
  const [questionsHard, setQuestionsHard] = useState(3);

  // Available questions count by difficulty
  const [availableEasy, setAvailableEasy] = useState(0);
  const [availableMedium, setAvailableMedium] = useState(0);
  const [availableHard, setAvailableHard] = useState(0);

  // Group results by email, considering only the latest participation for classification
  const groupResultsByEmail = useCallback((allResults: QuizResult[]): ParticipantSummary[] => {
    const emailMap = new Map<string, QuizResult[]>();
    
    // Group all results by email
    allResults.forEach((result) => {
      const existing = emailMap.get(result.email) || [];
      existing.push(result);
      emailMap.set(result.email, existing);
    });

    // Create ParticipantSummary for each unique email
    const participants: ParticipantSummary[] = [];
    emailMap.forEach((results, email) => {
      // Sort by completed_at descending (latest first)
      const sortedResults = [...results].sort(
        (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      );
      
      const latestResult = sortedResults[0];
      const oldestResult = sortedResults[sortedResults.length - 1];
      const bestScore = Math.max(...results.map((r) => r.score));

      participants.push({
        email,
        latestResult,
        allResults: sortedResults,
        totalParticipations: results.length,
        bestScore,
        firstParticipation: oldestResult.completed_at,
        lastParticipation: latestResult.completed_at,
      });
    });

    return participants;
  }, []);

  // Group participants by their latest score
  const groupParticipantsByScore = useCallback((participants: ParticipantSummary[]): ScoreGroup[] => {
    const scoreMap = new Map<number, ParticipantSummary[]>();

    participants.forEach((participant) => {
      const score = participant.latestResult.score;
      const existing = scoreMap.get(score) || [];
      existing.push(participant);
      scoreMap.set(score, existing);
    });

    const groups: ScoreGroup[] = [];
    scoreMap.forEach((participants, score) => {
      groups.push({
        score,
        count: participants.length,
        participants,
      });
    });

    // Sort by score descending
    return groups.sort((a, b) => b.score - a.score);
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [questionsRes, resultsRes, settingsRes] = await Promise.all([
        supabase.from("quiz_questions").select("*"),
        supabase.from("quiz_results").select("*").order("completed_at", { ascending: false }),
        supabase.from("quiz_settings").select("*"),
      ]);

      if (questionsRes.data) {
        setQuestionsCount(questionsRes.data.length);
        // Count questions by difficulty
        const easy = questionsRes.data.filter((q: { dificuldade: string }) => q.dificuldade.toLowerCase() === 'fácil').length;
        const medium = questionsRes.data.filter((q: { dificuldade: string }) => q.dificuldade.toLowerCase() === 'média').length;
        const hard = questionsRes.data.filter((q: { dificuldade: string }) => q.dificuldade.toLowerCase() === 'difícil').length;
        setAvailableEasy(easy);
        setAvailableMedium(medium);
        setAvailableHard(hard);
      }
      
      if (resultsRes.data) {
        setResults(resultsRes.data);
        const participants = groupResultsByEmail(resultsRes.data);
        const groups = groupParticipantsByScore(participants);
        setScoreGroups(groups);
      }

      if (settingsRes.data) {
        settingsRes.data.forEach((setting: { key: string; value: string }) => {
          if (setting.key === "timer_enabled") {
            setTimerEnabled(setting.value === "true");
          } else if (setting.key === "timer_seconds") {
            setTimerSeconds(parseInt(setting.value) || 180);
          } else if (setting.key === "difficulty_order_enabled") {
            setDifficultyOrderEnabled(setting.value === "true");
          } else if (setting.key === "show_difficulty_enabled") {
            setShowDifficultyEnabled(setting.value === "true");
          } else if (setting.key === "questions_easy") {
            setQuestionsEasy(parseInt(setting.value) || 3);
          } else if (setting.key === "questions_medium") {
            setQuestionsMedium(parseInt(setting.value) || 4);
          } else if (setting.key === "questions_hard") {
            setQuestionsHard(parseInt(setting.value) || 3);
          }
        });
      }
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  }, [groupResultsByEmail, groupParticipantsByScore]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Compute unique emails and total participations
  const { uniqueEmails, totalParticipations } = useMemo(() => {
    const participants = groupResultsByEmail(results);
    return {
      uniqueEmails: participants.length,
      totalParticipations: results.length,
    };
  }, [results, groupResultsByEmail]);

  // Count participants with score 10 (based on latest participation)
  const maxScoreCount = useMemo(() => {
    return scoreGroups.find((g) => g.score === 10)?.count || 0;
  }, [scoreGroups]);

  const saveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await Promise.all([
        supabase.from("quiz_settings").upsert({ key: "timer_enabled", value: String(timerEnabled) }, { onConflict: "key" }),
        supabase.from("quiz_settings").upsert({ key: "timer_seconds", value: String(timerSeconds) }, { onConflict: "key" }),
        supabase.from("quiz_settings").upsert({ key: "difficulty_order_enabled", value: String(difficultyOrderEnabled) }, { onConflict: "key" }),
        supabase.from("quiz_settings").upsert({ key: "show_difficulty_enabled", value: String(showDifficultyEnabled) }, { onConflict: "key" }),
        supabase.from("quiz_settings").upsert({ key: "questions_easy", value: String(questionsEasy) }, { onConflict: "key" }),
        supabase.from("quiz_settings").upsert({ key: "questions_medium", value: String(questionsMedium) }, { onConflict: "key" }),
        supabase.from("quiz_settings").upsert({ key: "questions_hard", value: String(questionsHard) }, { onConflict: "key" }),
      ]);

      toast.success("Configurações salvas com sucesso!");
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const totalQuestionsConfig = questionsEasy + questionsMedium + questionsHard;
  const isValidTotal = totalQuestionsConfig === 10;

  const handleDeleteResult = async (resultId: string) => {
    try {
      const { error } = await supabase
        .from("quiz_results")
        .delete()
        .eq("id", resultId);

      if (error) throw error;

      // Update local state
      const newResults = results.filter((r) => r.id !== resultId);
      setResults(newResults);
      
      const participants = groupResultsByEmail(newResults);
      const groups = groupParticipantsByScore(participants);
      setScoreGroups(groups);

      // Update selected participant if modal is open
      if (selectedParticipant) {
        const updatedParticipant = participants.find((p) => p.email === selectedParticipant.email);
        if (updatedParticipant) {
          setSelectedParticipant(updatedParticipant);
        } else {
          // All results for this participant were deleted
          setSelectedParticipant(null);
          setHistoryModalOpen(false);
        }
      }

      // Clear selected score if no more participants in that group
      if (selectedScore !== null && !groups.find((g) => g.score === selectedScore)) {
        setSelectedScore(null);
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

  const selectedParticipants = selectedScore !== null
    ? scoreGroups.find((g) => g.score === selectedScore)?.participants || []
    : [];

  return (
    <div className="min-h-screen bg-gradient-hero p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Painel Administrativo
            </h1>
          </div>
          <Badge variant="secondary" className="text-xs">
            Modo Protótipo
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Perguntas
              </CardTitle>
              <HelpCircle className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{questionsCount}</div>
              <button 
                onClick={() => navigate("/gabarito")}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                ver perguntas
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Participantes
              </CardTitle>
              <Users className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{uniqueEmails}</div>
              <button 
                onClick={() => navigate("/participantes")}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                ver participantes
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Nota Máxima
              </CardTitle>
              <Trophy className="w-5 h-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{maxScoreCount}</div>
              <button 
                onClick={() => navigate("/embaixadores")}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                ver embaixadores
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Settings Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timer Settings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <CardTitle>Configurações do Timer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="timer-enabled"
                  checked={timerEnabled}
                  onCheckedChange={setTimerEnabled}
                />
                <Label htmlFor="timer-enabled" className="cursor-pointer">
                  Timer ativo
                </Label>
              </div>

              <div className="flex items-center gap-3">
                <Label htmlFor="timer-seconds">Tempo por pergunta:</Label>
                <Input
                  id="timer-seconds"
                  type="number"
                  min={30}
                  max={600}
                  value={timerSeconds}
                  onChange={(e) => setTimerSeconds(Math.max(30, Math.min(600, parseInt(e.target.value) || 180)))}
                  className="w-20"
                  disabled={!timerEnabled}
                />
                <span className="text-sm text-muted-foreground">
                  ({Math.floor(timerSeconds / 60)}min {timerSeconds % 60}s)
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Difficulty Settings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                <CardTitle>Configurações de Dificuldade</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch
                  id="difficulty-order"
                  checked={difficultyOrderEnabled}
                  onCheckedChange={setDifficultyOrderEnabled}
                />
                <Label htmlFor="difficulty-order" className="cursor-pointer">
                  Ordenar por dificuldade progressiva
                </Label>
              </div>
              <p className="text-xs text-muted-foreground -mt-2 ml-12">
                (fácil primeiro → média → difícil)
              </p>

              <div className="flex items-center gap-3">
                <Switch
                  id="show-difficulty"
                  checked={showDifficultyEnabled}
                  onCheckedChange={setShowDifficultyEnabled}
                />
                <Label htmlFor="show-difficulty" className="cursor-pointer">
                  Mostrar dificuldade durante o quiz
                </Label>
              </div>

              <div className="border-t pt-4 space-y-3">
                <Label className="text-sm font-medium">Distribuição de perguntas:</Label>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="q-easy" className="text-xs text-green-600">Fáceis</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="q-easy"
                        type="number"
                        min={0}
                        max={availableEasy}
                        value={questionsEasy}
                        onChange={(e) => setQuestionsEasy(Math.max(0, Math.min(availableEasy, parseInt(e.target.value) || 0)))}
                        className="w-16"
                      />
                      <span className="text-xs text-muted-foreground">/{availableEasy}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="q-medium" className="text-xs text-yellow-600">Médias</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="q-medium"
                        type="number"
                        min={0}
                        max={availableMedium}
                        value={questionsMedium}
                        onChange={(e) => setQuestionsMedium(Math.max(0, Math.min(availableMedium, parseInt(e.target.value) || 0)))}
                        className="w-16"
                      />
                      <span className="text-xs text-muted-foreground">/{availableMedium}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="q-hard" className="text-xs text-red-600">Difíceis</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="q-hard"
                        type="number"
                        min={0}
                        max={availableHard}
                        value={questionsHard}
                        onChange={(e) => setQuestionsHard(Math.max(0, Math.min(availableHard, parseInt(e.target.value) || 0)))}
                        className="w-16"
                      />
                      <span className="text-xs text-muted-foreground">/{availableHard}</span>
                    </div>
                  </div>
                </div>

                <div className={`text-sm font-medium ${isValidTotal ? 'text-green-600' : 'text-destructive'}`}>
                  Total: {totalQuestionsConfig} perguntas {isValidTotal ? '✓' : '(deve ser 10)'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={saveSettings} 
            disabled={isSavingSettings || !isValidTotal} 
            className="gap-2"
            size="lg"
          >
            <Save className="w-4 h-4" />
            {isSavingSettings ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Groups */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Pontuação</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : scoreGroups.length === 0 ? (
                <p className="text-muted-foreground">
                  Nenhum participante ainda
                </p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {scoreGroups.map((group) => (
                      <Button
                        key={group.score}
                        variant={selectedScore === group.score ? "default" : "outline"}
                        className="w-full justify-between h-auto py-3"
                        onClick={() => setSelectedScore(group.score)}
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={group.score === 10 ? "default" : "secondary"}
                            className={
                              group.score === 10
                                ? "bg-accent text-accent-foreground"
                                : ""
                            }
                          >
                            {group.score} pts
                          </Badge>
                          <span>
                            {group.score === 10
                              ? "🏆 Embaixador"
                              : group.score >= 8
                              ? "🌟 Especialista III"
                              : group.score >= 6
                              ? "⭐ Especialista II"
                              : group.score >= 4
                              ? "📚 Especialista I"
                              : "🌱 Iniciante"}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          {group.count} pessoa{group.count !== 1 ? "s" : ""}
                        </span>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Selected Score Details */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedScore !== null
                  ? `Participantes com ${selectedScore} pontos`
                  : "Selecione uma pontuação"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedScore === null ? (
                <p className="text-muted-foreground">
                  Clique em uma pontuação para ver os detalhes
                </p>
              ) : selectedParticipants.length === 0 ? (
                <p className="text-muted-foreground">Nenhum resultado encontrado</p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {selectedParticipants.map((participant) => (
                      <Card 
                        key={participant.email} 
                        className="bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
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
                            <div className="flex items-center gap-2 flex-wrap">
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
      </div>

      {/* History Modal */}
      <ParticipantHistoryModal
        participant={selectedParticipant}
        open={historyModalOpen}
        onOpenChange={setHistoryModalOpen}
        onDeleteResult={handleDeleteResult}
      />
    </div>
  );
};

export default Admin;
