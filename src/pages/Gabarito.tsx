import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { ArrowLeft, BookOpen, CheckCircle, Search, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Alternativa {
  texto: string;
  correta: boolean;
  explicacao: string;
  regulamento_ref: string;
}

interface Question {
  id: string;
  numero: number;
  texto: string;
  alternativas: Record<string, Alternativa>;
  dificuldade: string;
  topico: string;
  regulamento_ref: string | null;
}

const getDifficultyColor = (dificuldade: string) => {
  switch (dificuldade.toLowerCase()) {
    case "fácil":
      return "bg-green-500/20 text-green-700 border-green-500/30";
    case "média":
      return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
    case "difícil":
      return "bg-red-500/20 text-red-700 border-red-500/30";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

const Gabarito = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("quiz_questions")
          .select("*")
          .order("numero", { ascending: true });

        if (error) throw error;

        if (data) {
          const formattedQuestions = data.map((q) => ({
            ...q,
            alternativas: q.alternativas as unknown as Record<string, Alternativa>,
          }));
          setQuestions(formattedQuestions);
          setFilteredQuestions(formattedQuestions);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    let filtered = questions;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.texto.toLowerCase().includes(term) ||
          q.topico.toLowerCase().includes(term) ||
          Object.values(q.alternativas).some(
            (alt) =>
              alt.texto.toLowerCase().includes(term) ||
              alt.explicacao.toLowerCase().includes(term) ||
              alt.regulamento_ref.toLowerCase().includes(term)
          )
      );
    }

    if (selectedTopic) {
      filtered = filtered.filter((q) => q.topico === selectedTopic);
    }

    if (selectedDifficulty) {
      filtered = filtered.filter((q) => q.dificuldade.toLowerCase() === selectedDifficulty.toLowerCase());
    }

    setFilteredQuestions(filtered);
  }, [searchTerm, selectedTopic, selectedDifficulty, questions]);

  const topics = [...new Set(questions.map((q) => q.topico))].sort();

  // Count questions by difficulty
  const difficultyCounts = {
    fácil: questions.filter((q) => q.dificuldade.toLowerCase() === "fácil").length,
    média: questions.filter((q) => q.dificuldade.toLowerCase() === "média").length,
    difícil: questions.filter((q) => q.dificuldade.toLowerCase() === "difícil").length,
  };

  const getCorrectAnswer = (alternativas: Record<string, Alternativa>) => {
    for (const [key, value] of Object.entries(alternativas)) {
      if (value.correta) {
        return { key, ...value };
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
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
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-primary" />
              Perguntas e Respostas
            </h1>
            <p className="text-muted-foreground">
              {questions.length} perguntas com respostas e explicações geradas com IA através do{" "}
              <button
                onClick={() => navigate("/regulamento")}
                className="text-primary hover:underline font-medium"
              >
                regulamento
              </button>
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por pergunta, resposta ou regulamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Difficulty Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedDifficulty(selectedDifficulty === "fácil" ? null : "fácil")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedDifficulty === "fácil"
                    ? "bg-green-500 text-white"
                    : "bg-green-500/20 text-green-700 hover:bg-green-500/30"
                }`}
              >
                Fácil ({difficultyCounts.fácil})
              </button>
              <button
                onClick={() => setSelectedDifficulty(selectedDifficulty === "média" ? null : "média")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedDifficulty === "média"
                    ? "bg-yellow-500 text-white"
                    : "bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30"
                }`}
              >
                Média ({difficultyCounts.média})
              </button>
              <button
                onClick={() => setSelectedDifficulty(selectedDifficulty === "difícil" ? null : "difícil")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedDifficulty === "difícil"
                    ? "bg-red-500 text-white"
                    : "bg-red-500/20 text-red-700 hover:bg-red-500/30"
                }`}
              >
                Difícil ({difficultyCounts.difícil})
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        {(searchTerm || selectedTopic || selectedDifficulty) ? (
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredQuestions.length} de {questions.length} perguntas
          </p>
        ) : null}

        {/* Questions List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando perguntas...</p>
          </div>
        ) : (
          <div className="space-y-4 pb-8">
            {filteredQuestions.map((question) => {
              const correctAnswer = getCorrectAnswer(question.alternativas);

              return (
                <Card key={question.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Badge
                          variant="outline"
                          className="shrink-0 mt-0.5 bg-primary/10 text-primary border-primary/30"
                        >
                          #{question.numero}
                        </Badge>
                        <CardTitle className="text-base font-medium leading-snug">
                          {question.texto}
                        </CardTitle>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 ml-10">
                      <Badge
                        variant="outline"
                        className={getDifficultyColor(question.dificuldade)}
                      >
                        {question.dificuldade}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {question.topico}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {correctAnswer && (
                      <div className="space-y-3">
                        {/* Correct Answer */}
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                          <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-700">
                              Resposta Correta: {correctAnswer.key}
                            </p>
                            <p className="text-foreground mt-1">
                              {correctAnswer.texto}
                            </p>
                          </div>
                        </div>

                        {/* Explanation */}
                        <div className="p-3 rounded-lg bg-muted/50 border">
                          <p className="text-sm text-muted-foreground mb-2 font-medium">
                            Explicação:
                          </p>
                          <p className="text-sm">{correctAnswer.explicacao}</p>
                        </div>

                        {/* Regulation Reference */}
                        <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                          <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground">
                            📖{" "}
                            <span className="font-medium text-foreground">
                              {correctAnswer.regulamento_ref}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {filteredQuestions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nenhuma pergunta encontrada com os filtros selecionados.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gabarito;
