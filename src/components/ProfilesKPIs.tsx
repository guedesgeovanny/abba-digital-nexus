import { KPICard } from "@/components/KPICard"
import { Users, Shield, Eye, Edit } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ProfilesKPIs {
  totalUsers: number
  adminUsers: number
  editorUsers: number
  viewerUsers: number
  usersByRole: Array<{ role: string; count: number }>
}

interface ProfilesKPICardsProps {
  kpis: ProfilesKPIs
  isLoading: boolean
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981']

export function ProfilesKPIs({ kpis, isLoading }: ProfilesKPICardsProps) {
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
          title="Total de Usuários"
          value={kpis.totalUsers}
          icon={Users}
          description="Perfis no sistema"
        />
        
        <KPICard
          title="Administradores"
          value={kpis.adminUsers}
          icon={Shield}
          trend={{ 
            value: kpis.totalUsers > 0 ? Math.round((kpis.adminUsers / kpis.totalUsers) * 100) : 0, 
            isPositive: true 
          }}
          description="Acesso total"
        />
        
        <KPICard
          title="Editores"
          value={kpis.editorUsers}
          icon={Edit}
          trend={{ 
            value: kpis.totalUsers > 0 ? Math.round((kpis.editorUsers / kpis.totalUsers) * 100) : 0, 
            isPositive: true 
          }}
          description="Acesso limitado"
        />
        
        <KPICard
          title="Visualizadores"
          value={kpis.viewerUsers}
          icon={Eye}
          trend={{ 
            value: kpis.totalUsers > 0 ? Math.round((kpis.viewerUsers / kpis.totalUsers) * 100) : 0, 
            isPositive: true 
          }}
          description="Apenas leitura"
        />
      </div>

      {/* Role Distribution Chart */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Distribuição por Função</CardTitle>
            <CardDescription className="text-muted-foreground">
              Usuários por nível de acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={kpis.usersByRole}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, percent }) => `${role} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {kpis.usersByRole.map((entry, index) => (
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

        {/* Role Details */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Detalhes por Função</CardTitle>
            <CardDescription className="text-muted-foreground">
              Permissões e responsabilidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Admin</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {kpis.adminUsers} usuários
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center space-x-2">
                  <Edit className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Editor</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {kpis.editorUsers} usuários
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Viewer</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {kpis.viewerUsers} usuários
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}