import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Regulamento = () => {
  const navigate = useNavigate();
  const pdfUrl = "/regulamentos/rendaextra-todos-regulamentos.pdf";

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border bg-card/50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">
              Regulamento Renda Extra
            </h1>
          </div>
        </div>
        <a
          href={pdfUrl}
          download
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <Download className="w-4 h-4" />
          Baixar PDF
        </a>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 p-4">
        <iframe
          src={pdfUrl}
          className="w-full h-full min-h-[80vh] rounded-lg border border-border shadow-lg"
          title="Regulamento Renda Extra Ton"
        />
      </div>
    </div>
  );
};

export default Regulamento;
