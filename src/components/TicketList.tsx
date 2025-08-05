import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, MessageSquare, AlertCircle, User } from "lucide-react";

const tickets = [
  {
    id: "#T001",
    customer: "Maria Silva",
    avatar: "https://i.pravatar.cc/150?img=1",
    subject: "Problema com integração WhatsApp",
    priority: "Alta",
    status: "Aberto",
    messages: 3,
    created: "há 15 minutos",
    assignee: "João Atendente"
  },
  {
    id: "#T002",
    customer: "Pedro Santos",
    avatar: "https://i.pravatar.cc/150?img=2",
    subject: "Dúvida sobre funcionalidades",
    priority: "Média",
    status: "Em Andamento",
    messages: 7,
    created: "há 1 hora",
    assignee: "Ana Suporte"
  },
  {
    id: "#T003",
    customer: "Carla Mendes",
    avatar: "https://i.pravatar.cc/150?img=3",
    subject: "Solicitação de nova feature",
    priority: "Baixa",
    status: "Aguardando",
    messages: 2,
    created: "há 2 horas",
    assignee: "Não atribuído"
  },
  {
    id: "#T004",
    customer: "Lucas Oliveira",
    avatar: "https://i.pravatar.cc/150?img=4",
    subject: "Bug no dashboard",
    priority: "Alta",
    status: "Resolvido",
    messages: 12,
    created: "há 3 horas",
    assignee: "João Atendente"
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Alta":
      return "destructive";
    case "Média":
      return "default";
    case "Baixa":
      return "secondary";
    default:
      return "outline";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Aberto":
      return "destructive";
    case "Em Andamento":
      return "default";
    case "Aguardando":
      return "secondary";
    case "Resolvido":
      return "outline";
    default:
      return "outline";
  }
};

export const TicketList = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tickets de Suporte</CardTitle>
            <CardDescription>
              Gerencie tickets de atendimento humanizado
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Filtrar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <Avatar>
                <AvatarImage src={ticket.avatar} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-muted-foreground">
                    {ticket.id}
                  </span>
                  <Badge variant={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                  <Badge variant={getStatusColor(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm">{ticket.subject}</h4>
                  <p className="text-xs text-muted-foreground">
                    Cliente: {ticket.customer}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {ticket.created}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {ticket.messages} mensagens
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {ticket.assignee}
                  </div>
                </div>
              </div>

              {ticket.priority === "Alta" && (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};