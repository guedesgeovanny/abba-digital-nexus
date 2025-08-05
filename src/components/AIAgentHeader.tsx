import { Button } from "@/components/ui/button";
import { Brain, Settings, Play } from "lucide-react";

export const AIAgentHeader = () => {
  return (
    <div className="border-b border-border bg-background">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Agente de IA</h1>
              <p className="text-sm text-muted-foreground">
                Configure e treine seus agentes inteligentes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
            <Button size="sm">
              <Play className="h-4 w-4 mr-2" />
              Testar Agente
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};