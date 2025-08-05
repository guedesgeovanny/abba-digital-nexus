import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Copy } from "lucide-react";

export const PromptEditor = () => {
  const [prompt, setPrompt] = useState(`Você é um assistente virtual especializado em atendimento ao cliente. 

Suas características:
- Sempre responda de forma cordial e profissional
- Seja claro e objetivo nas respostas
- Quando não souber algo, encaminhe para um atendente humano
- Mantenha um tom amigável e prestativo

Diretrizes:
1. Identifique-se como assistente virtual
2. Faça perguntas de esclarecimento quando necessário
3. Ofereça soluções práticas
4. Sempre pergunte se o cliente precisa de mais alguma coisa`);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Editor de Prompt</CardTitle>
            <CardDescription>
              Configure o comportamento e personalidade do seu agente de IA
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">GPT-4</Badge>
            <Badge variant="outline">Ativo</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Digite o prompt para seu agente de IA..."
          className="min-h-[300px] resize-none"
        />
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {prompt.length} caracteres
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
            <Button size="sm">
              <Save className="h-4 w-4 mr-2" />
              Salvar Prompt
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};