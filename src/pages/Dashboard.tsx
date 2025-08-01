
import { KPICard } from "@/components/KPICard"
import { Bot, MessageSquare, TrendingUp, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: 'Jan', tokens: 0 },
  { name: 'Fev', tokens: 0 },
  { name: 'Mar', tokens: 0 },
  { name: 'Abr', tokens: 0 },
  { name: 'Mai', tokens: 0 },
  { name: 'Jun', tokens: 0 },
  { name: 'Jul', tokens: 0 },
]

const Dashboard = () => {
  console.log('Dashboard: Component rendered');
  
  return (
    <div className="flex-1 space-y-6 p-6 bg-background min-h-screen">
      {/* Watermark */}
      <div className="fixed bottom-4 right-4 opacity-10 pointer-events-none">
        <img 
          src="/lovable-uploads/fb0eee38-84d5-47c6-b95f-cb80e02e53d3.png" 
          alt="Abba Digital" 
          className="w-16 h-16"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral dos seus agentes digitais
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KPICard
          title="Agentes Ativos"
          value="0"
          icon={Bot}
          trend={{ value: 0, isPositive: true }}
          description="Total de agentes em operação"
        />
        <KPICard
          title="Conversas Hoje"
          value="0"
          icon={MessageSquare}
          trend={{ value: 0, isPositive: true }}
          description="Interações realizadas"
        />
        <KPICard
          title="Taxa de Sucesso"
          value="0%"
          icon={TrendingUp}
          trend={{ value: 0, isPositive: true }}
          description="Resoluções efetivas"
        />
      </div>

      {/* Tokens Usage Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Uso de Tokens</CardTitle>
          <CardDescription className="text-muted-foreground">
            Consumo mensal de tokens por agente
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#111" />
              <XAxis dataKey="name" stroke="#43A047" />
              <YAxis stroke="#43A047" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #43A047',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="tokens" 
                stroke="#43A047"
                fill="url(#gradient)" 
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#43A047" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#43A047" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-abba-green" />
            Atividade Recente
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Últimas interações dos seus agentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Nenhuma atividade recente</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
