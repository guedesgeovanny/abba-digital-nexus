import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Clock, User, Bot } from "lucide-react";

const conversations = [
  {
    id: 1,
    user: "Maria Silva",
    avatar: "https://i.pravatar.cc/150?img=1",
    duration: "3m 45s",
    messages: 8,
    satisfaction: "Muito Bom",
    timestamp: "há 5 minutos",
    status: "Concluída"
  },
  {
    id: 2,
    user: "João Santos",
    avatar: "https://i.pravatar.cc/150?img=2",
    duration: "1m 23s",
    messages: 4,
    satisfaction: "Bom",
    timestamp: "há 12 minutos",
    status: "Transferida"
  },
  {
    id: 3,
    user: "Ana Costa",
    avatar: "https://i.pravatar.cc/150?img=3",
    duration: "5m 12s",
    messages: 12,
    satisfaction: "Excelente",
    timestamp: "há 28 minutos",
    status: "Concluída"
  },
];

export const ConversationHistory = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Histórico de Conversas</CardTitle>
            <CardDescription>
              Últimas interações processadas pelo agente de IA
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Ver Todas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <Avatar>
                <AvatarImage src={conversation.avatar} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm">{conversation.user}</h4>
                  <Badge 
                    variant={conversation.status === "Concluída" ? "secondary" : "outline"}
                  >
                    {conversation.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {conversation.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {conversation.messages} mensagens
                  </div>
                  <div className="flex items-center gap-1">
                    <Bot className="h-3 w-3" />
                    {conversation.satisfaction}
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                {conversation.timestamp}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};