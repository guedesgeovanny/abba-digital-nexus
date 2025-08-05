import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, User, UserCheck } from "lucide-react";

const messages = [
  {
    id: 1,
    sender: "Maria Silva",
    type: "customer",
    message: "Olá, estou com problemas para integrar o WhatsApp",
    timestamp: "14:30",
    avatar: "https://i.pravatar.cc/150?img=1"
  },
  {
    id: 2,
    sender: "João Atendente",
    type: "agent",
    message: "Olá Maria! Vou te ajudar com a integração. Pode me contar qual erro está aparecendo?",
    timestamp: "14:31",
    avatar: null
  },
  {
    id: 3,
    sender: "Maria Silva",
    type: "customer",
    message: "Aparece uma mensagem de erro quando tento conectar: 'Falha na autenticação'",
    timestamp: "14:32",
    avatar: "https://i.pravatar.cc/150?img=1"
  },
];

export const SupportChat = () => {
  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Chat de Atendimento</CardTitle>
            <CardDescription className="text-xs">
              Ticket #T001 - Maria Silva
            </CardDescription>
          </div>
          <Badge className="bg-green-500">Online</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === "agent" ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="h-8 w-8">
                {message.avatar ? (
                  <AvatarImage src={message.avatar} />
                ) : (
                  <AvatarFallback>
                    {message.type === "agent" ? (
                      <UserCheck className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div
                className={`flex-1 max-w-xs ${
                  message.type === "agent" ? "text-right" : ""
                }`}
              >
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.type === "agent"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.message}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Textarea
              placeholder="Digite sua mensagem..."
              className="min-h-[40px] max-h-[120px] resize-none"
            />
            <Button size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Digite para responder</span>
            <span>Enter para enviar</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};