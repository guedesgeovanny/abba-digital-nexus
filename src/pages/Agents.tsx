import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Smartphone, QrCode, CheckCircle } from "lucide-react";

const Agents = () => {
  const connections = [
    {
      id: 1,
      name: "Agente de IA",
      subtitle: "João Silva - Atendimento Geral",
      phone: "556211999887766",
      status: "connected",
      createdAt: "02/08/2025, 10:19",
      lastActivity: "02/08/2025, 10:19",
      avatar: "https://i.pravatar.cc/150?img=1"
    },
    {
      id: 2,
      name: "Atendimento Humano", 
      subtitle: "Maria Santos - Suporte Técnico",
      phone: "556211888776655",
      status: "disconnected",
      createdAt: "01/08/2025, 14:30",
      lastActivity: "01/08/2025, 16:45",
      avatar: "https://i.pravatar.cc/150?img=2"
    }
  ];

  const getStatusColor = (status: string) => {
    return status === "connected" ? "default" : "secondary";
  };

  const getStatusText = (status: string) => {
    return status === "connected" ? "Conectado" : "Desconectado";
  };

  const getStatusBadgeClass = (status: string) => {
    return status === "connected" 
      ? "bg-green-500 text-white hover:bg-green-600" 
      : "bg-gray-500 text-white hover:bg-gray-600";
  };

  const handleConnect = (connectionId: number) => {
    console.log("Conectar WhatsApp:", connectionId);
    // Aqui seria implementada a lógica de conexão
  };

  const handleDisconnect = (connectionId: number) => {
    console.log("Desconectar WhatsApp:", connectionId);
    // Aqui seria implementada a lógica de desconexão
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-background">
        <div className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Conexões</h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie suas conexões WhatsApp para atendimento automático
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conexões WhatsApp */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {connections.map((connection) => (
          <Card key={connection.id} className="w-full max-w-md border border-border rounded-lg">
            <CardContent className="p-6">
              {/* Header com Avatar e Info */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <img 
                    src={connection.avatar} 
                    alt={connection.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {connection.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {connection.subtitle}
                  </p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {connection.phone}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge className={getStatusBadgeClass(connection.status)}>
                  <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                  {getStatusText(connection.status)}
                </Badge>
              </div>

              {/* Informações de Data */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Criado em:</span>
                  <span className="text-sm text-foreground">{connection.createdAt}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Última atividade:</span>
                  <span className="text-sm text-foreground">{connection.lastActivity}</span>
                </div>
              </div>

              {/* Botão de Ação */}
              <Button
                variant="outline"
                onClick={() => connection.status === "connected" 
                  ? handleDisconnect(connection.id) 
                  : handleConnect(connection.id)
                }
                className="w-full"
              >
                <div className="flex items-center justify-center gap-2">
                  {connection.status === "connected" ? (
                    <>
                      <div className="w-4 h-4 flex items-center justify-center">
                        <div className="w-3 h-3 border-2 border-current rounded-sm"></div>
                      </div>
                      Desconectar
                    </>
                  ) : (
                    <>
                      <Smartphone className="h-4 w-4" />
                      Conectar
                    </>
                  )}
                </div>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Agents;