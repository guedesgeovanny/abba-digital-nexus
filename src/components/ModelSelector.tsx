import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Zap, Cpu, Sparkles } from "lucide-react";

const models = [
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI", icon: Sparkles, price: "Alto" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI", icon: Zap, price: "Médio" },
  { id: "claude-3", name: "Claude 3", provider: "Anthropic", icon: Cpu, price: "Alto" },
];

export const ModelSelector = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Modelo</CardTitle>
        <CardDescription>
          Selecione e configure o modelo de IA para seu agente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="model">Modelo de IA</Label>
          <Select defaultValue="gpt-4">
            <SelectTrigger>
              <SelectValue placeholder="Selecione um modelo" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex items-center gap-2">
                    <model.icon className="h-4 w-4" />
                    <span>{model.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {model.provider}
                    </Badge>
                    <Badge 
                      variant={model.price === "Alto" ? "destructive" : "outline"} 
                      className="text-xs"
                    >
                      {model.price}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Temperatura: 0.7</Label>
            <Slider defaultValue={[0.7]} max={1} min={0} step={0.1} />
            <p className="text-xs text-muted-foreground">
              Controla a criatividade das respostas
            </p>
          </div>

          <div className="space-y-2">
            <Label>Máximo de Tokens: 2048</Label>
            <Slider defaultValue={[2048]} max={4096} min={256} step={256} />
            <p className="text-xs text-muted-foreground">
              Limite de tokens por resposta
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};