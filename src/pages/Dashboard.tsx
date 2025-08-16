import { useState } from "react"
import { KPICard } from "@/components/KPICard"
import { DashboardDateFilter } from "@/components/DashboardDateFilter"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, MessageSquare, Users, PhoneCall, UserCheck } from "lucide-react"
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))']

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })
  
  const { 
    metrics, 
    isLoading, 
    refetch 
  } = useDashboardMetrics(dateRange)

  const handleRefresh = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral dos principais indicadores do sistema
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Date Filter */}
      <DashboardDateFilter 
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {/* Main KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Total de Conversas"
          value={metrics?.totalConversations || 0}
          icon={MessageSquare}
          description="Conversas registradas"
        />
        <KPICard
          title="Mensagens no Período"
          value={metrics?.messagesToday || 0}
          icon={MessageSquare}
          description={dateRange.from || dateRange.to ? "Mensagens no período" : "Mensagens de hoje"}
        />
        <KPICard
          title="Conexões Ativas"
          value={metrics?.activeConnections || 0}
          icon={PhoneCall}
          description="WhatsApp conectado"
        />
        <KPICard
          title="Total de Contatos"
          value={metrics?.totalContacts || 0}
          icon={Users}
          description="Contatos cadastrados"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Messages by Date */}
        <Card>
          <CardHeader>
            <CardTitle>Mensagens por Data</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics?.messagesByDate || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    color: 'hsl(var(--foreground))',
                    fontSize: '12px'
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload
                      return `Data: ${new Date(data.fullDate).toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}`
                    }
                    return label
                  }}
                  formatter={(value) => [`${value} mensagens`, 'Mensagens']}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2, fill: 'hsl(var(--background))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversations by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Conversas por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics?.conversationsByStatus || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(metrics?.conversationsByStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Conversas Abertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.openConversations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Conversas pendentes de resposta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Não Lidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.unreadConversations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Conversas com mensagens não lidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Usuários cadastrados no sistema
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}