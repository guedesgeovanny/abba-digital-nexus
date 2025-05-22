
import { KPICard } from "@/components/KPICard"
import { Bot, MessageSquare, TrendingUp, Zap, Activity, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

const data = [
  { name: 'Jan', tokens: 4000, agentes: 24 },
  { name: 'Fev', tokens: 3000, agentes: 28 },
  { name: 'Mar', tokens: 2000, agentes: 32 },
  { name: 'Abr', tokens: 2780, agentes: 35 },
  { name: 'Mai', tokens: 1890, agentes: 38 },
  { name: 'Jun', tokens: 2390, agentes: 42 },
  { name: 'Jul', tokens: 3490, agentes: 45 },
]

const Dashboard = () => {
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
          <h2 className="text-3xl font-bold tracking-tight text-abba-text">Dashboard</h2>
          <p className="text-gray-400">
            Visão geral dos seus agentes digitais
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Agentes Ativos"
          value="45"
          icon={Bot}
          trend={{ value: 12, isPositive: true }}
          description="Total de agentes em operação"
        />
        <KPICard
          title="Conversas Hoje"
          value="1,234"
          icon={MessageSquare}
          trend={{ value: 8, isPositive: true }}
          description="Interações realizadas"
        />
        <KPICard
          title="Tokens Utilizados"
          value="89.2K"
          icon={Zap}
          trend={{ value: -3, isPositive: false }}
          description="Consumo de API"
        />
        <KPICard
          title="Taxa de Sucesso"
          value="94.5%"
          icon={TrendingUp}
          trend={{ value: 2, isPositive: true }}
          description="Resoluções efetivas"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-abba-black border-abba-gray">
          <CardHeader>
            <CardTitle className="text-abba-text">Uso de Tokens</CardTitle>
            <CardDescription className="text-gray-400">
              Consumo mensal de tokens por agente
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#111" />
                <XAxis dataKey="name" stroke="#8ED93C" />
                <YAxis stroke="#8ED93C" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#000', 
                    border: '1px solid #8ED93C',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="#8ED93C" 
                  fill="url(#gradient)" 
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8ED93C" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8ED93C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-abba-black border-abba-gray">
          <CardHeader>
            <CardTitle className="text-abba-text">Crescimento de Agentes</CardTitle>
            <CardDescription className="text-gray-400">
              Evolução do número de agentes ativos
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#111" />
                <XAxis dataKey="name" stroke="#8ED93C" />
                <YAxis stroke="#8ED93C" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#000', 
                    border: '1px solid #8ED93C',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="agentes" 
                  stroke="#8ED93C" 
                  strokeWidth={3}
                  dot={{ fill: '#8ED93C', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-abba-black border-abba-gray">
        <CardHeader>
          <CardTitle className="text-abba-text flex items-center gap-2">
            <Activity className="w-5 h-5 text-abba-green" />
            Atividade Recente
          </CardTitle>
          <CardDescription className="text-gray-400">
            Últimas interações dos seus agentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { agent: "Agente Vendas", action: "Conversão realizada", time: "2 min atrás", status: "success" },
              { agent: "Agente Suporte", action: "Ticket resolvido", time: "5 min atrás", status: "success" },
              { agent: "Agente Marketing", action: "Lead qualificado", time: "8 min atrás", status: "info" },
              { agent: "Agente Vendas", action: "Follow-up enviado", time: "12 min atrás", status: "info" },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-abba-gray hover:bg-opacity-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${activity.status === 'success' ? 'bg-abba-green' : 'bg-blue-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-abba-text">{activity.agent}</p>
                    <p className="text-xs text-gray-400">{activity.action}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
