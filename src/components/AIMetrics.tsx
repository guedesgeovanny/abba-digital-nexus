import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, MessageSquare, Clock, DollarSign } from "lucide-react";

export const AIMetrics = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Métricas do Agente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Conversas Hoje</span>
            </div>
            <Badge variant="secondary">127</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Taxa de Sucesso</span>
            </div>
            <Badge className="bg-green-500">94%</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Tempo Médio</span>
            </div>
            <Badge variant="outline">2.3s</Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Custo Hoje</span>
            </div>
            <Badge variant="destructive">$12.45</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Uso de Tokens</CardTitle>
          <CardDescription className="text-xs">
            15,420 / 50,000 tokens hoje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={30.84} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            34,580 tokens restantes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">API OpenAI</span>
            <Badge className="bg-green-500">Online</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">WebSocket</span>
            <Badge className="bg-green-500">Conectado</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Banco de Dados</span>
            <Badge className="bg-green-500">Operacional</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};