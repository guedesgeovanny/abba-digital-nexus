
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Users, CreditCard, Shield, Bell, Trash2, Plus } from "lucide-react"

const Settings = () => {
  return (
    <div className="flex-1 space-y-6 p-6 bg-abba-black min-h-screen">
      {/* Watermark */}
      <div className="fixed bottom-4 right-4 opacity-10 pointer-events-none">
        <img 
          src="/lovable-uploads/a7cf582e-5718-4f64-912a-e05c747864bf.png" 
          alt="Abba Digital" 
          className="w-16 h-16"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-abba-text">Configurações</h2>
          <p className="text-gray-400">
            Gerencie sua conta e preferências
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="bg-abba-gray border-abba-gray">
          <TabsTrigger value="users" className="data-[state=active]:bg-abba-green data-[state=active]:text-abba-black">
            <Users className="w-4 h-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-abba-green data-[state=active]:text-abba-black">
            <CreditCard className="w-4 h-4 mr-2" />
            Plano & Faturamento
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-abba-green data-[state=active]:text-abba-black">
            <Shield className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-abba-green data-[state=active]:text-abba-black">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card className="bg-abba-black border-abba-gray">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-abba-text">Usuários & Permissões</CardTitle>
                  <CardDescription className="text-gray-400">
                    Gerencie quem tem acesso à plataforma
                  </CardDescription>
                </div>
                <Button className="bg-abba-gradient hover:opacity-90 text-abba-black">
                  <Plus className="w-4 h-4 mr-2" />
                  Convidar Usuário
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "João Silva", email: "joao@empresa.com", role: "Admin", status: "active" },
                  { name: "Maria Santos", email: "maria@empresa.com", role: "Editor", status: "active" },
                  { name: "Pedro Costa", email: "pedro@empresa.com", role: "Viewer", status: "pending" },
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-abba-gray hover:bg-opacity-50 transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-abba-green rounded-full flex items-center justify-center">
                        <span className="text-abba-black font-semibold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-abba-text">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant="outline" 
                        className="border-abba-green text-abba-green"
                      >
                        {user.role}
                      </Badge>
                      <Badge 
                        className={user.status === 'active' ? 'bg-abba-green text-abba-black' : 'bg-yellow-500 text-black'}
                      >
                        {user.status === 'active' ? 'Ativo' : 'Pendente'}
                      </Badge>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-abba-black border-abba-gray">
              <CardHeader>
                <CardTitle className="text-abba-text">Plano Atual</CardTitle>
                <CardDescription className="text-gray-400">
                  Plano Professional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-abba-green">R$ 299</span>
                    <span className="text-gray-400">/mês</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Agentes inclusos:</span>
                      <span className="text-abba-text">50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tokens mensais:</span>
                      <span className="text-abba-text">500K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Usuários:</span>
                      <span className="text-abba-text">10</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-abba-green text-abba-green hover:bg-abba-green hover:text-abba-black">
                    Alterar Plano
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-abba-black border-abba-gray">
              <CardHeader>
                <CardTitle className="text-abba-text">Uso Atual</CardTitle>
                <CardDescription className="text-gray-400">
                  Consumo deste mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Agentes ativos</span>
                      <span className="text-abba-text">45/50</span>
                    </div>
                    <div className="w-full bg-abba-gray rounded-full h-2">
                      <div className="bg-abba-green h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Tokens utilizados</span>
                      <span className="text-abba-text">312K/500K</span>
                    </div>
                    <div className="w-full bg-abba-gray rounded-full h-2">
                      <div className="bg-abba-green h-2 rounded-full" style={{ width: '62%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Usuários</span>
                      <span className="text-abba-text">3/10</span>
                    </div>
                    <div className="w-full bg-abba-gray rounded-full h-2">
                      <div className="bg-abba-green h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="bg-abba-black border-abba-gray">
            <CardHeader>
              <CardTitle className="text-abba-text">Configurações de Segurança</CardTitle>
              <CardDescription className="text-gray-400">
                Gerencie suas configurações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-password" className="text-abba-text">Senha Atual</Label>
                  <Input
                    id="current-password"
                    type="password"
                    className="bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
                  />
                </div>
                <div>
                  <Label htmlFor="new-password" className="text-abba-text">Nova Senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    className="bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-password" className="text-abba-text">Confirmar Nova Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    className="bg-abba-gray border-abba-gray text-abba-text focus:border-abba-green"
                  />
                </div>
                <Button className="bg-abba-gradient hover:opacity-90 text-abba-black">
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="bg-abba-black border-abba-gray">
            <CardHeader>
              <CardTitle className="text-abba-text">Configurações de Notificação</CardTitle>
              <CardDescription className="text-gray-400">
                Escolha como você quer ser notificado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { title: "Notificações por Email", description: "Receber atualizações por email" },
                { title: "Alertas de Agentes", description: "Ser notificado quando agentes ficam offline" },
                { title: "Relatórios Semanais", description: "Receber relatórios de performance" },
                { title: "Notificações de Faturamento", description: "Alertas sobre pagamentos e faturas" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-abba-text">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                  <Switch defaultChecked={index < 2} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Settings
