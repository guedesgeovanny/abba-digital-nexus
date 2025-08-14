import { KPICard } from "@/components/KPICard"
import { Link, Activity, Users, Zap } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ConnectionsKPIs {
  totalConnections: number
  activeConnections: number
  disconnectedConnections: number
  connectingConnections: number
  connectionsByUser: Array<{ user_name: string; count: number }>
  connectionsByStatus: Array<{ status: string; count: number }>
}

interface ConnectionsKPICardsProps {
  kpis: ConnectionsKPIs
  isLoading: boolean
}

const COLORS = ['#22c55e', '#ef4444', '#f59e0b']

export function ConnectionsKPIs({ kpis, isLoading }: ConnectionsKPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-card border-border rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total de Conexões"
          value={kpis.totalConnections}
          icon={Link}
          description="Instâncias configuradas"
        />
        
        <KPICard
          title="Conexões Ativas"
          value={kpis.activeConnections}
          icon={Activity}
          trend={{ 
            value: kpis.totalConnections > 0 ? Math.round((kpis.activeConnections / kpis.totalConnections) * 100) : 0, 
            isPositive: true 
          }}
          description="Funcionando"
        />
        
        <KPICard
          title="Desconectadas"
          value={kpis.disconnectedConnections}
          icon={Zap}
          trend={{ 
            value: kpis.totalConnections > 0 ? Math.round((kpis.disconnectedConnections / kpis.totalConnections) * 100) : 0, 
            isPositive: false 
          }}
          description="Offline"
        />
        
        <KPICard
          title="Conectando"
          value={kpis.connectingConnections}
          icon={Users}
          description="Em processo"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Distribuição por Status</CardTitle>
            <CardDescription className="text-muted-foreground">
              Status das conexões WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={kpis.connectionsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {kpis.connectionsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Connections by User */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Conexões por Usuário</CardTitle>
            <CardDescription className="text-muted-foreground">
              Distribuição de conexões entre usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpis.connectionsByUser.slice(0, 5).map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground">
                    {user.user_name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {user.count} conexões
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}