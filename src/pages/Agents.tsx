import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Smartphone, QrCode, CheckCircle } from "lucide-react";

const Agents = () => {
  const connections = [
    {
      id: 1,
      name: "WhatsApp Principal",
      description: "Conexão principal para atendimento automático",
      status: "connected",
      phone: "+55 11 99999-9999",
      messages: 127,
      lastActivity: "2 minutos atrás"
    },
    {
      id: 2,
      name: "WhatsApp Secundário",
      description: "Conexão secundária para overflow e backup",
      status: "disconnected",
      phone: null,
      messages: 0,
      lastActivity: "Nunca"
    }
  ];

  const getStatusColor = (status: string) => {
    return status === "connected" ? "default" : "secondary";
  };

  const getStatusText = (status: string) => {
    return status === "connected" ? "Conectado" : "Desconectado";
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {connections.map((connection) => (
          <Card key={connection.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Smartphone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{connection.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {connection.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={getStatusColor(connection.status)}>
                  {getStatusText(connection.status)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {connection.status === "connected" ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-muted-foreground">Telefone:</span>
                    <span className="font-medium">{connection.phone}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Mensagens hoje:</span>
                      <div className="font-semibold text-lg">{connection.messages}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Última atividade:</span>
                      <div className="font-medium">{connection.lastActivity}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(connection.id)}
                      className="flex-1"
                    >
                      Desconectar
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                    >
                      Configurar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-6">
                    <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Esta conexão não está configurada.
                      <br />
                      Clique em "Conectar" para configurar.
                    </p>
                  </div>

                  <Button
                    onClick={() => handleConnect(connection.id)}
                    className="w-full"
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Conectar WhatsApp
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Informações adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Como funciona?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-primary">1</span>
            </div>
            <div>
              <strong className="text-foreground">Conecte seu WhatsApp:</strong> Escaneie o QR Code com seu dispositivo móvel para estabelecer a conexão.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-primary">2</span>
            </div>
            <div>
              <strong className="text-foreground">Configure automações:</strong> Defina respostas automáticas e fluxos de atendimento personalizados.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-primary">3</span>
            </div>
            <div>
              <strong className="text-foreground">Monitore o desempenho:</strong> Acompanhe métricas e relatórios de atendimento em tempo real.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Agents;