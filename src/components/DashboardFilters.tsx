import { useState, useEffect } from 'react'
import { Calendar, Filter, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface DashboardFiltersProps {
  onFiltersChange: (filters: {
    status?: string
    channel?: string
    agent?: string
    dateFrom?: string
    dateTo?: string
  }) => void
}

interface Agent {
  id: string
  full_name: string
}

export function DashboardFilters({ onFiltersChange }: DashboardFiltersProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<string>()
  const [channel, setChannel] = useState<string>()
  const [agent, setAgent] = useState<string>()
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [agents, setAgents] = useState<Agent[]>([])
  const [isDateFromOpen, setIsDateFromOpen] = useState(false)
  const [isDateToOpen, setIsDateToOpen] = useState(false)

  // Fetch available agents
  useEffect(() => {
    const fetchAgents = async () => {
      if (!user) return

      const { data: conversations } = await supabase
        .from('conversations')
        .select('assigned_to')
        .eq('user_id', user.id)
        .not('assigned_to', 'is', null)

      if (!conversations?.length) return

      // Get unique agent IDs
      const agentIds = [...new Set(conversations.map(c => c.assigned_to))]
      
      // Fetch profiles separately
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', agentIds)

      setAgents(profiles || [])
    }

    fetchAgents()
  }, [user])

  // Update filters when any value changes
  useEffect(() => {
    const filters = {
      status,
      channel,
      agent,
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString(),
    }

    // Remove undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    )

    onFiltersChange(cleanFilters)
  }, [status, channel, agent, dateFrom, dateTo, onFiltersChange])

  const clearFilters = () => {
    setStatus(undefined)
    setChannel(undefined)
    setAgent(undefined)
    setDateFrom(undefined)
    setDateTo(undefined)
  }

  const hasActiveFilters = status || channel || agent || dateFrom || dateTo

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-card border border-border rounded-lg">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filtros:</span>
      </div>

      {/* Status Filter */}
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="aberta">Aberta</SelectItem>
          <SelectItem value="fechada">Fechada</SelectItem>
          <SelectItem value="pendente">Pendente</SelectItem>
          <SelectItem value="novo">Novo</SelectItem>
        </SelectContent>
      </Select>

      {/* Channel Filter */}
      <Select value={channel} onValueChange={setChannel}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Canal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="whatsapp">WhatsApp</SelectItem>
          <SelectItem value="telegram">Telegram</SelectItem>
          <SelectItem value="instagram">Instagram</SelectItem>
          <SelectItem value="messenger">Messenger</SelectItem>
        </SelectContent>
      </Select>

      {/* Agent Filter */}
      <Select value={agent} onValueChange={setAgent}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Agente" />
        </SelectTrigger>
        <SelectContent>
          {agents.map((agentItem) => (
            <SelectItem key={agentItem.id} value={agentItem.id}>
              {agentItem.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date From Filter */}
      <Popover open={isDateFromOpen} onOpenChange={setIsDateFromOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-40 justify-start text-left font-normal",
              !dateFrom && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Data início"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={dateFrom}
            onSelect={(date) => {
              setDateFrom(date)
              setIsDateFromOpen(false)
            }}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* Date To Filter */}
      <Popover open={isDateToOpen} onOpenChange={setIsDateToOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-40 justify-start text-left font-normal",
              !dateTo && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : "Data fim"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={dateTo}
            onSelect={(date) => {
              setDateTo(date)
              setIsDateToOpen(false)
            }}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  )
}