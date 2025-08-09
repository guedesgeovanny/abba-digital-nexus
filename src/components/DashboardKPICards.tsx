import { KPICard } from "@/components/KPICard"
import { MessageSquare, Users, CheckCircle, Mail } from "lucide-react"

interface DashboardKPIs {
  totalConversations: number
  openConversations: number
  closedConversations: number
  messagesToday: number
  conversationsWithoutResponse: number
  unreadConversations: number
}

interface DashboardKPICardsProps {
  kpis: DashboardKPIs
  isLoading: boolean
}

export function DashboardKPICards({ kpis, isLoading }: DashboardKPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-card border-border rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <KPICard
        title="Total de Conversas"
        value={kpis.totalConversations}
        icon={MessageSquare}
        description="Conversas criadas"
      />
      
      <KPICard
        title="Conversas Abertas"
        value={kpis.openConversations}
        icon={Users}
        trend={{ 
          value: kpis.openConversations > 0 ? Math.round((kpis.openConversations / kpis.totalConversations) * 100) : 0, 
          isPositive: kpis.openConversations > kpis.closedConversations 
        }}
        description="Em andamento"
      />
      
      <KPICard
        title="Conversas Fechadas"
        value={kpis.closedConversations}
        icon={CheckCircle}
        trend={{ 
          value: kpis.closedConversations > 0 ? Math.round((kpis.closedConversations / kpis.totalConversations) * 100) : 0, 
          isPositive: true 
        }}
        description="Finalizadas"
      />
      
      <KPICard
        title="Mensagens Hoje"
        value={kpis.messagesToday}
        icon={MessageSquare}
        description="Atividade do dia"
      />
      
      
      <KPICard
        title="Não Lidas"
        value={kpis.unreadConversations}
        icon={Mail}
        trend={{ 
          value: kpis.unreadConversations, 
          isPositive: false 
        }}
        description="Precisam atenção"
      />
    </div>
  )
}