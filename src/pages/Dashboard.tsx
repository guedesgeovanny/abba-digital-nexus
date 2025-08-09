
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardKPICards } from "@/components/DashboardKPICards"
import { ConversationsTable } from "@/components/ConversationsTable"
import { DashboardCharts } from "@/components/DashboardCharts"
import { DashboardFilters } from "@/components/DashboardFilters"
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics"
import { useConversations } from "@/hooks/useConversations"

const Dashboard = () => {
  const [filters, setFilters] = useState({})
  
  const {
    kpis,
    messagesByDate,
    conversationsByStatus,
    heatmapData,
    isLoading: analyticsLoading
  } = useDashboardAnalytics(filters)

  const { conversations, isLoading: conversationsLoading } = useConversations()
  
  return (
    <div className="flex-1 space-y-6 p-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral das suas conversas e métricas
          </p>
        </div>
      </div>

      {/* Filters */}
      <DashboardFilters onFiltersChange={setFilters} />

      {/* KPI Cards */}
      <DashboardKPICards kpis={kpis} isLoading={analyticsLoading} />

      {/* Charts */}
      <DashboardCharts 
        messagesByDate={messagesByDate}
        conversationsByStatus={conversationsByStatus}
        isLoading={analyticsLoading}
      />

      {/* Conversations Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Conversas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <ConversationsTable 
            conversations={conversations}
            isLoading={conversationsLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
