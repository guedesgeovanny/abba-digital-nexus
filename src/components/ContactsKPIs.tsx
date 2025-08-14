import { KPICard } from "@/components/KPICard"
import { Users, UserCheck, UserPlus, Tag } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ContactsKPIs {
  totalContacts: number
  contactsByStatus: Array<{ status: string; count: number }>
  contactsBySource: Array<{ source: string; count: number }>
  contactsByAgent: Array<{ agent_name: string; count: number }>
  contactsByDate: Array<{ date: string; count: number }>
  contactsByTag: Array<{ tag_name: string; count: number }>
}

interface ContactsKPICardsProps {
  kpis: ContactsKPIs
  isLoading: boolean
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export function ContactsKPIs({ kpis, isLoading }: ContactsKPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-card border-border rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  const leadContacts = kpis.contactsByStatus.find(s => s.status === 'lead')?.count || 0
  const clientContacts = kpis.contactsByStatus.find(s => s.status === 'cliente')?.count || 0

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total de Contatos"
          value={kpis.totalContacts}
          icon={Users}
          description="Cadastrados no sistema"
        />
        
        <KPICard
          title="Leads"
          value={leadContacts}
          icon={UserPlus}
          trend={{ 
            value: kpis.totalContacts > 0 ? Math.round((leadContacts / kpis.totalContacts) * 100) : 0, 
            isPositive: true 
          }}
          description="Em prospecção"
        />
        
        <KPICard
          title="Clientes"
          value={clientContacts}
          icon={UserCheck}
          trend={{ 
            value: kpis.totalContacts > 0 ? Math.round((clientContacts / kpis.totalContacts) * 100) : 0, 
            isPositive: true 
          }}
          description="Convertidos"
        />
        
        <KPICard
          title="Tags Ativas"
          value={kpis.contactsByTag.length}
          icon={Tag}
          description="Categorias em uso"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Status Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Contatos por Status</CardTitle>
            <CardDescription className="text-muted-foreground">
              Distribuição por status atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={kpis.contactsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {kpis.contactsByStatus.map((entry, index) => (
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

        {/* Source Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Contatos por Origem</CardTitle>
            <CardDescription className="text-muted-foreground">
              Canais de aquisição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpis.contactsBySource}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="source" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contacts Over Time */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Criação de Contatos</CardTitle>
            <CardDescription className="text-muted-foreground">
              Últimos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={kpis.contactsByDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contacts by Agent */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Contatos por Agente</CardTitle>
            <CardDescription className="text-muted-foreground">
              Distribuição entre agentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpis.contactsByAgent.slice(0, 5).map((agent, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground">
                    {agent.agent_name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {agent.count} contatos
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Tags */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Tags Mais Usadas</CardTitle>
            <CardDescription className="text-muted-foreground">
              Categorias principais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpis.contactsByTag.slice(0, 5).map((tag, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground">
                    {tag.tag_name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {tag.count} contatos
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