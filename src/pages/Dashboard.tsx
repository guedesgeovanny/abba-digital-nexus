import { DashboardKPICards } from "@/components/DashboardKPICards"
import { DashboardCharts } from "@/components/DashboardCharts"
import { DashboardFilters } from "@/components/DashboardFilters"
import { ConnectionsKPIs } from "@/components/ConnectionsKPIs"
import { ContactsKPIs } from "@/components/ContactsKPIs"
import { ProfilesKPIs } from "@/components/ProfilesKPIs"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useDashboardAnalytics } from "@/hooks/useDashboardAnalytics"
import { useState } from "react"

interface DashboardFilters {
  status?: string
  channel?: string
  agent?: string
  dateFrom?: Date
  dateTo?: Date
}

export default function Dashboard() {
  const [filters, setFilters] = useState<DashboardFilters>({})
  const { 
    kpis, 
    messagesByDate, 
    conversationsByStatus, 
    heatmapData,
    connectionsKPIs,
    contactsKPIs,
    profilesKPIs,
    isLoading, 
    refetch 
  } = useDashboardAnalytics(filters)

  const handleFiltersChange = (newFilters: { 
    status?: string
    channel?: string
    agent?: string
    dateFrom?: string
    dateTo?: string 
  }) => {
    setFilters({
      ...newFilters,
      dateFrom: newFilters.dateFrom ? new Date(newFilters.dateFrom) : undefined,
      dateTo: newFilters.dateTo ? new Date(newFilters.dateTo) : undefined,
    })
  }

  const handleRefresh = () => {
    refetch()
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

      {/* Filters */}
      <DashboardFilters onFiltersChange={handleFiltersChange} />

      {/* Main KPIs - Conversations & Messages */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Conversas e Mensagens</h2>
        <DashboardKPICards kpis={kpis} isLoading={isLoading} />
      </div>

      {/* Charts */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Análise Temporal</h2>
        <DashboardCharts 
          messagesByDate={messagesByDate}
          conversationsByStatus={conversationsByStatus}
          isLoading={isLoading}
        />
      </div>

      {/* Connections KPIs */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Conexões WhatsApp</h2>
        <ConnectionsKPIs kpis={connectionsKPIs} isLoading={isLoading} />
      </div>

      {/* Contacts KPIs */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Contatos</h2>
        <ContactsKPIs kpis={contactsKPIs} isLoading={isLoading} />
      </div>

      {/* Profiles KPIs */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">Usuários e Agentes</h2>
        <ProfilesKPIs kpis={profilesKPIs} isLoading={isLoading} />
      </div>
    </div>
  )
}