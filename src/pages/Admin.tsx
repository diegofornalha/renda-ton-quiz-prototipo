import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Users, HelpCircle, Trophy, Calendar, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface QuizResult {
  id: string;
  email: string;
  score: number;
  total_questions: number;
  completed_at: string;
}

interface ScoreGroup {
  score: number;
  count: number;
  results: QuizResult[];
}

const Admin = () => {
  const navigate = useNavigate();
  const [questionsCount, setQuestionsCount] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [scoreGroups, setScoreGroups] = useState<ScoreGroup[]>([]);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch questions count
        const { count: questionsCountData } = await supabase
          .from("quiz_questions")
          .select("*", { count: "exact", head: true });

        setQuestionsCount(questionsCountData || 0);

        // Fetch all results
        const { data: resultsData } = await supabase
          .from("quiz_results")
          .select("*")
          .order("score", { ascending: false })
          .order("completed_at", { ascending: false });

        if (resultsData) {
          setResults(resultsData);

          // Group by score
          const groups: { [key: number]: QuizResult[] } = {};
          resultsData.forEach((result) => {
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
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedResults = selectedScore !== null
    ? scoreGroups.find((g) => g.score === selectedScore)?.results || []
    : [];

  return (
    <div className="min-h-screen bg-gradient-hero p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
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
              <p className="text-xs text-muted-foreground">no banco de dados</p>
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

        {/* Score Groups and Details */}
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
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary shrink-0" />
                                <span className="font-medium truncate">
                                  {result.email}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4 shrink-0" />
                                <span>
                                  {format(
                                    new Date(result.completed_at),
                                    "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                                    { locale: ptBR }
                                  )}
                                </span>
                              </div>
                            </div>
                            <Badge variant="outline" className="shrink-0">
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
