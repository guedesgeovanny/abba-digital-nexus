
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, DollarSign, Calendar, MessageCircle, BarChart3, User } from "lucide-react"

interface CRMFiltersProps {
  showFilters: boolean
  filterChannel: string
  filterValueRange: string
  filterPeriod: string
  filterStatus: string
  filterUser?: string
  allChannels: string[]
  hasValueData: boolean
  allUsers?: Array<{id: string, full_name: string, email: string}>
  isAdmin?: boolean
  setFilterChannel: (value: string) => void
  setFilterValueRange: (value: string) => void
  setFilterPeriod: (value: string) => void
  setFilterStatus: (value: string) => void
  setFilterUser?: (value: string) => void
  clearFilters: () => void
  filteredLeadsCount: number
  totalLeads: number
}

export const CRMFilters = ({
  showFilters,
  filterChannel,
  filterValueRange,
  filterPeriod,
  filterStatus,
  filterUser,
  allChannels,
  hasValueData,
  allUsers = [],
  isAdmin = false,
  setFilterChannel,
  setFilterValueRange,
  setFilterPeriod,
  setFilterStatus,
  setFilterUser,
  clearFilters,
  filteredLeadsCount,
  totalLeads,
}: CRMFiltersProps) => {
  if (!showFilters) return null

  return (
    <Card className="bg-card border-abba-gray">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-abba-text flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
          <span className="text-sm text-abba-green">
            {filteredLeadsCount} de {totalLeads} leads
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 flex-wrap">
          {/* User Filter - Only for admins */}
          {isAdmin && (
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-[200px] bg-abba-gray border-abba-gray text-abba-text">
                <SelectValue placeholder="Usuário" />
              </SelectTrigger>
              <SelectContent className="bg-abba-gray border-abba-gray">
                <SelectItem value="all" className="text-abba-text">Todos os usuários</SelectItem>
                {allUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id} className="text-abba-text">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span className="truncate">
                        {user.full_name} ({user.email})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Channel Filter */}
          <Select value={filterChannel} onValueChange={setFilterChannel}>
            <SelectTrigger className="w-[180px] bg-abba-gray border-abba-gray text-abba-text">
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent className="bg-abba-gray border-abba-gray">
              <SelectItem value="all" className="text-abba-text">Todos os canais</SelectItem>
              {allChannels.map((channel) => (
                <SelectItem key={channel} value={channel} className="text-abba-text">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-3 h-3" />
                    {channel}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Value Range Filter */}
          {hasValueData && (
            <Select value={filterValueRange} onValueChange={setFilterValueRange}>
              <SelectTrigger className="w-[180px] bg-abba-gray border-abba-gray text-abba-text">
                <SelectValue placeholder="Valor do Lead" />
              </SelectTrigger>
              <SelectContent className="bg-abba-gray border-abba-gray">
                <SelectItem value="all" className="text-abba-text">Todos os valores</SelectItem>
                <SelectItem value="até-5000" className="text-abba-text">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3 h-3" />
                    Até R$ 5.000
                  </div>
                </SelectItem>
                <SelectItem value="5001-10000" className="text-abba-text">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3 h-3" />
                    R$ 5.001 - R$ 10.000
                  </div>
                </SelectItem>
                <SelectItem value="10001-20000" className="text-abba-text">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3 h-3" />
                    R$ 10.001 - R$ 20.000
                  </div>
                </SelectItem>
                <SelectItem value="acima-20000" className="text-abba-text">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3 h-3" />
                    Acima de R$ 20.000
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
          
          {/* Period Filter */}
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="w-[180px] bg-abba-gray border-abba-gray text-abba-text">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="bg-abba-gray border-abba-gray">
              <SelectItem value="all" className="text-abba-text">Todos os períodos</SelectItem>
              <SelectItem value="7-dias" className="text-abba-text">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Últimos 7 dias
                </div>
              </SelectItem>
              <SelectItem value="30-dias" className="text-abba-text">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Últimos 30 dias
                </div>
              </SelectItem>
              <SelectItem value="90-dias" className="text-abba-text">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Últimos 90 dias
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          {/* Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] bg-abba-gray border-abba-gray text-abba-text">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-abba-gray border-abba-gray">
              <SelectItem value="all" className="text-abba-text">Todos os status</SelectItem>
              <SelectItem value="aberta" className="text-abba-text">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-3 h-3" />
                  Conversas Abertas
                </div>
              </SelectItem>
              <SelectItem value="fechada" className="text-abba-text">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-3 h-3" />
                  Conversas Fechadas
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={clearFilters}
            variant="outline"
            className="border-abba-gray text-abba-text hover:bg-abba-gray"
          >
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
