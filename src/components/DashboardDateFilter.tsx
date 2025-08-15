import { useState } from "react"
import { CalendarIcon, ChevronDownIcon, FilterIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface DashboardDateFilterProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
}

export function DashboardDateFilter({ dateRange, onDateRangeChange }: DashboardDateFilterProps) {
  const [isFromOpen, setIsFromOpen] = useState(false)
  const [isToOpen, setIsToOpen] = useState(false)

  const handleFromDateSelect = (date: Date | undefined) => {
    onDateRangeChange({ ...dateRange, from: date })
    setIsFromOpen(false)
  }

  const handleToDateSelect = (date: Date | undefined) => {
    onDateRangeChange({ ...dateRange, to: date })
    setIsToOpen(false)
  }

  const clearFilters = () => {
    onDateRangeChange({ from: undefined, to: undefined })
  }

  const setPresetRange = (days: number) => {
    const today = new Date()
    const from = new Date()
    from.setDate(today.getDate() - days)
    onDateRangeChange({ from, to: today })
  }

  const getDisplayText = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "dd/MM", { locale: ptBR })} - ${format(dateRange.to, "dd/MM", { locale: ptBR })}`
    }
    if (dateRange.from) {
      return `A partir de ${format(dateRange.from, "dd/MM", { locale: ptBR })}`
    }
    if (dateRange.to) {
      return `Até ${format(dateRange.to, "dd/MM", { locale: ptBR })}`
    }
    return "Filtrar período"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 text-xs gap-2 bg-background"
        >
          <FilterIcon className="h-3 w-3" />
          {getDisplayText()}
          <ChevronDownIcon className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 bg-background">
        <DropdownMenuItem onClick={() => setPresetRange(6)} className="text-sm">
          Últimos 7 dias
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPresetRange(29)} className="text-sm">
          Últimos 30 dias
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setPresetRange(89)} className="text-sm">
          Últimos 90 dias
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <div className="text-xs font-medium mb-2 text-muted-foreground">Data personalizada</div>
          
          {/* From Date */}
          <div className="mb-2">
            <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal h-7 text-xs",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {dateRange.from ? (
                    format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Data inicial</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.from}
                  onSelect={handleFromDateSelect}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* To Date */}
          <div className="mb-2">
            <Popover open={isToOpen} onOpenChange={setIsToOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal h-7 text-xs",
                    !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  {dateRange.to ? (
                    format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Data final</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange.to}
                  onSelect={handleToDateSelect}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  disabled={(date) => 
                    dateRange.from ? date < dateRange.from : false
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {(dateRange.from || dateRange.to) && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={clearFilters} className="text-sm text-muted-foreground">
              Limpar filtros
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}