import { useState, useEffect, useCallback } from "react";
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

interface QuizResult {
  id: string;
  email: string;
  score: number;
  total_questions: number;
  completed_at: string;
  duration_seconds: number | null;
}

interface ScoreGroup {
  score: number;
  count: number;
  results: QuizResult[];
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
  
  // Timer settings
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch data directly from Supabase for prototype
      const [questionsRes, resultsRes, settingsRes] = await Promise.all([
        supabase.from("quiz_questions").select("id", { count: "exact" }),
        supabase.from("quiz_results").select("*").order("completed_at", { ascending: false }),
        supabase.from("quiz_settings").select("*"),
      ]);

      if (questionsRes.count !== null) {
        setQuestionsCount(questionsRes.count);
      }
      
      if (resultsRes.data) {
        setResults(resultsRes.data);

        // Group by score
        const groups: { [key: number]: QuizResult[] } = {};
        resultsRes.data.forEach((result: QuizResult) => {
          if (!groups[result.score]) {
            groups[result.score] = [];
          }
          groups[result.score].push(result);
        });

        // Convert to array and sort by score descending
        const groupsArray: ScoreGroup[] = Object.entries(groups)
          .map(([score, results]) => ({
            score: parseInt(score),
            count: results.length,
            results,
          }))
          .sort((a, b) => b.score - a.score);

        setScoreGroups(groupsArray);
      }

      if (settingsRes.data) {
        settingsRes.data.forEach((setting: { key: string; value: string }) => {
          if (setting.key === "timer_enabled") {
            setTimerEnabled(setting.value === "true");
          } else if (setting.key === "timer_seconds") {
            setTimerSeconds(parseInt(setting.value) || 180);
          }
        });
      }
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveSettings = async () => {
    setIsSavingSettings(true);
    try {
      // Upsert timer_enabled
      await supabase
        .from("quiz_settings")
        .upsert({ key: "timer_enabled", value: String(timerEnabled) }, { onConflict: "key" });

      // Upsert timer_seconds
      await supabase
        .from("quiz_settings")
        .upsert({ key: "timer_seconds", value: String(timerSeconds) }, { onConflict: "key" });

      toast.success("Configurações salvas com sucesso!");
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const selectedResults = selectedScore !== null
    ? scoreGroups.find((g) => g.score === selectedScore)?.results || []
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
              <div className="text-3xl font-bold">{results.length}</div>
              <p className="text-xs text-muted-foreground">finalizaram o quiz</p>
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
              <div className="text-3xl font-bold">
                {scoreGroups.find((g) => g.score === 10)?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                participantes com 10 pontos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Timer Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <CardTitle>Configurações do Timer</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-6">
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
                <Label htmlFor="timer-seconds">Tempo por pergunta (segundos):</Label>
                <Input
                  id="timer-seconds"
                  type="number"
                  min={30}
                  max={600}
                  value={timerSeconds}
                  onChange={(e) => setTimerSeconds(Math.max(30, Math.min(600, parseInt(e.target.value) || 180)))}
                  className="w-24"
                  disabled={!timerEnabled}
                />
                <span className="text-sm text-muted-foreground">
                  ({Math.floor(timerSeconds / 60)}min {timerSeconds % 60}s)
                </span>
              </div>

              <Button onClick={saveSettings} disabled={isSavingSettings} className="gap-2">
                <Save className="w-4 h-4" />
                {isSavingSettings ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </CardContent>
        </Card>

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
              ) : selectedResults.length === 0 ? (
                <p className="text-muted-foreground">Nenhum resultado encontrado</p>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {selectedResults.map((result) => (
                      <Card key={result.id} className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2 min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary shrink-0" />
                                <span className="font-medium truncate">
                                  {result.email}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                                  <span>
                                    {format(
                                      new Date(result.completed_at),
                                      "dd/MM/yyyy 'às' HH:mm",
                                      { locale: ptBR }
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 shrink-0" />
                                  <span>{formatDuration(result.duration_seconds)}</span>
                                </div>
                              </div>
                            </div>
                            <Badge className="shrink-0">
                              {result.score}/{result.total_questions}
                            </Badge>
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
    </div>
  );
};

export default Admin;
